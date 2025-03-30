/**
 * Master List of All Ingredients and Crafted Items
 * 
 * This file contains a consolidated, alphabetized list of all ingredients
 * and crafted items across the crafting system, each with a unique internal ID.
 * Each item now includes an imagePath property for asset tracking.
 */

// Import the necessary data files
// Make sure to update these paths if the structure changes
// const ingredientsFromMain = require('../const ingredients = [');
// const ingredientsFromData = require('./ingredients');
// const recipes = require('./recipes');

const masterItemsList = [
    // === INGREDIENTS ===
    {
        internalId: 1,
        id: 'azure-cream',
        name: 'Azure Moon Cream',
        type: 'ingredient',
        category: 'legendary',
        source: 'ice-cream-ingredients',
        imagePath: 'assets/images/Azure Moon Cream.png'
    },
    {
        internalId: 2,
        id: 'cream',
        name: 'Cream',
        type: 'ingredient',
        category: 'food',
        source: 'multiple',
        imagePath: 'assets/images/Cream.png'
    },
    {
        internalId: 3,
        id: 'crystal1',
        name: 'Clear Crystal',
        type: 'ingredient',
        category: 'crystal',
        source: 'ingredients',
        imagePath: 'assets/images/crystals/crystal1.png'
    },
    {
        internalId: 4,
        id: 'egg',
        name: 'Egg',
        type: 'ingredient',
        category: 'food',
        source: 'ice-cream-ingredients',
        imagePath: 'assets/images/Egg.png'
    },
    {
        internalId: 5,
        id: 'essence1',
        name: 'Water Essence',
        type: 'ingredient',
        category: 'essence',
        source: 'ingredients',
        imagePath: 'assets/images/essences/essence1.png'
    },
    {
        internalId: 6,
        id: 'herb1',
        name: 'Common Herb',
        type: 'ingredient',
        category: 'herb',
        source: 'ingredients',
        imagePath: 'assets/images/herbs/herb1.png'
    },
    {
        internalId: 7,
        id: 'legendary1',
        name: 'Phoenix Feather',
        type: 'ingredient',
        category: 'legendary',
        source: 'ingredients',
        imagePath: 'assets/images/legendary/legendary1.png'
    },
    {
        internalId: 8,
        id: 'lunar-egg',
        name: 'Lunar-Dodo Egg',
        type: 'ingredient',
        category: 'legendary',
        source: 'ice-cream-ingredients',
        imagePath: 'assets/images/Lunar-Dodo Egg.png'
    },
    {
        internalId: 9,
        id: 'metal1',
        name: 'Iron Dust',
        type: 'ingredient',
        category: 'metal',
        source: 'ingredients',
        imagePath: 'assets/images/metals/metal1.png'
    },
    {
        internalId: 10,
        id: 'night-sky',
        name: 'Distillation of a Night Sky',
        type: 'ingredient',
        category: 'legendary',
        source: 'ice-cream-ingredients',
        imagePath: 'assets/images/Distillation of a Night Sky.png'
    },
    {
        internalId: 11,
        id: 'rock-salt',
        name: 'Rock Salt',
        type: 'ingredient',
        category: 'crystal',
        source: 'ingredients',
        imagePath: 'assets/images/crystals/rock-salt.png'
    },
    {
        internalId: 12,
        id: 'savour-herb',
        name: 'Savoury Herb',
        type: 'ingredient',
        category: 'herb',
        source: 'ingredients',
        imagePath: 'assets/images/herbs/Savour Herb.png'
    },
    {
        internalId: 13,
        id: 'star-sugar',
        name: 'Star Sugar',
        type: 'ingredient',
        category: 'legendary',
        source: 'ice-cream-ingredients',
        imagePath: 'assets/images/Star Sugar.png'
    },
    {
        internalId: 14,
        id: 'starsoaked-vanilla',
        name: 'Starsoaked Vanilla',
        type: 'ingredient',
        category: 'legendary',
        source: 'ice-cream-ingredients',
        imagePath: 'assets/images/Starsoaked Vanilla.png'
    },
    {
        internalId: 15,
        id: 'sugar',
        name: 'White Sugar',
        type: 'ingredient',
        category: 'food',
        source: 'ice-cream-ingredients',
        imagePath: 'assets/images/White Sugar.png'
    },
    {
        internalId: 16,
        id: 'vanilla',
        name: 'Vanilla',
        type: 'ingredient',
        category: 'botanical',
        source: 'ice-cream-ingredients',
        imagePath: 'assets/images/Vanilla.png'
    },
    
    // New ingredients from newstuff.txt
    {
        internalId: 17,
        id: 'yarn',
        name: 'Yarn',
        type: 'ingredient',
        category: 'textile',
        source: 'newstuff',
        imagePath: 'assets/images/Yarn.png'
    },
    {
        internalId: 18,
        id: 'darkessence',
        name: 'Darkessence',
        type: 'ingredient',
        category: 'legendary reagent',
        source: 'newstuff',
        imagePath: 'assets/images/Darkessence.png'
    },
    {
        internalId: 19,
        id: 'plasticizer',
        name: 'Plasticizer',
        type: 'ingredient',
        category: 'essence',
        source: 'newstuff',
        imagePath: 'assets/images/Plasticizer.png'
    },
    {
        internalId: 20,
        id: 'vitalium',
        name: 'Vitalium',
        type: 'ingredient',
        category: 'crystal exotic',
        source: 'newstuff',
        imagePath: 'assets/images/Vitalium.png'
    },
    {
        internalId: 21,
        id: 'vitalocanum',
        name: 'Vitalocanum',
        type: 'ingredient',
        category: 'crystal exotic',
        source: 'newstuff',
        imagePath: 'assets/images/Vitalocanum.png'
    },
    {
        internalId: 22,
        id: 'adhesive',
        name: 'Adhesive',
        type: 'ingredient',
        category: 'essence',
        source: 'newstuff',
        imagePath: 'assets/images/Adhesive.png'
    },
    {
        internalId: 23,
        id: 'cotton-fluff',
        name: 'Cotton Fluff',
        type: 'ingredient',
        category: 'textile crafted',
        source: 'newstuff',
        imagePath: 'assets/images/Cotton Fluff.png'
    },
    {
        internalId: 24,
        id: 'petrodistillate',
        name: 'Petrodistillate',
        type: 'ingredient',
        category: 'essence',
        source: 'newstuff',
        imagePath: 'assets/images/Petrodistillate.png'
    },
    {
        internalId: 25,
        id: 'robusca',
        name: 'Robusca',
        type: 'ingredient',
        category: 'crystal',
        source: 'newstuff',
        imagePath: 'assets/images/Robusca.png'
    },
    {
        internalId: 26,
        id: 'solvent',
        name: 'Solvent',
        type: 'ingredient',
        category: 'essence',
        source: 'newstuff',
        imagePath: 'assets/images/Solvent.png'
    },
    {
        internalId: 27,
        id: 'barkgum',
        name: 'Barkgum',
        type: 'ingredient',
        category: 'botanical',
        source: 'newstuff',
        imagePath: 'assets/images/Barkgum.png'
    },
    {
        internalId: 28,
        id: 'berrimaters',
        name: 'Berrimaters',
        type: 'ingredient',
        category: 'botanical',
        source: 'newstuff',
        imagePath: 'assets/images/Berrimaters.png'
    },
    {
        internalId: 29,
        id: 'touch-of-love',
        name: 'Touch of Love',
        type: 'ingredient',
        category: 'exotic',
        source: 'newstuff',
        imagePath: 'assets/images/Touch of Love.png'
    },

    // === CRAFTED ITEMS ===
    {
        internalId: 101,
        id: 'azure-ice-cream',
        name: 'Azure Harvest Blue Moon Ice Cream',
        type: 'crafted',
        category: 'food legendary',
        recipe: ['cream', 'crystal1', 'essence1', 'legendary1'],
        source: 'recipes',
        imagePath: 'assets/images/food/azure-ice-cream.png'
    },
    {
        internalId: 102,
        id: 'butter',
        name: 'Butter',
        type: 'crafted',
        category: 'food',
        recipe: ['cream', 'rock-salt'],
        source: 'recipes',
        imagePath: 'assets/images/food/butter.png'
    },
    {
        internalId: 103,
        id: 'health-potion',
        name: 'Health Potion',
        type: 'crafted',
        category: 'potion',
        recipe: ['herb1', 'crystal1'],
        source: 'recipes',
        imagePath: 'assets/images/potions/health-potion.png'
    },
    {
        internalId: 104,
        id: 'herb-butter',
        name: 'Herb Butter',
        type: 'crafted',
        category: 'food',
        recipe: ['cream', 'rock-salt', 'savour-herb'],
        source: 'recipes',
        imagePath: 'assets/images/food/herb-butter.png'
    },
    {
        internalId: 105,
        id: 'turbonado-sugar',
        name: 'Turbinado Sugar',
        type: 'crafted',
        category: 'food legendary',
        recipe: ['crystal1', 'essence1', 'legendary1'],
        source: 'recipes',
        imagePath: 'assets/images/food/turbinado-sugar.png'
    },
    {
        internalId: 106,
        id: 'vanilla-ice-cream',
        name: 'Vanilla Ice Cream',
        type: 'crafted',
        category: 'food',
        recipe: ['cream', 'crystal1', 'essence1'],
        source: 'recipes',
        imagePath: 'assets/images/food/vanilla-ice-cream.png'
    },
    
    // New crafted items from newstuff.txt
    {
        internalId: 107,
        id: 'plastic-sheeting',
        name: 'Plastic Sheeting',
        type: 'crafted',
        category: 'textile crafted',
        recipe: ['plasticizer', 'petrodistillate'],
        source: 'newstuff',
        imagePath: 'assets/images/Plastic Sheeting.png'
    },
    {
        internalId: 108,
        id: 'crafted-adhesive',
        name: 'Adhesive',
        type: 'crafted',
        category: 'crafted other',
        recipe: ['barkgum', 'plasticizer', 'solvent'],
        source: 'newstuff',
        imagePath: 'assets/images/Adhesive.png'
    },
    {
        internalId: 109,
        id: 'diaper',
        name: 'Diaper',
        type: 'crafted',
        category: 'textile crafted',
        recipe: ['plastic-sheeting', 'adhesive', 'cotton-fluff'],
        source: 'newstuff',
        imagePath: 'assets/images/diaper.png'
    },
    {
        internalId: 110,
        id: 'lovely-diaper',
        name: 'Lovely Diaper',
        type: 'crafted',
        category: 'textile crafted',
        recipe: ['plastic-sheeting', 'adhesive', 'cotton-fluff', 'touch-of-love'],
        exoticIngredient: 'touch-of-love',
        source: 'newstuff',
        imagePath: 'assets/images/diaper.png'
    },
    {
        internalId: 111,
        id: 'quiche',
        name: 'Quiche',
        type: 'crafted',
        category: 'food crafted',
        source: 'newstuff',
        imagePath: 'assets/images/Quiche.png'
    }
];

// Function to get an item by its internal ID
function getItemByInternalId(internalId) {
    return masterItemsList.find(item => item.internalId === internalId);
}

// Function to get an item by its original ID
function getItemById(id) {
    return masterItemsList.find(item => item.id === id);
}

// Function to get all items of a specific type (ingredient or crafted)
function getItemsByType(type) {
    return masterItemsList.filter(item => item.type === type);
}

// Function to get all items of a specific category
function getItemsByCategory(category) {
    return masterItemsList.filter(item => item.category.includes(category));
}

// Function to check if the image path exists
function verifyImagePaths() {
    const missingImages = [];
    
    masterItemsList.forEach(item => {
        if (!item.imagePath) {
            missingImages.push({
                internalId: item.internalId,
                id: item.id,
                name: item.name
            });
        }
    });
    
    if (missingImages.length > 0) {
        console.warn(`Found ${missingImages.length} items missing image paths:`, missingImages);
    } else {
        console.log('All items have image paths defined!');
    }
    
    return missingImages;
}

// Function to check if all items in the list exist in the system
function verifyAllItems() {
    // This would need to be implemented with actual references to all source files
    console.log('Total master items:', masterItemsList.length);
    console.log('Ingredients:', masterItemsList.filter(item => item.type === 'ingredient').length);
    console.log('Crafted items:', masterItemsList.filter(item => item.type === 'crafted').length);
    
    // Verify image paths
    verifyImagePaths();
    
    return true;
}

// Add a function to normalize image paths
function normalizeImagePath(path) {
    if (!path) return null;
    
    // If path doesn't start with assets/images/ and doesn't contain a drive letter (like C:\)
    if (!path.includes('assets/images/') && !path.match(/^[a-zA-Z]:\\/)) {
        return 'assets/images/' + path;
    }
    
    return path;
}

// Export the data and functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        masterItemsList,
        getItemByInternalId,
        getItemById,
        getItemsByType,
        getItemsByCategory,
        verifyAllItems,
        verifyImagePaths,
        normalizeImagePath
    };
} else {
    // For browser environments, attach to window
    window.masterItemDatabase = {
        items: masterItemsList,
        getItemByInternalId,
        getItemById,
        getItemsByType,
        getItemsByCategory,
        verifyAllItems,
        verifyImagePaths,
        normalizeImagePath
    };
}