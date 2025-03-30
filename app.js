document.addEventListener('DOMContentLoaded', function() {
    // Make sure AlchemyBlaster is available before anything else
    if (typeof AlchemyBlaster === 'undefined') {
        console.error('AlchemyBlaster not found, creating interface');
        window.AlchemyBlaster = class {
            constructor() {
                this.canvas = document.createElement('canvas');
                this.ctx = this.canvas.getContext('2d');
                this.canvas.width = 640;
                this.canvas.height = 800;
            }
        };
    }

    // Initialize player inventory and storage first
    let playerInventory = {};
    let discoveredRecipes = {};
    let playerCraftedItems = {};
    let craftedInventory = {};

    // Helper functions for inventory management
    function initializeInventory() {
        try {
            const savedInventory = localStorage.getItem('playerInventory');
            if (savedInventory && savedInventory !== "undefined") {
                try {
                    playerInventory = JSON.parse(savedInventory);
                } catch (e) {
                    console.error("Error parsing player inventory:", e);
                    playerInventory = {};
                }
            } else {
                // Initialize with starter ingredients (your existing code)
                playerInventory = {};
                ingredients.forEach(ingredient => {
                    playerInventory[ingredient.id] = ingredient.category.includes('legendary') ? 2 : 5;
                });
                localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
            }
            
            // Load other storage items with error handling
            try {
                const savedCraftedItems = localStorage.getItem('craftedInventory');
                if (savedCraftedItems && savedCraftedItems !== "undefined") {
                    craftedInventory = JSON.parse(savedCraftedItems);
                }
            } catch (e) {
                console.error("Error loading crafted inventory:", e);
                craftedInventory = {};
            }
            
            try {
                const savedRecipes = localStorage.getItem('discoveredRecipes');
                if (savedRecipes && savedRecipes !== "undefined") {
                    discoveredRecipes = JSON.parse(savedRecipes);
                }
            } catch (e) {
                console.error("Error loading discovered recipes:", e);
                discoveredRecipes = {};
            }
            
            try {
                const savedPlayerCrafted = localStorage.getItem('playerCraftedItems');
                if (savedPlayerCrafted && savedPlayerCrafted !== "undefined") {
                    playerCraftedItems = JSON.parse(savedPlayerCrafted);
                }
            } catch (e) {
                console.error("Error loading player crafted items:", e);
                playerCraftedItems = {};
            }
        } catch (e) {
            console.error("Error in initializeInventory:", e);
            playerInventory = {};
            craftedInventory = {};
            discoveredRecipes = {};
            playerCraftedItems = {};
        }
        
        // Initialize debug menu after storage is loaded
        initializeDebugMenu();
    }

    function initializeDebugMenu() {
        const debugMenu = document.createElement('div');
        debugMenu.id = 'debug-menu';
        debugMenu.style.position = 'fixed';
        debugMenu.style.top = '10px';
        debugMenu.style.right = '10px';
        debugMenu.style.padding = '10px';
        debugMenu.style.background = '#333';
        debugMenu.style.border = '1px solid #666';
        debugMenu.style.borderRadius = '5px';
        debugMenu.style.zIndex = '9999';

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset All Data';
        resetButton.onclick = function() {
            if (confirm('This will reset all progress. Are you sure?')) {
                localStorage.clear();
                playerInventory = {
                    'herb1': 5,
                    'crystal1': 3,
                    'metal1': 3,  // Fixed typo: was 'metal11'
                    'essence1': 2,
                    'legendary1': 1
                };
                localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
                discoveredRecipes = {};
                localStorage.setItem('discoveredRecipes', JSON.stringify(discoveredRecipes));
                playerCraftedItems = {};
                localStorage.setItem('playerCraftedItems', JSON.stringify(playerCraftedItems));
                location.reload();
            }
        };
        debugMenu.appendChild(resetButton);

        const addIngredientsButton = document.createElement('button');
        addIngredientsButton.textContent = 'Add Ingredients';
        addIngredientsButton.style.marginLeft = '10px';
        addIngredientsButton.onclick = function() {
            ingredients.forEach(ing => {
                playerInventory[ing.id] = (playerInventory[ing.id] || 0) + 5;
            });
            localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
            loadIngredients(document.querySelector('.category-btn.active').dataset.category);
        };
        debugMenu.appendChild(addIngredientsButton);

        document.body.appendChild(debugMenu);
    }

    // Initialize variables
    let slotContents = {
        a: null,
        b: null,
        c: null,
        d: null,
        e: null
    };
    
    const brewButton = document.getElementById('brew-btn');
    const ingredientsContainer = document.getElementById('ingredients-container');
    const slots = document.querySelectorAll('.ingredient-slot');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const compendiumButton = document.getElementById('compendium-btn');
    const compendiumModal = document.getElementById('compendium-modal');
    const resultModal = document.getElementById('result-modal');
    const compCategoryButtons = document.querySelectorAll('.comp-category-btn');
    const closeButtons = document.querySelectorAll('.close');
    const collectButton = document.getElementById('collect-btn');
    const recipeBookButton = document.getElementById('recipe-book-btn');
    const recipeBookModal = document.getElementById('recipe-book-modal');
    
    // Initialize sound elements - update paths
    const sounds = {
        liquidFlow: document.getElementById('liquid-flow-sound'),
        success: document.getElementById('success-sound'),
        legendarySuccess: document.getElementById('legendary-success-sound'),
        fail: document.getElementById('fail-sound'),
        slot: document.getElementById('slot-sound'),
        slotRemove: document.getElementById('slot-remove-sound')
    };
    
    // Helper function for safer sound playing
    function playSound(soundId, options = {}) {
        const sound = sounds[soundId];
        if (!sound) {
            console.warn(`Sound not found: ${soundId}`);
            return;
        }
        
        sound.currentTime = 0;
        sound.volume = options.volume || 0.7;
        
        if (options.playbackRate) {
            sound.preservesPitch = false;
            sound.playbackRate = options.playbackRate;
        }
        
        return sound.play().catch(e => {
            console.warn(`Sound play failed (${soundId}):`, e);
        });
    }
    
    // Replace the existing playSlotSound function
    function playSlotSound(isRemoving = false) {
        if (isRemoving) {
            playSound('slotRemove', { volume: 0.5 });
        } else {
            playSound('slot', { volume: 0.7 });
        }
    }
    
    // Add collapse functionality for crafted items drawer
    const collapseBtn = document.querySelector('.collapse-btn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', function() {
            this.classList.toggle('collapsed');
            const craftedItemsContainer = document.getElementById('crafted-items-container');
            if (craftedItemsContainer) {
                craftedItemsContainer.classList.toggle('collapsed');
            }
        });
    }

    // Initialize the player's inventory
    initializeInventory();
    
    // Load ingredients into the drawer
    loadIngredients('all');
    
    // Load compendium items
    loadCompendiumItems('all');
    
    // Track if last recipe was successful
    let lastRecipeSuccess = false;
    
    // Event Listeners
    brewButton.addEventListener('click', brewPotion);
    
    // Update category buttons to match the ingredient categories
    const categories = [
        { id: 'all', label: 'All' },
        { id: 'botanical', label: 'Botanicals' },
        { id: 'crystal', label: 'Crystals' },
        { id: 'metal', label: 'Metals' },
        { id: 'essence', label: 'Essences' },
        { id: 'food', label: 'Food' },
        { id: 'legendary', label: 'Legendary' }
    ];
    
    // Set up category filter buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadIngredients(this.dataset.category);
        });
    });
    
    // Also update compendium category buttons
    const compCategoryButtonContainer = document.querySelector('.comp-category-buttons');
    if (compCategoryButtonContainer) {
        compCategoryButtonContainer.innerHTML = ''; // Clear existing buttons
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'comp-category-btn';
            button.dataset.category = category.id;
            button.textContent = category.label;
            
            if (category.id === 'all') {
                button.classList.add('active');
            }
            
            button.addEventListener('click', function() {
                document.querySelectorAll('.comp-category-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                loadCompendiumItems(this.dataset.category);
            });
            
            compCategoryButtonContainer.appendChild(button);
        });
    }
    
    // Compendium category filter buttons
    compCategoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            compCategoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadCompendiumItems(this.dataset.category);
        });
    });
    
    // Open compendium modal
    compendiumButton.addEventListener('click', function() {
        compendiumModal.style.display = 'block';
    });
    
    // Close modals when clicking the X
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            compendiumModal.style.display = 'none';
            resultModal.style.display = 'none';
            recipeBookModal.style.display = 'none';
        });
    });
    
    // Close modals when clicking outside of them
    window.addEventListener('click', function(event) {
        if (event.target === compendiumModal) {
            compendiumModal.style.display = 'none';
        }
        if (event.target === resultModal) {
            resultModal.style.display = 'none';
        }
        if (event.target === recipeBookModal) {
            recipeBookModal.style.display = 'none';
        }
    });
    
    // Collect button in result modal
    collectButton.addEventListener('click', function() {
        const resultName = document.getElementById('result-name').textContent;
        
        try {
            // Find the matching recipe by result name
            const recipe = recipes.find(r => r.result.name === resultName);
            if (recipe) {
                // Add to player inventory
                playerInventory[recipe.id] = (playerInventory[recipe.id] || 0) + 1;
                
                // Also track in crafted inventory to ensure it shows in the crafted items drawer
                craftedInventory[recipe.id] = (craftedInventory[recipe.id] || 0) + 1;
                
                // Track in playerCraftedItems for count display
                playerCraftedItems[recipe.id] = (playerCraftedItems[recipe.id] || 0) + 1;
                
                // Save all inventory changes
                localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
                localStorage.setItem('craftedInventory', JSON.stringify(craftedInventory));
                localStorage.setItem('playerCraftedItems', JSON.stringify(playerCraftedItems));
                
                console.log(`Added ${recipe.result.name} (${recipe.id}) to inventory and crafted items`);
                
                // Update the crafted items display
                updateCraftedItemsDisplay();
            } else {
                console.error('Recipe not found for result:', resultName);
            }
            
            // Update inventory display
            const activeCategory = document.querySelector('.category-btn.active').dataset.category;
            loadIngredients(activeCategory);
            
            // Close modal and reset station
            resultModal.style.display = 'none';
            resetAlchemyStation();
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Failed to save changes. Please check console for details.');
        }
    });

    function updateCraftedItems() {
        const container = document.getElementById('crafted-items-container');
        container.innerHTML = '';
        
        Object.entries(craftedInventory).forEach(([itemName, count]) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'crafted-item';
            
            const recipe = recipes.find(r => r.result.name === itemName);
            if (recipe) {
                const img = document.createElement('img');
                img.src = recipe.result.image;
                img.alt = itemName;
                img.title = itemName;
                itemElement.appendChild(img);
                
                const countBadge = document.createElement('span');
                countBadge.className = 'crafted-count';
                countBadge.textContent = count;
                itemElement.appendChild(countBadge);
            }
            
            container.appendChild(itemElement);
        });
    }

    function displayCraftedItems() {
        const craftedContainer = document.getElementById('crafted-items-container');
        craftedContainer.innerHTML = '';
        
        console.log("Displaying crafted items:", craftedItems);
        
        Object.keys(craftedItems).forEach(itemId => {
            const count = craftedItems[itemId];
            if (count > 0) {
                const recipe = recipes.find(r => r.id === itemId);
                if (recipe && recipe.result) {
                    const itemBox = document.createElement('div');
                    itemBox.className = 'item-box crafted-item';
                    itemBox.dataset.id = itemId;
                    
                    // Log the recipe we're trying to display
                    console.log(`Creating crafted item display for: ${recipe.id}`, recipe.result);
                    
                    const img = document.createElement('img');
                    // Ensure image path includes assets/images/ prefix
                    let imagePath = recipe.result.image;
                    if (!imagePath.includes('assets/images/') && !imagePath.includes(':\\')) {
                        imagePath = 'assets/images/' + imagePath;
                    }
                    img.src = imagePath;
                    img.alt = recipe.result.name;
                    
                    // Add error handling for image loading
                    img.onerror = function() {
                        console.error(`Failed to load image for ${recipe.id}: ${imagePath}`);
                        // Try alternate image path if available
                        if (recipe.result.craftedImage) {
                            const altImagePath = recipe.result.craftedImage;
                            console.log(`Trying alternate image path: ${altImagePath}`);
                            img.src = altImagePath;
                        } else {
                            // Use a placeholder
                            img.src = 'assets/images/placeholder.png';
                        }
                    };
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = recipe.result.name;
                    
                    const countSpan = document.createElement('span');
                    countSpan.className = 'count-badge';
                    countSpan.textContent = count;
                    
                    itemBox.appendChild(img);
                    itemBox.appendChild(nameSpan);
                    itemBox.appendChild(countSpan);
                    
                    // Add event listener for item details
                    itemBox.addEventListener('click', function() {
                        showCraftedItemDetails(recipe.result);
                    });
                    
                    craftedContainer.appendChild(itemBox);
                    
                    console.log(`Displayed crafted item: ${recipe.result.name}, image: ${img.src}`);
                } else {
                    console.warn(`No recipe found for crafted item: ${itemId}`);
                }
            }
        });
    }

    // Initialize crafted items display
    updateCraftedItems();
    
    // Event Listeners for Recipe Book
    recipeBookButton.addEventListener('click', function() {
        loadRecipeBook();
        recipeBookModal.style.display = 'block';
    });
    
    // Close Recipe Book modal when clicking X
    const recipeBookClose = recipeBookModal.querySelector('.close');
    recipeBookClose.addEventListener('click', function() {
        recipeBookModal.style.display = 'none';
    });
    
    // Make slots accept dragged ingredients and handle right-click removal
    slots.forEach(slot => {
        slot.addEventListener('dragover', allowDrop);
        slot.addEventListener('drop', drop);
        slot.addEventListener('dragenter', dragEnter);
        slot.addEventListener('dragleave', dragLeave);
        
        // Add right-click handler for removal
        slot.addEventListener('contextmenu', function(e) {
            e.preventDefault(); // Prevent context menu
            const position = this.dataset.position;
            
            // If there's an ingredient in this slot, remove it
            if (slotContents[position]) {
                // Return the ingredient to inventory
                playerInventory[slotContents[position].id]++;
                
                // Play removal sound
                playSlotSound(true);
                
                // Clear the slot
                slotContents[position] = null;
                this.innerHTML = '';
                
                // Reload the ingredients drawer to update counts
                const activeCategory = document.querySelector('.category-btn.active').dataset.category;
                loadIngredients(activeCategory);
                
                // Update channels
                updateChannels();
                
                // Update brew button state
                checkBrewButton();
                
                // Check for discovered recipes
                checkForDiscoveredRecipe();
            }
        });
    });
    
    // Function to load ingredients into the drawer based on category
    function loadIngredients(category) {
        ingredientsContainer.innerHTML = '';
        
        const filteredIngredients = getIngredientsByCategory(category);
        
        // Add debug info to help locate issues
        console.log('Loading ingredients:', filteredIngredients);
        console.log('Player inventory:', playerInventory);
        
        filteredIngredients.forEach(ingredient => {
            if (playerInventory[ingredient.id] && playerInventory[ingredient.id] > 0) {
                const ingredientElement = document.createElement('div');
                ingredientElement.className = `ingredient-item ${ingredient.category}`;
                ingredientElement.dataset.id = ingredient.id;
                ingredientElement.draggable = true;
                
                // Use unicode character if image doesn't exist
                if (!ingredient.image) {
                    ingredientElement.textContent = getGreekLetter(ingredient.name);
                } else {
                    const img = document.createElement('img');
                    // Check for absolute vs relative path and add error handling
                    img.src = ingredient.image.includes(':\\') ? ingredient.image : ingredient.image;
                    img.alt = ingredient.name;
                    img.onerror = function() {
                        console.error(`Failed to load image: ${img.src}`);
                        this.onerror = null;
                        this.src = ''; // Clear the src to prevent continuous error
                        ingredientElement.textContent = getGreekLetter(ingredient.name);
                    };
                    ingredientElement.appendChild(img);
                }
                
                // Restore the count badges to show inventory amounts
                const countBadge = document.createElement('span');
                countBadge.className = 'ingredient-count';
                countBadge.textContent = playerInventory[ingredient.id];
                ingredientElement.appendChild(countBadge);
                
                // Fix drag and drop events
                ingredientElement.addEventListener('dragstart', function(e) {
                    e.dataTransfer.setData('text/plain', this.dataset.id);
                    this.classList.add('dragging');
                    // Ensure dragImage looks good
                    const dragImg = this.cloneNode(true);
                    dragImg.style.width = '60px';
                    dragImg.style.height = '60px';
                    document.body.appendChild(dragImg);
                    e.dataTransfer.setDragImage(dragImg, 30, 30);
                    setTimeout(() => {
                        document.body.removeChild(dragImg);
                    }, 0);
                });
                
                ingredientsContainer.appendChild(ingredientElement);
            }
        });
    }
    
    // Function to load items into the compendium
    function loadCompendiumItems(category) {
        const compendiumItems = document.querySelector('.compendium-items');
        compendiumItems.innerHTML = '';
        
        const filteredIngredients = getIngredientsByCategory(category);
        
        filteredIngredients.forEach(ingredient => {
            // Only show ingredients the player has discovered
            if (playerInventory[ingredient.id] && playerInventory[ingredient.id] > 0) {
                const itemElement = document.createElement('div');
                itemElement.className = 'compendium-item';
                
                // Use unicode character if image doesn't exist
                if (!ingredient.image) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'greek-placeholder';
                    placeholder.textContent = getGreekLetter(ingredient.name);
                    itemElement.appendChild(placeholder);
                } else {
                    const img = document.createElement('img');
                    img.src = ingredient.image.includes(':\\') ? ingredient.image : ingredient.image;
                    img.alt = ingredient.name;
                    img.onerror = function() {
                        console.error(`Failed to load compendium image: ${img.src}`);
                        this.onerror = null;
                        this.src = '';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'greek-placeholder';
                        placeholder.textContent = getGreekLetter(ingredient.name);
                        itemElement.replaceChild(placeholder, this);
                    };
                    itemElement.appendChild(img);
                }
                
                const name = document.createElement('h4');
                name.textContent = ingredient.name;
                itemElement.appendChild(name);
                
                const description = document.createElement('p');
                description.textContent = ingredient.description;
                itemElement.appendChild(description);
                
                compendiumItems.appendChild(itemElement);
            }
        });
    }
    
    // Drag and drop functions
    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
        e.target.classList.add('dragging');
        
        // Log the drag operation to verify it's working
        console.log('Dragging ingredient with ID:', e.target.dataset.id);
        
        // Ensure dragImage looks good
        const dragImg = e.target.cloneNode(true);
        dragImg.style.width = '60px';
        dragImg.style.height = '60px';
        document.body.appendChild(dragImg);
        e.dataTransfer.setDragImage(dragImg, 30, 30);
        setTimeout(() => {
            document.body.removeChild(dragImg);
        }, 0);
    }
    
    function allowDrop(e) {
        e.preventDefault();
    }
    
    function dragEnter(e) {
        e.preventDefault();
        e.target.classList.add('can-drop');
    }
    
    function dragLeave(e) {
        e.target.classList.remove('can-drop');
    }
    
    function drop(e) {
        e.preventDefault();
        
        // Log the drop event
        console.log('Drop event triggered');
        
        // Get the slot element, accounting for nested elements
        const slot = e.target.closest('.ingredient-slot');
        if (!slot) {
            console.log('No valid slot found for drop');
            return;
        }
        
        slot.classList.remove('can-drop');
        const ingredientId = e.dataTransfer.getData('text/plain');
        console.log('Dropped ingredient ID:', ingredientId);
        
        // Find the dragging element if it exists
        const draggingElement = document.querySelector(`.ingredient-item[data-id="${ingredientId}"]`);
        if (draggingElement) {
            draggingElement.classList.remove('dragging');
        } else {
            console.warn('Could not find dragging element with ID:', ingredientId);
        }
        
        // Get the ingredient by ID
        const ingredient = getIngredientById(ingredientId);
        if (!ingredient) {
            console.error('Could not find ingredient with ID:', ingredientId);
            return;
        }
        
        // Get the position (a, b, c, d, e)
        const position = slot.dataset.position;
        
        // Check if this is the exotic slot (e) and if the ingredient is legendary
        if (position === 'e' && !ingredient.category.includes('legendary')) {
            alert('Only legendary ingredients can be placed in the exotic slot!');
            return;
        }
        
        // If there's already an ingredient in this slot, put it back in inventory
        if (slotContents[position]) {
            playerInventory[slotContents[position].id]++;
            playSlotSound(true);  // Play removal sound
        }
        
        // Decrease inventory count and play placement sound
        playerInventory[ingredientId]--;
        playSlotSound(false);  // Play placement sound
        
        // Update the slot with the new ingredient
        slotContents[position] = ingredient;
        
        // Update slot visually
        updateSlot(slot, ingredient);
        
        // Reload the ingredients drawer to update counts
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;
        loadIngredients(activeCategory);
        
        // Update channels
        updateChannels();
        
        // Enable/disable brew button
        checkBrewButton();
        
        // Check for discovered recipes
        checkForDiscoveredRecipe();
    }
    
    // Update the slot with an ingredient
    function updateSlot(slot, ingredient) {
        slot.innerHTML = '';
        
        if (ingredient) {
            if (!ingredient.image) {
                slot.textContent = getGreekLetter(ingredient.name);
                slot.style.color = ingredient.color || '#ffffff';
            } else {
                const img = document.createElement('img');
                img.src = ingredient.image.includes(':\\') ? ingredient.image : ingredient.image;
                img.alt = ingredient.name;
                img.onerror = function() {
                    console.error(`Failed to load slot image: ${img.src}`);
                    this.onerror = null;
                    this.src = '';
                    slot.textContent = getGreekLetter(ingredient.name);
                    slot.style.color = ingredient.color || '#ffffff';
                };
                slot.appendChild(img);
            }
        }
    }
    
    // Update channels between ingredients
    function updateChannels() {
        // Remove channel-e-result from channels list
        updateChannel('channel-a-b', slotContents.a, slotContents.b);
        updateChannel('channel-b-c', slotContents.b, slotContents.c);
        updateChannel('channel-c-d', slotContents.c, slotContents.d);
        updateChannel('channel-d-e', slotContents.d, slotContents.e);
        
        // Add exotic effects when slot E is filled
        const slotsContainer = document.querySelector('.slots-container');
        if (slotContents.e && slotContents.e.category.includes('legendary')) {
            slotsContainer.classList.add('exotic-active');
            document.querySelectorAll('.ingredient-slot, .result-chamber').forEach(el => {
                el.classList.add('exotic-sparkle');
            });
        } else {
            slotsContainer.classList.remove('exotic-active');
            document.querySelectorAll('.ingredient-slot, .result-chamber').forEach(el => {
                el.classList.remove('exotic-sparkle');
            });
        }
    }
    
    // Update a specific channel with gradient colors
    function updateChannel(channelId, startIngredient, endIngredient) {
        const channel = document.getElementById(channelId);
        if (!channel) return;

        const existingFill = channel.querySelector('div');
        const hasRequirements = startIngredient && endIngredient;
        
        // Check if this is the first connected channel
        const isFirstChannel = channelId === 'channel-a-b';
        const anyChannelFilled = document.querySelector('.channel div.filled');

        // If no ingredients or missing connection, clear the channel
        if (!hasRequirements) {
            if (existingFill) {
                // Fade out animation
                existingFill.style.transition = 'opacity 0.3s';
                existingFill.style.opacity = '0';
                setTimeout(() => {
                    channel.innerHTML = '';
                }, 300);
                
                // If this was the last filled channel, stop the sound
                if (!document.querySelector('.channel div.filled')) {
                    if (sounds.liquidFlow) {
                        sounds.liquidFlow.loop = false;
                        sounds.liquidFlow.pause();
                        sounds.liquidFlow.currentTime = 0;
                    }
                }
            }
            return;
        }

        // If already filled and still has requirements, do nothing
        if (existingFill && existingFill.classList.contains('filled')) {
            return;
        }

        // Create new fill element
        const fillDiv = document.createElement('div');
        channel.innerHTML = '';
        channel.appendChild(fillDiv);

        // Force reflow
        fillDiv.offsetHeight;

        // Add animation class
        fillDiv.classList.add('animate');

        // After animation completes, add filled class
        fillDiv.addEventListener('animationend', () => {
            fillDiv.classList.remove('animate');
            fillDiv.classList.add('filled');
        });

        // Play/manage liquid flow sound
        if (!anyChannelFilled) {
            if (sounds.liquidFlow) {
                sounds.liquidFlow.loop = true;
                sounds.liquidFlow.volume = 0.5;
                sounds.liquidFlow.currentTime = 0;
                sounds.liquidFlow.play().catch(console.error);
            }
        }
    }
    
    // Helper function to convert color to hue rotation
    function getHueRotation(color) {
        // Extract RGB from hex
        let r, g, b;
        if (color.startsWith('#')) {
            const hex = color.substring(1);
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            // Default values if color parsing fails
            r = 0;
            g = 150;
            b = 255;
        }
        
        // Convert RGB to HSL and return hue
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        
        if (max === min) {
            h = 0; // achromatic
        } else {
            const d = max - min;
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }
        
        // Map the hue to a rotation value (210 is the base hue of our animation)
        return (h - 210) % 360;
    }
    
    // Check if we can brew a potion and enable/disable button
    function checkBrewButton() {
        const brewBtn = document.getElementById('brew-btn');
        if (brewBtn) {
            // Logic for enabling/disabling the brew button
            const hasIngredients = Object.values(slotContents).some(slot => slot !== null);
            
            // Toggle button state based on whether there are ingredients
            if (hasIngredients) {
                brewBtn.classList.remove('disabled');
                brewBtn.src = "assets/images/button1a.png"; // Active state with higher resolution
                brewBtn.style.cursor = "pointer";
            } else {
                brewBtn.classList.add('disabled');
                brewBtn.src = "assets/images/button.png"; // Inactive state
                brewBtn.style.cursor = "not-allowed";
            }
        }
    }
    
    // Brew the potion when button is clicked (now called "Craft")
    function brewPotion() {
        console.group('Brewing Process');
        console.log('Current slot contents:', slotContents);
        
        // Try to find a matching recipe
        const recipe = findMatchingRecipe(slotContents);
        console.log('Found recipe:', recipe?.id);
        
        if (recipe) {
            console.log('Starting brewing animation for:', recipe.id);
            // Store success state for later
            lastRecipeSuccess = true;
            
            // Mark recipe as discovered immediately
            if (!discoveredRecipes[recipe.id]) {
                discoveredRecipes[recipe.id] = true;
                localStorage.setItem('discoveredRecipes', JSON.stringify(discoveredRecipes));
            }
            
            // Clear ingredients from slots immediately
            Object.keys(slotContents).forEach(slot => {
                if (slotContents[slot]) {
                    const slotElement = document.querySelector(`#slot-${slot}`);
                    if (slotElement) {
                        slotElement.innerHTML = '';
                    }
                }
            });
            
            // Reset slot contents
            slotContents = {
                a: null,
                b: null,
                c: null,
                d: null,
                e: null
            };
            
            // Animate the brewing process
            animateBrewingProcess().then(() => {
                // Show result after animation completes
                displayResult(recipe.result);
                
                // Play success sound only once here
                if (recipe.id === 'turbonado-sugar' || recipe.id === 'azure-ice-cream') {
                    playSound('legendarySuccess', { volume: 0.7 });
                } else {
                    playSound('success', { volume: 0.7 });
                }
                
                // Save inventory changes
                localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
                
                // Update ingredients drawer
                const activeCategory = document.querySelector('.category-btn.active').dataset.category;
                loadIngredients(activeCategory);
            });
        } else {
            // Handle failure...
            lastRecipeSuccess = false;
            animateFailedBrewing().then(() => {
                alert("Your concoction fizzles and bubbles, but produces nothing useful.");
                resetAlchemyStation();
            });
        }
        console.groupEnd();
    }
    
    // Animate the brewing process
    function animateBrewingProcess() {
        return new Promise(resolve => {
            // Play liquid flow sound
            playSound('liquidFlow', { volume: 0.5 });
            
            // Disable brew button during animation
            brewButton.disabled = true;

            // Define all channels in order of animation
            const primaryChannels = ['channel-a-b', 'channel-b-c', 'channel-c-d'];
            const convergingChannel = 'channel-d-e';
            
            // Animate primary channels simultaneously
            primaryChannels.forEach(channelId => {
                const channel = document.getElementById(channelId);
                if (channel) {
                    const fill = document.createElement('div');
                    fill.className = 'channel-filled converging';
                    channel.appendChild(fill);
                }
            });

            // After primary channels, animate converging channel
            setTimeout(() => {
                const convergingChan = document.getElementById(convergingChannel);
                if (convergingChan) {
                    const fill = document.createElement('div');
                    fill.className = 'channel-filled center-flow';
                    convergingChan.appendChild(fill);
                }

                // Animate result chamber
                setTimeout(() => {
                    const resultChamber = document.getElementById('result-chamber');
                    resultChamber.classList.add('glow');
                    
                    // Complete animation
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                }, 1000);
            }, 1500);

            // Fade out sound gradually
            const fadeInterval = setInterval(() => {
                if (sounds.liquidFlow && sounds.liquidFlow.volume > 0.01) {
                    sounds.liquidFlow.volume = Math.max(0, sounds.liquidFlow.volume - 0.1);
                } else {
                    clearInterval(fadeInterval);
                    if (sounds.liquidFlow) {
                        sounds.liquidFlow.pause();
                        sounds.liquidFlow.volume = 0.5;
                    }
                }
            }, 200);
        });
    }
    
    // Animate a failed brewing attempt
    function animateFailedBrewing() {
        return new Promise(resolve => {
            // Similar to brewing animation but with different colors to indicate failure
            const channels = [
                'channel-a-b',
                'channel-b-c',
                'channel-c-d',
                'channel-d-e',
                'channel-e-result'
            ];
            
            // Disable brew button during animation
            brewButton.disabled = true;
            
            // Animate each channel turning red in sequence
            let delay = 0;
            channels.forEach(channelId => {
                const channel = document.getElementById(channelId);
                const channelFill = channel.querySelector('.channel-filled');
                
                if (channelFill) {
                    setTimeout(() => {
                        channelFill.style.background = 'red';
                    }, delay);
                    delay += 300;
                }
            });
            
            // Animate the result chamber with a "poof" effect
            setTimeout(() => {
                const resultChamber = document.getElementById('result-chamber');
                resultChamber.style.backgroundColor = '#8d6e63';
                resultChamber.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
                
                // Play fail sound
                playSound('fail', { volume: 0.7 });
                
                // Reset after animation
                setTimeout(() => {
                    resultChamber.style.backgroundColor = '';
                    resultChamber.style.boxShadow = '';
                    resolve();
                }, 1000);
            }, delay);
        });
    }
    
    // Display the result of successful brewing
    function displayResult(result) {
        // Set the result image in the chamber
        const resultChamber = document.getElementById('result-chamber');
        resultChamber.innerHTML = '';
        
        const img = document.createElement('img');
        const isVanillaIceCream = result.image.includes('VanillaIceCream');
        img.src = isVanillaIceCream ? result.image.replace('VanillaIceCream', 'VanillaIceCreamSMALL') : result.image;
        img.alt = result.name;
        img.onerror = function() {
            console.error(`Failed to load result image: ${img.src}`);
            this.onerror = null;
            this.src = '';
            resultChamber.textContent = '✨'; // Use a sparkle character as fallback
        };
        resultChamber.appendChild(img);
        
        // Fill in the result modal
        const resultImg = document.getElementById('result-image');
        resultImg.src = result.image.includes(':\\') ? result.image : result.image;
        resultImg.onerror = function() {
            console.error(`Failed to load modal result image: ${resultImg.src}`);
            this.onerror = null;
            this.src = '';
        };
        
        document.getElementById('result-name').textContent = result.name;
        document.getElementById('result-description').textContent = result.description;
        document.getElementById('result-effects').textContent = result.effects;
        
        // Show crafted item count if we've made this before
        const countElement = document.getElementById('crafted-count');
        if (countElement) {
            const recipe = Object.values(recipes).find(r => r.result.name === result.name);
            const count = recipe && playerCraftedItems && playerCraftedItems[recipe.id] ? playerCraftedItems[recipe.id] : 1;
            countElement.textContent = `You have crafted this ${count} time${count !== 1 ? 's' : ''}.`;
            countElement.style.display = 'block';
        }
        
        // Show the result modal
        resultModal.style.display = 'block';
    }
    
    // Reset the alchemy station after brewing
    function resetAlchemyStation() {
        // Clear slot contents
        slotContents = {
            a: null,
            b: null,
            c: null,
            d: null,
            e: null
        };
        
        // Clear slot visuals
        slots.forEach(slot => {
            slot.innerHTML = '';
        });
        
        // Clear channels with fade animation
        const channels = document.querySelectorAll('.channel');
        channels.forEach(channel => {
            const fill = channel.querySelector('div');
            if (fill) {
                fill.style.transition = 'opacity 0.3s';
                fill.style.opacity = '0';
                setTimeout(() => {
                    channel.innerHTML = '';
                }, 300);
            }
        });
        
        // Clear result chamber
        const resultChamber = document.getElementById('result-chamber');
        resultChamber.innerHTML = '';
        resultChamber.classList.remove('glow');
        resultChamber.classList.remove('discovered');
        resultChamber.title = '';
        
        // Disable brew button
        brewButton.disabled = true;
        
        // Remove exotic effects
        document.querySelector('.slots-container').classList.remove('exotic-active');
        document.querySelectorAll('.ingredient-slot, .result-chamber').forEach(el => {
            el.classList.remove('exotic-sparkle');
        });
        
        // Stop any playing sounds
        if (sounds.liquidFlow) {
            sounds.liquidFlow.loop = false;
            sounds.liquidFlow.pause();
            sounds.liquidFlow.currentTime = 0;
        }
        
        // Reload ingredients drawer
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;
        loadIngredients(activeCategory);
    }
    
    // Helper function to get Greek letter for ingredients without images
    function getGreekLetter(name) {
        const greekLetters = {
            'a': 'α', 'b': 'β', 'c': 'γ', 'd': 'δ', 'e': 'ε',
            'f': 'ζ', 'g': 'η', 'h': 'θ', 'i': 'ι', 'j': 'κ',
            'k': 'λ', 'l': 'μ', 'm': 'ν', 'n': 'ξ', 'o': 'ο',
            'p': 'π', 'q': 'ρ', 'r': 'σ', 's': 'τ', 't': 'υ',
            'u': 'φ', 'v': 'χ', 'w': 'ψ', 'x': 'ω', 'y': 'ς',
            'z': 'ω'
        };
        
        // Get first letter of name and return corresponding Greek letter
        const firstChar = name.charAt(0).toLowerCase();
        return greekLetters[firstChar] || firstChar;
    }
    
    // Function to check if current slots match a known recipe
    function checkForDiscoveredRecipe() {
        const recipe = findMatchingRecipe(slotContents);
        const resultChamber = document.getElementById('result-chamber');
        resultChamber.innerHTML = ''; // Always clear result chamber

        // Remove preview box functionality - it creates ghost elements
        let previewBox = document.querySelector('.recipe-preview');
        if (previewBox) {
            previewBox.remove();
        }
    }
    
    // Helper function to check if recipe is complete
    function isRecipeComplete(slots, recipe) {
        // Check if all required ingredients are present
        const requiredCount = recipe.ingredients.length + (recipe.exoticIngredient ? 1 : 0);
        const currentCount = Object.values(slots).filter(slot => slot !== null).length;
        
        if (currentCount !== requiredCount) return false;
        
        // For recipes with specific slot requirements
        if (recipe.validate) {
            return recipe.validate(slots);
        }
        
        // For standard recipes
        const ingredientIds = [];
        for (const position of ['a', 'b', 'c', 'd']) {
            if (slots[position]) {
                ingredientIds.push(slots[position].id);
            }
        }
        
        const allIngredientsMatch = recipe.ingredients.every(ingId => 
            ingredientIds.includes(ingId)
        );
        
        const exoticMatches = 
            (recipe.exoticIngredient === null && !slots.e) || 
            (recipe.exoticIngredient && slots.e?.id === recipe.exoticIngredient);
        
        return allIngredientsMatch && exoticMatches;
    }
    
    // Function to load the recipe book
    function loadRecipeBook() {
        console.log('Loading recipe book...');
        const recipeBookItems = document.querySelector('.recipe-book-items');
        
        // Clear any existing content to prevent duplication
        if (recipeBookItems) {
            recipeBookItems.innerHTML = '';
        } else {
            console.error('Recipe book items container not found!');
            return;
        }
        
        // Load discovered recipes from localStorage if they exist
        const savedRecipes = localStorage.getItem('discoveredRecipes');
        if (savedRecipes) {
            discoveredRecipes = JSON.parse(savedRecipes);
        }
        
        // Track how many recipes are added
        let recipesAdded = 0;
        
        recipes.forEach(recipe => {
            // Only show recipes that have been discovered
            if (discoveredRecipes[recipe.id]) {
                recipesAdded++;
                const recipeElement = document.createElement('div');
                recipeElement.className = 'recipe-item';
                
                // Add recipe image in a container to control size
                const imageContainer = document.createElement('div');
                imageContainer.className = 'recipe-item-image';
                const img = document.createElement('img');
                img.src = recipe.result.image.includes(':\\') ? recipe.result.image : recipe.result.image;
                img.alt = recipe.result.name;
                img.onerror = function() {
                    this.onerror = null;
                    imageContainer.textContent = '✨';
                };
                imageContainer.appendChild(img);
                recipeElement.appendChild(imageContainer);
                
                // Add recipe name
                const name = document.createElement('h3');
                name.textContent = recipe.result.name;
                name.style.fontSize = '0.9rem';
                name.style.margin = '8px 0';
                recipeElement.appendChild(name);
                
                // Add recipe description - keep it very short
                const description = document.createElement('p');
                const shortDesc = recipe.result.description.length > 120 ? 
                    recipe.result.description.substring(0, 117) + '...' : 
                    recipe.result.description;
                description.textContent = shortDesc;
                description.title = recipe.result.description; // Full description on hover
                description.className = 'recipe-description';
                recipeElement.appendChild(description);
                
                // Add recipe effects - make this more compact
                const effects = document.createElement('p');
                effects.innerHTML = `<strong>Effects:</strong> ${recipe.result.effects.length > 100 ? 
                    recipe.result.effects.substring(0, 97) + '...' : 
                    recipe.result.effects}`;
                effects.title = recipe.result.effects; // Full effects on hover
                effects.className = 'recipe-effects';
                recipeElement.appendChild(effects);
                
                // Add ingredient list
                const instructionsContainer = document.createElement('div');
                instructionsContainer.className = 'recipe-instructions';
                instructionsContainer.style.marginTop = '5px';
                instructionsContainer.style.padding = '5px 0';
                
                const ingredientsTitle = document.createElement('p');
                ingredientsTitle.innerHTML = '<strong>Recipe:</strong>';
                ingredientsTitle.style.textAlign = 'center';
                ingredientsTitle.style.marginBottom = '4px';
                ingredientsTitle.style.fontSize = '0.8rem';
                instructionsContainer.appendChild(ingredientsTitle);
                
                const ingredientsContainer = document.createElement('div');
                ingredientsContainer.className = 'recipe-ingredients';
                ingredientsContainer.style.display = 'flex';
                ingredientsContainer.style.justifyContent = 'center';
                ingredientsContainer.style.gap = '5px';
                
                // Create recipe ingredient elements for all ingredients upfront
                const ingredientElements = [];
                
                // Add regular ingredients - remove size restrictions to show more text
                recipe.ingredients.forEach(ingredientId => {
                    const ingredient = getIngredientById(ingredientId);
                    if (ingredient) {
                        const ingredientElement = document.createElement('div');
                        ingredientElement.className = 'recipe-ingredient';
                        ingredientElement.title = ingredient.name;
                        ingredientElement.style.width = '45px';  // Increased from 25px
                        ingredientElement.style.height = '45px'; // Increased from 25px
                        ingredientElement.style.position = 'relative';
                        ingredientElement.style.display = 'flex';
                        ingredientElement.style.justifyContent = 'center';
                        ingredientElement.style.alignItems = 'center';
                        
                        const img = document.createElement('img');
                        img.src = ingredient.image.includes(':\\') ? ingredient.image : ingredient.image;
                        img.alt = ingredient.name;
                        img.style.maxWidth = '100%';
                        img.style.maxHeight = '100%';
                        img.style.objectFit = 'contain';
                        
                        img.onerror = function() {
                            this.onerror = null;
                            ingredientElement.textContent = getGreekLetter(ingredient.name);
                            ingredientElement.style.fontSize = '0.7rem';
                        };
                        ingredientElement.appendChild(img);
                        ingredientElements.push(ingredientElement);
                    }
                });
                
                // Add exotic ingredient if present - with special styling
                if (recipe.exoticIngredient) {
                    const exoticIngredient = getIngredientById(recipe.exoticIngredient);
                    if (exoticIngredient) {
                        const exoticElement = document.createElement('div');
                        exoticElement.className = 'recipe-ingredient legendary';
                        exoticElement.title = exoticIngredient.name + ' (Exotic)';
                        exoticElement.style.width = '35px';  // Increased from 25px
                        exoticElement.style.height = '35px'; // Increased from 25px
                        exoticElement.style.borderColor = '#b39ddb';
                        exoticElement.style.justifyContent = 'center';
                        exoticElement.style.alignItems = 'center';
                        
                        const img = document.createElement('img');
                        img.src = exoticIngredient.image.includes(':\\') ? exoticIngredient.image : exoticIngredient.image;
                        img.alt = exoticIngredient.name;
                        img.style.maxWidth = '100%';
                        img.style.maxHeight = '100%';
                        img.style.objectFit = 'contain';
                        
                        img.onerror = function() {
                            this.onerror = null;
                            exoticElement.textContent = getGreekLetter(exoticIngredient.name);
                            exoticElement.style.fontSize = '0.7rem';
                        };
                        exoticElement.appendChild(img);
                        ingredientElements.push(exoticElement);
                    }
                }
                
                // Now add all ingredient elements to the container
                ingredientElements.forEach(element => {
                    ingredientsContainer.appendChild(element);
                });
                
                instructionsContainer.appendChild(ingredientsContainer);
                recipeElement.appendChild(instructionsContainer);
                recipeBookItems.appendChild(recipeElement);
            }
        });
        
        console.log(`Added ${recipesAdded} recipes to the book`);
        
        // If no recipes have been discovered yet
        if (recipesAdded === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.style.gridColumn = '1 / -1';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '40px';
            emptyMessage.innerHTML = '<h3 style="color: var(--workspace-trim);">No Recipes Discovered Yet</h3>' +
                '<p>Craft successful recipes to fill your recipe book!</p>';
            recipeBookItems.appendChild(emptyMessage);
        }
    }
    
    // Initialize discovered recipes from localStorage
    // const savedRecipes = localStorage.getItem('discoveredRecipes');
    // if (savedRecipes) {
    //     discoveredRecipes = JSON.parse(savedRecipes);
    // }

    // Initialize player's crafted items from localStorage
    // let playerCraftedItems = {};
    // const savedCraftedItems = localStorage.getItem('playerCraftedItems');
    // if (savedCraftedItems) {
    //     playerCraftedItems = JSON.parse(savedCraftedItems);
    // }
    
    // Initialize player's inventory (add this if missing)
    // let playerInventory = {};

    // Function to initialize inventory (add this if missing)
    // function initializeInventory() {
    //     // Load from localStorage if it exists
    //     const savedInventory = localStorage.getItem('playerInventory');
    //     if (savedInventory) {
    //         playerInventory = JSON.parse(savedInventory);
    //     } else {
    //         // Initialize with some starter ingredients
    //         playerInventory = {
    //             'herb1': 5,
    //             'crystal1': 3,
    //             'metal1': 3,
    //             'essence1': 2,
    //             'legendary1': 1
    //         };
    //         // Save initial inventory
    //         localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
    //     }
    // }

    // Helper function to get ingredients by category
    function getIngredientsByCategory(category) {
        if (!ingredients) {
            console.error('Ingredients data not loaded!');
            return [];
        }
        
        if (category === 'all') {
            return ingredients;
        }
        return ingredients.filter(i => i.category.includes(category));
    }

    // Helper function to get ingredient by ID
    function getIngredientById(id) {
        // First check ingredients array
        const ingredient = ingredients.find(ing => ing.id === id);
        if (ingredient) return ingredient;
        
        // Then check recipe results (for crafted items)
        for (const recipe of recipes) {
            if (recipe.result && (recipe.result.id === id || recipe.id === id)) {
                return recipe.result;
            }
        }
        
        return null;
    }

    // Function to find matching recipe - improved to handle similar recipes like herb butter vs typical butter
    function findMatchingRecipe(slots) {
        if (!recipes) {
            console.error('Recipes data not loaded!');
            return null;
        }
        
        // Get all filled slot IDs
        const slotIngredients = {};
        for (const [position, ingredient] of Object.entries(slots)) {
            if (ingredient) {
                slotIngredients[position] = ingredient.id;
            }
        }
        
        // Count ingredients of each type
        const ingredientCounts = {};
        Object.values(slotIngredients).forEach(id => {
            ingredientCounts[id] = (ingredientCounts[id] || 0) + 1;
        });
        
        console.log('Searching for recipe with ingredients:', slotIngredients);
        console.log('Ingredient counts:', ingredientCounts);
        
        // First check for recipes with specific slot requirements or exact validation
        for (const recipe of recipes) {
            // If recipe has a custom validation function, use it first
            if (recipe.validate && recipe.validate(slots)) {
                console.log('Found recipe with custom validation:', recipe.id);
                return recipe;
            }
        }
        
        // Then look for recipes with exact ingredient match (including counts)
        const matchingRecipes = recipes.filter(recipe => {
            // Skip recipes with custom validation as we already checked those
            if (recipe.validate) return false;
            
            // Check if all required ingredients are present
            const requiredCount = recipe.ingredients.length + (recipe.exoticIngredient ? 1 : 0);
            const filledSlots = Object.values(slots).filter(slot => slot !== null).length;
            
            if (filledSlots !== requiredCount) return false;
            
            // Count recipe ingredients
            const recipeIngredientCounts = {};
            recipe.ingredients.forEach(id => {
                recipeIngredientCounts[id] = (recipeIngredientCounts[id] || 0) + 1;
            });
            
            if (recipe.exoticIngredient) {
                recipeIngredientCounts[recipe.exoticIngredient] = 
                    (recipeIngredientCounts[recipe.exoticIngredient] || 0) + 1;
            }
            
            // Check if ingredient counts match exactly
            const allIngredientsMatch = Object.entries(recipeIngredientCounts).every(([id, count]) => 
                ingredientCounts[id] === count
            );
            
            const noExtraIngredients = Object.keys(ingredientCounts).every(id => 
                recipeIngredientCounts[id] !== undefined
            );
            
            return allIngredientsMatch && noExtraIngredients;
        });
        
        // If we found exactly one matching recipe, return it
        if (matchingRecipes.length === 1) {
            console.log('Found recipe with exact ingredient match:', matchingRecipes[0].id);
            return matchingRecipes[0];
        }
        
        // If we found multiple matching recipes, prioritize more specific ones
        // (assuming herb butter is more specific than typical butter)
        if (matchingRecipes.length > 1) {
            console.log('Found multiple matching recipes:', matchingRecipes.map(r => r.id));
            
            // First, check if herb butter is among the matches
            const herbButterRecipe = matchingRecipes.find(r => r.id.includes('herb') && r.id.includes('butter'));
            if (herbButterRecipe) {
                console.log('Prioritizing herb butter recipe');
                return herbButterRecipe;
            }
            
            // If no specific rules match, return the first recipe (but log a warning)
            console.warn('Multiple matching recipes found with no priority rule, using first match');
            return matchingRecipes[0];
        }
        
        // Finally, fall back to the original simpler matching logic
        return recipes.find(recipe => {
            // Skip recipes with validate function as we already checked those
            if (recipe.validate) return false;
            
            // Check if the exotic ingredient matches
            const exoticMatches = !recipe.exoticIngredient || 
                (slots.e && slots.e.id === recipe.exoticIngredient);
                
            if (!exoticMatches) return false;
            
            // Get all non-exotic ingredient IDs from filled slots
            const nonExoticIngredients = Object.entries(slots)
                .filter(([pos, ing]) => pos !== 'e' && ing !== null)
                .map(([pos, ing]) => ing.id);
            
            // Check if all recipe ingredients are in the slots
            return recipe.ingredients.every(id => nonExoticIngredients.includes(id));
        });
    }

    // Helper function to handle crafted items correctly
    function updateCraftedItemsDisplay() {
        const container = document.getElementById('crafted-items-container');
        if (!container) {
            console.error('Crafted items container not found!');
            return;
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        // Debug log
        console.log('Updating crafted items display');
        console.log('Player inventory:', playerInventory);
        console.log('Crafted inventory:', craftedInventory);
        console.log('Player crafted items:', playerCraftedItems);
        
        // Check all recipes, including Lovely Vanilla Ice Cream
        let craftedCount = 0;
        
        // We need to check both playerInventory and craftedInventory
        recipes.forEach(recipe => {
            if (!recipe || !recipe.id) return;
            
            // Check for this recipe in both inventories
            let count = 0;
            if (playerInventory && playerInventory[recipe.id]) {
                count += playerInventory[recipe.id];
            }
            if (craftedInventory && craftedInventory[recipe.id]) {
                count += craftedInventory[recipe.id];
            }
            
            // Create crafted item element if count > 0
            if (count > 0) {
                craftedCount++;
                
                // Create element
                const itemElement = document.createElement('div');
                itemElement.className = 'crafted-item';
                
                // Add appropriate classes based on category
                if (recipe.result.category) {
                    // Handle both string and array formats
                    if (typeof recipe.result.category === 'string') {
                        if (recipe.result.category.includes('food')) {
                            itemElement.classList.add('food');
                        }
                        if (recipe.result.category.includes('legendary')) {
                            itemElement.classList.add('legendary');
                        }
                    } else if (Array.isArray(recipe.result.category)) {
                        if (recipe.result.category.includes('food')) {
                            itemElement.classList.add('food');
                        }
                        if (recipe.result.category.includes('legendary')) {
                            itemElement.classList.add('legendary');
                        }
                    }
                }
                
                // Add the image
                const img = document.createElement('img');
                const imagePath = recipe.result.image;
                
                // Handle Lovely Vanilla Ice Cream specially if needed
                if (recipe.id === 'lovely-vanilla-ice-cream') {
                    console.log('Adding Lovely Vanilla Ice Cream to crafted items');
                }
                
                img.src = imagePath;
                img.alt = recipe.result.name;
                img.title = recipe.result.name;
                
                // Better error handling for image loading
                img.onerror = function() {
                    console.warn(`Failed to load crafted item image: ${img.src}`);
                    this.onerror = null;
                    
                    // Try with assets/images/ prefix if it's missing
                    if (!img.src.includes('assets/images/')) {
                        img.src = 'assets/images/' + imagePath;
                    } else {
                        this.src = 'assets/images/placeholder.png';
                    }
                };
                
                itemElement.appendChild(img);
                
                // Add count badge
                const countBadge = document.createElement('span');
                countBadge.className = 'crafted-count';
                countBadge.textContent = count;
                itemElement.appendChild(countBadge);
                
                container.appendChild(itemElement);
            }
        });
        
        // Show message if no crafted items
        if (craftedCount === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.style.padding = '10px';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.color = '#aaa';
            emptyMsg.textContent = 'No crafted items yet';
            container.appendChild(emptyMsg);
        }
        
        console.log(`Displayed ${craftedCount} crafted items`);
    }

    // Add the tooltip container to the DOM
    function createTooltipContainer() {
        // Check if tooltip container already exists
        if (document.getElementById('item-tooltip')) {
            return;
        }
        
        const tooltipContainer = document.createElement('div');
        tooltipContainer.id = 'item-tooltip';
        tooltipContainer.className = 'item-tooltip';
        tooltipContainer.style.display = 'none';
        tooltipContainer.style.position = 'fixed';
        tooltipContainer.style.zIndex = '1000';
        tooltipContainer.style.background = '#1e2128';
        tooltipContainer.style.border = '2px solid #3a4049';
        tooltipContainer.style.borderRadius = '8px';
        tooltipContainer.style.padding = '12px';
        tooltipContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        tooltipContainer.style.maxWidth = '320px';
        tooltipContainer.style.color = '#e0e0e0';
        tooltipContainer.style.fontSize = '14px';
        tooltipContainer.style.pointerEvents = 'none'; // Prevent the tooltip from capturing mouse events
        
        document.body.appendChild(tooltipContainer);
    }

    // Show tooltip with item info at mouse position
    function showItemTooltip(item, event) {
        event.preventDefault(); // Prevent the default context menu
        
        // Create tooltip container if it doesn't exist
        createTooltipContainer();
        
        const tooltip = document.getElementById('item-tooltip');
        if (!tooltip) return;
        
        // Fix: Ensure we're using valid item data
        if (!item || !item.name) {
            console.warn('Attempted to show tooltip for invalid item:', item);
            return;
        }
        
        // Build tooltip content
        tooltip.innerHTML = '';
        
        // Container for image and name (header)
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.marginBottom = '8px';
        
        // Item image
        const img = document.createElement('img');
        img.src = item.image;
        if (!img.src.includes('assets/images/') && !img.src.includes(':\\')) {
            img.src = 'assets/images/' + item.image;
        }
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.objectFit = 'contain';
        img.style.marginRight = '10px';
        img.style.borderRadius = '4px';
        img.style.border = item.category?.includes('legendary') ? '2px solid gold' : '1px solid #555';
        
        // Error fallback
        img.onerror = function() {
            console.warn(`Failed to load crafted item image: ${img.src}`);
            this.onerror = null;
            // Try with assets/images/ prefix if it's missing
            if (!img.src.includes('assets/images/')) {
                img.src = 'assets/images/' + item.image;
            } else {
                this.src = 'assets/images/placeholder.png';
            }
        };
        
        // Item name
        const name = document.createElement('h3');
        name.textContent = item.name;
        name.style.margin = '0';
        name.style.fontSize = '18px';
        name.style.color = item.category?.includes('legendary') ? '#ffd700' : '#ffffff';
        
        header.appendChild(img);
        header.appendChild(name);
        tooltip.appendChild(header);
        
        // Category badges
        const categories = document.createElement('div');
        categories.style.display = 'flex';
        categories.style.flexWrap = 'wrap';
        categories.style.gap = '4px';
        categories.style.marginBottom = '8px';
        
        if (item.category) {
            const categoryList = Array.isArray(item.category) ? item.category : [item.category];
            categoryList.forEach(cat => {
                const badge = document.createElement('span');
                badge.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
                badge.style.padding = '2px 6px';
                badge.style.borderRadius = '4px';
                badge.style.fontSize = '11px';
                badge.style.backgroundColor = getCategoryColor(cat);
                badge.style.color = '#fff';
                categories.appendChild(badge);
            });
        }
        
        tooltip.appendChild(categories);
        
        // Description
        if (item.description) {
            const desc = document.createElement('p');
            desc.textContent = item.description;
            desc.style.margin = '6px 0';
            desc.style.fontSize = '14px';
            tooltip.appendChild(desc);
        }
        
        // Effects (if present)
        if (item.effects) {
            const effectsTitle = document.createElement('h4');
            effectsTitle.textContent = 'Effects:';
            effectsTitle.style.margin = '8px 0 2px 0';
            effectsTitle.style.fontSize = '15px';
            effectsTitle.style.color = '#afd5ff';
            
            const effects = document.createElement('p');
            effects.textContent = item.effects;
            effects.style.margin = '4px 0 8px 0';
            effects.style.fontSize = '13px';
            
            tooltip.appendChild(effectsTitle);
            tooltip.appendChild(effects);
        }
        
        // Recipe ingredients (for crafted items)
        const recipe = recipes.find(r => r.result.name === item.name);
        if (recipe) {
            const ingredientsTitle = document.createElement('h4');
            ingredientsTitle.textContent = 'Recipe:';
            ingredientsTitle.style.margin = '8px 0 4px 0';
            ingredientsTitle.style.fontSize = '15px';
            ingredientsTitle.style.color = '#b8e986';
            
            const ingredientsList = document.createElement('div');
            ingredientsList.style.display = 'flex';
            ingredientsList.style.flexWrap = 'wrap';
            ingredientsList.style.gap = '6px';
            
            // Add regular ingredients
            recipe.ingredients.forEach(ingId => {
                const ing = getIngredientById(ingId);
                if (ing) {
                    const ingItem = document.createElement('div');
                    ingItem.style.width = '32px';
                    ingItem.style.height = '32px';
                    ingItem.style.position = 'relative';
                    ingItem.style.border = '1px solid #555';
                    ingItem.style.borderRadius = '4px';
                    ingItem.style.overflow = 'hidden';
                    
                    const ingImg = document.createElement('img');
                    let imagePath = ing.image;
                    if (!imagePath.includes('assets/images/') && !imagePath.includes(':\\')) {
                        imagePath = 'assets/images/' + imagePath;
                    }
                    ingImg.src = imagePath;
                    ingImg.style.width = '100%';
                    ingImg.style.height = '100%';
                    ingImg.style.objectFit = 'contain';
                    ingImg.title = ing.name;
                    
                    ingItem.appendChild(ingImg);
                    ingredientsList.appendChild(ingItem);
                }
            });
            
            // Add exotic ingredient if present
            if (recipe.exoticIngredient) {
                const exoticIng = getIngredientById(recipe.exoticIngredient);
                if (exoticIng) {
                    const exoticItem = document.createElement('div');
                    exoticItem.style.width = '32px';
                    exoticItem.style.height = '32px';
                    exoticItem.style.position = 'relative';
                    exoticItem.style.border = '2px solid gold';
                    exoticItem.style.borderRadius = '4px';
                    exoticItem.style.overflow = 'hidden';
                    
                    const exoticImg = document.createElement('img');
                    let imagePath = exoticIng.image;
                    if (!imagePath.includes('assets/images/') && !imagePath.includes(':\\')) {
                        imagePath = 'assets/images/' + imagePath;
                    }
                    exoticImg.src = imagePath;
                    exoticImg.style.width = '100%';
                    exoticImg.style.height = '100%';
                    exoticImg.style.objectFit = 'contain';
                    exoticImg.title = exoticIng.name + ' (Exotic)';
                    
                    exoticItem.appendChild(exoticImg);
                    ingredientsList.appendChild(exoticItem);
                }
            }
            
            tooltip.appendChild(ingredientsTitle);
            tooltip.appendChild(ingredientsList);
        }
        
        // Position tooltip near the mouse
        tooltip.style.display = 'block';
        positionTooltip(tooltip, event);
    }

    // Get a color based on category
    function getCategoryColor(category) {
        const colors = {
            'food': '#8d6e63',
            'essence': '#7986cb',
            'crystal': '#4db6ac',
            'metal': '#78909c',
            'botanical': '#81c784',
            'textile': '#ce93d8',
            'herb': '#81c784',
            'legendary': '#ffd54f',
            'crafted': '#90a4ae',
            'exotic': '#ff8a65'
        };
        
        return colors[category.toLowerCase()] || '#757575';
    }

    // Hide the tooltip
    function hideItemTooltip() {
        const tooltip = document.getElementById('item-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    // Position the tooltip near the mouse
    function positionTooltip(tooltip, event) {
        const padding = 15; // Space between mouse and tooltip
        
        // Get mouse position
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Get tooltip dimensions
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        
        // Default position (right and below the cursor)
        let posX = mouseX + padding;
        let posY = mouseY + padding;
        
        // Check if tooltip would go off the right edge
        if (posX + tooltipWidth > viewportWidth) {
            posX = mouseX - tooltipWidth - padding;
        }
        
        // Check if tooltip would go off the bottom edge
        if (posY + tooltipHeight > viewportHeight) {
            posY = mouseY - tooltipHeight - padding;
        }
        
        // Ensure tooltip doesn't go off the left or top edges
        posX = Math.max(10, posX);
        posY = Math.max(10, posY);
        
        // Set the position
        tooltip.style.left = posX + 'px';
        tooltip.style.top = posY + 'px';
    }

    // Document click handler to hide tooltip
    document.addEventListener('click', function() {
        hideItemTooltip();
    });

    // Add event listeners to ingredient items for tooltip functionality
    function addTooltipListeners() {
        // For ingredients in the drawer
        document.querySelectorAll('.ingredient-item').forEach(item => {
            item.addEventListener('contextmenu', function(e) {
                const ingredientId = this.dataset.id;
                const ingredient = getIngredientById(ingredientId);
                if (ingredient) {
                    showItemTooltip(ingredient, e);
                }
            });
        });
        
        // For ingredients in the slots
        document.querySelectorAll('.ingredient-slot').forEach(slot => {
            slot.addEventListener('contextmenu', function(e) {
                const position = this.dataset.position;
                if (slotContents && slotContents[position]) {
                    showItemTooltip(slotContents[position], e);
                }
            });
        });
        
        // For crafted items - FIX HERE
        document.querySelectorAll('#crafted-items-container .crafted-item').forEach(item => {
            item.addEventListener('contextmenu', function(e) {
                e.preventDefault(); // Prevent default context menu
                
                const recipeId = this.dataset.id;
                console.log('Right-clicked crafted item with recipeId:', recipeId);
                
                if (recipeId) {
                    const recipe = recipes.find(r => r.id === recipeId);
                    if (recipe && recipe.result) {
                        showItemTooltip(recipe.result, e);
                    } else {
                        console.warn('Could not find recipe with id:', recipeId);
                    }
                }
            });
        });
    }

    // Override loadIngredients to add tooltip functionality
    const originalLoadIngredients = loadIngredients;
    loadIngredients = function(category) {
        originalLoadIngredients(category);
        addTooltipListeners();
    };

    // Add direct tooltip support to displayCraftedItems
    const originalDisplayCraftedItems = displayCraftedItems;
    displayCraftedItems = function() {
        // Call original function
        originalDisplayCraftedItems();
        
        // Add our tooltip functionality with a slight delay to ensure DOM is ready
        setTimeout(() => {
            // Select all crafted items that don't have a context menu listener yet
            document.querySelectorAll('#crafted-items-container .crafted-item').forEach(item => {
                // Remove any existing contextmenu listeners to prevent duplicates
                const clone = item.cloneNode(true);
                item.parentNode.replaceChild(clone, item);
                
                // Add the tooltip functionality
                clone.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    const recipeId = this.dataset.id;
                    console.log('Showing tooltip for crafted item:', recipeId);
                    
                    const recipe = recipes.find(r => r.id === recipeId);
                    if (recipe && recipe.result) {
                        showItemTooltip(recipe.result, e);
                    }
                });
            });
            
            console.log('Added tooltip listeners to crafted items');
        }, 100);
    };

    // Add MutationObserver to specifically watch the crafted items container
    const craftedItemsObserver = new MutationObserver(function(mutations) {
        addTooltipListeners();
    });

    // Start observing the crafted items container specifically
    document.addEventListener('DOMContentLoaded', function() {
        const craftedItemsContainer = document.getElementById('crafted-items-container');
        if (craftedItemsContainer) {
            craftedItemsObserver.observe(craftedItemsContainer, { 
                childList: true, 
                subtree: true 
            });
        }
    });

    // Add CSS for tooltip
    const tooltipStyle = document.createElement('style');
    tooltipStyle.textContent = `
        .item-tooltip {
            transition: opacity 0.2s ease;
            opacity: 1;
        }
    `;
    document.head.appendChild(tooltipStyle);

    // Initialize tooltip functionality
    addTooltipListeners();

    // MutationObserver to add tooltip listeners when DOM changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                addTooltipListeners();
            }
        });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    // Prevent context menu on ingredient containers
    document.querySelectorAll('#ingredients-container, #crafted-items-container').forEach(container => {
        container.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    });
    
    // Expedition handling
    const expeditionBtn = document.getElementById('expedition-btn');
    const expeditionModal = document.getElementById('expedition-modal');
    let currentGame = null;

    expeditionBtn.addEventListener('click', function() {
        expeditionModal.style.display = 'block';
        const container = document.getElementById('expedition-container');
        container.style.display = 'none';

        document.querySelector('.level-thumbnail').addEventListener('click', function() {
            const container = document.getElementById('expedition-container');
            container.style.display = 'block';
            document.getElementById('expedition-level-select').style.display = 'none';

            // Initialize game with audio elements
            currentGame = new AlchemyBlaster({
                container: container,
                sounds: {
                    shoot: document.getElementById('shoot-sound'),
                    hit1: document.getElementById('hit1-sound'),
                    hit2: document.getElementById('hit2-sound'),
                    victory: document.getElementById('victory-sound'),
                    victory1: document.getElementById('victory1-sound'),
                    victory2: document.getElementById('victory2-sound'),
                    gameOver: document.getElementById('gameover-sound'),
                    gameOver1: document.getElementById('gameover1-sound'),
                    spellfire: [
                        document.getElementById('spellfire-sound'),
                        document.getElementById('spellfire1-sound'),
                        document.getElementById('spellfire2-sound'),
                        document.getElementById('spellfire3-sound')
                    ],
                    alizaHit1: document.getElementById('aliza-hit1-sound'),
                    alizaHit2: document.getElementById('aliza-hit2-sound'),
                    alizaVictory1: document.getElementById('aliza-victory1-sound'),
                    alizaVictory2: document.getElementById('aliza-victory2-sound'),
                    alizaGameOver1: document.getElementById('aliza-gameover1-sound'),
                    alizaGameOver2: document.getElementById('aliza-gameover2-sound')
                },
                onRewardsCollected: function(rewards) {
                    // Add rewards to player inventory
                    if (rewards && Array.isArray(rewards)) {
                        rewards.forEach(reward => {
                            if (reward.id && reward.amount) {
                                playerInventory[reward.id] = (playerInventory[reward.id] || 0) + reward.amount;
                            }
                        });
                        
                        // Save updated inventory
                        localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
                        
                        // Reload ingredients drawer
                        const activeCategory = document.querySelector('.category-btn.active').dataset.category;
                        loadIngredients(activeCategory);
                    }
                }
            });
        });
    });

    // Close expedition modal
    expeditionModal.querySelector('.close').addEventListener('click', function() {
        expeditionModal.style.display = 'none';
        if (currentGame) {
            currentGame.gameState = 'menu';
            document.getElementById('expedition-level-select').style.display = 'block';
            document.getElementById('expedition-container').style.display = 'none';
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === expeditionModal) {
            expeditionModal.style.display = 'none';
            if (currentGame) {
                currentGame.gameState = 'menu';
                document.getElementById('expedition-level-select').style.display = 'block';
                document.getElementById('expedition-container').style.display = 'none';
            }
        }
    });
});
