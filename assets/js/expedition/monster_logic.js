/**
 * Monster Logic - Alchemy Blaster
 * 
 * This file contains all the monster logic for the Alchemy Blaster mini-game.
 * It centralizes the behavior for all regular monsters and boss monsters
 * in a Space Invaders-style system with finite waves.
 */

class MonsterLogic {
    constructor(game) {
        this.game = game;
        this.characterSprites = {
            dere: {
                select: 'assets/images/darklings/dereharacterselect.png',
                left: 'assets/images/darklings/dereleft.png',
                right: 'assets/images/darklings/dereright.png',
                shots: [
                    'assets/images/darklings/shot1.png',
                    'assets/images/darklings/shot1a.png',
                    'assets/images/darklings/shot1b.png'
                ],
                gameover: 'assets/images/darklings/deregameover.png'
            },
            aliza: {
                select: 'assets/images/darklings/alizacharacterselect.png',
                left: 'assets/images/darklings/alizaleft.png',
                right: 'assets/images/darklings/alizaright.png',
                shots: [
                    'assets/images/darklings/alizashot1.png', // Largest shot
                    'assets/images/darklings/alizashot2.png', // Alternates between extra large/large
                    'assets/images/darklings/alizashot3.png'  // Between shot2 and shot1 in size 
                ],
                gameover: 'assets/images/darklings/alizagameover.png'
            }
        };
        
        // Character-specific game mechanics as per design document
        this.characterMechanics = {
            dere: {
                // Multi-layered health system with 5 levels
                health: {
                    type: 'layered',
                    layers: 3,
                    assets: [
                        'assets/images/darklings/derehp1.png',
                        'assets/images/darklings/derehp2.png',
                        'assets/images/darklings/derehp3.png'
                    ]
                },
                // Directional firing with offset
                firing: {
                    type: 'directional',
                    offsets: {
                        left: { x: 5, y: -5 }, 
                        right: { x: -5, y: -5 } 
                    },
                    rate: 'steady',
                    projectileSelection: 'random',
                    // Power level upgrades (1-5)
                    powerLevels: {
                        1: { projectiles: 1, damage: 10 },
                        2: { projectiles: 2, damage: 10 },
                        3: { projectiles: 3, damage: 10 },
                        4: { projectiles: 3, damage: 15 }, // Level 4: Same as 3 but higher damage
                        5: { projectiles: 4, damage: 15 }  // Level 5: 4 projectiles with higher damage
                    },
                    special: {
                        type: 'screen-clear',
                        damage: 30,        // High damage to all enemies on screen
                        cooldown: 10000,   // 10 second cooldown
                        effectRadius: 300, // Covers most of the screen
                        name: 'Flash Blast' // Special attack name
                    }
                },
                movement: {
                    speed: 'moderate',
                    style: 'horizontal'
                }
            },
            aliza: {
                // Regenerating shield system
                health: {
                    type: 'shield',
                    maxShield: 100,
                    regenRate: 0.5,
                    regenDelay: 120
                },
                // Central firing with burst mode
                firing: {
                    type: 'central',
                    offsets: { x: 0, y: 0 }, // Center of sprite
                    rate: 'variable',
                    burstFire: {
                        active: true,
                        cooldown: 5000, // ms
                        burstRate: 50, // ms between burst shots
                        burstCount: 6 // Number of shots in a burst
                    }
                },
                movement: {
                    speed: 'fast',
                    style: 'horizontal'
                }
            }
        };
        
        // Define finite wave structure for Space Invaders style gameplay
        this.waveStructure = this.initializeWaveStructure();
        
        // Setup flyby system for basic darklings that move from left to right across screen
        this.flybySystem = {
            enabled: true,
            active: false,
            lastSpawn: 0,
            spawnInterval: 5000, // Reduced from 8000 to increase frequency
            minEnemies: 8,      // Increased from 3 to 8
            maxEnemies: 15,     // Increased from 6 to 15
            enemyTypes: ['darkling2', 'darkling3', 'darkling4'], // Basic enemy types for flybys
            possibleHeights: [60, 80, 100, 120, 140, 160, 180, 200], // Added more height options
            speed: -0.1,         // Reduced from 0.005 to make flybys much slower
            spacing: 30         // Reduced from 40 to create tighter groups
        };
    }
    
    /**
     * Initialize the wave structure for the entire game
     * Creates a finite set of waves with predetermined enemy formations
     * @returns {Object} Complete wave structure
     */
    initializeWaveStructure() {
        return {
            1: { // Round 1
                waves: [
                    {
                        // Wave 1: Spiral formation of basic enemies - Increased from 8 to 16
                        formation: 'spiral',
                        enemies: Array(16).fill('darkling1'),
                        spacing: { x: 35, y: 35 }, // Reduced spacing to accommodate more enemies
                        startPosition: { x: 125, y: 80 },
                        movementPattern: 'rotate'
                    },
                    {
                        // Wave 2: Dual helix formation - Increased from 12 to 20
                        formation: 'helix',
                        enemies: Array(20).fill().map((_, i) => 
                            i % 3 === 0 ? 'darkling2' : 'darkling1'),
                        spacing: { x: 25, y: 18 }, // Reduced spacing
                        startPosition: { x: 125, y: 60 },
                        movementPattern: 'pulse'
                    },
                    {
                        // Wave 3: Circular orbiting formation - Increased from 12 to 24
                        formation: 'orbital',
                        rings: 3, // Added an extra ring
                        enemies: Array(24).fill().map((_, i) => 
                            i < 8 ? 'darkling3' : 'darkling2'),
                        spacing: { radius: [80, 140, 200] }, // Added a third ring
                        startPosition: { x: 125, y: 120 },
                        movementPattern: 'converge'
                    },
                    {
                        // Wave 4: Flying-V with flanking enemies - Doubled the enemies
                        formation: 'multi-formation',
                        subFormations: [
                            {
                                type: 'arc',
                                enemies: Array(10).fill('darkling1'), // Increased from 5
                                spacing: { radius: 200, arc: 180 },
                                position: { x: 0, y: -40 }
                            },
                            {
                                type: 'arc',
                                enemies: Array(10).fill('darkling1'), // Increased from 5
                                spacing: { radius: 200, arc: 180 },
                                position: { x: 0, y: 40 }
                            }
                        ],
                        movementPattern: 'swoop'
                    },
                    {
                        // Wave 5: Boss wave with circling minions - Increased minion counts
                        formation: 'boss-with-satellites',
                        boss: { type: 'darklingboss1', position: { x: 0, y: 100 } },
                        minions: [
                            { type: 'darkling2', count: 12, orbit: { radius: 120, speed: 0.002 } }, // Doubled from 6
                            { type: 'darkling1', count: 10, orbit: { radius: 200, speed: -0.001 } }, // More than doubled from 4
                            { type: 'darkling3', count: 8, orbit: { radius: 250, speed: 0.0015 } } // Added a new orbital group
                        ],
                        movementPattern: 'boss-attack'
                    }
                ],
                bossWave: 5
            },
            2: { // Round 2
                waves: [
                    {
                        // Wave 1: Pentagram formation with rotating enemies - Increased from 15 to 25
                        formation: 'pentagram',
                        enemies: Array(25).fill().map((_, i) => 
                            ['darkling1', 'darkling2', 'darkling3'][i % 3]),
                        spacing: { outer: 170, inner: 100 }, // Increased spacing to accommodate more enemies
                        startPosition: { x: 0, y: 0 },
                        movementPattern: 'star-pulse'
                    },
                    {
                        // Wave 2: Pentagram formation with rotating enemies - Increased from 15 to 25
                        formation: 'pentagram',
                        enemies: Array(25).fill().map((_, i) => 
                            ['darkling5', 'darkling6', 'darkling4'][i % 3]),
                        spacing: { outer: 170, inner: 100 }, // Increased spacing
                        startPosition: { x: 0, y: 0 },
                        movementPattern: 'star-pulse'
                    },
                    {
                        // Wave 3: Multi-tiered serpentine attack - Increased from 21 to 35
                        formation: 'serpentine',
                        rows: 5, // Increased from 3 to 5 rows
                        enemies: Array(35).fill().map((_, i) => {
                            const row = Math.floor(i / 7);
                            return row === 0 ? 'darkling6' : 
                                   row === 1 ? 'darkling5' : 
                                   row === 2 ? 'darkling4' :
                                   row === 3 ? 'darkling3' : 'darkling2';
                        }),
                        spacing: { x: 65, y: 40 }, // Reduced spacing slightly
                        startPosition: { x: 0, y: -20 }, // Start higher
                        waveFactor: { amplitude: 60, frequency: 0.1 },
                        movementPattern: 'wave-attack'
                    },
                    {
                        // Wave 4: Pentagram formation - Increased from 25 to 35
                        formation: 'pentagram',
                        enemies: Array(35).fill().map((_, i) => 
                            ['darkling5', 'darkling6', 'darkling4','darkling1','darkling2','darkling3' ][i % 6]),
                        spacing: { outer: 200, inner: 100 }, // Increased spacing
                        startPosition: { x: 0, y: 100 },
                        movementPattern: 'star-pulse'
                    },
                    {
                        // Wave 5: Nested circles with different rotation directions - Doubled enemy counts
                        formation: 'nested-circles',
                        rings: [
                            { 
                                enemies: Array(16).fill('darkling8'), // Doubled from 8
                                radius: 80,
                                rotationSpeed: 0.001
                            },
                            { 
                                enemies: Array(24).fill('darkling5'), // Doubled from 12
                                radius: 150,
                                rotationSpeed: -0.0008
                            },
                            { 
                                enemies: Array(12).fill('darkling4'), // Doubled from 6
                                radius: 220,
                                rotationSpeed: 0.0005
                            }
                        ],
                        startPosition: { x: 0, y: 120 },
                        movementPattern: 'pulsating'
                    },
                    {
                        // Wave 6: Staggered assault with three attack lines - Doubled enemy counts
                        formation: 'staggered-assault',
                        waves: [
                            {
                                formation: 'arc',
                                enemies: Array(10).fill('darkling8'), // Doubled from 5
                                spacing: { radius: 120, arc: 120 },
                                startPosition: { x: 0, y: -40 },
                                delay: 0
                            },
                            {
                                formation: 'pentagram',
                                enemies: Array(30).fill().map((_, i) => // Doubled from 15
                                ['darkling1', 'darkling2', 'darkling3'][i % 3]),
                                spacing: { outer: 170, inner: 100 }, // Increased spacing
                                startPosition: { x: 0, y: 0 },
                                movementPattern: 'star-pulse'
                            },
                            {
                                formation: 'arc',
                                enemies: Array(10).fill('darkling8'), // Doubled from 5
                                spacing: { radius: 120, arc: 120 },
                                startPosition: { x: 0, y: 40 },
                                delay: 0
                            }
                        ],
                        movementPattern: 'pulsating'
                    },
                    {
                        // Wave 7: Boss wave - Completely redesigned for more reliability
                        formation: 'round2-boss',
                        boss: { 
                            type: 'darklingboss2', 
                            position: { x: 0, y: 120 },
                            health: 150, // Increased health for more challenging battle
                            hasShield: true, // New shield mechanic
                            phase: 1, // Boss starts in phase 1
                            phaseThresholds: [0.7, 0.4] // Transition at 70% and 40% health
                        },
                        guardians: [
                            // Four fixed guardian positions around the boss
                            { type: 'darkling7', position: { x: -100, y: 80 } },
                            { type: 'darkling7', position: { x: 100, y: 80 } },
                            { type: 'darkling7', position: { x: -100, y: 160 } },
                            { type: 'darkling7', position: { x: 100, y: 160 } }
                        ],
                        minions: [
                            // Orbiting minions - first wave
                            { type: 'darkling5', count: 8, orbit: { radius: 180, speed: 0.001, offset: 0 } },
                            // Second wave of minions spawns when boss reaches 70% health
                            { type: 'darkling4', count: 10, orbit: { radius: 220, speed: -0.0015, offset: Math.PI / 2 } },
                            // Final reinforcements when boss reaches 40% health
                            { type: 'darkling8', count: 6, orbit: { radius: 150, speed: 0.002, offset: Math.PI / 4 } }
                        ],
                        movementPattern: 'round2-boss-movement'
                    }
                ],
                bossWave: 7
            },
            3: { // Round 3
                waves: [
                    {
                        // Wave 1: Hypnotic spiral with alternating enemy types - Doubled from 20 to 40
                        formation: 'growing-spiral',
                        enemies: Array(40).fill().map((_, i) => 
                            i % 2 === 0 ? 'darkling8' : 'darkling7'),
                        spacing: { angle: 12, radiusStep: 12 }, // Reduced spacing to fit more enemies
                        startPosition: { x: 0, y: -50 },
                        growFactor: 0.3,
                        movementPattern: 'spiral-expand'
                    },
                    {
                        // Wave 2: Dynamic fractal formation that evolves - Increased seed and children
                        formation: 'fractal',
                        seed: {
                            enemies: ['darkling10', 'darkling10', 'darkling10', 'darkling10', 'darkling10'], // Added 2 more seed enemies
                            positions: [
                                { x: -150, y: 80 },
                                { x: -75, y: 40 },
                                { x: 0, y: 20 },
                                { x: 75, y: 40 },
                                { x: 150, y: 80 }
                            ]
                        },
                        children: {
                            enemies: Array(50).fill().map(() => // Increased from 32 to 50
                                Math.random() < 0.3 ? 'darkling8' : 'darkling7'),
                            offset: { x: [-40, -20, 0, 20, 40], y: [30, 30, 30, 30, 30] }
                        },
                        movementPattern: 'fractal-collapse'
                    },
                    {
                        // Wave 3: Interlocking rings with coordinated movements - Tripled enemy counts
                        formation: 'interlocking-rings',
                        rings: [
                            {
                                enemies: Array(18).fill('darkling10'), // Tripled from 6
                                radius: 100,
                                rotationSpeed: 0.001,
                                center: { x: -60, y: 100 }
                            },
                            {
                                enemies: Array(18).fill('darkling10'), // Tripled from 6
                                radius: 100,
                                rotationSpeed: -0.001,
                                center: { x: 60, y: 100 }
                            },
                            {
                                enemies: Array(12).fill('darkling7'), // Quadrupled from 3
                                radius: 40,
                                rotationSpeed: 0.002,
                                center: { x: 0, y: 100 }
                            },
                            { // Added a fourth ring
                                enemies: Array(24).fill('darkling8'),
                                radius: 150,
                                rotationSpeed: 0.0015,
                                center: { x: 0, y: 100 }
                            }
                        ],
                        movementPattern: 'cosmic-dance'
                    },
                    {
                        // Wave 4: Fortress formation with more turrets and defenders
                        formation: 'fortress',
                        core: {
                            enemies: Array(10).fill('darkling7'), // Doubled from 5
                            positions: [
                                { x: 0, y: 80 },
                                { x: -60, y: 120 },
                                { x: 60, y: 120 },
                                { x: -120, y: 160 },
                                { x: 120, y: 160 },
                                { x: -40, y: 100 },
                                { x: 40, y: 100 },
                                { x: -80, y: 140 },
                                { x: 80, y: 140 },
                                { x: 0, y: 140 }
                            ]
                        },
                        turrets: [
                            { type: 'darkling8', position: { x: -160, y: 80 } },
                            { type: 'darkling8', position: { x: 160, y: 80 } },
                            { type: 'darkling8', position: { x: -140, y: 120 } }, // Added 2 more turrets
                            { type: 'darkling8', position: { x: 140, y: 120 } }
                        ],
                        defenders: {
                            formation: 'patrol',
                            enemies: Array(18).fill('darkling10'), // Tripled from 6
                            paths: [
                                { points: [{ x: -140, y: 40 }, { x: 140, y: 40 }], speed: 0.5 },
                                { points: [{ x: -100, y: 200 }, { x: 100, y: 200 }], speed: 0.3 },
                                { points: [{ x: -120, y: 120 }, { x: 120, y: 120 }], speed: 0.4 } // Added third patrol path
                            ]
                        },
                        movementPattern: 'fortress-defense'
                    },
                    {
                        // Wave 5: Pulsating nebula with swarming enemies - Doubled enemy count
                        formation: 'nebula',
                        clusters: [
                            {
                                enemies: Array(50).fill().map(() => // Doubled from 25
                                    Math.random() < 0.7 ? 'darkling8' : 'darkling10'),
                                radius: 180,
                                density: 0.7,
                                center: { x: 0, y: 120 }
                            },
                            { // Added a second cluster
                                enemies: Array(20).fill().map(() =>
                                    Math.random() < 0.4 ? 'darkling7' : 'darkling10'),
                                radius: 100,
                                density: 0.6,
                                center: { x: 0, y: 60 }
                            }
                        ],
                        pulseRate: { min: 0.7, max: 1.3, speed: 0.0005 },
                        movementPattern: 'nebula-pulse'
                    },
                    {
                        // Wave 6: Alchemy crucible - transforming formation - Tripled enemy counts in each phase
                        formation: 'crucible',
                        phases: [
                            {
                                formation: 'pentagon',
                                enemies: Array(30).fill('darkling8'), // Tripled from 10
                                radius: 150, // Increased radius to fit more enemies
                                position: { x: 100, y: 100 },
                                duration: 6000
                            },
                            {
                                formation: 'star',
                                enemies: Array(30).fill('darkling10'), // Tripled from 10
                                radius: { inner: 100, outer: 200 }, // Increased radius
                                position: { x: 0, y: 0 },
                                duration: 6000
                            },
                            {
                                formation: 'circle',
                                enemies: Array(30).fill('darkling7'), // Tripled from 10
                                radius: 170, // Increased radius
                                position: { x: -100, y: 0 },
                                duration: 6000
                            }
                        ],
                        transitionSpeed: 2000,
                        movementPattern: 'alchemical-transmutation'
                    },
                    {
                        // Wave 7: Dual vortex with periodic enemy pulses - Doubled enemy counts
                        formation: 'dual-vortex',
                        vortices: [
                            {
                                enemies: Array(16).fill().map((_, i) => // Doubled from 8
                                    i % 2 === 0 ? 'darkling10' : 'darkling8'),
                                center: { x: -100, y: 120 },
                                radius: { start: 30, end: 120 },
                                spiral: { turns: 1.5, direction: 1 }
                            },
                            {
                                enemies: Array(16).fill().map((_, i) => // Doubled from 8
                                    i % 2 === 0 ? 'darkling10' : 'darkling8'),
                                center: { x: 100, y: 120 },
                                radius: { start: 30, end: 120 },
                                spiral: { turns: 1.5, direction: -1 }
                            }
                        ],
                        connectors: {
                            enemies: Array(15).fill('darkling7'), // Tripled from 5
                            spacing: { x: 20, y: 0 } // Reduced spacing to fit more enemies
                        },
                        movementPattern: 'vortex-collapse'
                    },
                    {
                        // Wave 8: Final boss with phased dynamic defenses - Tripled minion counts
                        formation: 'final-bastion',
                        boss: { type: 'darklingboss3', position: { x: 0, y: 140 } },
                        phases: [
                            {
                                // Phase 1: Shielding formation - Tripled enemy count
                                formation: 'shield-wall',
                                enemies: Array(18).fill('darkling10'), // Tripled from 6
                                positions: [
                                    { x: -120, y: 90 }, { x: -80, y: 80 }, { x: -40, y: 70 }, 
                                    { x: 0, y: 60 }, { x: 40, y: 70 }, { x: 80, y: 80 },
                                    { x: 120, y: 90 }, { x: -100, y: 120 }, { x: -50, y: 110 },
                                    { x: 0, y: 100 }, { x: 50, y: 110 }, { x: 100, y: 120 },
                                    { x: -60, y: 150 }, { x: -20, y: 140 }, { x: 20, y: 140 },
                                    { x: 60, y: 150 }, { x: 0, y: 180 }, { x: 0, y: 200 }
                                ],
                                duration: 20000
                            },
                            {
                                // Phase 2: Attack formation - Tripled squad sizes
                                formation: 'attack-squad',
                                squads: [
                                    {
                                        enemies: Array(9).fill('darkling7'), // Tripled from 3
                                        formation: 'triangle',
                                        radius: 90, // Increased radius
                                        center: { x: -120, y: 120 }
                                    },
                                    {
                                        enemies: Array(9).fill('darkling7'), // Tripled from 3
                                        formation: 'triangle',
                                        radius: 90, // Increased radius
                                        center: { x: 120, y: 120 }
                                    },
                                    { // Added a third squad
                                        enemies: Array(12).fill('darkling8'),
                                        formation: 'diamond',
                                        radius: 100,
                                        center: { x: 0, y: 80 }
                                    }
                                ],
                                duration: 15000
                            },
                            {
                                // Phase 3: Desperate defense - Tripled enemy count
                                formation: 'desperation',
                                enemies: Array(36).fill().map(() => // Tripled from 12
                                    Math.random() < 0.5 ? 'darkling8' : 'darkling10'),
                                pattern: 'chaos',
                                boundary: { x: [-220, 220], y: [60, 220] }, // Increased boundary
                                duration: 25000
                            }
                        ],
                        movementPattern: 'final-stand'
                    }
                ],
                bossWave: 8
            },
            4: { // Round 4
                waves: [
                    {
                        // Wave 1: Elite special formation with increased enemies
                        formation: 'elite-formation',
                        enemies: Array(20).fill().map((_, i) => 
                            ['darkling8', 'darkling10', 'darkling7'][i % 3]),
                        spacing: { x: 50, y: 35 },
                        startPosition: { x: 0, y: 80 },
                        movementPattern: 'elite-movement'
                    },
                    {
                        // Wave 2: Advanced spiral
                        formation: 'growing-spiral',
                        enemies: Array(12).fill().map((_, i) => 
                            i % 2 === 0 ? 'darkling10' : 'darkling8'),
                        spacing: { angle: 18, radiusStep: 15 },
                        startPosition: { x: 0, y: 100 },
                        growFactor: 0.3,
                        movementPattern: 'spiral-expand'
                    },
                    {
                        // Wave 3: Circular orbiting formation
                        formation: 'orbital',
                        rings: 2,
                        enemies: Array(12).fill().map((_, i) => 
                            i < 4 ? 'darkling3' : 'darkling2'),
                        spacing: { radius: [80, 150] },
                        startPosition: { x: 0, y: 120 },
                        movementPattern: 'converge'
                    },
                    {
                        // Wave 4: Flying-V with flanking enemies
                        formation: 'multi-formation',
                        subFormations: [
                            {
                                type: 'v',
                                enemies: Array(5).fill('darkling3'),
                                spacing: { x: 50, y: 30 },
                                position: { x: 0, y: 80 }
                            },
                            {
                                type: 'arc',
                                enemies: Array(5).fill('darkling1'),
                                spacing: { radius: 180, arc: 120 },
                                position: { x: 0, y: 40 }
                            }
                        ],
                        movementPattern: 'swoop'
                    },
                    {
                        // Wave 5: Boss wave with circling minions
                        formation: 'boss-with-satellites',
                        boss: { type: 'darklingboss1', position: { x: 0, y: 100 } },
                        minions: [
                            { type: 'darkling2', count: 6, orbit: { radius: 120, speed: 0.002 } },
                            { type: 'darkling1', count: 4, orbit: { radius: 200, speed: -0.001 } }
                        ],
                        movementPattern: 'boss-attack'
                    }
                ],
                bossWave: 5
            }
        };
    }

    /**
     * Get initial health for an enemy based on its type
     * @param {string} type - The type of enemy
     * @returns {number} - Initial health value
     */
    getInitialHealth(type) {
        const healthMap = {
            'darklingboss1': 50,  // Increased from 25
            'darklingboss2': 250, // Increased from 100
            'darklingboss3': type === 'darklingboss3' ? 4000 : 400, // Final boss unchanged
            'darklingboss4': 100, // Increased from 50
            'darkling1': 1,
            'darkling2': 1,
            'darkling3': 1,
            'darkling4': 3,
            'darkling5': 2,
            'darkling6': 2,
            'darkling7': 10,
            'darkling8': 3,
            'darkling9': 1,
            'darkling10': 4
        };
        
        return healthMap[type] || 1; // Default to 1 if type not found
    }

    /**
     * Get shot cooldown for an enemy based on its type
     * @param {string} type - The type of enemy
     * @param {number} health - Current health of the enemy
     * @returns {number} - Cooldown time in milliseconds
     */
    getShotCooldown(type, health) {
        const cooldownMap = {
            'darklingboss1': 2400, // Reduced from 3000
            'darklingboss2': 1500, // Reduced from 2000
            'darklingboss3': 2000, // Final boss unchanged
            'darklingboss4': 3000, // Reduced from 3500
            'darkling1': Infinity, // These enemies don't shoot
            'darkling2': 3000,
            'darkling3': 2500,
            'darkling4': 2000,
            'darkling5': 1500,
            'darkling6': 2000,
            'darkling7': 1500,
            'darkling8': 1000,
            'darkling9': Infinity,
            'darkling10': 1500
        };
        
        return cooldownMap[type] || 4000;
    }

    /**
     * Get movement speed for an enemy based on its type and health
     * @param {string} type - The type of enemy
     * @param {number} health - Current health of the enemy
     * @returns {number} - Movement speed value
     */
    getSpeed(type, health) {
        // Special cases for bosses - speed up at low health
        if (type === 'darklingboss3' && health <= 20) {
            return 3;
        }
        
        // Remove conditional speed change for darklingboss2
        if (type.includes('boss')) {
            return 1.5; // All bosses are slower
        }
        
        if (['darkling5', 'darkling9'].includes(type)) {
            return 2.5; // Fast enemies
        }
        
        return 2; // Default speed
    }

    /**
     * Get point value for defeating an enemy
     * @param {string} type - The type of enemy
     * @returns {number} - Point value
     */
    getPoints(type) {
        if (type.includes('boss')) {
            return 500; // Bosses give more points
        }
        
        // Base points based on enemy type
        const pointsMap = {
            'darkling1': 10,
            'darkling2': 15,
            'darkling3': 20,
            'darkling4': 25,
            'darkling5': 30,
            'darkling6': 35,
            'darkling7': 50,
            'darkling8': 40,
            'darkling9': 15,
            'darkling10': 45
        };
        
        return pointsMap[type] || 10;
    }

    /**
     * Determine if an enemy can drop a potion and which type
     * @param {string} type - The type of enemy
     * @returns {Object|null} - Potion data or null if no drop
     */
    getPotionDrop(type) {
        // Determine drop chance based on enemy type
        let dropChance = 0.05; // 5% base chance
        
        // Bosses have higher drop chance
        if (type.includes('boss')) {
            dropChance = 0.5; // 50% chance - bosses always have a good chance of dropping items
        } else if (['darkling7', 'darkling8', 'darkling10'].includes(type)) {
            dropChance = 0.2; // 20% chance for stronger enemies
        } else if (['darkling4', 'darkling5', 'darkling6'].includes(type)) {
            dropChance = 0.1; // 10% chance for medium-strength enemies
        }
        
        // Determine if a potion drops
        if (Math.random() < dropChance) {
            // Determine which type of potion to drop
            const potionRoll = Math.random();
            
            let potionType;
            if (potionRoll < 0.5) {
                // 50% chance for health potion
                potionType = 'health';
            } else if (potionRoll < 0.75) {
                // 25% chance for power potion
                potionType = 'power';
            } else {
                // 25% chance for shield potion
                potionType = 'shield';
            }
            
            return { type: potionType };
        }
        
        return null; // No potion drop
    }

    /**
     * Get formation data for a specific round and wave
     * @param {number} round - Current round number
     * @param {number} wave - Current wave number
     * @returns {Object} - Formation data for the wave
     */
    getWaveFormation(round, wave) {
        // Validate input
        if (!this.waveStructure[round] || 
            !this.waveStructure[round].waves || 
            !this.waveStructure[round].waves[wave - 1]) {
            console.error(`Invalid round or wave: ${round}, ${wave}`);
            
            // Add fallback formation for debugging
            return {
                formation: 'line',
                enemies: Array(5).fill('darkling8'),
                spacing: { x: 50, y: 0 },
                startPosition: { x: 0, y: 80 },
                movementPattern: 'default'
            };
        }
        
        // Get the wave formation definition
        const formation = this.waveStructure[round].waves[wave - 1];
        console.log(`Loading formation for round ${round}, wave ${wave}: ${formation.formation}`);
        
        // For quantum formation in wave 4, ensure teleport positions are properly defined
        if (formation.formation === 'quantum') {
            // Add default teleport grid if not defined
            if (!formation.teleportPositions) {
                formation.teleportPositions = [];
                // Create grid of teleport positions
                for (let x = -200; x <= 200; x += 100) {
                    for (let y = 50; y <= 200; y += 50) {
                        formation.teleportPositions.push({ x, y });
                    }
                }
            }
            
            // Ensure teleport interval is defined
            if (!formation.teleportInterval) {
                formation.teleportInterval = 3000;
            }
        }
        
        return formation;
    }

    /**
     * Check if the current wave is a boss wave
     * @param {number} round - Current round number
     * @param {number} wave - Current wave number
     * @returns {boolean} - True if this is a boss wave
     */
    isBossWave(round, wave) {
        // Hardcoded boss wave numbers for clarity and reliability
        if (round === 1 && wave === 5) return true;
        if (round === 2 && wave === 7) return true;
        if (round === 3 && wave === 8) return true;
        
        return false;
    }

    /**
     * Get the number of waves in a specific round
     * @param {number} round - Round number
     * @returns {number} - Number of waves in the round
     */
    getWavesInRound(round) {
        // Hardcoded wave counts for reliability
        if (round === 1) return 5;
        if (round === 2) return 7;
        if (round === 3) return 8;
        if (round === 4) return 5;
        
        // Default fallback
        return this.waveStructure[round] ? 
               this.waveStructure[round].waves.length : 0;
    }

    /**
     * Get a movement pattern for a formation of enemies
     * @param {string} formation - The formation type
     * @param {string} pattern - The movement pattern to use
     * @returns {Function} - Function that returns formation position based on time
     */
    getFormationMovement(formation, pattern = 'default') {
        // Set up base movement patterns
        const patterns = {
            // Original patterns
            'default': t => ({
                x: Math.sin(t * 0.001) * 100,
                y: Math.min(100, Math.floor(t / 5000) * 20)
            }),
            
            // New pattern for Round 2 boss
            'round2-boss-movement': t => {
                // Boss in center with somewhat aggressive movement
                const phase = Math.floor(t / 12000) % 2;
                const phaseProgress = (t % 12000) / 12000;
                
                if (phase === 0) {
                    // Slower movement phase
                    return {
                        x: Math.sin(t * 0.0005) * 100,
                        y: 120 + Math.sin(t * 0.0007) * 30
                    };
                } else {
                    // More aggressive movement phase
                    return {
                        x: Math.sin(t * 0.001) * 140,
                        y: 120 + Math.cos(t * 0.0012) * 50
                    };
                }
            },
            
            'sidestep': t => ({
                x: Math.sin(t * 0.001) * 80,
                y: Math.min(60, (t * 0.008) % 80)
            }),
            
            'oscillate': t => ({
                x: Math.sin(t * 0.002) * 120,
                y: Math.floor(t / 4000) * 20 + Math.sin(t * 0.001) * 15
            }),
            
            'advance': t => ({
                x: Math.sin(t * 0.0015) * 50,
                y: Math.min(150, (t * 0.02))
            }),
            
            // New movement patterns
            'rotate': t => ({
                x: Math.sin(t * 0.001) * 100,
                y: Math.cos(t * 0.001) * 50 + 50
            }),
            
            'pulse': t => {
                const baseScale = 0.8 + Math.sin(t * 0.0015) * 0.2;
                return {
                    x: Math.sin(t * 0.001) * 100 * baseScale,
                    y: Math.cos(t * 0.0008) * 50 * baseScale + 30
                };
            },
            
            'converge': t => {
                // Start wide, then converge toward center
                const progress = Math.min(1, t / 10000);
                const expansionFactor = Math.max(0.3, 1 - progress);
                return {
                    x: Math.sin(t * 0.001) * 150 * expansionFactor,
                    y: 40 + progress * 80
                };
            },
            
            'swoop': t => {
                const swoopPhase = (t % 8000) / 8000;
                
                if (swoopPhase < 0.5) {
                    // Swoop in
                    const inProgress = swoopPhase * 2;
                    return {
                        x: Math.sin(t * 0.001) * 100,
                        y: 150 * inProgress
                    };
                } else {
                    // Swoop out
                    const outProgress = (swoopPhase - 0.5) * 2;
                    return {
                        x: Math.sin(t * 0.001) * 100,
                        y: 150 - (outProgress * 100)
                    };
                }
            },
            
            'boss-attack': t => {
                const phase = Math.floor(t / 8000) % 3;
                
                switch (phase) {
                    case 0: // Center position
                        return {
                            x: Math.sin(t * 0.0005) * 30,
                            y: 100 + Math.sin(t * 0.0007) * 20
                        };
                    case 1: // Left attack
                        return {
                            x: -150 + Math.sin(t * 0.002) * 50,
                            y: 80 + Math.cos(t * 0.002) * 30
                        };
                    case 2: // Right attack
                        return {
                            x: 150 + Math.sin(t * 0.002) * 50,
                            y: 80 + Math.cos(t * 0.002) * 30
                        };
                }
            },
            
            'converge-attack': t => {
                // Start at the sides, converge to center, then attack
                const phase = Math.floor(t / 10000) % 2;
                const phaseProgress = (t % 10000) / 10000;
                
                if (phase === 0) {
                    // Converge phase
                    return {
                        x: (1 - phaseProgress) * 200 * (Math.sin(t * 0.002)),
                        y: 60 + phaseProgress * 60
                    };
                } else {
                    // Attack phase - advance toward player
                    return {
                        x: Math.sin(t * 0.001) * 80,
                        y: 120 + phaseProgress * 100
                    };
                }
            },
            
            'star-pulse': t => {
                // Pentagram rotates and pulses
                const rotationSpeed = 0.0003;
                const pulseRate = 0.0006;
                const pulseAmount = 0.3;
                
                const rotation = t * rotationSpeed;
                const pulse = 1 + Math.sin(t * pulseRate) * pulseAmount;
                
                return {
                    x: Math.sin(rotation) * 100 * pulse,
                    y: 100 + Math.cos(rotation) * 40 * pulse
                };
            },
            
            'wave-attack': t => {
                const waveTime = t % 15000;
                const waveProgress = waveTime / 15000;
                
                // Start with horizontal wave motion
                if (waveProgress < 0.6) {
                    const adjustedProgress = waveProgress / 0.6;
                    return {
                        x: Math.sin(t * 0.001) * 150,
                        y: 60 + adjustedProgress * 40
                    };
                } else {
                    // Then rush attack
                    const attackProgress = (waveProgress - 0.6) / 0.4;
                    return {
                        x: Math.sin(t * 0.002) * (150 * (1 - attackProgress)),
                        y: 100 + attackProgress * 200
                    };
                }
            },
            
            'quantum-shift': t => {
                // Teleportation movement pattern with smooth transitions
                const phase = Math.floor(t / 3000) % 4;
                const phaseProgress = (t % 3000) / 3000;
                
                // Define key teleport positions for the overall formation movement
                const positions = [
                    { x: 0, y: 100 },
                    { x: -150, y: 80 },
                    { x: 0, y: 150 },
                    { x: 150, y: 80 }
                ];
                
                // Current and next position
                const currentPos = positions[phase];
                const nextPos = positions[(phase + 1) % 4];
                
                // For the first 80% of each phase, stay at current position with slight movement
                if (phaseProgress < 0.8) {
                    return {
                        x: currentPos.x + Math.sin(t * 0.003) * 20,
                        y: currentPos.y + Math.cos(t * 0.003) * 15
                    };
                } 
                // For the last 20%, quickly transition to next position (teleport effect)
                else {
                    // Use easing function for smooth transition
                    const transitionProgress = (phaseProgress - 0.8) / 0.2;
                    const easedProgress = Math.pow(transitionProgress, 2);
                    
                    return {
                        x: currentPos.x + (nextPos.x - currentPos.x) * easedProgress,
                        y: currentPos.y + (nextPos.y - currentPos.y) * easedProgress
                    };
                }
            },
            
            'pulsating': t => {
                // Concentric circles that rotate at different speeds and pulse
                const baseScale = 0.8 + Math.sin(t * 0.001) * 0.2;
                const yOffset = 100 + Math.sin(t * 0.0003) * 30;
                
                return {
                    x: Math.sin(t * 0.0007) * 80 * baseScale,
                    y: yOffset + Math.cos(t * 0.001) * 30 * baseScale
                };
            },
            
            'rush-and-hold': t => {
                const phase = Math.floor(t / 6000) % 2;
                const phaseProgress = (t % 6000) / 6000;
                
                if (phase === 0) {
                    // Rush in quickly
                    return {
                        x: Math.sin(t * 0.002) * 100 * (1 - phaseProgress),
                        y: 200 * phaseProgress
                    };
                } else {
                    // Hold position with slight movement
                    return {
                        x: Math.sin(t * 0.002) * 40,
                        y: 200 + Math.sin(t * 0.001) * 30
                    };
                }
            },
            
            'fortified-assault': t => {
                // Boss in center with defensive formation that periodically charges
                const phase = Math.floor(t / 10000) % 3;
                const phaseProgress = (t % 10000) / 10000;
                
                switch (phase) {
                    case 0: // Defensive formation
                        return {
                            x: Math.sin(t * 0.0005) * 40,
                            y: 120 + Math.sin(t * 0.0007) * 20
                        };
                    case 1: // Charge preparation
                        return {
                            x: Math.sin(t * 0.001) * 80 * (1 - phaseProgress),
                            y: 120 - phaseProgress * 40
                        };
                    case 2: // Charge attack
                        return {
                            x: Math.sin(t * 0.001) * 60,
                            y: 80 + phaseProgress * 180
                        };
                    default:
                        return {
                            x: Math.sin(t * 0.0005) * 40,
                            y: 120
                        };
                }
            },
            
            'spiral-expand': t => {
                // Spiral grows and contracts
                const expansionPhase = (t % 12000) / 12000;
                const expansionFactor = Math.sin(expansionPhase * Math.PI) * 0.5 + 0.5;
                
                return {
                    x: Math.sin(t * 0.0008) * 120 * expansionFactor,
                    y: 100 + Math.cos(t * 0.0008) * 60 * expansionFactor
                };
            },
            
            'fractal-collapse': t => {
                // Starts expanded, collapses inward, then expands again
                const collapsePhase = (t % 15000) / 15000;
                const collapseFactor = Math.abs(Math.sin(collapsePhase * Math.PI));
                
                return {
                    x: Math.sin(t * 0.0006) * 150 * collapseFactor,
                    y: 100 + Math.cos(t * 0.0006) * 70 * collapseFactor
                };
            },
            
            'cosmic-dance': t => {
                // Complex interlocking movements for interlocking-rings formation
                return {
                    x: Math.sin(t * 0.0007) * 120 + Math.sin(t * 0.0015) * 50,
                    y: 100 + Math.cos(t * 0.0009) * 60 + Math.cos(t * 0.0015) * 30
                };
            },
            
            'fortress-defense': t => {
                // Static fortress with slight movement and occasional defensive posture shifts
                const phase = Math.floor(t / 12000) % 3;
                const phaseProgress = (t % 12000) / 12000;
                
                switch (phase) {
                    case 0: // Standard defensive position
                        return {
                            x: Math.sin(t * 0.0004) * 30,
                            y: 120 + Math.sin(t * 0.0006) * 20
                        };
                    case 1: // Advance slightly
                        return {
                            x: Math.sin(t * 0.0005) * 50,
                            y: 130 + Math.sin(t * 0.0008) * 20
                        };
                    case 2: // Retreat and regroup
                        return {
                            x: Math.sin(t * 0.0003) * 25,
                            y: 100 + Math.sin(t * 0.0004) * 10
                        };
                    default:
                        return {
                            x: Math.sin(t * 0.0004) * 30,
                            y: 120
                        };
                }
            },
            
            'nebula-pulse': t => {
                // Swirling cloud-like motion
                const pulseRate = 0.0004;
                const pulseAmount = 0.4;
                const pulse = 1 + Math.sin(t * pulseRate) * pulseAmount;
                
                return {
                    x: Math.sin(t * 0.0005) * 80 * pulse,
                    y: 120 + Math.cos(t * 0.0007) * 40 * pulse
                };
            },
            
            'alchemical-transmutation': t => {
                // Movement that represents alchemical transformation
                const phase = Math.floor(t / 6000) % 3;
                const phaseProgress = (t % 6000) / 6000;
                
                // Different movement for each alchemical phase
                switch (phase) {
                    case 0: // Calcination - heating
                        return {
                            x: Math.sin(t * 0.001) * 80,
                            y: 100 + Math.sin(phaseProgress * Math.PI) * 30
                        };
                    case 1: // Dissolution - dissolving
                        return {
                            x: Math.sin(t * 0.0015) * 120 * (1 - phaseProgress/2),
                            y: 100 + Math.cos(t * 0.0015) * 50 * (1 - phaseProgress/2)
                        };
                    case 2: // Conjunction - recombining
                        return {
                            x: Math.sin(t * 0.002) * 60 * phaseProgress,
                            y: 100 + Math.cos(t * 0.002) * 30 * phaseProgress
                        };
                    default:
                        return {
                            x: Math.sin(t * 0.001) * 80,
                            y: 100 + Math.sin(t * 0.0008) * 30
                        };
                }
            },
            
            'vortex-collapse': t => {
                // Dual vortices that periodically collapse inward
                const collapsePhase = (t % 10000) / 10000;
                const collapseProgress = Math.sin(collapsePhase * Math.PI * 2);
                const collapseFactor = 0.5 + Math.abs(collapseProgress) * 0.5;
                
                return {
                    x: Math.sin(t * 0.0008) * 120 * collapseFactor,
                    y: 120 + Math.sin(t * 0.0004) * 50 * collapseFactor
                };
            },
            
            'final-stand': t => {
                // Complex multi-phase boss pattern
                const majorPhase = Math.floor(t / 20000) % 3;
                const phaseProgress = (t % 20000) / 20000;
                
                switch (majorPhase) {
                    case 0: // Defensive position
                        return {
                            x: Math.sin(t * 0.0005) * 60,
                            y: 140 + Math.sin(t * 0.0007) * 20
                        };
                    case 1: // Attack phase - rapid movement
                        return {
                            x: Math.sin(t * 0.002) * 150,
                            y: 120 + Math.cos(t * 0.0015) * 80
                        };
                    case 2: // Desperation phase - erratic movement
                        return {
                            x: Math.sin(t * 0.003) * 100 + Math.sin(t * 0.005) * 50,
                            y: 140 + Math.sin(t * 0.004) * 60 + Math.cos(t * 0.006) * 30
                        };
                    default:
                        return {
                            x: Math.sin(t * 0.0005) * 60,
                            y: 140 + Math.sin(t * 0.0007) * 20
                        };
                }
            }
        };
        
        // Return the requested pattern, or default if not found
        return patterns[pattern] || patterns.default;
    }

    /**
     * Get individual enemy movement pattern for a specific enemy
     * @param {string} type - The type of enemy
     * @param {number} x - Base X position (from formation)
     * @param {number} y - Base Y position (from formation)
     * @param {boolean} isInFormation - Whether the enemy is part of a formation
     * @returns {Function} - Function that returns x,y position based on time
     */
    getEnemyMovement(type, x, y, isInFormation = true) {
        // If the enemy is part of a formation, use simpler movement patterns
        // as the formation itself will move
        if (isInFormation) {
            if (type.includes('boss')) {
                // Bosses move in special patterns even in formations
                if (type === 'darklingboss2') {
                    // Simplified, more aggressive movement for Round 2 boss
                    return t => ({
                        x: x + Math.sin(t * 0.002) * 120, // Wider horizontal movement
                        y: y + Math.sin(t * 0.001) * 20   // Subtle vertical movement
                    });
                }
                return t => ({
                    x: x + Math.sin(t * 0.002) * 30,
                    y: y + Math.sin(t * 0.003) * 20
                });
            }
            
            // Basic enemies in formations just have minor movement relative to their position
            return t => ({
                x: x + Math.sin(t * 0.003 + (x * 0.01)) * 10,
                y: y + Math.sin(t * 0.002 + (y * 0.01)) * 8
            });
        }
        
        // If not in formation (special enemies or escaped from formation),
        // use more complex movement patterns from the original logic
        switch(type) {
            case 'darklingboss1':
                return t => ({
                    x: x + Math.sin(t * 0.002) * 120,
                    y: y + Math.sin(t * 0.001) * 60
                });
                
            case 'darklingboss2':
                // More aggressive movement for Round 2 boss when not in formation too
                return t => ({
                    x: x + Math.sin(t * 0.002) * 120, // Faster, wider horizontal motion
                    y: y + Math.sin(t * 0.001) * 20   // Slight vertical movement
                });
                
            case 'darklingboss3':
                return t => {
                    // Teleport mechanic for final boss
                    if (!this.lastTeleport || Date.now() - this.lastTeleport > 8000) {
                        this.teleportX = Math.random() * 240 - 120;
                        this.lastTeleport = Date.now();
                    }
                    
                    return {
                        x: x + this.teleportX + Math.sin(t * 0.002) * 30,
                        y: y + Math.sin(t * 0.001) * 50
                    };
                };
                
            default:
                // Default movement for normal enemies not in formation
                return t => ({
                    x: x + Math.sin(t * 0.002) * 80,
                    y: y + Math.sin(t * 0.001) * 40
                });
        }
    }

    /**
     * Create projectiles for an enemy based on its type
     * @param {string} type - The type of enemy
     * @param {number} x - X position of the enemy
     * @param {number} y - Y position of the enemy
     * @param {Object} playerPosition - Player's current position (for targeted shots)
     * @returns {Array} - Array of projectile objects
     */
    createProjectiles(type, x, y, playerPosition = null) {
        const projectiles = [];
        
        // Helper function to create a projectile with an angle
        const createProjectile = (angle, speed = 3, size = 1) => {
            const rad = angle * Math.PI / 180;
            const dx = Math.cos(rad) * speed;
            const dy = Math.sin(rad) * speed;
            
            return {
                x: x,
                y: y,
                dx: dx,
                dy: dy,
                width: 30 * size,
                height: 30 * size,
                sprite: Math.random() < 0.5 ? 'darklingshot1' : 'darklingshot2' // Use the correct enemy projectile sprites
            };
        };
        
        // Helper for creating a targeted projectile
        const createTargetedProjectile = (speed = 3, size = 1) => {
            if (!playerPosition) return null;
            
            const dx = playerPosition.x - x;
            const dy = playerPosition.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Normalize and scale by speed
            const ndx = (dx / dist) * speed;
            const ndy = (dy / dist) * speed;
            
            return {
                x: x,
                y: y,
                dx: ndx,
                dy: ndy,
                width: 30 * size,
                height: 30 * size,
                sprite: 'darklingshot2' // Use the second variant for targeted shots
            };
        };
        
        // Some enemies don't shoot
        if (['darkling1', 'darkling9'].includes(type)) {
            return projectiles;
        }
        
        switch(type) {
            case 'darkling2':
            case 'darkling3':
                // Simple single shot
                projectiles.push(createProjectile(90, 3));
                break;
                
            case 'darkling4':
                // Two angled shots
                projectiles.push(createProjectile(75, 3));
                projectiles.push(createProjectile(105, 3));
                break;
                
            case 'darkling5':
            case 'darkling6':
                // Diagonal shots
                projectiles.push(createProjectile(75, 3.5));
                projectiles.push(createProjectile(105, 3.5));
                break;
                
            case 'darkling7':
                // Wide spread
                for (let angle = 75; angle <= 105; angle += 15) {
                    projectiles.push(createProjectile(angle, 3.5));
                }
                break;
                
            case 'darkling8':
                // Two precise shots
                projectiles.push(createProjectile(85, 4));
                projectiles.push(createProjectile(95, 4));
                break;
                
            case 'darkling10':
                // Random pattern with multiple options
                const patterns = [
                    // Pattern 1: Single fast shot
                    () => projectiles.push(createProjectile(90, 5)),
                    
                    // Pattern 2: Three-way spread
                    () => {
                        for (let angle = 75; angle <= 105; angle += 15) {
                            projectiles.push(createProjectile(angle, 3.2));
                        }
                    },
                    
                    // Pattern 3: Targeted shot if player position available
                    () => {
                        const targeted = createTargetedProjectile(4, 1.2);
                        if (targeted) projectiles.push(targeted);
                    }
                ];
                
                // Choose a random pattern
                patterns[Math.floor(Math.random() * patterns.length)]();
                break;
                
            case 'darklingboss1':
                // First boss: multiple shots in a V pattern
                for (let angle = 75; angle <= 105; angle += 7.5) {
                    projectiles.push(createProjectile(angle, 4, 1.2));
                }
                break;
                
            case 'darklingboss2':
                // Simplified Round 2 boss: 3-way spread + 1 targeted shot
                // No more phases or complex mechanics
                for (let angle = 75; angle <= 105; angle += 15) {
                    projectiles.push(createProjectile(angle, 4));
                }
                
                // Add a targeted projectile
                if (playerPosition) {
                    const targeted = createTargetedProjectile(4.5);
                    if (targeted) projectiles.push(targeted);
                }
                break;
                
            default:
                // Default - simple straight shot
                projectiles.push(createProjectile(90, 3));
        }
        
        return projectiles;
    }
    
    /**
     * Check if it's time to spawn a new flyby group
     * @param {number} timestamp - Current game timestamp
     * @returns {boolean} - True if it's time to spawn a new flyby
     */
    shouldSpawnFlyby(timestamp) {
        if (!this.flybySystem.enabled) return false;
        
        // If no flyby is active and enough time has passed since the last one
        const timeSinceLastSpawn = timestamp - (this.flybySystem.lastSpawn || 0);
        return timeSinceLastSpawn >= this.flybySystem.spawnInterval;
    }
    
    /**
     * Create a new flyby group of enemies
     * @param {number} timestamp - Current game timestamp
     * @returns {Array} - Array of enemy objects in the flyby formation
     */
    createFlybyGroup(timestamp) {
        this.flybySystem.lastSpawn = timestamp;
        this.flybySystem.active = true;
        
        // Determine number of enemies in this flyby group
        const count = Math.floor(
            Math.random() * 
            (this.flybySystem.maxEnemies - this.flybySystem.minEnemies + 1) + 
            this.flybySystem.minEnemies
        );
        
        // Select a random height from the possible heights
        const yPos = this.flybySystem.possibleHeights[
            Math.floor(Math.random() * this.flybySystem.possibleHeights.length)
        ];
        
        // Select enemy types for this group
        const enemyTypes = [];
        for (let i = 0; i < count; i++) {
            // Pick a random enemy type from the available ones
            const typeIndex = Math.floor(Math.random() * this.flybySystem.enemyTypes.length);
            enemyTypes.push(this.flybySystem.enemyTypes[typeIndex]);
        }
        
        // Create the enemies in a line formation
        const enemies = [];
        const startX = -300; // Start off-screen to the left
        
        for (let i = 0; i < count; i++) {
            const enemy = {
                id: `flyby_${timestamp}_${i}`,
                type: enemyTypes[i],
                health: this.getInitialHealth(enemyTypes[i]),
                position: {
                    x: startX + (i * this.flybySystem.spacing),
                    y: yPos
                },
                movement: 'flyby',
                shotCooldown: this.getShotCooldown(enemyTypes[i]),
                lastShot: 0,
                isFlyby: true,
                speed: this.flybySystem.speed
            };
            
            enemies.push(enemy);
        }
        
        return enemies;
    }
    
    /**
     * Update flyby enemy positions
     * @param {Array} flybyEnemies - Array of flyby enemies
     * @param {number} deltaTime - Time since last update in ms
     * @returns {Array} - Updated array of flyby enemies (removed ones that have gone off-screen)
     */
    updateFlybyEnemies(flybyEnemies, deltaTime) {
        const remainingEnemies = [];
        const screenRightEdge = 300; // Right edge of the screen
        
        for (const enemy of flybyEnemies) {
            // Move the enemy from left to right
            enemy.position.x += enemy.speed * (deltaTime / 16); // Normalize by frame rate
            
            // Keep the enemy if it's still on screen
            if (enemy.position.x < screenRightEdge) {
                remainingEnemies.push(enemy);
            }
        }
        
        // If all enemies have gone off-screen, mark flyby as inactive
        if (remainingEnemies.length === 0) {
            this.flybySystem.active = false;
        }
        
        return remainingEnemies;
    }
    
    /**
     * Get movement function for flyby enemies
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {number} speed - Movement speed 
     * @returns {Function} - Function that returns x,y position based on time
     */
    getFlybyMovement(x, y, speed) {
        return t => {
            // Simple left to right linear movement with small vertical oscillation
            return {
                x: x + (speed * t / 16), // Move right at constant speed
                y: y + Math.sin(t * 0.002) * 10 // Small vertical oscillation
            };
        };
    }
}

// Export the MonsterLogic class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MonsterLogic };
}