/**
 * Debug Tools for Crafting Application
 * Enhanced with Master Item Database integration
 */

// Wait for document and master database to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize in development environments
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '') {
        initializeDebugTools();
    }
});

// Initialize debug tools
function initializeDebugTools() {
    createDebugButton();
    
    // Register keyboard shortcut (Ctrl+Shift+D)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            toggleDebugPanel();
        }
    });
}

// Create debug button
function createDebugButton() {
    const button = document.createElement('button');
    button.id = 'debug-btn';
    button.textContent = '🛠️';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.right = '10px';
    button.style.zIndex = '1000';
    button.style.backgroundColor = '#555';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '50%';
    button.style.width = '40px';
    button.style.height = '40px';
    button.style.fontSize = '20px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 3px 5px rgba(0,0,0,0.2)';
    button.title = 'Debug Tools (Ctrl+Shift+D)';
    
    button.addEventListener('click', toggleDebugPanel);
    document.body.appendChild(button);
}

// Toggle debug panel
function toggleDebugPanel() {
    let panel = document.getElementById('debug-panel');
    
    if (panel) {
        panel.remove();
    } else {
        createDebugPanel();
    }
}

// Create debug panel
function createDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.position = 'fixed';
    panel.style.top = '50%';
    panel.style.left = '50%';
    panel.style.transform = 'translate(-50%, -50%)';
    panel.style.backgroundColor = '#2a2a2a';
    panel.style.border = '2px solid #555';
    panel.style.borderRadius = '8px';
    panel.style.padding = '20px';
    panel.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
    panel.style.zIndex = '2000';
    panel.style.maxWidth = '80vw';
    panel.style.maxHeight = '80vh';
    panel.style.overflow = 'auto';
    panel.style.color = '#e0e0e0';
    panel.style.fontFamily = 'monospace';
    
    // Create header with close button
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '15px';
    
    const title = document.createElement('h2');
    title.textContent = 'Debug Tools';
    title.style.margin = '0';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.backgroundColor = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#e0e0e0';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', () => panel.remove());
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);
    
    // Create tab navigation
    const tabNav = document.createElement('div');
    tabNav.style.display = 'flex';
    tabNav.style.marginBottom = '15px';
    tabNav.style.borderBottom = '1px solid #555';
    
    const tabs = [
        { id: 'tab-master-db', label: 'Master Database' },
        { id: 'tab-ingredients', label: 'Ingredients' },
        { id: 'tab-recipes', label: 'Recipes' },
        { id: 'tab-inventory', label: 'Inventory' },
        { id: 'tab-utils', label: 'Utilities' },
    ];
    
    tabs.forEach(tab => {
        const tabBtn = document.createElement('button');
        tabBtn.id = tab.id;
        tabBtn.textContent = tab.label;
        tabBtn.style.backgroundColor = 'transparent';
        tabBtn.style.border = 'none';
        tabBtn.style.color = '#e0e0e0';
        tabBtn.style.padding = '8px 15px';
        tabBtn.style.cursor = 'pointer';
        tabBtn.style.borderBottom = '3px solid transparent';
        tabBtn.style.marginRight = '5px';
        
        tabBtn.addEventListener('click', () => {
            // Reset all tabs
            document.querySelectorAll('#debug-panel .tab-content').forEach(content => {
                content.style.display = 'none';
            });
            document.querySelectorAll('#debug-panel [id^="tab-"]').forEach(btn => {
                btn.style.borderBottom = '3px solid transparent';
            });
            
            // Activate selected tab
            tabBtn.style.borderBottom = '3px solid #7e57c2';
            document.getElementById(tab.id + '-content').style.display = 'block';
        });
        
        tabNav.appendChild(tabBtn);
    });
    
    panel.appendChild(tabNav);
    
    // Create tab content containers
    const tabContents = tabs.map(tab => {
        const content = document.createElement('div');
        content.id = tab.id + '-content';
        content.className = 'tab-content';
        content.style.display = 'none';
        
        return content;
    });
    
    tabContents.forEach(content => panel.appendChild(content));
    
    // Fill tab contents
    fillMasterDatabaseTab(tabContents[0]);
    fillIngredientsTab(tabContents[1]);
    fillRecipesTab(tabContents[2]);
    fillInventoryTab(tabContents[3]);
    fillUtilitiesTab(tabContents[4]);
    
    document.body.appendChild(panel);
    
    // Activate first tab by default
    document.getElementById(tabs[0].id).click();
}

// Fill Master Database tab
function fillMasterDatabaseTab(container) {
    // Create header with stats
    const header = document.createElement('div');
    header.style.marginBottom = '15px';
    header.style.padding = '10px';
    header.style.backgroundColor = '#3a3a3a';
    header.style.borderRadius = '5px';
    
    const totalItems = window.masterItemDatabase?.items.length || 0;
    const totalIngredients = window.masterItemDatabase?.getIngredients().length || 0;
    const totalCrafted = window.masterItemDatabase?.getCraftedItems().length || 0;
    
    header.innerHTML = `
        <h3 style="margin: 0 0 10px 0">Master Database Summary</h3>
        <div>Total Items: <span style="color: #7e57c2; font-weight: bold">${totalItems}</span></div>
        <div>Ingredients: <span style="color: #42a5f5; font-weight: bold">${totalIngredients}</span></div>
        <div>Crafted Items: <span style="color: #66bb6a; font-weight: bold">${totalCrafted}</span></div>
    `;
    
    container.appendChild(header);
    
    // Create search functionality
    const searchContainer = document.createElement('div');
    searchContainer.style.marginBottom = '15px';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search items...';
    searchInput.style.padding = '8px';
    searchInput.style.backgroundColor = '#3a3a3a';
    searchInput.style.border = '1px solid #555';
    searchInput.style.borderRadius = '4px';
    searchInput.style.color = '#e0e0e0';
    searchInput.style.width = '100%';
    searchInput.style.marginBottom = '10px';
    
    const categoryFilter = document.createElement('select');
    categoryFilter.style.padding = '8px';
    categoryFilter.style.backgroundColor = '#3a3a3a';
    categoryFilter.style.border = '1px solid #555';
    categoryFilter.style.borderRadius = '4px';
    categoryFilter.style.color = '#e0e0e0';
    categoryFilter.style.width = '100%';
    
    // Get unique categories
    const allCategories = new Set();
    if (window.masterItemDatabase?.items) {
        window.masterItemDatabase.items.forEach(item => {
            item.category.split(' ').forEach(cat => allCategories.add(cat));
        });
    }
    
    // Add option for all categories
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Categories';
    categoryFilter.appendChild(allOption);
    
    // Add options for each category
    [...allCategories].sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
    
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(categoryFilter);
    container.appendChild(searchContainer);
    
    // Create table for displaying items
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '15px';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.style.backgroundColor = '#3a3a3a';
    
    const headerRow = document.createElement('tr');
    
    const headers = ['ID', 'Internal ID', 'Name', 'Type', 'Category', 'Description'];
    
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '8px';
        th.style.textAlign = 'left';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Render items in the table
    function renderTableItems(items) {
        tbody.innerHTML = '';
        
        if (!items || items.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.textContent = 'No items found';
            emptyCell.colSpan = headers.length;
            emptyCell.style.textAlign = 'center';
            emptyCell.style.padding = '20px';
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        } else {
            items.forEach((item, index) => {
                const row = document.createElement('tr');
                row.style.backgroundColor = index % 2 === 0 ? '#2a2a2a' : '#333';
                
                const idCell = document.createElement('td');
                idCell.textContent = item.id;
                idCell.style.padding = '8px';
                
                const internalIdCell = document.createElement('td');
                internalIdCell.textContent = item.internalId;
                internalIdCell.style.padding = '8px';
                
                const nameCell = document.createElement('td');
                nameCell.textContent = item.name;
                nameCell.style.padding = '8px';
                
                const typeCell = document.createElement('td');
                typeCell.textContent = item.type;
                typeCell.style.padding = '8px';
                
                const categoryCell = document.createElement('td');
                categoryCell.textContent = item.category;
                categoryCell.style.padding = '8px';
                
                const descriptionCell = document.createElement('td');
                descriptionCell.textContent = item.description;
                descriptionCell.style.padding = '8px';
                descriptionCell.style.maxWidth = '300px';
                descriptionCell.style.overflow = 'hidden';
                descriptionCell.style.textOverflow = 'ellipsis';
                descriptionCell.style.whiteSpace = 'nowrap';
                
                // Show full description on hover
                descriptionCell.title = item.description;
                
                row.appendChild(idCell);
                row.appendChild(internalIdCell);
                row.appendChild(nameCell);
                row.appendChild(typeCell);
                row.appendChild(categoryCell);
                row.appendChild(descriptionCell);
                
                tbody.appendChild(row);
            });
        }
    }
    
    // Initial render of all items
    if (window.masterItemDatabase?.items) {
        renderTableItems(window.masterItemDatabase.items);
    } else {
        renderTableItems([]);
    }
    
    // Add search and filter functionality
    searchInput.addEventListener('input', filterItems);
    categoryFilter.addEventListener('change', filterItems);
    
    function filterItems() {
        const searchTerm = searchInput.value.toLowerCase();
        const categoryTerm = categoryFilter.value;
        
        let filteredItems = window.masterItemDatabase?.items || [];
        
        // Filter by search term
        if (searchTerm) {
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(searchTerm) || 
                item.id.toLowerCase().includes(searchTerm) || 
                item.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filter by category
        if (categoryTerm !== 'all') {
            filteredItems = filteredItems.filter(item => 
                item.category.split(' ').includes(categoryTerm) || 
                item.category === categoryTerm
            );
        }
        
        renderTableItems(filteredItems);
    }
    
    table.appendChild(tbody);
    container.appendChild(table);
}

// Fill Ingredients tab
function fillIngredientsTab(container) {
    const content = document.createElement('div');
    content.innerHTML = `
        <h3>Loaded Ingredients</h3>
        <div id="debug-ingredients-list"></div>
    `;
    
    container.appendChild(content);
    
    // Display loaded ingredients
    const ingredientsList = document.getElementById('debug-ingredients-list');
    
    if (ingredientsList) {
        if (window.ingredients && Array.isArray(window.ingredients)) {
            // Check if all ingredients in the master database are present
            const missingIngredients = [];
            
            if (window.masterItemDatabase?.items) {
                window.masterItemDatabase.getIngredients().forEach(masterItem => {
                    const foundInIngredients = window.ingredients.some(ing => ing.id === masterItem.id);
                    if (!foundInIngredients) {
                        missingIngredients.push(masterItem);
                    }
                });
            }
            
            // Display results
            const resultsDiv = document.createElement('div');
            resultsDiv.innerHTML = `
                <div style="margin-bottom: 15px; padding: 10px; background-color: #3a3a3a; border-radius: 5px;">
                    <p>Loaded ingredients: <strong>${window.ingredients.length}</strong></p>
                    <p>Master ingredients: <strong>${window.masterItemDatabase?.getIngredients().length || 0}</strong></p>
                    <p>Missing ingredients: <strong style="color: ${missingIngredients.length > 0 ? '#f44336' : '#66bb6a'}">${missingIngredients.length}</strong></p>
                </div>
            `;
            
            ingredientsList.appendChild(resultsDiv);
            
            // Display missing ingredients if any
            if (missingIngredients.length > 0) {
                const missingList = document.createElement('div');
                missingList.innerHTML = `
                    <h4 style="color: #f44336">Missing Ingredients:</h4>
                    <ul style="list-style-type: none; padding-left: 10px;">
                        ${missingIngredients.map(item => 
                            `<li style="margin-bottom: 5px; padding: 5px; background-color: #3a3a3a; border-radius: 3px;">
                                <strong>${item.name}</strong> (ID: ${item.id}, Internal ID: ${item.internalId})
                            </li>`
                        ).join('')}
                    </ul>
                `;
                
                ingredientsList.appendChild(missingList);
            }
        } else {
            ingredientsList.innerHTML = `
                <div style="padding: 20px; background-color: #3a3a3a; border-radius: 5px; color: #f44336;">
                    <p>No ingredients array found in global scope.</p>
                </div>
            `;
        }
    }
}

// Fill Recipes tab
function fillRecipesTab(container) {
    const content = document.createElement('div');
    content.innerHTML = `
        <h3>Loaded Recipes</h3>
        <div id="debug-recipes-list"></div>
    `;
    
    container.appendChild(content);
    
    // Display loaded recipes
    const recipesList = document.getElementById('debug-recipes-list');
    
    if (recipesList) {
        if (window.recipes && Array.isArray(window.recipes)) {
            // Check if all crafted items in the master database are present
            const missingCrafted = [];
            
            if (window.masterItemDatabase?.items) {
                window.masterItemDatabase.getCraftedItems().forEach(masterItem => {
                    const foundInRecipes = window.recipes.some(recipe => 
                        recipe.result && recipe.result.name === masterItem.name
                    );
                    if (!foundInRecipes) {
                        missingCrafted.push(masterItem);
                    }
                });
            }
            
            // Display results
            const resultsDiv = document.createElement('div');
            resultsDiv.innerHTML = `
                <div style="margin-bottom: 15px; padding: 10px; background-color: #3a3a3a; border-radius: 5px;">
                    <p>Loaded recipes: <strong>${window.recipes.length}</strong></p>
                    <p>Master crafted items: <strong>${window.masterItemDatabase?.getCraftedItems().length || 0}</strong></p>
                    <p>Missing crafted items: <strong style="color: ${missingCrafted.length > 0 ? '#f44336' : '#66bb6a'}">${missingCrafted.length}</strong></p>
                </div>
            `;
            
            recipesList.appendChild(resultsDiv);
            
            // Display missing crafted items if any
            if (missingCrafted.length > 0) {
                const missingList = document.createElement('div');
                missingList.innerHTML = `
                    <h4 style="color: #f44336">Missing Crafted Items:</h4>
                    <ul style="list-style-type: none; padding-left: 10px;">
                        ${missingCrafted.map(item => 
                            `<li style="margin-bottom: 5px; padding: 5px; background-color: #3a3a3a; border-radius: 3px;">
                                <strong>${item.name}</strong> (ID: ${item.id}, Internal ID: ${item.internalId})
                            </li>`
                        ).join('')}
                    </ul>
                `;
                
                recipesList.appendChild(missingList);
            }
        } else {
            recipesList.innerHTML = `
                <div style="padding: 20px; background-color: #3a3a3a; border-radius: 5px; color: #f44336;">
                    <p>No recipes array found in global scope.</p>
                </div>
            `;
        }
    }
}

// Fill Inventory tab
function fillInventoryTab(container) {
    const content = document.createElement('div');
    content.innerHTML = `
        <h3>Player Inventory</h3>
        <div id="debug-inventory-tools" style="margin-bottom: 15px; padding: 10px; background-color: #3a3a3a; border-radius: 5px;">
            <button id="debug-add-all-items" style="padding: 8px 15px; background-color: #7e57c2; border: none; border-radius: 4px; color: white; cursor: pointer; margin-right: 10px;">
                Add All Items
            </button>
            <button id="debug-clear-inventory" style="padding: 8px 15px; background-color: #f44336; border: none; border-radius: 4px; color: white; cursor: pointer;">
                Clear Inventory
            </button>
        </div>
        <div id="debug-inventory-list"></div>
    `;
    
    container.appendChild(content);
    
    // Hook up inventory tools
    const addAllButton = document.getElementById('debug-add-all-items');
    const clearButton = document.getElementById('debug-clear-inventory');
    
    if (addAllButton) {
        addAllButton.addEventListener('click', () => {
            if (window.masterItemDatabase?.items && window.playerInventory) {
                window.masterItemDatabase.getIngredients().forEach(item => {
                    window.playerInventory[item.id] = 10; // Add 10 of each ingredient
                });
                
                refreshInventoryDisplay();
            }
        });
    }
    
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (window.playerInventory) {
                Object.keys(window.playerInventory).forEach(key => {
                    window.playerInventory[key] = 0;
                });
                
                refreshInventoryDisplay();
            }
        });
    }
    
    refreshInventoryDisplay();
    
    function refreshInventoryDisplay() {
        const inventoryList = document.getElementById('debug-inventory-list');
        
        if (inventoryList) {
            if (window.playerInventory) {
                const items = Object.entries(window.playerInventory).map(([id, count]) => ({ id, count }));
                
                inventoryList.innerHTML = `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background-color: #3a3a3a;">
                            <tr>
                                <th style="padding: 8px; text-align: left;">Item</th>
                                <th style="padding: 8px; text-align: left;">ID</th>
                                <th style="padding: 8px; text-align: right;">Count</th>
                                <th style="padding: 8px; text-align: center;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map((item, index) => {
                                const ingredientInfo = window.getIngredientById ? window.getIngredientById(item.id) : null;
                                const name = ingredientInfo ? ingredientInfo.name : item.id;
                                
                                return `
                                    <tr style="background-color: ${index % 2 === 0 ? '#2a2a2a' : '#333'};">
                                        <td style="padding: 8px;">${name}</td>
                                        <td style="padding: 8px;">${item.id}</td>
                                        <td style="padding: 8px; text-align: right;">${item.count}</td>
                                        <td style="padding: 8px; text-align: center;">
                                            <button 
                                                class="debug-add-item" 
                                                data-id="${item.id}" 
                                                style="padding: 3px 8px; background-color: #66bb6a; border: none; border-radius: 3px; color: white; cursor: pointer; margin-right: 5px;">
                                                +1
                                            </button>
                                            <button 
                                                class="debug-remove-item" 
                                                data-id="${item.id}" 
                                                style="padding: 3px 8px; background-color: #f44336; border: none; border-radius: 3px; color: white; cursor: pointer;">
                                                -1
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                `;
                
                // Add event listeners for the buttons
                document.querySelectorAll('.debug-add-item').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.dataset.id;
                        window.playerInventory[id] = (window.playerInventory[id] || 0) + 1;
                        refreshInventoryDisplay();
                    });
                });
                
                document.querySelectorAll('.debug-remove-item').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.dataset.id;
                        if (window.playerInventory[id] > 0) {
                            window.playerInventory[id]--;
                            refreshInventoryDisplay();
                        }
                    });
                });
            } else {
                inventoryList.innerHTML = `
                    <div style="padding: 20px; background-color: #3a3a3a; border-radius: 5px; color: #f44336;">
                        <p>No playerInventory object found in global scope.</p>
                    </div>
                `;
            }
        }
    }
}

// Fill Utilities tab
function fillUtilitiesTab(container) {
    const content = document.createElement('div');
    content.innerHTML = `
        <h3>Debug Utilities</h3>
        
        <div style="margin-bottom: 15px; padding: 10px; background-color: #3a3a3a; border-radius: 5px;">
            <h4>Toggle Recipe Preview</h4>
            <button id="debug-toggle-preview" style="padding: 8px 15px; background-color: #7e57c2; border: none; border-radius: 4px; color: white; cursor: pointer;">
                Toggle Recipe Preview
            </button>
            <p style="margin-top: 10px; font-size: 12px; color: #aaa;">
                This will toggle the recipe preview feature, showing what recipe will be crafted with the current ingredients.
            </p>
        </div>
        
        <div style="margin-bottom: 15px; padding: 10px; background-color: #3a3a3a; border-radius: 5px;">
            <h4>Test Tooltip System</h4>
            <button id="debug-test-tooltip" style="padding: 8px 15px; background-color: #7e57c2; border: none; border-radius: 4px; color: white; cursor: pointer;">
                Test Tooltip
            </button>
            <p style="margin-top: 10px; font-size: 12px; color: #aaa;">
                This will display a test tooltip at the center of the screen to verify the tooltip system is working.
            </p>
        </div>
        
        <div style="margin-bottom: 15px; padding: 10px; background-color: #3a3a3a; border-radius: 5px;">
            <h4>Test Channels</h4>
            <button id="debug-test-channels" style="padding: 8px 15px; background-color: #7e57c2; border: none; border-radius: 4px; color: white; cursor: pointer;">
                Test Channel Animations
            </button>
            <p style="margin-top: 10px; font-size: 12px; color: #aaa;">
                This will test the channel animations to ensure they are working correctly.
            </p>
        </div>
    `;
    
    container.appendChild(content);
    
    // Hook up utility buttons
    const previewToggleBtn = document.getElementById('debug-toggle-preview');
    const tooltipTestBtn = document.getElementById('debug-test-tooltip');
    const channelsTestBtn = document.getElementById('debug-test-channels');
    
    if (previewToggleBtn) {
        previewToggleBtn.addEventListener('click', () => {
            window.debugShowRecipePreview = !window.debugShowRecipePreview;
            previewToggleBtn.textContent = window.debugShowRecipePreview ? 
                'Disable Recipe Preview' : 'Enable Recipe Preview';
            
            // Look for the preview element and toggle it
            const preview = document.querySelector('.recipe-preview');
            if (preview) {
                preview.style.display = window.debugShowRecipePreview ? 'block' : 'none';
            }
        });
    }
    
    if (tooltipTestBtn) {
        tooltipTestBtn.addEventListener('click', () => {
            // Only if tooltip functionality exists
            if (typeof window.showItemTooltip === 'function') {
                // Create a mock event at the center of the screen
                const mockEvent = {
                    clientX: window.innerWidth / 2,
                    clientY: window.innerHeight / 2,
                    preventDefault: () => {}
                };
                
                // Create a test item
                const testItem = {
                    name: 'Test Item',
                    description: 'This is a test item to verify the tooltip system is working correctly.',
                    category: 'debug test',
                    effects: 'No effects, just testing the tooltip system.',
                    image: 'assets/images/placeholder.png'
                };
                
                // Show the tooltip
                window.showItemTooltip(testItem, mockEvent);
                
                // Hide after 5 seconds
                setTimeout(() => {
                    if (typeof window.hideItemTooltip === 'function') {
                        window.hideItemTooltip();
                    }
                }, 5000);
            } else {
                alert('Tooltip functionality not found. Make sure the tooltip system is implemented.');
            }
        });
    }
    
    if (channelsTestBtn) {
        channelsTestBtn.addEventListener('click', () => {
            // Test channel animations
            document.querySelectorAll('.channel').forEach(channel => {
                // Remove any existing filled channels
                const existingFill = channel.querySelector('.channel-filled');
                if (existingFill) {
                    existingFill.remove();
                }
                
                // Create new channel fill
                const channelFill = document.createElement('div');
                channelFill.className = 'channel-filled';
                channel.appendChild(channelFill);
            });
        });
    }
}