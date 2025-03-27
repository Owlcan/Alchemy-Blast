// This file defines recipes properly
const recipes = [
    {
        id: 'butter',
        ingredients: ['cream', 'rock-salt'],
        exoticIngredient: null,
        validate: function(slots) {
            // Must have exactly cream and rock-salt, nothing else
            const ingredients = Object.values(slots)
                .filter(slot => slot !== null)
                .map(slot => slot.id);
            
            const hasCream = ingredients.includes('cream');
            const hasRockSalt = ingredients.includes('rock-salt');
            const hasExactly2Ingredients = ingredients.length === 2;
            const hasNoHerb = !ingredients.includes('savour-herb');
            
            console.log('Butter validation check:', { 
                hasCream, 
                hasRockSalt, 
                count: ingredients.length,
                hasNoHerb
            });
            
            return hasCream && hasRockSalt && hasExactly2Ingredients && hasNoHerb;
        },
        result: {
            name: 'Butter',
            description: 'Smooth, creamy butter, perfect for cooking.',
            effects: 'Adds richness to food dishes.',
            category: 'food',
            image: 'assets/images/food/butter.png',
            craftedImage: 'assets/images/food/butter-small.png'
        }
    },
    {
        id: 'herb-butter',
        ingredients: ['cream', 'rock-salt', 'savour-herb'],
        exoticIngredient: null,
        validate: function(slots) {
            // Debug logging
            console.log('Validating Herb Butter Recipe');
            console.log('Slot contents:', slots);
            
            // Must have exactly these three ingredients in any slots
            const ingredients = Object.values(slots)
                .filter(slot => slot !== null)
                .map(slot => slot.id);
            
            const hasCream = ingredients.includes('cream');
            const hasRockSalt = ingredients.includes('rock-salt');
            const hasSavourHerb = ingredients.includes('savour-herb');
            const hasExactly3Ingredients = ingredients.length === 3;
            
            console.log('Herb Butter validation check:', { 
                hasCream, 
                hasRockSalt, 
                hasSavourHerb, 
                count: ingredients.length 
            });
            
            return hasCream && hasRockSalt && hasSavourHerb && hasExactly3Ingredients;
        },
        result: {
            name: 'Herb Butter',
            description: 'Butter infused with aromatic herbs.',
            effects: 'Adds rich flavor to any dish.',
            category: 'food',
            image: 'assets/images/food/herb-butter.png',
            craftedImage: 'assets/images/food/herb-butter-small.png'
        }
    },
    {
        id: 'health-potion',
        ingredients: ['herb1', 'crystal1'],
        exoticIngredient: null,
        result: {
            name: 'Health Potion',
            description: 'A basic healing potion that restores vitality.',
            effects: 'Restores 25 health points when consumed.',
            category: 'potion',
            image: 'assets/images/potions/health-potion.png'
        }
    },
    {
        id: 'turbonado-sugar',
        ingredients: ['crystal1', 'essence1'],
        exoticIngredient: 'legendary1',
        result: {
            name: 'Turbinado Sugar',
            description: 'A magical sugar with extraordinary properties.',
            effects: 'Makes foods taste incredible and adds magical properties.',
            category: 'food legendary',
            image: 'assets/images/food/turbinado-sugar.png'
        }
    },
    {
        id: 'vanilla-ice-cream',
        ingredients: ['cream', 'crystal1', 'essence1'],
        exoticIngredient: null,
        result: {
            name: 'Vanilla Ice Cream',
            description: 'The tried and true classic. Almost no one can mess this up- delicious even when it turns to soup!',
            effects: 'Restores 6HP, 8 if savored during a short rest.',
            category: 'food',
            image: 'assets/images/food/vanilla-ice-cream.png',
            craftedImage: 'assets/images/food/vanilla-ice-cream-small.png'
        }
    },
    {
        id: 'azure-ice-cream',
        ingredients: ['cream', 'crystal1', 'essence1'],
        exoticIngredient: 'legendary1',
        result: {
            name: 'Azure Harvest Blue Moon Ice Cream',
            description: 'Some say they taste citrus, others swear there are hints of custard and aromatics- and yet still more profess their belief it tastes like the platonic ideal of blue children\'s modelling clay- all of them agree it is one of the best iced confections ever created.',
            effects: 'Resistance to fire for one dungeon or expedition. When consumed on expedition, you instantly succeed 2 of the required checks for completion. When consumed it restores 12HP and cures all non-magical diseases and afflictions.',
            category: 'food legendary',
            image: 'assets/images/food/azure-ice-cream.png'
        }
    }
];
