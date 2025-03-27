const ingredients = [
    // Regular Ice Cream Ingredients
    {
        id: 'cream',
        name: 'Cream',
        description: 'Fresh dairy cream, essential for making ice cream and other desserts.',
        category: 'food',
        image: 'assets/images/Cream.png',
        color: '#fff5e6'
    },
    {
        id: 'white-sugar', // Changed back to match recipe references
        name: 'White Sugar',
        description: 'Refined sugar that adds sweetness to any recipe.',
        category: 'food',
        image: 'assets/images/White Sugar.png',
        color: '#ffffff'
    },
    {
        id: 'egg',
        name: 'Egg',
        description: 'A common binding agent used in cooking and baking.',
        category: 'food',
        image: 'assets/images/Egg.png',
        color: '#ffe0b3'
    },
    {
        id: 'vanilla',
        name: 'Vanilla',
        description: 'A fragrant flavoring extracted from vanilla pods.',
        category: 'botanical',
        image: 'assets/images/Vanilla.png',
        color: '#f5e3c4'
    },
    
    // Legendary Ice Cream Ingredients
    {
        id: 'azure-cream',
        name: 'Azure Moon Cream',
        description: 'Legendary cream harvested under a blue moon. Glows with ethereal light.',
        category: 'food legendary',
        image: 'assets/images/Azure Moon Cream.png',
        color: '#8eb8e5'
    },
    {
        id: 'star-sugar',
        name: 'Star Sugar',
        description: 'Crystallized sweetness that fell from the stars. Sparkles with cosmic energy.',
        category: 'food legendary',
        image: 'assets/images/Star Sugar.png',
        color: '#e0e0ff'
    },
    {
        id: 'lunar-egg',
        name: 'Lunar-Dodo Egg',
        description: 'An egg from the rare Lunar-Dodo bird. Emits a soft blue glow.',
        category: 'food legendary',
        image: 'assets/images/Lunar-Dodo Egg.png',
        color: '#c4d8f5'
    },
    {
        id: 'starsoaked-vanilla',
        name: 'Starsoaked Vanilla',
        description: 'Vanilla beans that have been bathed in starlight for a full lunar cycle.',
        category: 'food legendary botanical',
        image: 'assets/images/Starsoaked Vanilla.png',
        color: '#d2c4f5'
    },
    {
        id: 'night-sky',
        name: 'Distillation of a Night Sky',
        description: 'The essence of a perfect night sky captured in a bottle. Contains stardust and dreams.',
        category: 'legendary',
        image: 'assets/images/Distillation of a Night Sky.png',
        color: '#0a1a3f'
    },
    {
        id: 'flavor-matrix',
        name: 'Flavor Matrix',
        description: 'Made from the distillation of Candy Elemental, this crystallized flavor matrix can radically expand the flavor profile of many food items- and even unlock the hidden potential of some ingredients.',
        category: 'legendary',
        image: 'assets/images/Flavor Matrix.png',
        color: '#7986cb'
    },
    {
        id: 'turbonado-sugar',
        name: 'Turbonado Sugar',
        description: 'With the awesome gastronomic might of the flavor matrix, even plain white sugar can be elevated to godly tiers of taste sensation!',
        category: 'legendary',
        image: 'assets/images/TurbonadoSugar.png',
        color: '#b39ddb'
    },
    {
        id: 'liquid-pain',
        name: 'Liquid Pain',
        description: 'A shifting, blood‑red fluid pulsing as though alive, harvested from the shattered hearts of fiends—dangerous, potent, and steeped in dark magic.',
        category: 'legendary food',
        image: 'assets/images/Liquid Pain.png',
        color: '#8b0000'
    },
    {
        id: 'touch-of-love',
        name: 'Touch of Love',
        description: 'The \'most common\' of Legendary Ingredients is one many can make themselves- but isn\'t it being so common a good thing? <3',
        category: 'legendary exotic',  // Make sure it has both categories
        image: 'assets/images/Touch of Love.png',
        color: '#ffb6c1'
    },
    
    // New Ingredients
    {
        id: 'wildflower-honey-cream',
        name: 'Wildflower Honey-Cream',
        description: 'A golden cream swirled with wildflower nectar, exuding the essence of springtime warmth and renewal.',
        category: 'food botanical',
        image: 'assets/images/Wildflower Honey-Cream.bak.png',
        color: '#ffd700'
    },
    {
        id: 'birch-syrup',
        name: 'Birch Syrup',
        description: 'A rare syrup tapped from ancient, enchanted birch trees; each drop resonates with the forest\'s whispered secrets.',
        category: 'food botanical',
        image: 'assets/images/Birch Syrup.bak.png',
        color: '#8b4513'
    },
    {
        id: 'chromatic-platinum',
        name: 'Chromatic Platinum',
        description: 'A resplendent metal alloy imbued with shifting prismatic hues, radiating a subtle magical aura.',
        category: 'legendary mineral',
        image: 'assets/images/Chromatic Platinum.png',
        color: '#e5e4e2'
    },
    {
        id: 'dreamvapor',
        name: 'Dreamvapor',
        description: 'An ephemeral mist carrying the scents of lavender and lost lullabies, slipping away like a fragment of a fading dream.',
        category: 'legendary',
        image: 'assets/images/Dreamvapor.png',
        color: '#e6e6fa'
    },
    {
        id: 'fractal-copper',
        name: 'Fractal Copper',
        description: 'A mysterious, ever-fractalizing metal whose intricate patterns appear only under the full moon\'s light.',
        category: 'mineral',
        image: 'assets/images/Fractal Copper.png',
        color: '#b87333'
    },
    {
        id: 'defractor-prism',
        name: 'Defractor Prism',
        description: 'Differentiates magical, material, and chemical processes, allowing for breakdown of materials into their components.',
        category: 'rare mineral',
        image: 'assets/images/Defractor Prism.png',
        color: '#f0f8ff'
    },
    {
        id: 'glimmelectrum',
        name: 'Glimmelectrum',
        description: 'A radiant, mysterious alloy that hums with magical energy, capturing and reflecting light in mesmerizing patterns.',
        category: 'mineral',
        image: 'assets/images/Glimmelectrum.png',
        color: '#e5e4e2'
    },
    {
        id: 'glimmergold',
        name: 'Glimmergold',
        description: 'A rare alchemical powder that sparkles like crushed sunlight, coveted by mages and merchants alike for its enigmatic properties.',
        category: 'mineral',
        image: 'assets/images/glimmergold.bak.png',
        color: '#ffd700'
    },
    {
        id: 'sunset-essence',
        name: 'Sunset Essence',
        description: 'Captured at the fleeting moment of twilight, this radiant liquid holds the fading light of a dying day, evoking enchanting warmth and mystery.',
        category: 'food rare',
        image: 'assets/images/Sunset Essence.png',
        color: '#ffa07a'
    },
    {
        id: 'hemimetrichite',
        name: 'Hemimetrichite',
        description: 'A shimmering crystal with half-formed facets, said to harbor the memories of unfulfilled destinies and ancient lore.',
        category: 'mineral',
        image: 'assets/images/hemimetrichite.png',
        color: '#c0c0c0'
    },
    {
        id: 'starshot-ore',
        name: 'Starshot Ore',
        description: 'A celestial metallic fragment believed to have fallen from the heavens; it glimmers with soft starlight even in utter darkness.',
        category: 'mineral',
        image: 'assets/images/Starshot Ore.png',
        color: '#e6e6fa'
    },
    {
        id: 'orichalchite',
        name: 'Orichalchite',
        description: 'Often called "orichalcum\'s ghost," this peculiar mineral shifts between the material and ethereal realms, evoking lost legends.',
        category: 'mineral',
        image: 'assets/images/Orichalchite.png',
        color: '#daa520'
    },
    {
        id: 'jadicine',
        name: 'Jadicine',
        description: 'A translucent green substance, rumored to be distilled from the tears of a jade dragon, soothing the mind and mending wounds.',
        category: 'exotic mineral',
        image: 'assets/images/Jadicine.png',
        color: '#90ee90'
    },
    {
        id: 'liquid-pain',
        name: 'Liquid Pain',
        description: 'A shifting, blood‑red fluid pulsing as though alive, harvested from the shattered hearts of fiends—dangerous, potent, and steeped in dark magic.',
        category: 'legendary food',
        image: 'assets/images/Liquid Pain.png',
        color: '#8b0000'
    },
    {
        id: 'matrix-malachite',
        name: 'Matrix Malachite',
        description: 'A stone of intricate interlocking veins, its mystifying patterns hint at the buried wisdom of ancient sages.',
        category: 'mineral',
        image: 'assets/images/matrixmalachite.png',
        color: '#2e8b57'
    },
    {
        id: 'prismatic-activator',
        name: 'Prismatic Activator',
        description: 'A dazzling device shimmering with the full spectrum of colors, designed to unlock hidden magical potentials with a decisive spark.',
        category: 'legendary rare',
        image: 'assets/images/Prismatic Activator.png',
        color: '#ff69b4'
    },
    {
        id: 'rock-salt',
        name: 'Rock Salt',
        description: 'A coarse, naturally occurring crystalline salt harvested from ancient deposits. It lends a distinct crunch and subtle brininess to recipes.',
        category: 'mineral',
        image: 'assets/images/Rock Salt.png',
        color: '#e0e0e0'
    },
    {
        id: 'flour',
        name: 'Flour',
        description: 'A finely milled powder ground from high-quality grains, known for its versatile binding properties and delicate, neutral flavor.',
        category: 'food',
        image: 'assets/images/Flour.png',
        color: '#fff5e6'
    },
    {
        id: 'spring-water',
        name: 'Spring Water',
        description: 'Pure water drawn from pristine natural springs, enriched with essential minerals to enhance the clarity and freshness of any culinary creation.',
        category: 'food',
        image: 'assets/images/Spring Water.png',
        color: '#e6f3ff'
    },
    {
        id: 'savour-herb',
        name: 'Savour Herb',
        description: 'A fragrant herb blend that brings out the savory essence in any dish.',
        category: 'food botanical',
        image: 'assets/images/Savour Herb.png',
        color: '#567d46'
    },
    {
        id: 'sweetleaf',
        name: 'Sweetleaf',
        description: 'Naturally sweet leaves that add a delicate sweetness without overpowering other flavors.',
        category: 'food botanical',
        image: 'assets/images/Sweetleaf.png',
        color: '#98fb98'
    },
    {
        id: 'tastetanium-crystal',
        name: 'Tastetanium Crystal',
        description: 'This anomalous crystalline lattice of freestate energy interacts with ingredients to create new and novel building blocks for taste sensation! It\'s also incredibly durable, but who cares about that?',
        category: 'legendary mineral food',
        image: 'assets/images/Tastetanium Crystal.png',
        color: '#b19cd9'
    },
    {
        id: 'butter',
        name: 'Butter',
        description: 'A rich, creamy spread made from churned cream and salt. Essential for countless recipes.',
        category: 'food',
        image: 'assets/images/Butter.png',
        color: '#fff4c4'
    },
    {
        id: 'whipped-butter',
        name: 'Whipped White Butter',
        description: 'Light and airy butter whipped to perfection. Spreads like a dream.',
        category: 'food',
        image: 'assets/images/Whipped White Butter.png',
        color: '#fffff0'
    },
    {
        id: 'herb-butter',
        name: 'Herb Butter',
        description: 'Delicious and flavorful, with hints of savory rosemary and garlic common to savourherb.',
        category: 'food',
        image: 'assets/images/Herb Butter.png',
        color: '#e6ffe6'
    },
    {
        id: 'magibutter',
        name: 'Magibutter',
        description: 'This incredibutter brings all of the flavor and joy of butter, with all of the protein and vitamins and minerals, but somehow no calories! Whoa!',
        category: 'food',
        image: 'assets/images/Magibutter.png',
        color: '#e6e6fa'
    }
];

// Initialize player inventory
let playerInventory = {};

// Add starting ingredients to inventory
function initializeInventory() {
    try {
        // Clear existing inventory
        playerInventory = {};
        
        // Give starting amounts
        ingredients.forEach(ingredient => {
            playerInventory[ingredient.id] = ingredient.category.includes('legendary') ? 2 : 5;
        });
        
        // Save to localStorage with error checking
        const saved = localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
        console.log('Inventory save successful:', saved);
        console.log('Initialized inventory:', playerInventory);
    } catch (error) {
        console.error('Failed to initialize inventory:', error);
        alert('Failed to initialize inventory. Please check console for details.');
    }
}

// Try to load saved inventory with error handling
try {
    const savedInventory = localStorage.getItem('playerInventory');
    if (savedInventory) {
        playerInventory = JSON.parse(savedInventory);
        console.log('Loaded saved inventory successfully');
    } else {
        console.log('No saved inventory found, initializing new one');
        initializeInventory();
    }
} catch (error) {
    console.error('Error loading inventory:', error);
    alert('Error loading saved data. Initializing new inventory.');
    initializeInventory();
}

// Helper functions
function getIngredientById(id) {
    return ingredients.find(ingredient => ingredient.id === id);
}

function getIngredientsByCategory(category) {
    if (category === 'all') {
        return ingredients;
    }
    return ingredients.filter(ingredient => ingredient.category.includes(category));
}
