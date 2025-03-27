const ingredients = [
    // Regular Ice Cream Ingredients
    {
        id: 'cream',
        name: 'Cream',
        description: 'Fresh dairy cream, essential for making ice cream and other desserts.',
        category: 'food',
        image: 'Cream.png',
        color: '#fff5e6'
    },
    {
        id: 'sugar',
        name: 'White Sugar',
        description: 'Refined sugar that adds sweetness to any recipe.',
        category: 'food',
        image: 'White Sugar.png',
        color: '#ffffff'
    },
    {
        id: 'egg',
        name: 'Egg',
        description: 'A common binding agent used in cooking and baking.',
        category: 'food',
        image: 'Egg.png',
        color: '#ffe0b3'
    },
    {
        id: 'vanilla',
        name: 'Vanilla',
        description: 'A fragrant flavoring extracted from vanilla pods.',
        category: 'botanical',
        image: 'Vanilla.png',
        color: '#f5e3c4'
    },
    
    // Legendary Ice Cream Ingredients
    {
        id: 'azure-cream',
        name: 'Azure Moon Cream',
        description: 'Legendary cream harvested under a blue moon. Glows with ethereal light.',
        category: 'legendary',
        image: 'Azure Moon Cream.png',
        color: '#8eb8e5'
    },
    {
        id: 'star-sugar',
        name: 'Star Sugar',
        description: 'Crystallized sweetness that fell from the stars. Sparkles with cosmic energy.',
        category: 'legendary',
        image: 'Star Sugar.png',
        color: '#e0e0ff'
    },
    {
        id: 'lunar-egg',
        name: 'Lunar-Dodo Egg',
        description: 'An egg from the rare Lunar-Dodo bird. Emits a soft blue glow.',
        category: 'legendary',
        image: 'Lunar-Dodo Egg.png',
        color: '#c4d8f5'
    },
    {
        id: 'starsoaked-vanilla',
        name: 'Starsoaked Vanilla',
        description: 'Vanilla beans that have been bathed in starlight for a full lunar cycle.',
        category: 'legendary',
        image: 'Starsoaked Vanilla.png',
        color: '#d2c4f5'
    },
    {
        id: 'night-sky',
        name: 'Distillation of a Night Sky',
        description: 'The essence of a perfect night sky captured in a bottle. Contains stardust and dreams.',
        category: 'legendary',
        image: 'Distillation of a Night Sky.png',
        color: '#0a1a3f'
    }
];

// Initialize player inventory
let playerInventory = {};

// Add starting ingredients to inventory
function initializeInventory() {
    ingredients.forEach(ingredient => {
        // Give player 5 of each regular ingredient and 1 of each legendary
        playerInventory[ingredient.id] = ingredient.category === 'legendary' ? 1 : 5;
    });
}

// Get ingredient by ID
function getIngredientById(id) {
    return ingredients.find(ingredient => ingredient.id === id);
}

// Function to filter ingredients by category
function getIngredientsByCategory(category) {
    if (category === 'all') {
        return ingredients;
    }
    return ingredients.filter(ingredient => ingredient.category === category);
}
