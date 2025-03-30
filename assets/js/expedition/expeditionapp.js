// Alchemy Blaster - Rail Shooter Mini-Game
class AlchemyBlaster {
    constructor(options = {}) {
        // Save options
        this.options = options;
        this.container = options.container || document.getElementById('expedition-container');
        this.sounds = options.sounds || {};
        this.onRewardsCollected = options.onRewardsCollected;
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 640;
        this.canvas.height = 800;
        this.canvas.style.cursor = 'none';
        
        // Add canvas to container if provided
        if (this.container) {
            this.container.innerHTML = '';
            this.container.appendChild(this.canvas);
        }

        this.gameState = 'loading';
        this.selectedCharacter = null; // Add character selection state
        this.isPaused = false;
        this.score = 0;
        this.round = 1;
        this.wave = 1;
        this.assets = {
            images: {},
            sounds: {},
            loaded: 0,
            total: 0
        };
        this.player = null;
        this.projectiles = [];
        this.enemies = [];
        this.particles = [];
        this.powerups = [];
        
        // Initialize input handling
        this.keys = {
            left: false,
            right: false
        };
        this.mousePosition = { x: 0, y: 0 };
        this.isShooting = false;

        // Bind event handlers to this instance
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        this.setupEventListeners();
        
        // Load assets after events are set up
        this.loadAssets();
    }

    handleMouseUp(e) {
        if (e.button === 0) { // Left click
            this.isShooting = false;
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    async loadAssets() {
        const imagesToLoad = {
            'playerLeft': './assets/images/darklings/dereleft.png',
            'playerRight': './assets/images/darklings/dereright.png',
            'playerHP1': './assets/images/darklings/derehp1.png',
            'playerHP2': './assets/images/darklings/derehp2.png',
            'playerHP3': './assets/images/darklings/derehp3.png',
            'shot1': './assets/images/darklings/shot1.png',
            'shot1a': './assets/images/darklings/shot1a.png',
            'shot1b': './assets/images/darklings/shot1b.png',
            'shotImpact1': './assets/images/darklings/shotimpact1.png',
            'shotImpact2': './assets/images/darklings/shotimpact2.png',
            'background': './assets/images/darklings/lissomeplainsBG.png',
            'foreground': './assets/images/darklings/lissomeplainsFG.png',
            'gameOver': './assets/images/darklings/deregameover.png',
            // Aliza character sprites
            'alizaLeft': './assets/images/darklings/alizaleft.png',
            'alizaRight': './assets/images/darklings/alizaright.png',
            'alizaShot1': './assets/images/darklings/alizashot1.png',
            'alizaShot2': './assets/images/darklings/alizashot2.png',
            'alizaShot3': './assets/images/darklings/alizashot3.png',
            'alizaShotImpact1': './assets/images/darklings/alizashotimpact1.png',
            'alizaShotImpact2': './assets/images/darklings/alizashotimpact2.png',
            // Character select images
            'dereharacterselect': './assets/images/darklings/dereharacterselect.png',
            'alizacharacterselect': './assets/images/darklings/alizacharacterselect.png',
            // Add potion images
            'healthPotion': './assets/images/darklings/health_potion.png',
            'powerPotion': './assets/images/darklings/power_potion.png',
            'shieldPotion': './assets/images/darklings/shield_potion.png',
            // Enemy sprites with correct paths using darklingmob filenames
            'darkling1': './assets/images/darklings/darklingmob1.png',
            'darkling2': './assets/images/darklings/darklingmob2.png',
            'darkling3': './assets/images/darklings/darklingmob3.png',
            'darkling4': './assets/images/darklings/darklingmob4.png',
            'darkling5': './assets/images/darklings/darklingmob5.png',
            'darkling6': './assets/images/darklings/darklingmob6.png',
            'darkling7': './assets/images/darklings/darklingmob7.png',
            'darkling8': './assets/images/darklings/darklingmob8.png',
            'darkling9': './assets/images/darklings/darklingmob9.png',
            'darkling10': './assets/images/darklings/darklingmob10.png',
            'darklingboss1': './assets/images/darklings/darklingboss1.png',
            'darklingboss2': './assets/images/darklings/darklingboss2.png',
            'darklingboss3': './assets/images/darklings/darklingboss3.png',
            'deregameover': './assets/images/darklings/deregameover.png',
            'alizagameover': './assets/images/darklings/alizagameover.png',
        };

        // Print out all image paths to confirm they exist
        console.log("Loading the following image paths:", Object.values(imagesToLoad));

        const soundsToLoad = {
            hit1: 'hit1.wav',
            hit2: 'hit2.wav',
            shoot: 'shoot.wav',
            victory: 'victory.wav',
            victory1: 'victory1.wav',
            victory2: 'victory2.wav',
            gameOver: 'gameover.wav',
            gameOver1: 'gameover1.wav',
            spellfire: ['spellfire.wav', 'spellfire1.mp3', 'spellfire2.mp3', 'spellfire3.mp3'],
            // Add potion sounds
            potion1: 'potion1.wav',
            potion2: 'potion2.wav',
            potion3: 'potion3.wav',
            potion4: 'potion4.wav',
            // Add Aliza's sounds
            alizaVictory1: 'alizavictory1.wav',
            alizaVictory2: 'alizavictory2.wav',
            alizaGameOver1: 'alizagameover1.wav',
            alizaGameOver2: 'alizagameover2.wav',
            alizaHit1: 'alizahit1.wav',
            alizaHit2: 'alizahit2.wav'
        };

        this.assets.total = Object.keys(imagesToLoad).length + Object.keys(soundsToLoad).length;

        // Load images
        for (const [key, path] of Object.entries(imagesToLoad)) {
            this.loadImage(key, path);
        }

        // Load sounds
        for (const [key, path] of Object.entries(soundsToLoad)) {
            if (Array.isArray(path)) {
                this.assets.sounds[key] = path.map(p => this.loadSound(p));
            } else {
                this.assets.sounds[key] = this.loadSound(path);
            }
        }
    }

    loadImage(key, path) {
        const img = new Image();
        img.src = path;
        console.log(`Loading image: ${key} from path: ${path}`);
        img.onload = () => {
            console.log(`Successfully loaded image: ${key}`);
            this.assets.images[key] = img;
            this.assets.loaded++;
            this.checkAllAssetsLoaded();
        };
        img.onerror = (error) => {
            console.error(`Failed to load image: ${key} from path: ${path}`, error);
            this.assets.loaded++;
            this.checkAllAssetsLoaded();
        };
    }

    loadSound(path) {
        const audio = new Audio(`assets/sounds/${path}`);
        audio.oncanplaythrough = () => {
            this.assets.loaded++;
            this.checkAllAssetsLoaded();
        };
        audio.onerror = () => {
            console.error(`Failed to load sound: ${path}`);
            this.assets.loaded++;
            this.checkAllAssetsLoaded();
        };
        return audio;
    }

    checkAllAssetsLoaded() {
        if (this.assets.loaded === this.assets.total) {
            this.initGame();
        }
    }

    initGame() {
        this.gameState = 'menu';
        this.player = new Player(this);
        this.startGameLoop();
    }

    startGameLoop() {
        const gameLoop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    update() {
        if (this.gameState !== 'playing' || this.isPaused) return;

        if (this.player) {
            this.player.update();
            this.updateProjectiles();
            this.updateEnemies();
            this.updateParticles();
            this.updatePowerups();
            this.checkCollisions();
            this.checkWaveProgress();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        if (this.assets.images.background) {
            this.ctx.drawImage(this.assets.images.background, 0, 0, this.canvas.width, this.canvas.height);
        }

        // Handle different game states
        switch(this.gameState) {
            case 'menu':
                // Draw character selection
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = 'white';
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 3;
                this.ctx.textAlign = 'center';
                this.ctx.font = 'bold 32px Arial';
                
                // Draw title
                const title = 'Select Your Character';
                this.ctx.strokeText(title, this.canvas.width/2, 50);
                this.ctx.fillText(title, this.canvas.width/2, 50);

                // Draw character options
                const charWidth = 200;
                const charHeight = 300;
                const spacing = 100;
                const startX = (this.canvas.width - (2 * charWidth + spacing)) / 2;
                const startY = 100;

                // Draw Dere
                if (this.assets.images.dereharacterselect) {
                    this.ctx.drawImage(this.assets.images.dereharacterselect, 
                        startX, startY, charWidth, charHeight);
                }

                // Draw Aliza
                if (this.assets.images.alizacharacterselect) {
                    this.ctx.drawImage(this.assets.images.alizacharacterselect, 
                        startX + charWidth + spacing, startY, charWidth, charHeight);
                }

                // Draw selection boxes
                this.ctx.strokeStyle = 'white';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(startX, startY, charWidth, charHeight);
                this.ctx.strokeRect(startX + charWidth + spacing, startY, charWidth, charHeight);

                // Draw character names
                this.ctx.font = 'bold 24px Arial';
                this.ctx.fillText('Dere', startX + charWidth/2, startY + charHeight + 40);
                this.ctx.fillText('Aliza', startX + charWidth + spacing + charWidth/2, startY + charHeight + 40);
                break;

            case 'playing':
                // Draw the game state underneath
                this.drawGameState();
                
                // Draw targeting reticle
                if (this.selectedCharacter === 'aliza') {
                    // Aliza's targeting reticle - larger and more ornate
                    this.ctx.strokeStyle = '#ff69b4'; // Hot pink
                    this.ctx.lineWidth = 3;
                    
                    // Outer circle
                    this.ctx.beginPath();
                    this.ctx.arc(this.mousePosition.x, this.mousePosition.y, 25, 0, Math.PI * 2);
                    this.ctx.stroke();
                    
                    // Inner circle
                    this.ctx.beginPath();
                    this.ctx.arc(this.mousePosition.x, this.mousePosition.y, 12, 0, Math.PI * 2);
                    this.ctx.stroke();
                    
                    // Diagonal crosshairs
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.mousePosition.x - 18, this.mousePosition.y - 18);
                    this.ctx.lineTo(this.mousePosition.x + 18, this.mousePosition.y + 18);
                    this.ctx.moveTo(this.mousePosition.x + 18, this.mousePosition.y - 18);
                    this.ctx.lineTo(this.mousePosition.x - 18, this.mousePosition.y + 18);
                    this.ctx.stroke();
                } else {
                    // Dere's original targeting reticle
                    this.ctx.strokeStyle = 'red';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.arc(this.mousePosition.x, this.mousePosition.y, 18, 0, Math.PI * 2);
                    this.ctx.stroke();
                    
                    // Draw crosshair
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.mousePosition.x - 12, this.mousePosition.y);
                    this.ctx.lineTo(this.mousePosition.x + 12, this.mousePosition.y);
                    this.ctx.moveTo(this.mousePosition.x, this.mousePosition.y - 12);
                    this.ctx.lineTo(this.mousePosition.x, this.mousePosition.y + 12);
                    this.ctx.stroke();
                }

                this.drawUI();
                break;

            case 'paused':
                // Draw the game state underneath
                this.drawGameState();
                
                // Draw pause overlay
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Draw pause text
                this.ctx.fillStyle = 'white';
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 3;
                this.ctx.font = 'bold 48px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                this.ctx.strokeText('PAUSED', this.canvas.width/2, this.canvas.height/2 - 30);
                this.ctx.fillText('PAUSED', this.canvas.width/2, this.canvas.height/2 - 30);
                
                this.ctx.font = 'bold 24px Arial';
                this.ctx.strokeText('Press SPACE, Q, or Middle Click to Resume', 
                    this.canvas.width/2, this.canvas.height/2 + 30);
                this.ctx.fillText('Press SPACE, Q, or Middle Click to Resume', 
                    this.canvas.width/2, this.canvas.height/2 + 30);
                break;

            case 'gameOver':
                // Use character-specific game over image
                const gameOverKey = this.selectedCharacter === 'aliza' ? 'alizagameover' : 'deregameover';
                const gameOverImage = this.assets.images[gameOverKey];
                
                if (gameOverImage) {
                    // Calculate dimensions to fit the screen while maintaining aspect ratio
                    const scale = Math.min(
                        this.canvas.width / gameOverImage.width,
                        this.canvas.height / gameOverImage.height
                    );
                    const scaledWidth = gameOverImage.width * scale;
                    const scaledHeight = gameOverImage.height * scale;
                    const x = (this.canvas.width - scaledWidth) / 2;
                    const y = (this.canvas.height - scaledHeight) / 2;

                    this.ctx.drawImage(gameOverImage, x, y, scaledWidth, scaledHeight);
                }
                break;
        }

        // Draw foreground last
        if (this.assets.images.foreground) {
            this.ctx.drawImage(this.assets.images.foreground, 0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawGameState() {
        // Draw enemies, projectiles, particles, and UI
        this.drawEnemies();
        this.drawProjectiles();
        this.drawParticles();
        this.drawPowerups();
        
        // Draw player last (on top)
        if (this.player) {
            this.player.draw();
        }
    }

    updateProjectiles() {
        // Update player projectiles
        this.projectiles = this.projectiles.filter(proj => !proj.update());
        
        // Update enemy projectiles
        if (!this.enemyProjectiles) this.enemyProjectiles = [];
        this.enemyProjectiles = this.enemyProjectiles.filter(proj => !proj.update());
    }

    updateEnemies() {
        const time = Date.now();
        this.enemies = this.enemies.filter(enemy => !enemy.update(time));
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => !particle.update());
    }

    updatePowerups() {
        this.powerups = this.powerups.filter(powerup => !powerup.update());
    }

    drawProjectiles() {
        this.projectiles.forEach(proj => proj.draw());
        if (this.enemyProjectiles) {
            this.enemyProjectiles.forEach(proj => proj.draw());
        }
    }

    drawEnemies() {
        this.enemies.forEach(enemy => enemy.draw());
    }

    drawParticles() {
        this.particles.forEach(particle => particle.draw());
    }

    drawPowerups() {
        this.powerups.forEach(powerup => powerup.draw());
    }

    drawUI() {
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.font = '24px Arial';
        
        // Draw score
        const scoreText = `Score: ${this.score}`;
        this.ctx.strokeText(scoreText, 10, 30);
        this.ctx.fillText(scoreText, 10, 30);
        
        // Draw round and wave info
        const waveText = `Round ${this.round} - Wave ${this.wave}`;
        this.ctx.strokeText(waveText, this.canvas.width - 200, 30);
        this.ctx.fillText(waveText, this.canvas.width - 200, 30);
        
        // Draw health
        const healthText = `HP: ${this.player.health}`;
        this.ctx.strokeText(healthText, 10, this.canvas.height - 10);
        this.ctx.fillText(healthText, 10, this.canvas.height - 10);
        
        // Draw power potion UI if active
        if (this.powerUI) {
            const now = Date.now();
            const elapsed = now - this.powerUI.startTime;
            const remaining = Math.max(0, this.powerUI.duration - elapsed);
            const progress = remaining / this.powerUI.duration;
            
            // Draw power potion timer circle
            const circleX = 50;
            const circleY = 80;
            const radius = 15;
            
            // Draw background circle
            this.ctx.beginPath();
            this.ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fill();
            
            // Draw progress arc (vertically depletes from top)
            this.ctx.beginPath();
            this.ctx.arc(circleX, circleY, radius, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * progress));
            this.ctx.lineTo(circleX, circleY);
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            this.ctx.fill();
            
            // Draw outline
            this.ctx.beginPath();
            this.ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw power icon
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText('P', circleX, circleY);
            
            // Reset text alignment
            this.ctx.textAlign = 'start';
            this.ctx.textBaseline = 'alphabetic';
        }
        
        // Draw shield potion UI if active
        if (this.shieldUI) {
            const now = Date.now();
            const elapsed = now - this.shieldUI.startTime;
            const remaining = Math.max(0, this.shieldUI.duration - elapsed);
            const progress = remaining / this.shieldUI.duration;
            
            // Draw shield potion timer circle
            const circleX = 50;
            const circleY = 120;
            const radius = 15;
            
            // Draw background circle
            this.ctx.beginPath();
            this.ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fill();
            
            // Create flashing effect for shield timer
            let alpha = 0.7;
            if (remaining < 5000) {
                // Fast flicker in last 5 seconds
                alpha = 0.3 + Math.abs(Math.sin(now * 0.01)) * 0.5;
            } else if (remaining < 10000) {
                // Medium flicker between 5-10 seconds left
                alpha = 0.4 + Math.abs(Math.sin(now * 0.005)) * 0.4;
            } else if (remaining < 20000) {
                // Slow flicker between 10-20 seconds left
                alpha = 0.5 + Math.abs(Math.sin(now * 0.002)) * 0.3;
            }
            
            // Draw progress arc (vertically depletes from top)
            this.ctx.beginPath();
            this.ctx.arc(circleX, circleY, radius, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * progress));
            this.ctx.lineTo(circleX, circleY);
            this.ctx.fillStyle = `rgba(0, 150, 255, ${alpha})`;
            this.ctx.fill();
            
            // Draw outline
            this.ctx.beginPath();
            this.ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw shield icon
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText('S', circleX, circleY);
            
            // Reset text alignment
            this.ctx.textAlign = 'start';
            this.ctx.textBaseline = 'alphabetic';
        }
    }
    
    checkWaveProgress() {
        if (this.gameState !== 'playing' || this.isSpawningWave) return;

        // Initialize wave start time if not set
        if (!this.waveStartTime) {
            this.waveStartTime = Date.now();
        }

        const currentTime = Date.now();
        const waveElapsedTime = currentTime - this.waveStartTime;

        // Check if this is a boss wave
        const isBossWave = (this.round === 2 && this.wave === 7) || 
                          (this.round === 3 && this.wave === 8) || 
                          (this.round === 3 && this.wave === 9);

        // For boss waves, wait for boss defeat
        if (isBossWave) {
            const bossesRemaining = this.enemies.filter(e => e.type.includes('boss')).length;
            if (bossesRemaining === 0) {
                console.log(`Boss wave ${this.wave} completed in round ${this.round}`);
                this.advanceWave();
            }
            return;
        }

        // For normal waves, use 30 second timer
        if (waveElapsedTime >= 30000) {
            console.log(`Wave ${this.wave} time completed in round ${this.round}`);
            this.advanceWave();
        }
    }

    advanceWave() {
        this.isSpawningWave = false;
        
        if (this.wave < this.getWavesInRound()) {
            this.wave++;
            console.log(`Advancing to wave ${this.wave} in round ${this.round}`);
            this.showWaveDialog(`Get Ready for Wave ${this.wave}!`);
        } else if (this.round < 3) {
            this.round++;
            this.wave = 1;
            console.log(`Advancing to round ${this.round}, wave 1`);
            this.showWaveDialog(`Round ${this.round} Start!`);
        } else if (this.round === 3 && this.wave >= this.getWavesInRound()) {
            console.log('Victory! All rounds and waves completed');
            this.gameState = 'victory';
            // Play victory sound based on health
            const sound = this.player.health === 3 ? this.assets.sounds.victory :
                         this.player.health === 2 ? this.assets.sounds.victory1 :
                         this.assets.sounds.victory2;
            sound.play();
            // Apply victory score multiplier
            this.score *= 6;
            this.distributeRewards();
        }

        // Reset wave start time for next wave
        this.waveStartTime = null;
    }

    showWaveDialog(message) {
        const dialog = document.createElement('div');
        dialog.style.position = 'absolute';
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        dialog.style.border = '2px solid #d4af37';
        dialog.style.borderRadius = '8px';
        dialog.style.padding = '20px';
        dialog.style.color = '#fff';
        dialog.style.textAlign = 'center';
        dialog.style.zIndex = '1000';
        dialog.style.fontSize = '24px';
        dialog.textContent = message;

        this.canvas.parentNode.appendChild(dialog);
        
        // Pause spawning until timer expires
        this.isSpawningWave = true;
        
        // Automatically remove dialog and start wave after 2 seconds
        setTimeout(() => {
            dialog.remove();
            this.spawnWave();
        }, 2000);
    }

    getWavesInRound() {
        return this.round === 1 ? 5 : 
               this.round === 2 ? 7 : 8;
    }

    spawnWave() {
        this.isSpawningWave = true;
        const enemies = this.generateWaveEnemies();
        let spawned = 0;
        
        console.log(`Starting to spawn wave ${this.wave} of round ${this.round} with ${enemies.length} enemies`);
        
        // Store reference to this interval so we can clear it if needed
        this.spawnInterval = setInterval(() => {
            if (spawned >= enemies.length || this.gameState !== 'playing') {
                clearInterval(this.spawnInterval);
                this.isSpawningWave = false;
                console.log(`Finished spawning wave ${this.wave}, waiting for enemies to be defeated`);
                return;
            }

            const enemy = enemies[spawned];
            const newEnemy = new Enemy(
                this,
                enemy.type,
                enemy.x,
                enemy.y
            );
            
            this.enemies.push(newEnemy);
            spawned++;
        }, 2000); // Increased from 1000 to 2000ms to space out enemy spawns more
    }

    generateWaveEnemies() {
        const enemies = [];
        const width = this.canvas.width;
        
        // Handle specific boss waves
        if ((this.round === 2 && this.wave === 7) || 
            (this.round === 3 && this.wave === 8) || 
            (this.round === 3 && this.wave === 9)) {
            
            // Only spawn the boss, no minions
            const bossType = this.round === 2 ? 'darklingboss1' : 
                           (this.round === 3 && this.wave === 8) ? 'darklingboss2' : 'darklingboss3';
            
            enemies.push({
                type: bossType,
                x: width/2,
                y: -100
            });
            
            return enemies;
        }
        
        // First wave of round 1 - very few enemies
        if (this.round === 1 && this.wave === 1) {
            const maxEnemiesWave1 = 3;
            for (let i = 0; i < maxEnemiesWave1; i++) {
                const type = ['darkling1', 'darkling2', 'darkling3'][Math.floor(Math.random() * 3)];
                const x = width * (i + 1) / (maxEnemiesWave1 + 1);
                const yOffset = type === 'darkling1' ? -130 :
                              type === 'darkling2' ? -100 :
                              type === 'darkling3' ? -70 : -100;
                
                enemies.push({ type, x, y: -50 + yOffset });
            }
            return enemies;
        }

        // Other regular waves - reduced enemy counts
        const enemyCount = this.round === 1 ? 3 + Math.min(2, this.wave) :  // 3-5 enemies in round 1
                          this.round === 2 ? 4 + Math.min(2, this.wave) :    // 4-6 enemies in round 2
                          5 + Math.min(2, this.wave);                        // 5-7 enemies in round 3

        const types = this.getEnemyTypesForWave();
        for (let i = 0; i < enemyCount; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const x = width * (i + 1) / (enemyCount + 1);
            const yOffset = type === 'darkling1' ? -130 :
                          type === 'darkling2' ? -100 :
                          type === 'darkling3' ? -70 : -100;
            
            enemies.push({ type, x, y: -50 + yOffset });
        }

        return enemies;
    }

    getEnemyTypesForWave() {
        // Debug the selected enemy types for current round and wave
        const types = this.round === 1 ? 
            ['darkling1', 'darkling2', 'darkling3'] :
            this.round === 2 ? 
            ['darkling2', 'darkling3', 'darkling4', 'darkling5', 'darkling6'] :
            ['darkling4', 'darkling5', 'darkling6', 'darkling7', 'darkling8', 'darkling10'];
        
        console.log(`Available enemy types for Round ${this.round}, Wave ${this.wave}:`, types);
        return types;
    }

    checkCollisions() {
        // Check player projectiles vs enemies
        for (const proj of this.projectiles) {
            for (const enemy of this.enemies) {
                if (this.checkCollision(proj, enemy)) {
                    this.projectiles = this.projectiles.filter(p => p !== proj);
                    const defeated = enemy.takeDamage();
                    this.particles.push(new Particle(this, proj.x, proj.y, defeated ? 'defeat' : 'hit'));
                    break;
                }
            }
        }

        // Check enemy projectiles vs player
        for (const proj of this.enemyProjectiles || []) {
            if (this.checkCollision(proj, this.player)) {
                this.enemyProjectiles = this.enemyProjectiles.filter(p => p !== proj);
                this.player.takeDamage();
                this.particles.push(new Particle(this, proj.x, proj.y, 'hit'));
            }
        }

        // Check powerups vs player
        for (const powerup of this.powerups) {
            if (this.checkCollision(powerup, this.player)) {
                this.powerups = this.powerups.filter(p => p !== powerup);
                powerup.collect(this.player);
            }
        }
    }

    checkCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    distributeRewards() {
        const rewards = [];
        
        // Specific items for Lissome Plains as defined in design doc
        const lissomePlainsItems = [
            'cottonfluff', 'eggs', 'butter', 'cream', 'birch-syrup', 
            'fractalcopper', 'flour', 'rocksalt', 'savourherb', 
            'sweetleaf', 'springwater', 'barkgum', 'berrimaters'
        ];
        
        // Calculate number of rewards based on score: 1 item per 1000 points
        const baseRewardCount = Math.floor(this.score / 1000);
        
        // Cap at 100 items maximum
        const rewardCount = Math.min(baseRewardCount, 100);
        
        console.log(`Distributing ${rewardCount} rewards based on score: ${this.score}`);
        
        // Randomly select rewards from possible items
        for (let i = 0; i < rewardCount; i++) {
            const randomIndex = Math.floor(Math.random() * lissomePlainsItems.length);
            rewards.push(lissomePlainsItems[randomIndex]);
        }
        
        // Special reward for high score - Touch of Love (if score > 2000)
        if (this.score >= 2000) {
            const touchCount = Math.floor(Math.random() * 3) + 1; // 1-3 Touch of Love
            console.log(`Adding ${touchCount} potential Touch of Love items`);
            for (let i = 0; i < touchCount; i++) {
                if (Math.random() < 0.25) { // 25% chance per item
                    rewards.push('touchoflove');
                    console.log("Added Touch of Love!");
                }
            }
        }
        
        // Victory reward - 25% chance for Distillation of a Night Sky
        if (this.gameState === 'victory' && Math.random() < 0.25) {
            rewards.push('distillationofnightsky');
            console.log("Added Distillation of Night Sky for victory!");
        }
        
        // Call callback with rewards if it exists
        if (this.onRewardsCollected) {
            this.onRewardsCollected(rewards);
        }
        
        console.log("Final rewards:", rewards);
        return rewards;
    }

    gameOver() {
        this.gameState = 'gameover';
        
        // Use character-specific game over sound and image
        const gameOverKey = this.selectedCharacter === 'aliza' ? 'alizagameover' : 'deregameover';
        const gameOverImage = this.assets.images[gameOverKey];
        
        if (!gameOverImage) {
            console.error('Game over image not found:', gameOverKey);
            return;
        }

        // Play game over sound
        const gameoverSound = Math.random() < 0.5 ? 
            this.assets.sounds[this.selectedCharacter === 'aliza' ? 'alizaGameOver1' : 'gameOver'] : 
            this.assets.sounds[this.selectedCharacter === 'aliza' ? 'alizaGameOver2' : 'gameOver1'];
        
        if (gameoverSound) {
            gameoverSound.currentTime = 0;
            gameoverSound.play();
        }

        const rewards = this.distributeRewards();
        
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen';
        
        // Use character-specific game over image
        const gameOverImgKey = this.player.gameOverImage;
        const gameOverImg = this.assets.images[gameOverImgKey];
        
        if (!gameOverImg) {
            console.error('Game over image not found:', gameOverImgKey);
        }

        const receivedItemsHTML = rewards.map(item => {
            // Check exact ingredients from the rewards array and use their small images
            if (item === 'cottonfluff') return `<div class="received-item"><img src="assets/images/cottonfluff_small.png" alt="Cotton Fluff"><span>Cotton Fluff</span></div>`;
            if (item === 'eggs') return `<div class="received-item"><img src="assets/images/eggs_small.png" alt="Eggs"><span>Eggs</span></div>`;
            if (item === 'butter') return `<div class="received-item"><img src="assets/images/butter_small.png" alt="Butter"><span>Butter</span></div>`;
            if (item === 'cream') return `<div class="received-item"><img src="assets/images/cream_small.png" alt="Cream"><span>Cream</span></div>`;
            if (item === 'birch-syrup') return `<div class="received-item"><img src="assets/images/birchsyrup_small.png" alt="Birch Syrup"><span>Birch Syrup</span></div>`;
            if (item === 'fractalcopper') return `<div class="received-item"><img src="assets/images/fractalcopper_small.png" alt="Fractal Copper"><span>Fractal Copper</span></div>`;
            if (item === 'flour') return `<div class="received-item"><img src="assets/images/flour_small.png" alt="Flour"><span>Flour</span></div>`;
            if (item === 'rocksalt') return `<div class="received-item"><img src="assets/images/rocksalt_small.png" alt="Rock Salt"><span>Rock Salt</span></div>`;
            if (item === 'savourherb') return `<div class="received-item"><img src="assets/images/savourherb_small.png" alt="Savour Herb"><span>Savour Herb</span></div>`;
            if (item === 'barkgum') return `<div class="received-item"><img src="assets/images/barkgum_small.png" alt="Bark Gum"><span>Bark Gum</span></div>`;
            if (item === 'berrimaters') return `<div class="received-item"><img src="assets/images/berrimaters_small.png" alt="Berrimaters"><span>Berrimaters</span></div>`;
            if (item === 'touchoflove') return `<div class="received-item"><img src="assets/images/touchoflove_small.png" alt="Touch of Love"><span>Touch of Love</span></div>`;
            if (item === 'distillationofnightsky') return `<div class="received-item"><img src="assets/images/distillationofnightsky_small.png" alt="Distillation of Night Sky"><span>Distillation of Night Sky</span></div>`;
            return `<div class="received-item"><span>${item}</span></div>`;
        }).join('');
        
        gameOverScreen.innerHTML = `
            <div class="game-over-content">
                <img src="assets/images/darklings/${gameOverImgKey}.png" alt="Game Over" style="max-width: 250px; margin: -20px 0 -10px 0;">
                <div style="margin: -10px 0 5px 0;">
                    <h2 style="margin: 0; font-size: 24px;">Final Score: ${this.score}</h2>
                    ${rewards.length > 0 ? 
                        `<div class="received-items" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; margin-top: 5px;">
                            ${receivedItemsHTML}
                        </div>` 
                        : '<p style="margin: 5px 0;">No items were collected.</p>'
                    }
                </div>
                <div class="game-over-buttons" style="margin-top: 5px;">
                    <button class="retry-btn">Try Again</button>
                    <button class="menu-btn">Return to Menu</button>
                    <button class="exit-btn">Exit</button>
                </div>
            </div>
        `;

        // Add CSS for received items
        const style = document.createElement('style');
        style.textContent = `
            .received-item {
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                margin: 2px;
                font-size: 10px;
                color: #fff;
            }
            .received-item img {
                width: 24px;
                height: 24px;
                object-fit: contain;
            }
            .received-item span {
                margin-top: 2px;
                white-space: nowrap;
            }
        `;
        document.head.appendChild(style);

        // Add the game over screen to the document
        this.canvas.parentElement.appendChild(gameOverScreen);
    }

    handleClick(e) {
        if (this.gameState === 'playing') {
            this.fireProjectile(e);
        }
    }

    takeDamage() {
        // Check for invincibility from shield potion
        if (this.shieldActive) {
            console.log("Shield active - damage prevented!");
            // Create a shield flash effect to show impact
            this.game.ctx.save();
            this.game.ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
            this.game.ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
            this.game.ctx.restore();
            
            // Play a shield block sound
            const hitSound = this.game.assets.sounds.hit1;
            if (hitSound) {
                hitSound.currentTime = 0;
                hitSound.volume = 0.3;
                hitSound.play();
            }
            
            return; // Prevent damage while shield is active
        }
        
        // Only reduce health and play damage sound if not shielded
        this.health--;
        const hitSound = Math.random() < 0.5 ? this.game.assets.sounds.hit1 : this.game.assets.sounds.hit2;
        hitSound.play();

        // Update health overlays regardless of shield status
        if (this.healthOverlays) {
            for (let i = 0; i < this.healthOverlays.length; i++) {
                this.healthOverlays[i].alpha = i < this.health ? 1 : Math.max(0, this.healthOverlays[i].alpha - this.fadeSpeed);
            }
        }

        if (this.health <= 0) {
            this.game.gameOver();
        }
    }

    resetGame() {
        // Reset game state variables
        this.score = 0;
        this.round = 1;
        this.wave = 1;
        this.gameState = 'menu';
        this.isPaused = false;
        this.isSpawningWave = false;
        
        // Clear all game entities
        this.projectiles = [];
        this.enemies = [];
        this.particles = [];
        this.powerups = [];
        if (this.enemyProjectiles) {
            this.enemyProjectiles = [];
        }
        
        // Reset player position and health
        if (this.player) {
            this.player.x = this.canvas.width / 2 - this.player.width / 2;
            this.player.y = this.canvas.height - this.player.height - 60;
            this.player.health = 3;
            this.player.isLeft = false;
            this.player.lastShot = 0;
            
            // Reset health overlays
            for (const overlay of this.player.healthOverlays) {
                overlay.alpha = 1;
            }
        } else {
            // If player doesn't exist, create a new one
            this.player = new Player(this);
        }
        
        // Clear any active intervals or timeouts
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }
        
        // Clear the canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        console.log('Game reset complete - starting new game');
        
        // Start a new game
        this.gameState = 'playing';
        this.spawnWave();
    }
}

class Player {
    constructor(game) {
        this.game = game;
        this.width = 85;
        this.height = 200;
        this.x = game.canvas.width / 2 - this.width / 2;
        this.y = game.canvas.height - this.height - 60;
        this.speed = 5;
        this.health = 3;
        this.isLeft = false;
        this.lastShot = 0;
        this.shotCooldown = 250; // milliseconds
        this.fadeSpeed = 0.1;
        this.powerShotActive = false;

        // Health overlays will be set in initializeSelectedCharacter
        this.healthOverlays = [];
    }

    update() {
        // Handle movement
        if (this.game.keys.left && this.x > 0) {
            this.x -= this.speed;
            this.isLeft = true;
        }
        if (this.game.keys.right && this.x < this.game.canvas.width - this.width) {
            this.x += this.speed;
            this.isLeft = false;
        }

        // Handle shooting
        if (this.game.isShooting) {
            const now = Date.now();
            if (now - this.lastShot >= this.shotCooldown) {
                this.shoot();
                this.lastShot = now;
            }
        }
        
        // Update powerup effects
        this.updatePowerupEffects();
    }
    
    updatePowerupEffects() {
        const now = Date.now();
        
        // Update power shot effects
        if (this.powerShotActive && now > this.powerShotEndTime) {
            this.powerShotActive = false;
            this.speed = this.originalSpeed || 5;
            this.shotCooldown = this.originalShotCooldown || 250;
            console.log("Power potion effect expired");
            
            // Remove UI
            if (this.game.powerUI) {
                this.game.powerUI = null;
            }
        }
        
        // Update shield effects
        if (this.shieldActive && now > this.shieldEndTime) {
            this.shieldActive = false;
            console.log("Shield potion effect expired");
            
            // Remove UI
            if (this.game.shieldUI) {
                this.game.shieldUI = null;
            }
        }
    }
    
    draw() {
        // Use character-specific sprites
        const sprite = this.isLeft ? 
            this.game.assets.images[this.game.player.sprites.left] : 
            this.game.assets.images[this.game.player.sprites.right];

        if (sprite) {
            // Draw shield effect if shield potion is active
            if (this.shieldActive) {
                this.game.ctx.save();
                
                // Calculate shield effect properties
                const now = Date.now();
                const timeLeft = this.shieldEndTime - now;
                const shieldRadius = this.width * 0.8;
                
                // Flicker shield at certain thresholds
                let alpha = 0.6;
                if (timeLeft < 5000) {
                    // Fast flicker in last 5 seconds
                    alpha = 0.2 + Math.abs(Math.sin(now * 0.01)) * 0.5;
                } else if (timeLeft < 10000) {
                    // Medium flicker between 5-10 seconds left
                    alpha = 0.3 + Math.abs(Math.sin(now * 0.005)) * 0.4;
                } else if (timeLeft < 20000) {
                    // Slow flicker between 10-20 seconds left
                    alpha = 0.4 + Math.abs(Math.sin(now * 0.002)) * 0.3;
                }
                
                // Create glowing shield effect with safe coordinates
                const centerX = Math.floor(this.x + this.width/2);
                const centerY = Math.floor(this.y + this.height/2);
                const gradient = this.game.ctx.createRadialGradient(
                    centerX, 
                    centerY, 0,
                    centerX, 
                    centerY, 
                    Math.floor(shieldRadius)
                );
                
                gradient.addColorStop(0, `rgba(100, 200, 255, 0)`);
                gradient.addColorStop(0.5, `rgba(100, 200, 255, ${alpha * 0.3})`);
                gradient.addColorStop(0.8, `rgba(100, 200, 255, ${alpha})`);
                gradient.addColorStop(1, `rgba(100, 200, 255, 0)`);
                
                this.game.ctx.fillStyle = gradient;
                this.game.ctx.beginPath();
                this.game.ctx.arc(
                    this.x + this.width/2, 
                    this.y + this.height/2, 
                    shieldRadius, 
                    0, 
                    Math.PI * 2
                );
                this.game.ctx.fill();
                
                this.game.ctx.restore();
            }
            
            // Draw the player sprite
            this.game.ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
            
            // Draw power shot effect if active
            if (this.powerShotActive) {
                this.game.ctx.save();
                
                const now = Date.now();
                // Green glow effect around player
                this.game.ctx.shadowColor = 'rgba(0, 255, 0, 0.7)';
                this.game.ctx.shadowBlur = 15 + Math.sin(now * 0.01) * 5;
                
                // Show power particles occasionally
                if (Math.random() < 0.2) {
                    const particleX = this.x + Math.random() * this.width;
                    const particleY = this.y + Math.random() * this.height;
                    this.game.ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
                    this.game.ctx.beginPath();
                    this.game.ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
                    this.game.ctx.fill();
                }
                
                this.game.ctx.restore();
            }
        }

        // Only draw health overlays if not ignored
        if (!this.ignoreVisualOverlays && this.healthOverlays) {
            for (let i = 0; i < this.healthOverlays.length; i++) {
                const overlay = this.healthOverlays[i];
                overlay.alpha = i < this.health ? 1 : Math.max(0, overlay.alpha - this.fadeSpeed);
                if (overlay.alpha > 0) {
                    const healthSprite = this.game.assets.images[overlay.sprite];
                    if (healthSprite) {
                        this.game.ctx.globalAlpha = overlay.alpha;
                        this.game.ctx.drawImage(healthSprite, this.x, this.y, this.width, this.height);
                        this.game.ctx.globalAlpha = 1;
                    }
                }
            }
        }
    }

    shoot() {
        const offsetX = this.isLeft ? -10 : 10;
        const projectile = new Projectile(
            this.game,
            this.x + this.width/2 + offsetX,
            this.y,
            this.game.mousePosition.x,
            this.game.mousePosition.y
        );
        this.game.projectiles.push(projectile);
        
        // Play shoot sound with cooldown
        if (!this.lastSoundTime || Date.now() - this.lastSoundTime > 3000) {
            const spellSounds = this.game.assets.sounds.spellfire;
            const randomSound = spellSounds[Math.floor(Math.random() * spellSounds.length)];
            randomSound.currentTime = 0;
            randomSound.play();
            this.lastSoundTime = Date.now();
        }
    }

    takeDamage() {
        // Check for invincibility from shield potion
        if (this.shieldActive) {
            console.log("Shield active - damage prevented!");
            // Create a shield flash effect to show impact
            this.game.ctx.save();
            this.game.ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
            this.game.ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
            this.game.ctx.restore();
            
            // Play a shield block sound
            const hitSound = this.game.assets.sounds.hit1;
            if (hitSound) {
                hitSound.currentTime = 0;
                hitSound.volume = 0.3; // Quieter for shield hit
                hitSound.play();
            }
            
            return; // Prevent damage while shield is active
        }
        
        // Only reduce health and play damage sound if not shielded
        this.health--;
        const hitSound = Math.random() < 0.5 ? this.game.assets.sounds.hit1 : this.game.assets.sounds.hit2;
        hitSound.play();

        // Update health overlays regardless of shield status
        if (this.healthOverlays) {
            for (let i = 0; i < this.healthOverlays.length; i++) {
                this.healthOverlays[i].alpha = i < this.health ? 1 : Math.max(0, this.healthOverlays[i].alpha - this.fadeSpeed);
            }
        }

        if (this.health <= 0) {
            this.game.gameOver();
        }
    }
}

class Projectile {
    constructor(game, x, y, targetX, targetY) {
        this.game = game;
        this.x = x;
        this.y = y;
        // Use character-specific settings
        let projectileSize = this.game.player.projectileSize || 1;
        
        // Handle Aliza's shot2 alternating size
        if (this.game.selectedCharacter === 'aliza' && 
            this.game.player.projectileSprites[Math.floor(Math.random() * this.game.player.projectileSprites.length)] === 'alizaShot2') {
            projectileSize = Math.random() < 0.5 ? 3 : 2;  // Alternate between extra large and large
        }
        
        this.width = 40 * projectileSize;
        this.height = 40 * projectileSize;
        this.speed = this.game.player.projectileSpeed || 15;
        
        const angle = Math.atan2(targetY - y, targetX - x);
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;

        // Use character-specific projectile sprites
        if (this.game.player.projectileSprites) {
            const randomIndex = Math.floor(Math.random() * this.game.player.projectileSprites.length);
            this.sprite = this.game.player.projectileSprites[randomIndex];
        } else {
            this.sprite = 'shot1';
            const randomSprite = Math.random();
            if (randomSprite < 0.2) this.sprite = 'shot1a';
            else if (randomSprite < 0.4) this.sprite = 'shot1b';
        }
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        return this.isOffscreen();
    }

    draw() {
        const sprite = this.game.assets.images[this.sprite];
        if (sprite) {
            this.game.ctx.drawImage(sprite, 
                this.x - this.width/2, 
                this.y - this.height/2, 
                this.width, 
                this.height 
            );
        }
    }

    isOffscreen() {
        return this.x < 0 || this.x > this.game.canvas.width || 
               this.y < 0 || this.y > this.game.canvas.height;
    }
}

class Enemy {
    constructor(game, type, x, y) {
        this.game = game;
        this.type = type;
        this.x = x;
        this.y = y;
        console.log(`Creating enemy of type: ${type} at position (${x}, ${y})`);
        // Set dimensions based on enemy type
        if (type === 'darkling1') {
            this.width = 34;    // 20% smaller (from 42)
            this.height = 67;   // 20% smaller (from 84)
        } else if (type === 'darkling2') {
            this.width = 126;   // 20% larger (from 84)
            this.height = 126;  
        } else {
            this.width = 84;    
            this.height = 84;   
        }
        this.reversePattern = Math.random() > 0.5;
        this.patternOffset = Math.random() * Math.PI * 2;
        this.health = this.getInitialHealth();
        this.pattern = this.getMovementPattern();
        this.lastShot = 0;
        this.shotCooldown = this.getShotCooldown();
        this.speed = this.getSpeed();
        this.points = this.getPoints();
        this.fadeAlpha = 1;
        this.shieldActive = false;
        this.shieldCooldown = 0;
        this.lastTeleport = 0;
        this.spawnTime = Date.now();
        this.isInvulnerable = false;
        this.isCharging = false;
        // Check if sprite is available and log result
        if (!this.game.assets.images[this.type]) {
            console.error(`ERROR: Sprite for ${this.type} not found! Available sprites:`, Object.keys(this.game.assets.images));
        } else {
            console.log(`Successfully created ${this.type} enemy with image:`, this.game.assets.images[this.type].src);
        }
    }

    getInitialHealth() {
        if (this.type === 'darklingboss1') return 25;
        if (this.type === 'darklingboss2') return 30;
        if (this.type === 'darklingboss3') return 40;
        if (this.type === 'darkling4') return 20;
        if (this.type === 'darkling7') return 10;
        if (['darkling6', 'darkling8'].includes(this.type)) return 2;
        return 1;
    }

    getMovementPattern() {
        const randomOffset = this.patternOffset;
        const reverseDirection = this.reversePattern ? -1 : 1;
        const phaseOffset = Math.random() * 1000;
        const verticalOffset = Math.random() * 50 - 25;
        const amplitudeVariation = 0.8 + Math.random() * 0.4;
        switch(this.type) {
            case 'darkling1':
                const gridSize = 120;
                const moveSpeed = 0.006;
                let initialX = this.x;
                let initialY = this.y;
                let lastChangeTime = 0;
                let isRandomMove = false;
                let randomAngle = 0;
                let randomDuration = 0;
                return t => {
                    // Check for random direction change (50% chance every 3 seconds)
                    if (!isRandomMove && t - lastChangeTime > 3000 && Math.random() < 0.5) {
                        isRandomMove = true;
                        randomAngle = Math.random() * Math.PI * 2;
                        randomDuration = 500; // Duration of random movement in ms
                        lastChangeTime = t;
                    }
                    // Handle random movement
                    if (isRandomMove) {
                        if (t - lastChangeTime < randomDuration) {
                            // Quick burst in random direction
                            return {
                                x: initialX + Math.cos(randomAngle) * ((t - lastChangeTime) / 100) * gridSize * 0.5,
                                y: initialY + Math.sin(randomAngle) * ((t - lastChangeTime) / 100) * gridSize * 0.5,
                            };
                        } else {
                            // Reset after random movement
                            isRandomMove = false;
                            initialX = this.x;
                            initialY = this.y;
                        }
                    }
                    // Normal movement pattern
                    const normalizedTime = t * moveSpeed;
                    const pattern = Math.floor(normalizedTime / 4) % 8;
                    const progress = (normalizedTime % 4) - 2;
                    let x, y;
                    switch(pattern) {
                        case 0: // Move right
                            x = initialX + progress * gridSize;
                            y = initialY;
                            break;
                        case 1: // Move diagonal down-right
                            x = initialX + progress * gridSize;
                            y = initialY + progress * gridSize;
                            break;
                        case 2: // Move down
                            x = initialX + gridSize;
                            y = initialY + progress * gridSize;
                            break;
                        case 3: // Move diagonal down-left
                            x = initialX + (2 - progress) * gridSize;
                            y = initialY + progress * gridSize;
                            break;
                        case 4: // Move left
                            x = initialX + (2 - progress) * gridSize;
                            y = initialY + gridSize;
                            break;
                        case 5: // Move diagonal up-left
                            x = initialX + (2 - progress) * gridSize;
                            y = initialY + (2 - progress) * gridSize;
                            break;
                        case 6: // Move up
                            x = initialX;
                            y = initialY + (2 - progress) * gridSize;
                            break;
                        case 7: // Move diagonal up-right
                            x = initialX + progress * gridSize;
                            y = initialY + (2 - progress) * gridSize;
                            break;
                    }
                    return {
                        x: x * reverseDirection,
                        y: y + 50 + (Math.sin(t * 0.001 + randomOffset) * 20)
                    };
                };
            case 'darkling2':
                return t => {
                    // Add random direction change similar to darkling1
                    if (!this.lastChangeTime) this.lastChangeTime = t;
                    if (!this.isRandomMove && t - this.lastChangeTime > 3000 && Math.random() < 0.5) {
                        this.isRandomMove = true;
                        this.randomAngle = Math.random() * Math.PI * 2;
                        this.randomDuration = 500;
                        this.initialX = this.x;
                        this.initialY = this.y;
                    }
                    if (this.isRandomMove) {
                        if (t - this.lastChangeTime < this.randomDuration) {
                            return {
                                x: this.initialX + Math.cos(this.randomAngle) * ((t - this.lastChangeTime) / 100) * 80,
                                y: this.initialY + Math.sin(this.randomAngle) * ((t - this.lastChangeTime) / 100) * 80,
                            };
                        } else {
                            this.isRandomMove = false;
                            this.initialX = this.x;
                            this.initialY = this.y;
                        }
                    }
                    // Normal snake-like pattern
                    const rowHeight = 80;
                    const width = this.game.canvas.width * 0.45;
                    const normalizedTime = t * 0.01;
                    const row = Math.floor(normalizedTime / width) % 4;
                    const xProgress = (normalizedTime % width);
                    let x = (row % 2 === 0) ? xProgress : (width - xProgress);
                    let y = row * rowHeight + 80 + Math.sin(t * 0.01 + randomOffset) * 40;
                    return {
                        x: x * reverseDirection,
                        y: y + verticalOffset + (Math.sin(t * 0.002 + randomOffset) * 15)
                    };
                };
            case 'darklingboss1':
                const cycleLength = 4000;
                return t => ({
                    x: Math.sin(t * 0.015) * (this.game.canvas.width * 0.45),
                    y: Math.sin(t * 0.005) * (this.game.canvas.height * 0.3)
                });

            case 'darklingboss2':
                return t => ({
                    x: Math.sin(t * 0.005) * (this.game.canvas.width * 0.45),
                    y: Math.cos(t * 0.003) * (this.game.canvas.height * 0.25)
                });
            
            case 'darklingboss3':
                const spiralX = Math.cos(t * 0.003) * (Math.sin(t * 0.001) * 50);
                const spiralY = Math.sin(t * 0.003) * (Math.cos(t * 0.001) * 50);
                if (!this.lastTeleport || Date.now() - this.lastTeleport > 10000) {
                    this.x = Math.random() * (this.game.canvas.width - this.width);
                    this.lastTeleport = Date.now();
                }
                return {
                    x: Math.sin(t * 0.01) * (this.game.canvas.width * 0.4),
                    y: Math.sin(t * 0.005) * (this.game.canvas.height * 0.25)
                };
            default:
                return ['darkling2', 'darkling5', 'darkling6'].includes(this.type) ?
                    t => ({ 
                        x: Math.sin(t * 0.015) * (this.game.canvas.width * 0.4), 
                        y: Math.cos(t * 0.01) * (this.game.canvas.height * 0.2) 
                    }) : t => ({ 
                        x: Math.sin(t * 0.01) * (this.game.canvas.width * 0.35), 
                        y: Math.sin(t * 0.008) * (this.game.canvas.height * 0.15) 
                    });
        }
    }

    getShotCooldown() {
        if (this.type === 'darkling4') return 3000;
        if (this.type === 'darklingBoss1') return 5000;
        if (this.type === 'darklingBoss2') return this.health > 25 ? Infinity : 4000;
        if (this.type === 'darklingBoss3') return 5000;
        return {
            'darkling2': 6000,  // Increased from 5000
            'darkling3': 5000,  // Increased from 4000
            'darkling5': 5000,  // Increased from 4000
            'darkling6': 4000,  // Increased from 3000
            'darkling7': 6000,  // Increased from 5000
            'darkling8': 6000,  // Increased from 5000
            'darkling10': 6000  // Increased from 5000
        }[this.type] || 6000;  // Default increased from 5000
    }

    getSpeed() {
        if (this.type === 'darklingBoss3' && this.health <= 20) return 2;
        return this.type.includes('boss') ? 1 : 1.5;
    }

    getPoints() {
        if (this.type === 'darklingBoss1') return 100;
        if (this.type === 'darklingBoss2') return this.health > 25 ? Infinity : 4000;
        return this.type.includes('boss') ? 100 : 10;
    }

    update(time) {
        // Check if darkling1 or darkling9 should flee
        if ((this.type === 'darkling1' && time - this.spawnTime > 15000) ||
            (this.type === 'darkling9' && time - this.spawnTime > 10000)) {
            this.fadeAlpha -= 0.05;
            if (this.fadeAlpha <= 0) {
                return true;  // Remove this enemy
            }
        }

        // Update position based on pattern
        const pos = this.pattern(time);
        // Allow full vertical range with no top margin
        this.x = Math.max(this.width/2, Math.min(this.game.canvas.width - this.width/2,
                     this.game.canvas.width/2 + pos.x));
        this.y = Math.min(this.game.canvas.height * 0.6, pos.y);

        // Handle shield cooldown for darkling4
        if (this.type === 'darkling4' && this.shieldCooldown > 0) {
            this.shieldCooldown = Math.max(0, this.shieldCooldown - (time - this.lastShot));
            this.shieldActive = false;
        }

        // Handle shooting
        if (time - this.lastShot >= this.shotCooldown && !this.isInvulnerable) {
            this.shoot();
            this.lastShot = time;
        }
        return false;  // Keep this enemy
    }

    draw() {
        const sprite = this.game.assets.images[this.type];
        if (sprite && sprite.complete) {
            this.game.ctx.globalAlpha = this.fadeAlpha;
            if (this.shieldActive) {
                this.game.ctx.shadowColor = 'blue';
                this.game.ctx.shadowBlur = 10;
            }
            if (this.type === 'darklingboss3' && this.health <= 20) {
                this.game.ctx.shadowColor = 'red';
                this.game.ctx.shadowBlur = 15;
            }
            const drawX = this.x - this.width/2;
            const drawY = this.y - this.height/2;
            this.game.ctx.drawImage(sprite, drawX, drawY, this.width, this.height);
            this.game.ctx.shadowBlur = 0;
            this.game.ctx.globalAlpha = 1;
        } else {
            console.error(`Failed to load sprite for enemy type: ${this.type}`);
            this.game.ctx.fillStyle = 'red';
            this.game.ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        }
    }

    shoot() {
        if (this.type === 'darkling1' || this.type === 'darkling9') return;
        const createProjectile = (angle, speed = 5, size = 1) => {
            const rad = angle * Math.PI / 180;
            const dx = Math.cos(rad) * speed;
            const dy = Math.sin(rad) * speed;
            const proj = new EnemyProjectile(this.game, this.x, this.y, dx, dy);
            proj.width *= size;
            proj.height *= size;
            proj.sprite = 'shot1'; // Use player shot sprite for enemy projectiles
            return proj;
        };
        // Play boss shooting sound
        if (this.type.includes('boss')) {
            const spellSounds = this.game.assets.sounds.spellfire;
            const randomSound = spellSounds[Math.floor(Math.random() * spellSounds.length)];
            randomSound.currentTime = 0;
            randomSound.play();
        }
        // Match sprite names exactly with loaded assets
        switch(this.type) {
            case 'darkling4':
                if (!this.shieldActive && this.shieldCooldown === 0) {
                    this.shieldActive = true;
                    this.isInvulnerable = true;
                    setTimeout(() => {
                        for (let i = 0; i < 10; i++) {
                            setTimeout(() => {
                                const angle = 90 + (Math.random() * 20 - 10);
                                this.game.enemyProjectiles.push(createProjectile(angle));
                            }, i * 100);
                        }
                        this.shieldActive = false;
                        this.isInvulnerable = false;
                        this.shieldCooldown = 20000;
                    }, 1000);
                } 
                break;
            case 'darkling5':
            case 'darkling6':
                this.game.enemyProjectiles.push(createProjectile(45));
                this.game.enemyProjectiles.push(createProjectile(135));
                break;
            case 'darkling7':
                for (let angle = 75; angle <= 105; angle += 15) {
                    this.game.enemyProjectiles.push(createProjectile(angle));
                }
                break;
            case 'darkling8':
                if (Math.random() < 0.5) {
                    this.game.enemyProjectiles.push(createProjectile(90, 6.25));
                }
                break;
            case 'darkling10':
                const patterns = [
                    () => this.game.enemyProjectiles.push(createProjectile(90)),
                    () => {
                        this.game.enemyProjectiles.push(createProjectile(45));
                        this.game.enemyProjectiles.push(createProjectile(135));
                    },
                    () => {
                        for (let angle = 75; angle <= 105; angle += 15) {
                            this.game.enemyProjectiles.push(createProjectile(angle));
                        }
                    },
                ];
                patterns[Math.floor(Math.random() * patterns.length)]();
                break;
            case 'darklingBoss1':
                this.isCharging = true;
                setTimeout(() => {
                    this.game.enemyProjectiles.push(createProjectile(90, 7.5, 1.2));
                    this.isCharging = false;
                }, 500);
                break;
            case 'darklingBoss2':
                if (this.health <= 25) {
                    this.isCharging = true;
                    setTimeout(() => {
                        for (let i = 0; i < 10; i++) {
                            this.game.enemyProjectiles.push(createProjectile(90, 6, 1.2));
                        }
                        this.speed = 4;
                        this.isCharging = false;
                    }, 1000);
                }
                break;
            case 'darklingBoss3':
                this.isCharging = true;
                this.isInvulnerable = true;
                setTimeout(() => {
                    if (Math.random() < 0.5) {
                        for (let i = 0; i < 20; i++) {
                            this.game.enemyProjectiles.push(createProjectile(90, 6.25));
                        }
                    } else {
                        for (let i = 0; i < 3; i++) {
                            for (let angle = 45; angle <= 135; angle += 15) {
                                this.game.enemyProjectiles.push(createProjectile(angle));
                            }
                        }
                    }
                    this.isCharging = false;
                    this.isInvulnerable = false;
                }, 1000);
                break;
            default:
                this.game.enemyProjectiles.push(createProjectile(90));
        }
    }

    takeDamage() {
        this.health--;
        
        // If defeated, potentially drop a powerup
        if (this.health <= 0) {
            // Random chance to drop a powerup (higher for bosses)
            const dropChance = this.type.includes('boss') ? 0.5 : 0.1;
            if (Math.random() < dropChance) {
                const types = ['health', 'power', 'shield'];
                const randomType = types[Math.floor(Math.random() * types.length)];
                this.game.powerups.push(new Powerup(this.game, this.x, this.y, randomType));
            }
            
            // Add points to score
            if (this.points) {
                this.game.score += this.points;
            }
            
            return true; // Enemy was defeated
        }
        
        return false; // Enemy survived
    }
}

class EnemyProjectile extends Projectile {
    constructor(game, x, y, dx, dy) {
        super(game, x, y, x + dx * 100, y + dy * 100);
        this.dx = dx * 0.7;
        this.dy = dy * 0.7;
        this.width = 38;
        this.height = 38;
        this.sprite = 'shot1';  // Enemy projectiles use shot1 sprite
    }
}

class Particle {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        this.alpha = 1;
        this.scale = type === 'defeat' ? 2 : 1;
        this.fadeSpeed = type === 'defeat' ? 0.02 : 0.1;
    }

    update() {
        this.alpha -= this.fadeSpeed;
        return this.alpha <= 0;
    }

    draw() {
        // Get the correct impact sprite based on whether this is a hit or defeat particle
        // Also use character-specific impact sprites
        const character = this.game.selectedCharacter || 'dere';
        let spriteKey;
        
        if (this.type === 'hit') {
            // For hit particles, use character-specific impact sprites
            spriteKey = character === 'aliza' ? 'alizaShotImpact1' : 'alizaShotImpact2';
        } else if (this.type === 'defeat') {
            // For defeat particles, use character-specific larger impact sprites           
            spriteKey = character === 'aliza' ? 'alizaShotImpact2' : 'shotImpact2';
        }
        
        const sprite = this.game.assets.images[spriteKey];
        
        if (sprite) {
            this.game.ctx.save();
            this.game.ctx.globalAlpha = this.alpha;
            
            // Use a larger size for defeat particles
            const size = this.type === 'defeat' ? 80 * this.scale : 40 * this.scale;
            
            this.game.ctx.drawImage(
                sprite,
                this.x - size/2,
                this.y - size/2,
                size,
                size
            );
            
            this.game.ctx.restore();
        } else {
            // Fallback if sprite not found
            this.game.ctx.save();
            this.game.ctx.globalAlpha = this.alpha;
            this.game.ctx.fillStyle = this.type === 'defeat' ? 'orange' : 'yellow';
            const size = this.type === 'defeat' ? 40 : 20;
            this.game.ctx.beginPath();
            this.game.ctx.arc(this.x, this.y, size * this.scale / 2, 0, Math.PI * 2);
            this.game.ctx.fill();
            this.game.ctx.restore();
        }
    }
}

class Powerup {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.type = type; // 'health', 'power', or 'shield'
        this.speed = 2;
        this.angle = Math.random() * Math.PI * 2; // Random drift angle
        this.driftAmount = 1.5;
        this.fallSpeed = 1.5;
        this.bobAmount = 5;
        this.bobSpeed = 0.05;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.startTime = Date.now();
        
        // Set sprite based on type
        this.sprite = this.type === 'health' ? 'healthPotion' : 
                      this.type === 'power' ? 'powerPotion' : 'shieldPotion';
    }

    update() {
        // Make the powerup fall downward with a slight bobbing motion
        this.y += this.fallSpeed;
        
        // Add a drifting motion (left/right)
        this.x += Math.cos(this.angle) * this.driftAmount * 
                Math.sin(Date.now() * 0.001 + this.bobOffset);
        
        // Add bobbing motion
        const bobY = Math.sin(Date.now() * this.bobSpeed + this.bobOffset) * this.bobAmount;
        this.y += bobY * 0.1; // Scale the bob amount
        
        // Remove if offscreen
        if (this.y > this.game.canvas.height + 50) { 
            return true; // Remove this powerup
        }
        
        return false; // Keep this powerup
    }

    draw() {
        const sprite = this.game.assets.images[this.sprite];
        if (sprite) {
            // Create a nice glowing effect for the potion
            this.game.ctx.save();
            // Add glow based on potion type
            const glowColor = this.type === 'health' ? 'rgba(255, 50, 50, 0.3)' : 
                             this.type === 'power' ? 'rgba(50,255, 50, 0.3)' : 
                             'rgba(50, 50, 255, 0.3)';
            this.game.ctx.shadowColor = glowColor;
            this.game.ctx.shadowBlur = 10 + Math.sin(Date.now() * 0.005) * 5;
            // Draw the potion with a slight bobbing animation
            this.game.ctx.drawImage(
                sprite, 
                this.x - this.width/2, 
                this.y - this.height/2 + Math.sin(Date.now() * 0.005) * 3, 
                this.width, 
                this.height 
            );
            this.game.ctx.restore();
        }   
    }

    collect(player) {
        // Play a random potion sound
        this.playPotionSound();
        // Apply effect based on type
        switch(this.type) {
            case 'health':
                if (player.health < 3) {
                    player.health++;
                    console.log("Health potion collected! Health restored to:", player.health);
                    // Reset alpha for overlays that should be visible
                    for (let i = 0; i < player.healthOverlays.length; i++) {
                        if (i < player.health) {
                            player.healthOverlays[i].alpha = 1;
                        }
                    }
                }
                break;
            case 'power':
                player.powerShotActive = true;
                player.powerShotEndTime= Date.now() + 30000; // 30 seconds
                player.originalSpeed = player.speed;
                player.originalShotCooldown = player.shotCooldown;
                console.log("Power potion collected! Speed and firepower enhanced for 30 seconds");
                // Reset alpha for overlays that should be visible
                if (!this.game.powerUI) {
                    this.game.powerUI = {
                        startTime: Date.now(),
                        duration: 30000 // 30 seconds
                    };
                } else {
                    this.game.powerUI.startTime = Date.now();
                }
                break;
            case 'shield':
                player.shieldActive = true;
                player.shieldEndTime = Date.now() + 30000; // 30 seconds
                console.log("Shield potion collected! Player is invulnerable for 30 seconds");
                player.speed = player.originalSpeed * 1.1; // 10% movement speed increase
                // Create shield UI if it doesn't exist
                if (!this.game.shieldUI) {
                    this.game.shieldUI = {
                        startTime: Date.now(),
                        duration: 30000 // 30 seconds
                    };
                } else {
                    this.game.shieldUI.startTime = Date.now();
                }
                break;
        }
    }

    playPotionSound() {
        // Define potential potion sounds
        const potionSounds = [
            this.game.assets.sounds.potion1,
            this.game.assets.sounds.potion2,
            this.game.assets.sounds.potion3,
            this.game.assets.sounds.potion4
        ];
        // Check if any potion sound is currently playing
        const isSoundPlaying = potionSounds.some(sound => 
            !sound.paused && sound.currentTime > 0 && sound.currentTime < sound.duration
        );
        // If no potion sound is playing, play a random one
        if (!isSoundPlaying) {
            const randomIndex = Math.floor(Math.random() * potionSounds.length);
            const sound = potionSounds[randomIndex];
            sound.currentTime = 0;
            sound.play().catch(e => console.error("Error playing potion sound:", e));
        }
    }
}

// Add inputhandlers to AlchemyBlaster class
AlchemyBlaster.prototype.handleKeyDown = function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
    if (e.key === ' ' || e.key.toLowerCase() === 'q') this.togglePause();
};

AlchemyBlaster.prototype.handleKeyUp = function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
};

AlchemyBlaster.prototype.handleMouseMove = function(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition.x = e.clientX - rect.left;
    this.mousePosition.y = e.clientY - rect.top;
};

AlchemyBlaster.prototype.handleMouseDown = function(e) {
    if (e.button === 0) { // Left click
        // In menu state, handle character selection
        if (this.gameState === 'menu') {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Character selection hitbox
            const charWidth = 200;
            const charHeight = 300;
            const spacing = 100;
            const startX = (this.canvas.width - (2 * charWidth + spacing)) / 2;
            const startY = 100;

            // Check if clicked on Dere
            if (mouseX >= startX && mouseX <= startX + charWidth &&
                mouseY >= startY && mouseY <= startY + charHeight) {
                this.selectedCharacter = 'dere';
                this.initializeSelectedCharacter();
                return;
            }
            
            // Check if clicked on Aliza
            if (mouseX >= startX + charWidth + spacing && mouseX <= startX + 2 * charWidth + spacing &&
                mouseY >= startY && mouseY <= startY + charHeight) {
                this.selectedCharacter = 'aliza';
                this.initializeSelectedCharacter();
                return;
            }
        }
        
        // If we're playing, handle shooting
        if (this.gameState === 'playing') {
            this.isShooting = true;
        }
    } else if (e.button === 1) { // Middle click
        e.preventDefault();
        this.togglePause();
    }
};

AlchemyBlaster.prototype.initializeSelectedCharacter = function() {
    // Ensure player exists first
    if (!this.player) {
        this.player = new Player(this);
    }

    // Configure character-specific properties
    if (this.selectedCharacter === 'aliza') {
        this.player.sprites = {
            left: 'alizaLeft',
            right: 'alizaRight'
        };
        this.player.projectileSprites = ['alizaShot1', 'alizaShot2', 'alizaShot3'];
        this.player.projectileSize = 2.5;
        this.player.projectileSpeed = 11.25;
        this.player.sounds = {
            hit: ['alizaHit1', 'alizaHit2'],
            victory: ['alizaVictory1', 'alizaVictory2'],
            gameOver: ['alizaGameOver1', 'alizaGameOver2']
        };
        this.player.ignoreVisualOverlays = true; // Flag to ignore HP overlays
        this.player.gameOverImage = 'alizagameover';
    } else {
        // Default Dere configuration 
        this.player.sprites = {
            left: 'playerLeft',
            right: 'playerRight'
        };
        this.player.gameOverImage = 'deregameover';
        this.player.projectileSprites = ['shot1', 'shot1a', 'shot1b'];
        this.player.projectileSize = 1;
        this.player.projectileSpeed = 15;
        this.player.sounds = {
            hit: ['hit1', 'hit2'],
            victory: ['victory', 'victory1', 'victory2'],
            gameOver: ['gameOver', 'gameOver1']
        };
        this.player.healthOverlays = [
            { sprite: 'playerHP3', alpha: 1 },
            { sprite: 'playerHP2', alpha: 1 },
            { sprite: 'playerHP1', alpha: 1 }
        ];
    }

    // Start the game
    this.gameState = 'playing';
    this.spawnWave();
};

AlchemyBlaster.prototype.togglePause = function() {
    if (this.gameState === 'playing') {
        this.gameState = 'paused';
        this.isPaused = true;
    } else if (this.gameState === 'paused') {
        this.gameState = 'playing';
        this.isPaused = false;
    }
};