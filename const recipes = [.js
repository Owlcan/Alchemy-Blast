const recipes = [
    {
        id: 'vanilla-ice-cream',
        name: 'Vanilla Ice Cream',
        ingredients: ['cream', 'sugar', 'egg', 'vanilla'],
        exoticIngredient: null,
        result: {
            name: 'Vanilla Ice Cream',
            description: 'The tried and true classic. Almost no one can mess this up- delicious even when it turns to soup!',
            effects: 'Restores 6HP, 8 if savored during a short rest.',
            image: 'Vanilla Ice Cream.png'
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
            image: 'Azure Harvest Blue Moon Ice Cream.png'
        }
    }
];

// Function to check if a recipe can be created with the given ingredients
function findMatchingRecipe(slotContents) {
    // Extract ingredient IDs from slots
    const ingredientIds = [];
    for (const position of ['a', 'b', 'c', 'd']) {
        if (slotContents[position]) {
            ingredientIds.push(slotContents[position].id);
        }
    }
    
    // Check for exotic ingredient
    const exoticIngredient = slotContents.e ? slotContents.e.id : null;
    
    // If we don't have enough ingredients, return null
    if (ingredientIds.length < 4) {
        return null;
    }
    
    // Check each recipe
    for (const recipe of recipes) {
        // Check if all required recipe ingredients are present
        const allIngredientsMatch = recipe.ingredients.every(ingId => 
            ingredientIds.includes(ingId)
        );
        
        // Check if exotic ingredient matches or is not required
        const exoticMatches = 
            (recipe.exoticIngredient === null && exoticIngredient === null) || 
            (recipe.exoticIngredient === exoticIngredient);
            
        // If all ingredients match and we have the right exotic ingredient (or none if not required)
        if (allIngredientsMatch && exoticMatches && ingredientIds.length === recipe.ingredients.length) {
            return recipe;
        }
    }
    
    return null;
}
