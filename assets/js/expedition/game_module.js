/**
 * Game Module for Alchemy Blaster
 * 
 * This is the main entry point for the game that:
 * - Sets up the game components
 * - Handles user input
 * - Manages the game loop
 * - Coordinates between controller and renderer
 */

const AlchemyBlaster = (() => {
    // Game components
    let gameController;
    let gameRenderer;
    let canvas;
    
    // Input state
    const input = {
        left: false,
        right: false,
        fire: false,
        specialFire: false
    };
    
    // Animation frame ID for game loop
    let animationFrameId = null;
    
    // Background music tracks
    let bgMusic = {
        selectionScreen: new Audio("assets/sounds/Main Theme Turn On.mp3"),
        wave1: new Audio("assets/sounds/Darkness Unleashed.mp3"),
        wave2: new Audio("assets/sounds/Shadow's Duel.mp3"),
        wave3: new Audio("assets/sounds/Unyielding Shadows.mp3"),
        finalBoss: new Audio("assets/sounds/MissShadowsResplendent.mp3"),
        currentTrack: null,
        volume: 0.5, // Set default volume to 50%
        lastRound: 0,
        lastWave: 0
    };
    
    // Sound effects
    let sounds = {
        // Character sounds (loaded based on selected character)
        hit: null,
        gameOver: null,
        victory: null,
        
        // Game sounds
        shoot: new Audio('assets/sounds/shoot.wav'),
        enemyHit: new Audio('assets/sounds/hit.wav'),
        explosion: new Audio('assets/sounds/explosion.wav'),
        powerup: new Audio('assets/sounds/powerup.wav'),
        
        // Additional sound references
        shieldHit: new Audio('assets/sounds/shieldhit.wav'),
        healthPotion: new Audio('assets/sounds/potion1.wav'),
        shieldPotion: new Audio('assets/sounds/potion2.wav'),
        powerPotion: new Audio('assets/sounds/potion4.wav'),
        specialAttack: new Audio('assets/sounds/specialattack.wav'),
        
        // Character special attack sounds
        dereSpecialAttack: new Audio('assets/sounds/derespecialattack.wav'),
        alizaSpecialAttack: new Audio('assets/sounds/alizaspecialattack.wav'),
        
        // Shinshi specific sounds
        shinBeamAttack1: new Audio('assets/sounds/shinnyzap1.wav'),
        shinBeamAttack2: new Audio('assets/sounds/shinnyzap2.mp3'),
        shinBeamLastUsed: 0, // Track which sound was played last
        shinSpecialAttack: new Audio('assets/sounds/shinnypewpewpew.wav')
    };
    
    // Pre-load sounds
    function loadSounds(character) {
        // Character-specific sounds
        if (character === 'dere') {
            sounds.hit = [new Audio('assets/sounds/hit1.wav'), new Audio('assets/sounds/hit2.wav')];
            sounds.gameOver = [new Audio('assets/sounds/gameover.wav'), new Audio('assets/sounds/gameover1.wav')];
            sounds.victory = [new Audio('assets/sounds/victory.wav'), new Audio('assets/sounds/victory1.wav')];
        } else if (character === 'aliza') {
            sounds.hit = [new Audio('assets/sounds/alizahit1.wav'), new Audio('assets/sounds/alizahit2.wav')];
            sounds.gameOver = [new Audio('assets/sounds/alizagameover1.wav'), new Audio('assets/sounds/alizagameover2.wav')];
            sounds.victory = [new Audio('assets/sounds/alizavictory1.wav'), new Audio('assets/sounds/alizavictory2.wav')];
        } else if (character === 'shinshi') {
            sounds.hit = [new Audio('assets/sounds/shinnyhit1.wav')];
            sounds.gameOver = [new Audio('assets/sounds/gameover.wav')]; // Reuse Dere's game over for now
            sounds.victory = [new Audio('assets/sounds/shinnyvictory1.wav'), new Audio('assets/sounds/shinnyvictory2.wav')];
        }
    }
    
    // Play background music based on current wave
    function playBackgroundMusic() {
        // Stop current track if playing
        if (bgMusic.currentTrack) {
            bgMusic.currentTrack.pause();
            bgMusic.currentTrack.currentTime = 0;
        }
        
        // Determine which track to play based on game state
        if (!gameController || !gameController.gameState.isActive) {
            // Selection screen
            bgMusic.currentTrack = bgMusic.selectionScreen;
        } else {
            // In-game music based on round/wave
            if (gameController.gameState.currentRound === 3 && gameController.gameState.currentWave >= 8) {
                bgMusic.currentTrack = bgMusic.finalBoss;
            } else if (gameController.gameState.currentRound === 3) {
                bgMusic.currentTrack = bgMusic.wave3;
            } else if (gameController.gameState.currentRound === 2) {
                bgMusic.currentTrack = bgMusic.wave2;
            } else {
                bgMusic.currentTrack = bgMusic.wave1;
            }
        }
        
        // Set up loop and play - apply 25% volume for music
        if (bgMusic.currentTrack) {
            bgMusic.currentTrack.loop = true;
            bgMusic.currentTrack.volume = 0.25; // Fixed 25% volume
            bgMusic.currentTrack.play().catch(error => {
                console.log("Audio playback failed:", error);
            });
        }
    }
    
    // Initialize the game
    function init(canvasId) {
        // Set up canvas
        canvas = document.getElementById(canvasId);
        
        if (!canvas) {
            console.error(`Canvas with ID '${canvasId}' not found.`);
            return;
        }
        
        // Create game components
        gameController = new GameController();
        gameRenderer = new GameRenderer(canvasId, gameController);
        
        // Set up audio manager for game controller
        setupAudioManager();
        
        // Set up event listeners
        setupEventListeners();
        
        // Start with selection screen music immediately
        playBackgroundMusic();
        
        // Start the game loop
        startGameLoop();
    }
    
    // Set up audio manager for game controller
    function setupAudioManager() {
        // Create audio manager object to inject into game controller
        const audioManager = {
            playSfx: function(sfxName) {
                switch(sfxName) {
                    case 'playerHit':
                        playCharacterSound('hit');
                        break;
                    case 'enemyHit':
                        sounds.enemyHit.currentTime = 0;
                        sounds.enemyHit.play().catch(e => console.log("Failed to play sound:", e));
                        break;
                    case 'explosion':
                        sounds.explosion.currentTime = 0;
                        sounds.explosion.play().catch(e => console.log("Failed to play sound:", e));
                        break;
                    case 'playerShot':
                        sounds.shoot.currentTime = 0;
                        sounds.shoot.play().catch(e => console.log("Failed to play sound:", e));
                        break;
                    case 'specialAttack':
                        // Play character-specific special attack sound
                        if (gameController.gameState.selectedCharacter === 'dere') {
                            sounds.dereSpecialAttack.currentTime = 0;
                            sounds.dereSpecialAttack.play().catch(e => console.log("Failed to play sound:", e));
                        } else if (gameController.gameState.selectedCharacter === 'aliza') {
                            sounds.alizaSpecialAttack.currentTime = 0;
                            sounds.alizaSpecialAttack.play().catch(e => console.log("Failed to play sound:", e));
                        } else if (gameController.gameState.selectedCharacter === 'shinshi') {
                            sounds.shinSpecialAttack.currentTime = 0;
                            sounds.shinSpecialAttack.play().catch(e => console.log("Failed to play sound:", e));
                        } else {
                            sounds.specialAttack.currentTime = 0;
                            sounds.specialAttack.play().catch(e => console.log("Failed to play sound:", e));
                        }
                        break;
                    case 'gameOver':
                        playCharacterSound('gameOver');
                        break;
                    case 'victory':
                        playCharacterSound('victory');
                        break;
                    case 'shieldHit':
                        sounds.shieldHit.currentTime = 0;
                        sounds.shieldHit.play().catch(e => console.log("Failed to play sound:", e));
                        break;
                    case 'healthPotion':
                        sounds.healthPotion.currentTime = 0;
                        sounds.healthPotion.play().catch(e => console.log("Failed to play sound:", e));
                        break;
                    case 'shieldPotion':
                        sounds.shieldPotion.currentTime = 0;
                        sounds.shieldPotion.play().catch(e => console.log("Failed to play sound:", e));
                        break;
                    case 'powerPotion':
                        sounds.powerPotion.currentTime = 0;
                        sounds.powerPotion.play().catch(e => console.log("Failed to play sound:", e));
                        break;
                    case 'powerup':
                        sounds.powerup.currentTime = 0;
                        sounds.powerup.play().catch(e => console.log("Failed to play sound:", e));
                        break;
                    case 'shinBeamAttack':
                        // Alternate between two electrical sounds for Shinshi's beam attack
                        if (sounds.shinBeamLastUsed === 0 || sounds.shinBeamLastUsed === 2) {
                            sounds.shinBeamAttack1.currentTime = 0;
                            sounds.shinBeamAttack1.play().catch(e => console.log("Failed to play sound:", e));
                            sounds.shinBeamLastUsed = 1;
                        } else {
                            sounds.shinBeamAttack2.currentTime = 0;
                            sounds.shinBeamAttack2.play().catch(e => console.log("Failed to play sound:", e));
                            sounds.shinBeamLastUsed = 2;
                        }
                        break;
                }
            },
            
            stopAll: function() {
                // Stop all currently playing sound effects
                Object.values(sounds).forEach(sound => {
                    if (sound) {
                        if (Array.isArray(sound)) {
                            sound.forEach(s => {
                                s.pause();
                                s.currentTime = 0;
                            });
                        } else {
                            sound.pause();
                            sound.currentTime = 0;
                        }
                    }
                });
            }
        };
        
        // Inject audio manager into game controller
        if (gameController) {
            gameController.audioManager = audioManager;
        }
    }
    
    // Set up event listeners for user input
    function setupEventListeners() {
        // Mouse events for UI interaction
        canvas.addEventListener('click', handleClick);
        
        // Keyboard events for gameplay
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        // Touch events for mobile support
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);
    }
    
    // Handle mouse click on UI elements
    function handleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const element = gameRenderer.getElementAtPosition(x, y);
        
        if (element) {
            switch (element.type) {
                case 'character':
                    // Character select
                    // Play select sound if available
                    if (gameController.audioManager) {
                        gameController.audioManager.playSfx('select');
                    }
                    
                    // Start game with selected character
                    startGame(element.value);
                    
                    // Play character-specific start sound
                    if (gameController.audioManager) {
                        if (element.value === 'dere') {
                            gameController.audioManager.playSfx('dereselect1');
                        } else if (element.value === 'aliza') {
                            gameController.audioManager.playSfx('alizaselect1');
                        } else if (element.value === 'shinshi') {
                            gameController.audioManager.playSfx('shinnyattack1');
                        }
                    }
                    break;
                    
                case 'restart':
                    // Restart game
                    if (gameController.audioManager) {
                        gameController.audioManager.playSfx('select');
                    }
                    resetGame();
                    break;
                    
                case 'pause':
                    // Toggle pause
                    togglePause();
                    break;
            }
        }
    }
    
    // Adjust music volume
    function adjustVolume(amount) {
        // Calculate new volume level (clamp between 0-1)
        bgMusic.volume = Math.max(0, Math.min(1, bgMusic.volume + amount));
        
        // Update current track if playing
        if (bgMusic.currentTrack) {
            bgMusic.currentTrack.volume = bgMusic.volume;
        }
        
        console.log(`Music volume: ${Math.round(bgMusic.volume * 100)}%`);
    }
    
    // Set music volume directly to a specific value
    function setVolume(value) {
        // Set volume (clamp between 0-1)
        bgMusic.volume = Math.max(0, Math.min(1, value));
        
        // Update current track if playing
        if (bgMusic.currentTrack) {
            bgMusic.currentTrack.volume = bgMusic.volume;
        }
        
        console.log(`Music volume set to: ${Math.round(bgMusic.volume * 100)}%`);
    }
    
    // Handle key down events
    function handleKeyDown(event) {
        // Volume controls
        if (event.key === '+' || event.key === '=') {
            adjustVolume(0.1);
            return;
        } else if (event.key === '-' || event.key === '_') {
            adjustVolume(-0.1);
            return;
        }
        
        if (!gameController.gameState.isActive || gameController.gameState.isPaused) {
            return;
        }
        
        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
                input.left = true;
                break;
                
            case 'ArrowRight':
            case 'd':
                input.right = true;
                break;
                
            case ' ':
            case 'z':
                if (!input.fire) {
                    input.fire = true;
                    firePlayerWeapon(false);
                }
                break;
                
            case 'x':
            case 'Shift':
                if (!input.specialFire) {
                    input.specialFire = true;
                    firePlayerWeapon(true);
                }
                break;
                
            case 'p':
            case 'Escape':
                togglePause();
                break;
        }
    }
    
    // Handle key up events
    function handleKeyUp(event) {
        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
                input.left = false;
                break;
                
            case 'ArrowRight':
            case 'd':
                input.right = false;
                break;
                
            case ' ':
            case 'z':
                input.fire = false;
                // For Shinshi, stop her beam when key is released
                if (gameController.gameState.selectedCharacter === 'shinshi') {
                    gameController.stopPlayerBeam();
                }
                break;
                
            case 'x':
            case 'Shift':
                input.specialFire = false;
                break;
        }
    }
    
    // Handle touch start for mobile controls
    function handleTouchStart(event) {
        event.preventDefault(); // Prevent default scrolling
        
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Check for UI element touch first
        const element = gameRenderer.getElementAtPosition(x, y);
        if (element) {
            switch (element.type) {
                case 'character':
                    startGame(element.value);
                    return;
                    
                case 'restart':
                    resetGame();
                    return;
                    
                case 'pause':
                    togglePause();
                    return;
            }
        }
        
        // If game is active, handle movement/firing
        if (gameController.gameState.isActive && !gameController.gameState.isPaused) {
            const centerX = canvas.width / 2;
            
            if (y > canvas.height * 0.7) {
                // Bottom 30% of screen is movement area
                if (x < centerX - 50) {
                    input.left = true;
                    input.right = false;
                } else if (x > centerX + 50) {
                    input.right = true;
                    input.left = false;
                }
            } else {
                // Upper part of screen is shooting area
                if (!input.fire) {
                    input.fire = true;
                    firePlayerWeapon(x > centerX); // Special fire if on right half
                }
            }
        }
    }
    
    // Handle touch move for mobile controls
    function handleTouchMove(event) {
        event.preventDefault(); // Prevent default scrolling
        
        if (!gameController.gameState.isActive || gameController.gameState.isPaused) {
            return;
        }
        
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const centerX = canvas.width / 2;
        
        // Update movement based on touch position
        if (x < centerX - 50) {
            input.left = true;
            input.right = false;
        } else if (x > centerX + 50) {
            input.right = true;
            input.left = false;
        } else {
            input.left = false;
            input.right = false;
        }
    }
    
    // Handle touch end for mobile controls
    function handleTouchEnd(event) {
        event.preventDefault(); // Prevent default scrolling
        
        // Reset input states
        input.left = false;
        input.right = false;
        
        // For Shinshi, stop her beam when touch ends
        if (input.fire && gameController.gameState.selectedCharacter === 'shinshi') {
            gameController.stopPlayerBeam();
        }
        
        input.fire = false;
        input.specialFire = false;
    }
    
    // Start a new game with the selected character
    function startGame(character) {
        // Load character-specific sounds
        loadSounds(character);
        
        // Initialize game with selected character
        gameController.startGame(character);
        
        // Start appropriate background music
        playBackgroundMusic();
    }
    
    // Reset game to character select
    function resetGame() {
        gameController.gameState.isActive = false;
        gameController.gameState.gameOver = false;
        
        // Switch back to selection screen music
        playBackgroundMusic();
    }
    
    // Toggle pause state
    function togglePause() {
        if (gameController.gameState.isActive) {
            gameController.pauseGame(!gameController.gameState.isPaused);
            
            // Pause/resume music
            if (gameController.gameState.isPaused && bgMusic.currentTrack) {
                bgMusic.currentTrack.pause();
            } else if (!gameController.gameState.isPaused && bgMusic.currentTrack) {
                bgMusic.currentTrack.play().catch(error => {
                    console.log("Audio playback failed:", error);
                });
            }
        }
    }
    
    // Fire player weapon
    function firePlayerWeapon(isSpecial) {
        if (!gameController.gameState.isActive || gameController.gameState.isPaused) {
            return;
        }
        
        // Fire projectile using the controller
        gameController.firePlayerProjectile(isSpecial);
    }
    
    // Handle wave change - updates background music
    function onWaveChange() {
        // Update background music when wave changes
        playBackgroundMusic();
    }
    
    // Start the game loop
    function startGameLoop() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        // Set last timestamp to current time
        let lastTimestamp = performance.now();
        
        // Define the game loop
        function gameLoop(timestamp) {
            // Calculate delta time (for smoother animations)
            const deltaTime = timestamp - lastTimestamp;
            lastTimestamp = timestamp;
            
            // Process movement input
            processInput();
            
            // Update game state
            if (gameController.gameState.isActive && !gameController.gameState.isPaused) {
                gameController.update(timestamp);
            }
            
            // Render the game
            gameRenderer.render(timestamp);
            
            // Continue the game loop
            animationFrameId = requestAnimationFrame(gameLoop);
        }
        
        // Start the game loop
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    // Process movement input
    function processInput() {
        if (!gameController.gameState.isActive || gameController.gameState.isPaused) {
            return;
        }
        
        // Process left/right movement
        if (input.left) {
            gameController.movePlayer('left', true);
        } else if (input.right) {
            gameController.movePlayer('right', true);
        }
        
        // Handle character-specific continuous fire mechanics
        if (gameController.gameState.selectedCharacter === 'aliza') {
            // Aliza's continuous firing
            if ((input.fire || input.specialFire)) {
                // Get current time to control fire rate
                const currentTime = Date.now();
                
                // Check if enough time has passed since last shot (fire rate limiting)
                if (!gameController.player.lastFireTime || 
                    currentTime - gameController.player.lastFireTime > gameController.player.fireRate) {
                    
                    // Update last fire time
                    gameController.player.lastFireTime = currentTime;
                    
                    // Fire projectile (regular or special based on input)
                    firePlayerWeapon(input.specialFire);
                }
            }
        } else if (gameController.gameState.selectedCharacter === 'shinshi') {
            // Shinshi's beam attack - continuous as long as fire is pressed
            if (input.fire) {
                if (!gameController.player.isBeamActive) {
                    // Start beam attack by firing normal weapon
                    firePlayerWeapon(false);
                }
                
                // Keep firing while button is held, using normal fire logic
                // instead of using special beam methods
                const currentTime = Date.now();
                if (!gameController.player.lastFireTime || 
                    currentTime - gameController.player.lastFireTime > gameController.player.fireRate) {
                    
                    gameController.player.lastFireTime = currentTime;
                    firePlayerWeapon(false);
                }
            }
            
            // Handle special attack button press
            if (input.specialFire && !gameController.player.specialActive) {
                firePlayerWeapon(true);
            }
        }
    }
    
    // Play character-specific sound
    function playCharacterSound(type) {
        if (!sounds[type] || !sounds[type].length) return;
        
        // Pick a random sound from the array
        const randomIndex = Math.floor(Math.random() * sounds[type].length);
        const sound = sounds[type][randomIndex];
        
        // Reset and play
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.log("Audio playback failed:", error);
            });
        }
    }
    
    // Public API
    return {
        init,
        playCharacterSound,
        onWaveChange,
        getVolume: () => bgMusic.volume
    };
})();

// Initialize the game when the page is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Initialize with AlchemyBlaster.js instead of expedition.js
    AlchemyBlaster.init('gameCanvas');
});