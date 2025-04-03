/**
 * Projectile Manager for Alchemy Blaster
 */
class ProjectileManager {
    constructor(game) {
        this.game = game;
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
        
        // Special projectile effects
        this.beams = [];        // For Shinshi's beam attacks
        this.specialBeams = []; // For Shinshi's special beam attacks
    }
    
    /**
     * Update all projectiles
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        this.updatePlayerProjectiles(deltaTime);
        this.updateEnemyProjectiles(deltaTime);
        this.updateBeams(deltaTime);
        this.updateSpecialBeams(deltaTime);
        
        this.checkCollisions();
    }
    
    /**
     * Update player projectiles
     * @param {number} deltaTime - Time elapsed since last update
     */
    updatePlayerProjectiles(deltaTime) {
        for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.playerProjectiles[i];
            
            // Update position
            projectile.x += projectile.vx * (deltaTime / 16);
            projectile.y += projectile.vy * (deltaTime / 16);
            
            // FIXED: Make boundary values much more extreme to ensure projectiles
            // reach all parts of the screen before being removed
            if (projectile.y < -2000 || projectile.y > 2000 || 
                projectile.x < -1000 || projectile.x > 1000) {
                this.playerProjectiles.splice(i, 1);
            }
        }
    }
    
    /**
     * Update enemy projectiles
     * @param {number} deltaTime - Time elapsed since last update
     */
    updateEnemyProjectiles(deltaTime) {
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.enemyProjectiles[i];
            
            // Update position
            projectile.x += projectile.vx * (deltaTime / 16);
            projectile.y += projectile.vy * (deltaTime / 16);
            
            // Update rotation for rotating projectiles
            if (projectile.rotate && projectile.rotationSpeed) {
                projectile.rotation = (projectile.rotation || 0) + projectile.rotationSpeed * (deltaTime / 16);
            }
            
            // Check if out of bounds
            if (projectile.y < -800 || projectile.y > 1060 || 
                projectile.x < -100 || projectile.x > 900) {
                this.enemyProjectiles.splice(i, 1);
            }
        }
    }
    
    /**
     * Update beam attacks (for Shinshi character)
     * @param {number} deltaTime - Time elapsed since last update
     */
    updateBeams(deltaTime) {
        // Remove beams if no longer active
        if (this.game.gameController.selectedCharacter === 'shinshi' && 
            !this.game.gameController.player.isBeamActive) {
            this.beams = [];
        }
        
        // Otherwise, beams stay active as long as fire button is held
    }
    
    /**
     * Update special beam attacks (for Shinshi character)
     * @param {number} deltaTime - Time elapsed since last update
     */
    updateSpecialBeams(deltaTime) {
        for (let i = this.specialBeams.length - 1; i >= 0; i--) {
            const beam = this.specialBeams[i];
            
            // Check if beam has expired
            if (Date.now() - beam.createdAt > 800) { // 800ms duration for special beams
                this.specialBeams.splice(i, 1);
            }
        }
    }
    
    /**
     * Create a player projectile
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} vx - X velocity
     * @param {number} vy - Y velocity
     * @param {Object} options - Additional projectile options
     * @returns {Object} The created projectile
     */
    createPlayerProjectile(x, y, vx, vy, options = {}) {
        const projectile = {
            x,
            y,
            vx,
            vy,
            sprite: options.sprite || 0,
            damage: options.damage || 1,
            width: options.width || 20,
            height: options.height || 20,
            hit: false
        };
        
        this.playerProjectiles.push(projectile);
        return projectile;
    }
    
    /**
     * Create an enemy projectile
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Additional projectile options
     * @returns {Object} The created projectile
     */
    createEnemyProjectile(x, y, options = {}) {
        // Adjust the player's position for targeting
        const playerX = this.game.gameController.player.position.x;
        // Use the player's actual Y position - no offset adjustment needed anymore
        const playerY = this.game.gameController.player.position.y;
        
        // Calculate direction to player
        const dx = playerX - x;
        const dy = playerY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction
        const speed = options.speed || 3;
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;
        
        return this.createEnemyProjectileWithVelocity(x, y, vx, vy, options);
    }
    
    /**
     * Create an enemy projectile with specific velocity
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} vx - X velocity
     * @param {number} vy - Y velocity
     * @param {Object} options - Additional projectile options
     * @returns {Object} The created projectile
     */
    createEnemyProjectileWithVelocity(x, y, vx, vy, options = {}) {
        const projectile = {
            x,
            y,
            vx,
            vy,
            width: options.width || 30,
            height: options.height || 30,
            damage: options.damage || 1,
            hit: false,
            sprite: options.sprite || 'darklingshot1',
            rotate: options.rotate || false,
            rotationSpeed: options.rotationSpeed || 0,
            rotation: 0
        };
        
        this.enemyProjectiles.push(projectile);
        return projectile;
    }
    
    /**
     * Create a targeted enemy projectile that aims directly at the player
     * @param {number} x - X position of the enemy
     * @param {number} y - Y position of the enemy
     * @param {Object} options - Additional projectile options
     * @returns {Object} The created projectile
     */
    createTargetedEnemyProjectile(x, y, options = {}) {
        // Get player's position
        const playerX = this.game.gameController.player.position.x;
        // Use the player's actual Y position - no offset adjustment needed anymore
        const playerY = this.game.gameController.player.position.y;
        
        // Calculate angle to player
        const dx = playerX - x;
        const dy = playerY - y;
        const angle = Math.atan2(dy, dx);
        
        // Create projectile with calculated velocity
        const speed = options.speed || 3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        return this.createEnemyProjectileWithVelocity(x, y, vx, vy, options);
    }
    
    /**
     * Create a beam attack for Shinshi character
     * @param {number} x - X position of beam origin
     * @param {number} y - Y position of beam origin
     * @param {number} level - Beam power level (1-3)
     * @returns {Object} The created beam
     */
    createBeam(x, y, level) {
        // Just use the current position for the beam, no offset adjustment needed anymore
        const beam = {
            x,
            y,
            width: level === 1 ? 15 : level === 2 ? 30 : 45,
            damage: level === 3 ? 2 : 1,
            level: level,
            createdAt: Date.now()
        };
        
        this.beams.push(beam);
        return beam;
    }
    
    /**
     * Create a special beam attack for Shinshi character (horizontal screen-wide beams)
     * @param {number} count - Number of beams to create
     * @returns {Array} The created beams
     */
    createSpecialBeams(count) {
        const beams = [];
        const screenHeight = this.game.canvas.height;
        const beamHeight = 40;
        
        this.specialBeams = []; // Clear existing special beams
        
        for (let i = 0; i < count; i++) {
            // Position beams evenly across the screen, using game coordinates
            const verticalSpacing = screenHeight / (count + 1);
            const yPosition = -screenHeight/2 + (i + 1) * verticalSpacing;
            
            const beam = {
                y: yPosition,
                width: this.game.canvas.width,
                height: beamHeight,
                damage: 10,
                direction: i % 2 === 0 ? 'right' : 'left', // Alternating directions
                createdAt: Date.now()
            };
            
            this.specialBeams.push(beam);
            beams.push(beam);
        }
        
        return beams;
    }
    
    /**
     * Check for collisions between projectiles and targets
     */
    checkCollisions() {
        const gameController = this.game.gameController;
        if (!gameController || !gameController.player) return;
        
        // Check player projectiles vs enemies
        for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.playerProjectiles[i];
            if (projectile.hit) continue; // Skip already hit projectiles
            
            for (const enemy of gameController.enemies) {
                // Calculate distance
                const dx = enemy.position.x - projectile.x;
                const dy = enemy.position.y - projectile.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Adjust hitbox based on enemy type
                const enemyHitboxSize = enemy.type.includes('boss') ? 40 : 25;
                const projectileHitboxSize = 15;
                
                if (distance < enemyHitboxSize + projectileHitboxSize) {
                    // Mark projectile as hit
                    projectile.hit = true;
                    
                    // Deal damage to enemy
                    enemy.health -= projectile.damage || 1;
                    
                    // Create hit particle effect
                    this.game.particleSystem.createHitEffect(projectile.x, projectile.y);
                    
                    // Check if enemy was defeated
                    if (enemy.health <= 0) {
                        // Create defeat effect
                        this.game.particleSystem.createExplosion(
                            enemy.position.x, 
                            enemy.position.y
                        );
                        
                        // Check for potion drop
                        const potionDrop = gameController.monsterLogic.getPotionDrop(enemy.type);
                        if (potionDrop) {
                            gameController.addPowerup(
                                enemy.position.x,
                                enemy.position.y,
                                potionDrop.type
                            );
                        }
                        
                        // Add score and mark enemy for removal
                        gameController.gameState.score += gameController.monsterLogic.getPoints(enemy.type);
                        enemy.destroyed = true;
                    }
                    
                    break;
                }
            }
            
            // Remove hit projectiles
            if (this.playerProjectiles[i].hit) {
                this.playerProjectiles.splice(i, 1);
            }
        }
        
        // Check enemy projectiles vs player
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.enemyProjectiles[i];
            if (projectile.hit) continue;
            
            const player = gameController.player;
            // Player hitbox size
            const playerHitboxSize = 20;
            
            // Calculate distance for collision
            const dx = player.position.x - projectile.x;
            const dy = player.position.y - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < playerHitboxSize + (projectile.width / 2)) {
                projectile.hit = true;
                
                // Deal damage to player
                if (!player.isInvulnerable) {
                    gameController.handlePlayerHit(projectile.damage || 1);
                    
                    // Create hit effect
                    this.game.particleSystem.createPlayerHitEffect(
                        player.position.x,
                        player.position.y
                    );
                }
                
                // Remove hit projectile
                this.enemyProjectiles.splice(i, 1);
            }
        }
        
        // Check beams vs enemies
        if (this.beams.length > 0) {
            for (const beam of this.beams) {
                for (const enemy of gameController.enemies) {
                    // For beam collision, check if enemy is within the beam's width
                    const dx = Math.abs(enemy.position.x - beam.x);
                    
                    // Only check enemies above the beam origin
                    if (dx < beam.width / 2 && enemy.position.y < beam.y) {
                        // Apply damage (with reduced rate for continuous beams)
                        if (!enemy.lastBeamHitTime || Date.now() - enemy.lastBeamHitTime > 100) {
                            enemy.health -= beam.damage;
                            enemy.lastBeamHitTime = Date.now();
                            
                            // Create small hit effect
                            this.game.particleSystem.createHitEffect(
                                enemy.position.x,
                                enemy.position.y,
                                'small'
                            );
                            
                            // Check if enemy was defeated
                            if (enemy.health <= 0) {
                                // Create defeat effect
                                this.game.particleSystem.createExplosion(
                                    enemy.position.x, 
                                    enemy.position.y
                                );
                                
                                // Add score and mark enemy for removal
                                gameController.gameState.score += gameController.monsterLogic.getPoints(enemy.type);
                                enemy.destroyed = true;
                            }
                        }
                    }
                }
            }
        }
        
        // Check special beams vs enemies
        if (this.specialBeams.length > 0) {
            for (const beam of this.specialBeams) {
                for (const enemy of gameController.enemies) {
                    // Special beams are horizontal, so check if enemy is within the beam's height
                    const dy = Math.abs(enemy.position.y - beam.y);
                    
                    if (dy < beam.height / 2) {
                        // Apply damage (with reduced rate for special beams)
                        if (!enemy.lastSpecialBeamHitTime || Date.now() - enemy.lastSpecialBeamHitTime > 100) {
                            enemy.health -= beam.damage;
                            enemy.lastSpecialBeamHitTime = Date.now();
                            
                            // Create hit effect
                            this.game.particleSystem.createHitEffect(
                                enemy.position.x,
                                enemy.position.y,
                                'beam'
                            );
                            
                            // Check if enemy was defeated
                            if (enemy.health <= 0) {
                                // Create defeat effect
                                this.game.particleSystem.createExplosion(
                                    enemy.position.x, 
                                    enemy.position.y
                                );
                                
                                // Add score and mark enemy for removal
                                gameController.gameState.score += gameController.monsterLogic.getPoints(enemy.type);
                                enemy.destroyed = true;
                            }
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Get all active projectiles for rendering
     * @returns {Object} Object containing all projectile arrays
     */
    getProjectiles() {
        return {
            player: this.playerProjectiles,
            enemy: this.enemyProjectiles,
            beams: this.beams,
            specialBeams: this.specialBeams
        };
    }
}

// Export the ProjectileManager class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProjectileManager };
}