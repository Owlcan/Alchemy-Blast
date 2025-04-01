/**
 * ProjectileManager.js
 * Manages all projectiles in the game with proper travel distance tracking
 */

class ProjectileSystem {
    /**
     * Base projectile class
     * @param {Object} game - The game instance
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     * @param {Object} options - Additional options
     */
    constructor(game, x, y, options = {}) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.width = options.width || 40;
        this.height = options.height || 40;
        this.velocity = options.velocity || { x: 0, y: -10 }; // Default moving upward
        this.speed = options.speed || 10;
        this.maxDistance = options.maxDistance || 2000; // Maximum travel distance
        this.damage = options.damage || 1;
        this.type = options.type || 'player';
        this.sprite = options.sprite || 'shot1';
        this.distanceTraveled = 0;
        this.isActive = true;
        this.owner = options.owner || null;
        this.effects = options.effects || [];
        this.hitParticle = options.hitParticle || 'hit';
    }
    
    /**
     * Calculate distance from start position
     * @returns {number} - Distance traveled
     */
    calculateDistanceTraveled() {
        const dx = this.x - this.startX;
        const dy = this.y - this.startY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Update projectile position and check boundaries
     * @returns {boolean} - True if the projectile should be removed
     */
    update() {
        if (!this.isActive) return true;
        
        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Update distance traveled
        this.distanceTraveled = this.calculateDistanceTraveled();
        
        // Check if projectile has traveled too far
        if (this.distanceTraveled > this.maxDistance) {
            return true;
        }
        
        // Check if off-screen
        if (this.isOffscreen()) {
            return true;
        }
        
        return false;
    }

    /**
     * Draw the projectile
     */
    draw() {
        if (!this.isActive) return;
        
        const sprite = this.game.assets.images[this.sprite];
        if (sprite) {
            this.game.ctx.drawImage(
                sprite,
                this.x - this.width/2,
                this.y - this.height/2,
                this.width,
                this.height
            );
        } else {
            // Fallback if sprite not found
            this.game.ctx.fillStyle = this.type === 'player' ? '#00FFFF' : '#FF5555';
            this.game.ctx.beginPath();
            this.game.ctx.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
            this.game.ctx.fill();
        }
    }

    /**
     * Check if projectile is off-screen
     * @returns {boolean} - True if off-screen
     */
    isOffscreen() {
        return this.x < -this.width || 
               this.x > this.game.canvas.width + this.width ||
               this.y < -this.height || 
               this.y > this.game.canvas.height + this.height;
    }
    
    /**
     * Handle collision with a target
     * @param {Object} target - The collision target
     */
    onHit(target) {
        this.isActive = false;
        
        // Create hit particle
        if (this.game.particleSystem) {
            this.game.particleSystem.createParticle(this.x, this.y, {
                type: this.hitParticle,
                scale: this.type === 'player' ? 1 : 0.7
            });
        }
        
        // Apply effects
        this.effects.forEach(effect => {
            if (typeof effect === 'function') {
                effect(target);
            }
        });
    }
}

class PlayerProjectile extends ProjectileSystem {
    /**
     * Create a player projectile
     * @param {Object} game - The game instance
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     * @param {number} targetX - Target X position 
     * @param {number} targetY - Target Y position
     * @param {Object} options - Additional options
     */
    constructor(game, x, y, targetX, targetY, options = {}) {
        // Calculate velocity based on target position
        const angle = Math.atan2(targetY - y, targetX - x);
        
        // Character-specific projectile speed
        // Aliza's projectiles travel at 75% of Dere's speed per the design doc
        let speed = options.speed || (game.selectedCharacter === 'aliza' ? 
                                     (game.player.projectileSpeed || 11.25) : // 75% of 15
                                     (game.player.projectileSpeed || 15));
        
        // Create the projectile with character-specific parameters
        super(game, x, y, {
            ...options,
            velocity: {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            },
            type: 'player',
            maxDistance: options.maxDistance || 1500
        });
        
        // Random sprite selection for visual variety based on character
        if (game.selectedCharacter === 'aliza') {
            // Use Aliza's specific projectile sprites as per design doc
            const alizaSprites = ['alizaShot1', 'alizaShot2', 'alizaShot3'];
            const randomIndex = Math.floor(Math.random() * alizaSprites.length);
            this.sprite = alizaSprites[randomIndex];
            
            // Special size handling for alizaShot2 as per design doc (alternating size)
            if (this.sprite === 'alizaShot2') {
                this.width = 40 * (Math.random() < 0.5 ? 3 : 2);  // Extra large or large
                this.height = this.width;
            } else if (this.sprite === 'alizaShot1') {
                // alizaShot1 is the largest of Aliza's shots
                this.width = 40 * 3;  // 3x normal size
                this.height = this.width;
            } else {
                // alizaShot3 - larger than shot2 but smaller than shot1
                this.width = 40 * 2.5;  // 2.5x normal size
                this.height = this.width;
            }
        } else {
            // Dere's standard projectile sprites
            const dereSprites = ['shot1', 'shot1a', 'shot1b'];
            const randomIndex = Math.floor(Math.random() * dereSprites.length);
            this.sprite = dereSprites[randomIndex];
            
            // Standard size for Dere's projectiles
            this.width = 40;
            this.height = 40;
        }
        
        // Apply powerup size modifications if active
        if (game.player && game.player.powerShotActive) {
            this.width *= 1.25;  // 25% larger when power shot is active
            this.height *= 1.25;
        }
    }
    
    // Override onHit to use character-specific impact sprites
    onHit(target) {
        this.isActive = false;
        
        // Create hit particle based on character
        const defeated = target.health <= 1;
        const character = this.game.selectedCharacter || 'dere';
        
        // Add the hit particle based on character and defeat status
        if (character === 'aliza') {
            const spriteKey = defeated ? 'alizaShotImpact2' : 'alizaShotImpact1';
            const particle = new Particle(this.game, this.x, this.y, defeated ? 'defeat' : 'hit');
            particle.sprite = spriteKey;
            this.game.particles.push(particle);
        } else {
            const spriteKey = defeated ? 'shotImpact2' : 'shotImpact1';
            const particle = new Particle(this.game, this.x, this.y, defeated ? 'defeat' : 'hit');
            particle.sprite = spriteKey;
            this.game.particles.push(particle);
        }
    }
}

class EnemyProjectile extends ProjectileSystem {
    /**
     * Create an enemy projectile
     * @param {Object} game - The game instance
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     * @param {number} dx - X velocity component
     * @param {number} dy - Y velocity component
     * @param {Object} options - Additional options
     */
    constructor(game, x, y, dx, dy, options = {}) {
        super(game, x, y, {
            ...options,
            velocity: {
                x: dx,
                y: dy
            },
            type: 'enemy',
            maxDistance: options.maxDistance || 1000,
            sprite: options.sprite || 'shot1'
        });
    }
}

class ProjectileManager {
    /**
     * Manages all projectiles in the game
     * @param {Object} game - The game instance
     */
    constructor(game) {
        this.game = game;
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
    }
    
    /**
     * Create a player projectile
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @param {Object} options - Additional options
     * @returns {ProjectileSystem} - The created projectile
     */
    createPlayerProjectile(x, y, targetX, targetY, options = {}) {
        const projectile = new PlayerProjectile(this.game, x, y, targetX, targetY, options);
        this.playerProjectiles.push(projectile);
        return projectile;
    }
    
    /**
     * Create an enemy projectile
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     * @param {number} angle - Angle in degrees
     * @param {Object} options - Additional options
     * @returns {ProjectileSystem} - The created projectile
     */
    createEnemyProjectile(x, y, angle, options = {}) {
        const rad = angle * Math.PI / 180;
        const speed = options.speed || 5;
        const dx = Math.cos(rad) * speed;
        const dy = Math.sin(rad) * speed;
        
        const projectile = new EnemyProjectile(this.game, x, y, dx, dy, options);
        this.enemyProjectiles.push(projectile);
        return projectile;
    }
    
    /**
     * Create an enemy projectile with direct velocity
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     * @param {number} dx - X velocity
     * @param {number} dy - Y velocity
     * @param {Object} options - Additional options
     * @returns {ProjectileSystem} - The created projectile
     */
    createEnemyProjectileWithVelocity(x, y, dx, dy, options = {}) {
        const projectile = new EnemyProjectile(this.game, x, y, dx, dy, options);
        this.enemyProjectiles.push(projectile);
        return projectile;
    }
    
    /**
     * Create a targeted enemy projectile
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     * @param {Object} target - Target object with x,y properties
     * @param {Object} options - Additional options
     * @returns {ProjectileSystem} - The created projectile
     */
    createTargetedEnemyProjectile(x, y, target, options = {}) {
        if (!target) return null;
        
        const dx = target.x - x;
        const dy = target.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = options.speed || 5;
        
        // Normalize and scale
        const ndx = (dx / dist) * speed;
        const ndy = (dy / dist) * speed;
        
        return this.createEnemyProjectileWithVelocity(x, y, ndx, ndy, options);
    }
    
    /**
     * Update all projectiles
     */
    update() {
        // Update player projectiles
        this.playerProjectiles = this.playerProjectiles.filter(proj => !proj.update());
        
        // Update enemy projectiles
        this.enemyProjectiles = this.enemyProjectiles.filter(proj => !proj.update());
    }
    
    /**
     * Draw all projectiles
     */
    draw() {
        this.playerProjectiles.forEach(projectile => projectile.draw());
        this.enemyProjectiles.forEach(projectile => projectile.draw());
    }
    
    /**
     * Check collisions between projectiles and targets
     * @param {Array} playerTargets - Targets for player projectiles
     * @param {Array} enemyTargets - Targets for enemy projectiles 
     */
    checkCollisions(playerTargets, enemyTargets) {
        // Check player projectiles vs targets (typically enemies)
        if (playerTargets && playerTargets.length) {
            for (const proj of this.playerProjectiles) {
                if (!proj.isActive) continue;
                
                for (const target of playerTargets) {
                    if (this.checkCollision(proj, target)) {
                        proj.onHit(target);
                        target.takeDamage(proj.damage);
                        break;
                    }
                }
            }
        }
        
        // Check enemy projectiles vs targets (typically player)
        if (enemyTargets && enemyTargets.length) {
            for (const proj of this.enemyProjectiles) {
                if (!proj.isActive) continue;
                
                for (const target of enemyTargets) {
                    if (this.checkCollision(proj, target)) {
                        proj.onHit(target);
                        
                        // Handle damage application for player targets
                        const damageApplied = target.takeDamage(proj.damage);
                        
                        // Create shield hit effect when damage is blocked by shield
                        // FIXED: Changed condition from 'damageApplied === false' to 'target.shield > 0'
                        if (target.shield > 0) {
                            this.createShieldHitEffect(proj.x, proj.y);
                        }
                        
                        break;
                    }
                }
            }
        }
    }
    
    /**
     * Create a shield hit effect
     * @param {number} x - X position of the hit
     * @param {number} y - Y position of the hit
     */
    createShieldHitEffect(x, y) {
        // Use the ParticleSystem if available
        if (this.game.particleSystem) {
            this.game.particleSystem.createShieldEffect(x, y);
        } else {
            // Fallback if no particle system - create a basic shield particle
            const particle = new Particle(this.game, x, y, 'shield', {
                color: 'rgba(100, 200, 255, 0.8)',
                size: 1.5,
                lifespan: 20
            });
            this.game.particles.push(particle);
        }
        
        // Play shield block sound
        const hitSound = this.game.assets.sounds.hit1;
        if (hitSound) {
            hitSound.currentTime = 0;
            hitSound.volume = 0.3; // Lower volume for shield hit
            hitSound.play().catch(e => console.error("Error playing shield hit sound:", e));
        }
    }
    
    /**
     * Check collision between a projectile and a target
     * @param {Object} projectile - The projectile
     * @param {Object} target - The target
     * @returns {boolean} - True if collision detected
     */
    checkCollision(projectile, target) {
        if (!projectile.isActive || !target) return false;
        
        // Handle different target types (Round 3 enemies have different structures)
        let targetX, targetY, targetWidth, targetHeight;
        
        if (target.position) {
            // Game controller format for Round 3 enemies
            targetX = target.position.x;
            targetY = target.position.y;
            targetWidth = target.width || 40;
            targetHeight = target.height || 40;
            
            // Apply Y offset for visuals if needed (Round 3 enemies are drawn with offset)
            if (target.type && target.type.includes('darkling')) {
                targetY -= 350; // Apply visual offset for darklings
            }
        } else {
            // Standard format
            targetX = target.x;
            targetY = target.y;
            targetWidth = target.width;
            targetHeight = target.height;
        }
        
        // For very small targets or projectiles, use distance-based collision
        if (targetWidth < 20 || targetHeight < 20 || 
            projectile.width < 20 || projectile.height < 20) {
            
            const dx = (targetX + targetWidth/2) - (projectile.x + projectile.width/2);
            const dy = (targetY + targetHeight/2) - (projectile.y + projectile.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = (targetWidth + projectile.width) / 3; // Forgiving collision
            
            return distance < minDistance;
        }
        
        // Standard rectangular collision
        return projectile.x < targetX + targetWidth &&
               projectile.x + projectile.width > targetX &&
               projectile.y < targetY + targetHeight &&
               projectile.y + projectile.height > targetY;
    }
    
    /**
     * Create an enemy projectile with specific patterns for Round 3 enemies
     * @param {string} enemyType - The type of enemy firing
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     * @param {Object} targetPosition - Player position for targeting
     * @returns {Array} - Array of created projectiles
     */
    createEnemyTypeProjectiles(enemyType, x, y, targetPosition) {
        const projectiles = [];
        
        // Round 3 enemy firing patterns
        switch (enemyType) {
            case 'darkling7':
                // Wide spread (3 shots)
                for (let angle = 75; angle <= 105; angle += 15) {
                    projectiles.push(this.createEnemyProjectile(x, y, angle, { speed: 3.5 }));
                }
                break;
                
            case 'darkling8':
                // Faster dual shots
                projectiles.push(this.createEnemyProjectile(x, y, 85, { speed: 4.5 }));
                projectiles.push(this.createEnemyProjectile(x, y, 95, { speed: 4.5 }));
                break;
                
            case 'darkling10':
                // Random pattern with multiple options
                const pattern = Math.floor(Math.random() * 3);
                if (pattern === 0) {
                    // Single fast shot
                    projectiles.push(this.createEnemyProjectile(x, y, 90, { speed: 5 }));
                } else if (pattern === 1) {
                    // Three-way spread
                    for (let angle = 75; angle <= 105; angle += 15) {
                        projectiles.push(this.createEnemyProjectile(x, y, angle, { speed: 3.5 }));
                    }
                } else {
                    // Targeted shot
                    if (targetPosition) {
                        projectiles.push(this.createTargetedEnemyProjectile(
                            x, y, targetPosition, { speed: 4.5, width: 35, height: 35 }
                        ));
                    }
                }
                break;
                
            case 'darklingboss3':
                // Final boss attack pattern
                if (Math.random() < 0.5 && targetPosition) {
                    // Targeted attack with additional spread
                    projectiles.push(this.createTargetedEnemyProjectile(
                        x, y, targetPosition, { speed: 5, width: 45, height: 45 }
                    ));
                    
                    // Offset shots around the targeted one
                    projectiles.push(this.createEnemyProjectile(x, y, 70, { speed: 4.5, width: 40, height: 40 }));
                    projectiles.push(this.createEnemyProjectile(x, y, 110, { speed: 4.5, width: 40, height: 40 }));
                } else {
                    // Radial attack pattern (every 30 degrees)
                    for (let angle = 0; angle < 360; angle += 30) {
                        projectiles.push(this.createEnemyProjectile(
                            x, y, angle, { speed: 3.5, width: 35, height: 35 }
                        ));
                    }
                }
                break;
                
            default:
                // Default pattern for other enemy types
                projectiles.push(this.createEnemyProjectile(x, y, 90, { speed: 3 }));
        }
        
        return projectiles;
    }
    
    /**
     * Handle enemy shooting based on enemy type and position
     * @param {Object} enemy - The enemy object
     * @param {Object} playerPosition - Player's current position
     */
    handleEnemyShooting(enemy, playerPosition) {
        if (!enemy || !enemy.type) return;
        
        // Calculate adjusted position (Round 3 enemies have different position structure)
        const enemyX = enemy.position ? enemy.position.x : enemy.x;
        const enemyY = enemy.position ? enemy.position.y : enemy.y;
        
        // Create projectiles based on enemy type
        this.createEnemyTypeProjectiles(enemy.type, enemyX, enemyY, playerPosition);
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
            
            return this.createEnemyProjectileWithVelocity(x, y, dx, dy, {
                width: 30 * size,
                height: 30 * size,
                sprite: Math.random() < 0.5 ? 'darklingshot1' : 'darklingshot2'
            });
        };
        
        // Helper for creating a targeted projectile
        const createTargetedProjectile = (speed = 3, size = 1) => {
            if (!playerPosition) return null;
            
            return this.createTargetedEnemyProjectile(x, y, playerPosition, {
                speed: speed,
                width: 30 * size,
                height: 30 * size,
                sprite: 'darklingshot2'
            });
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
}