const recipes = [
    {
        id: 'vanilla-ice-cream',
        name: 'Vanilla Ice Cream',
        ingredients: ['cream', 'white-sugar', 'egg', 'vanilla'], // Fixed sugar ID to match ingredients.js
        exoticIngredient: null,
        result: {
            name: 'Vanilla Ice Cream',
            description: 'The tried and true classic. Almost no one can mess this up- delicious even when it turns to soup!',
            effects: 'Restores 6HP, 8 if savored during a short rest.',
            image: 'assets/images/VanillaIceCreamSMALL.png',
            craftedImage: 'assets/images/VanillaIceCream.png',  // Removed TINY
            size: {
                width: 128,
                height: 128
            }
        }
    },
    {
        id: 'lovely-vanilla-ice-cream',
        name: 'Lovely Vanilla Ice Cream',
        ingredients: ['cream', 'white-sugar', 'egg', 'vanilla'],
        exoticIngredient: 'touch-of-love',
        result: {
            name: 'Lovely Vanilla Ice Cream',
            description: 'Who would have thought you could infuse love in something firming up in the fridge?! Delightfully creamy and airy, whipped to perfection and chilled patiently- this is the real deal.',
            effects: 'Grants an Inspiration point that may be used whenever the player desires. Fully heals HP and restores all spell slots lower than 4th.',
            image: 'assets/images/Lovely Vanilla Ice Cream.png',
            craftedImage: 'assets/images/Lovely Vanilla Ice Cream.png',
            category: ['food', 'legendary']  // Added category array to ensure it appears in crafted items
        }
    },
    {
        id: 'azure-ice-cream',
        name: 'Azure Harvest Blue Moon Ice Cream',
        ingredients: ['azure-cream', 'star-sugar', 'lunar-egg', 'starsoaked-vanilla'],
        exoticIngredient: 'night-sky',
        result: {
            name: 'Azure Harvest Blue Moon Ice Cream',
            description: 'Some say they taste citrus, others swear there are hints of custard and aromatics- and yet still more profess their belief it tastes like the platonic ideal of blue children\'s modelling clay- all of them agree it is one of the best iced confections ever created.',
            effects: 'Resistance to fire for one dungeon or expedition. When consumed on expedition, you instantly succeed 2 of the required checks for completion. When consumed it restores 12HP and cures all non-magical diseases and afflictions.',
            image: 'assets/images/Azure Harvest Blue Moon Ice Cream.png',
            craftedImage: 'assets/images/Azure Harvest Blue Moon Ice Cream.png',
            category: ['food', 'legendary']  // Added category array to ensure it appears in crafted items
        }
    },
    {
        id: 'turbonado-sugar',
        name: 'Turbonado Sugar',
        ingredients: ['white-sugar'],
        exoticIngredient: 'flavor-matrix',
        result: {
            name: 'Turbonado Sugar',
            description: 'With the awesome gastronomic might of the flavor matrix, even plain white sugar can be elevated to godly tiers of taste sensation!',
            effects: 'A legendary catalyst that can dramatically enhance the potency of any recipe.',
            image: 'assets/images/TurbonadoSugar.png'
        },
        validate: function(slots) {
            // Extensive debug logging
            console.group('Turbonado Sugar Recipe Validation');
            console.log('Slot Contents:', slots);
            console.log('Checking slot C:', slots.c?.id);
            console.log('Checking slot E:', slots.e?.id);
            console.log('Expected slot C: white-sugar'); // Updated to match ingredients.js
            console.log('Expected slot E: flavor-matrix');
            
            // Updated validation to use white-sugar
            const isValid = slots.c?.id === 'white-sugar' && slots.e?.id === 'flavor-matrix';
            
            console.log('Validation result:', isValid);
            console.groupEnd();
            
            return isValid;
        }
    },
    {
        id: 'butter',
        name: 'Butter',
        ingredients: ['cream', 'rock-salt'],
        exoticIngredient: null,
        validate: function(slots) {
            // Only cream and rock-salt, exactly 2 ingredients
            const slotArray = Object.values(slots).filter(slot => slot !== null);
            const hasRequiredIngredients = slotArray.some(slot => slot.id === 'cream') && 
                                         slotArray.some(slot => slot.id === 'rock-salt');
            return hasRequiredIngredients && slotArray.length === 2;
        },
        result: {
            name: 'Butter',
            description: 'A rich, creamy spread made from churned cream and salt. Essential for countless recipes.',
            effects: 'A basic but vital ingredient for many recipes.',
            image: 'assets/images/Butter.png'
        }
    },
    {
        id: 'whipped-butter',
        name: 'Whipped White Butter',
        ingredients: ['cream', 'rock-salt'], // Updated to include ingredients
        exoticIngredient: null,
        validate: function(slots) {
            // Debug logging
            console.log('Validating Whipped Butter Recipe');
            console.log('Slot contents:', slots);
            
            // Count how many slots contain butter
            const butterCount = Object.values(slots)
                .filter(slot => slot && slot.id === 'butter')
                .length;
            
            console.log('Found butter in', butterCount, 'slots');
            
            // Need exactly 2 butter for whipped butter
            return butterCount === 2;
        },
        result: {
            name: 'Whipped White Butter',
            description: 'Light and airy butter whipped to perfection. Spreads like a dream.',
            effects: 'Can be used as a substitute for regular butter in most recipes, with enhanced results.',
            image: 'assets/images/Whipped White Butter.png'
        }
    },
    {
        id: 'herb-butter',
        name: 'Herb Butter',
        ingredients: ['cream', 'rock-salt', 'savour-herb'], // Updated to include ingredients
        exoticIngredient: null,
        validate: function(slots) {
            // Debug logging
            console.log('Validating Herb Butter Recipe');
            console.log('Slot contents:', slots);
            
            // Check for cream, rock salt, and savour herb in any slots
            const hasIngredients = {
                cream: false,
                rockSalt: false,
                savourHerb: false
            };

            Object.values(slots).forEach(slot => {
                if (slot) {
                    if (slot.id === 'cream') hasIngredients.cream = true;
                    if (slot.id === 'rock-salt') hasIngredients.rockSalt = true;
                    if (slot.id === 'savour-herb') hasIngredients.savourHerb = true;
                }
            });

            // All ingredients must be present and must have exactly 3 ingredients
            const totalIngredients = Object.values(slots).filter(slot => slot !== null).length;
            const isValid = hasIngredients.cream && 
                          hasIngredients.rockSalt && 
                          hasIngredients.savourHerb &&
                          totalIngredients === 3;

            console.log('Herb Butter validation:', hasIngredients, 'Total ingredients:', totalIngredients);
            console.log('Recipe is valid:', isValid);
            
            return isValid;
        },
        result: {
            name: 'Herb Butter',
            description: 'Delicious and flavorful, with hints of savory rosemary and garlic common to savourherb.',
            effects: 'Enhances the savory aspects of any dish it\'s used in.',
            image: 'assets/images/Herb Butter.png'
        }
    },
    {
        id: 'magibutter',
        name: 'Magibutter',
        ingredients: ['cream', 'rock-salt'],
        exoticIngredient: 'tastetanium-crystal',
        validate: function(slots) {
            // Need cream, rock-salt, and tastetanium-crystal in exotic slot
            const hasBasicIngredients = Object.values(slots)
                .filter(slot => slot !== null)
                .some(slot => slot.id === 'cream') &&
                Object.values(slots)
                .filter(slot => slot !== null)
                .some(slot => slot.id === 'rock-salt');
            const hasExotic = slots.e?.id === 'tastetanium-crystal';
            return hasBasicIngredients && hasExotic;
        },
        result: {
            name: 'Magibutter',
            description: 'This incredibutter brings all of the flavor and joy of butter, with all of the protein and vitamins and minerals, but somehow no calories! Whoa!',
            effects: 'A magical butter substitute that provides all the benefits with none of the drawbacks.',
            image: 'assets/images/Magibutter.png'
        }
    },
    {
        id: 'plastic-sheeting',
        name: 'Plastic Sheeting',
        ingredients: ['plasticizer', 'petrodistillate'],
        exoticIngredient: null,
        validate: function(slots) {
            // Need exactly plasticizer and petrodistillate
            const ingredients = Object.values(slots)
                .filter(slot => slot !== null)
                .map(slot => slot.id);
            
            const hasPlasticizer = ingredients.includes('plasticizer');
            const hasPetrodistillate = ingredients.includes('petrodistillate');
            const hasExactly2Ingredients = ingredients.length === 2;
            
            return hasPlasticizer && hasPetrodistillate && hasExactly2Ingredients;
        },
        result: {
            name: 'Plastic Sheeting',
            description: 'A thin yet durable layer of plastic engineered for protective coverings, waterproofing, and precise industrial applications.',
            effects: 'Can be used in crafting to create waterproof items and containers.',
            category: ['crafted', 'textile'],
            image: 'assets/images/Plastic Sheeting.png',
            craftedImage: 'assets/images/Plastic Sheeting.png' // Removed TINY
        }
    },
    {
        id: 'crafted-adhesive',
        name: 'Adhesive',
        ingredients: ['barkgum', 'plasticizer', 'solvent'],
        exoticIngredient: null,
        validate: function(slots) {
            // Need exactly barkgum, plasticizer, and solvent
            const ingredients = Object.values(slots)
                .filter(slot => slot !== null)
                .map(slot => slot.id);
            
            const hasBarkgum = ingredients.includes('barkgum');
            const hasPlasticizer = ingredients.includes('plasticizer');
            const hasSolvent = ingredients.includes('solvent');
            const hasExactly3Ingredients = ingredients.length === 3;
            
            return hasBarkgum && hasPlasticizer && hasSolvent && hasExactly3Ingredients;
        },
        result: {
            name: 'Adhesive',
            description: 'A highly effective, sticky substance with powerful bonding properties, ideal for uniting disparate materials into one cohesive whole.',
            effects: 'Used in crafting to bind materials together.',
            category: ['crafted', 'essence'],
            image: 'assets/images/Adhesive.png',
            craftedImage: 'assets/images/Adhesive.png' // Removed TINY
        }
    },
    {
        id: 'diaper',
        name: 'Diaper',
        ingredients: ['plastic-sheeting', 'adhesive', 'cotton-fluff'],
        exoticIngredient: null,
        validate: function(slots) {
            // Need exactly plastic-sheeting, adhesive, and cotton-fluff
            const ingredients = Object.values(slots)
                .filter(slot => slot !== null)
                .map(slot => slot.id);
            
            const hasPlasticSheeting = ingredients.includes('plastic-sheeting');
            const hasAdhesive = ingredients.includes('adhesive');
            const hasCottonFluff = ingredients.includes('cotton-fluff');
            const hasExactly3Ingredients = ingredients.length === 3;
            const noExotic = !slots.e;
            
            return hasPlasticSheeting && hasAdhesive && hasCottonFluff && hasExactly3Ingredients && noExotic;
        },
        result: {
            name: 'Diaper',
            description: 'A durable plastic-backed marvel of engineering and magic! The ultimate in protection- you can\'t get any safer small clothes than these!',
            effects: 'Provides exceptional protection and comfort.',
            category: ['crafted', 'textile'],
            image: 'assets/images/diaper.png',
            craftedImage: 'assets/images/diaper.png' // Removed TINY
        }
    },
    {
        id: 'lovely-diaper',
        name: 'Lovely Diaper',
        ingredients: ['plastic-sheeting', 'adhesive', 'cotton-fluff'],
        exoticIngredient: 'touch-of-love',
        validate: function(slots) {
            // Need exactly plastic-sheeting, adhesive, cotton-fluff, and touch-of-love in exotic slot
            const ingredients = Object.values(slots)
                .filter(slot => slot !== null && slot.id !== 'touch-of-love')
                .map(slot => slot.id);
            
            const hasPlasticSheeting = ingredients.includes('plastic-sheeting');
            const hasAdhesive = ingredients.includes('adhesive');
            const hasCottonFluff = ingredients.includes('cotton-fluff');
            const hasExotic = slots.e && slots.e.id === 'touch-of-love';
            const hasExactly3RegularIngredients = ingredients.length === 3;
            
            return hasPlasticSheeting && hasAdhesive && hasCottonFluff && hasExotic && hasExactly3RegularIngredients;
        },
        result: {
            name: 'Lovely Diaper',
            description: 'D\'awwww! Isn\'t that sweet. I bet whoever receives this will know how much you want to keep them safe.',
            effects: 'Provides exceptional protection and comfort with an extra dose of love and care.',
            category: ['crafted', 'textile', 'legendary'],
            image: 'assets/images/lovely diaper.png',
            craftedImage: 'assets/images/lovely diaper.png' // Removed TINY
        }
    },
    {
        id: 'quiche',
        name: 'Quiche',
        ingredients: ['egg', 'cream', 'flour', 'herb-butter', 'savour-herb'],
        exoticIngredient: null,
        validate: function(slots) {
            // Need these 5 ingredients
            const ingredients = Object.values(slots)
                .filter(slot => slot !== null)
                .map(slot => slot.id);
            
            const hasEgg = ingredients.includes('egg');
            const hasCream = ingredients.includes('cream');
            const hasFlour = ingredients.includes('flour');
            const hasHerbButter = ingredients.includes('herb-butter');
            const hasSavourHerb = ingredients.includes('savour-herb');
            const hasExactly5Ingredients = ingredients.length === 5;
            
            return hasEgg && hasCream && hasFlour && hasHerbButter && hasSavourHerb && hasExactly5Ingredients;
        },
        result: {
            name: 'Quiche',
            description: 'A savory tart filled with a rich blend of ingredients, offering a hearty, delectable treat with artisanal flair.',
            effects: 'Provides substantial nourishment and restores 10 hit points when consumed.',
            category: ['food', 'crafted'],
            image: 'assets/images/Quiche.png',
            craftedImage: 'assets/images/Quiche.png' // Removed TINY
        }
    }
];

// Update findMatchingRecipe to handle recipe validation better
function findMatchingRecipe(slotContents) {
    console.group('Recipe Matching');
    console.log('Checking slots:', slotContents);

    // Get all matching recipes instead of just the first one
    const matchingRecipes = recipes.filter(recipe => {
        if (recipe.validate) {
            return recipe.validate(slotContents);
        }

        // Standard ingredient matching
        const slotArray = Object.values(slotContents).filter(slot => slot !== null);
        const hasAllIngredients = recipe.ingredients.every(
            ingId => slotArray.some(slot => slot.id === ingId)
        );
        const matchesExotic = recipe.exoticIngredient ?
            slotContents.e?.id === recipe.exoticIngredient :
            !slotContents.e;

        return hasAllIngredients && matchesExotic;
    });

    if (matchingRecipes.length > 0) {
        // Sort by complexity (more ingredients = higher priority)
        matchingRecipes.sort((a, b) => {
            const complexityA = a.ingredients.length + (a.exoticIngredient ? 1 : 0);
            const complexityB = b.ingredients.length + (b.exoticIngredient ? 1 : 0);
            return complexityB - complexityA;
        });

        console.log('Found recipe:', matchingRecipes[0].id);
        console.groupEnd();
        return matchingRecipes[0];
    }

    console.log('No recipe found');
    console.groupEnd();
    return null;
}

// Fix recipe preview check
function isRecipeComplete(slots, recipe) {
    if (recipe.validate) {
        return recipe.validate(slots);
    }

    const slotArray = Object.values(slots).filter(slot => slot !== null);
    const hasAllIngredients = recipe.ingredients.every(
        ingId => slotArray.some(slot => slot.id === ingId)
    );
    const matchesExotic = recipe.exoticIngredient ?
        slots.e?.id === recipe.exoticIngredient :
        !slots.e;

    return hasAllIngredients && matchesExotic;
}

function displayResult(result) {
    // ...existing code...
    const img = document.createElement('img');
    // Use craftedImage for inventory slots if it exists
    img.src = slotContents ? (result.craftedImage || result.image) : result.image;
    // ...existing code...
}

// ...existing code...

function checkForDiscoveredRecipe() {
    console.group('Check for Recipe Preview');
    const recipe = findMatchingRecipe(slotContents);
    const resultChamber = document.getElementById('result-chamber');

    // Get or create preview box
    let previewBox = document.querySelector('.recipe-preview');
    if (!previewBox) {
        previewBox = document.createElement('div');
        previewBox.className = 'recipe-preview';
        resultChamber.parentNode.insertBefore(previewBox, resultChamber);
    }

    // Clear previous content
    resultChamber.innerHTML = '';
    previewBox.innerHTML = '';
    previewBox.style.display = 'none';

    if (recipe) {
        console.log('Found recipe:', recipe.id);
        console.log('Recipe is discovered:', !!discoveredRecipes[recipe.id]);
        
        // Show preview if recipe is valid and discovered
        if (discoveredRecipes[recipe.id] && isRecipeComplete(slotContents, recipe)) {
            previewBox.style.display = 'flex';
            
            const img = document.createElement('img');
            img.src = recipe.result.image;
            img.alt = recipe.result.name;
            previewBox.appendChild(img);
            
            // Add tooltip and visual feedback
            previewBox.title = `Click Craft to create: ${recipe.result.name}`;
            previewBox.style.opacity = '1';
            previewBox.style.cursor = 'pointer';
        }
    }

    console.groupEnd();
}

// ...existing code...
