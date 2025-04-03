/**
 * EnemySystem.js
 * Updated Enemy class with improved integration with the game systems
 */

class Enemy {
    /**
     * Create a new enemy
     * @param {Object} game - The game instance
     * @param {string} type - Enemy type
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    constructor(game, type, x, y) {
        this.game = game;
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 80;
        this.speed = this.getMovementSpeed();
        this.health = this.getMaxHealth();
        this.maxHealth = this.health;
        this.lastShot = 0;
        this.shootCooldown = this.getShootCooldown();
        this.points = this.getPoints();
        this.fadeAlpha = 1;
        this.isDying = false;
        this.isInvulnerable = false;
        this.isBoss = this.type.includes('boss');
        this.hasShield = this.type === 'darkling4';
        this.shieldActive = false;
        this.shieldCooldown = 0;
        this.isCharging = false;
        
        // Movement pattern
        this.reversePattern = Math.random() < 0.5;
        this.amplitude = 50 + Math.floor(Math.random() * 50);
        this.frequency = 0.001 + (Math.random() * 0.003);
        this.verticalSpeed = this.type.includes('boss') ? 0.5 : 1.2;
        this.homeY = this.getHomeY();
        this.hasReachedHome = false;
        this.originalX = x; // Store original X position for patterns
    }
    
    /**
     * Get the movement speed for this enemy type
     * @returns {number} - Movement speed
     */
    getMovementSpeed() {
        if (this.type.includes('boss')) {
            return 1.5;
        }
        return 2 + Math.random();
    }
    
    /**
     * Get the max health for this enemy type
     * @returns {number} - Max health
     */
    getMaxHealth() {
        switch(this.type) {
            case 'darkling1':
            case 'darkling2':
            case 'darkling3':
                return 1;
            case 'darkling4':
            case 'darkling5':
            case 'darkling6':
                return 2;
            case 'darkling7':
            case 'darkling8':
            case 'darkling9':
                return 3;
            case 'darkling10':
                return 4;
            case 'darklingboss1':
                return 30;
            case 'darklingboss2':
                return 45;
            case 'darklingboss3':
                return 60;
            default:
                return 1;
        }
    }
    
    /**
     * Get the shooting cooldown time for this enemy type
     * @returns {number} - Cooldown time in milliseconds
     */
    getShootCooldown() {
        if (this.type.includes('boss')) {
            return 1500;
        }
        
        switch(this.type) {
            case 'darkling1':
            case 'darkling9':
                return 0; // Doesn't shoot
            case 'darkling2':
            case 'darkling3':
                return 2000;
            case 'darkling4':
                return 3000;
            case 'darkling5':
            case 'darkling6':
                return 2200;
            case 'darkling7':
                return 2500;
            case 'darkling8':
                return 1800;
            case 'darkling10':
                return 1500;
            default:
                return 2000;
        }
    }
    
    /**
     * Get point value for defeating this enemy
     * @returns {number} - Point value
     */
    getPoints() {
        if (this.type.includes('boss')) {
            return 1000;
        }
        
        switch(this.type) {
            case 'darkling1':
            case 'darkling2':
            case 'darkling3':
                return 100;
            case 'darkling4':
            case 'darkling5':
            case 'darkling6':
                return 200;
            case 'darkling7':
            case 'darkling8':
            case 'darkling9':
                return 300;
            case 'darkling10':
                return 500;
            default:
                return 100;
        }
    }
    
    /**
     * Get the vertical position where this enemy should stop
     * @returns {number} - Target Y position
     */
    getHomeY() {
        if (this.type.includes('boss')) {
            return 150;
        }
        return 100 + Math.random() * 200;
    }
    
    /**
     * Calculate movement pattern
     * @returns {Object} - Movement vector { x, y }
     */
    getMovementPattern() {
        const reverseDirection = this.reversePattern ? -1 : 1;
        const phaseOffset = Math.random() * 1000;
        
        if (!this.hasReachedHome) {
            // Move to home position
            const distToHome = this.homeY - this.y;
            if (distToHome <= this.verticalSpeed) {
                this.hasReachedHome = true;
                this.y = this.homeY;
                return { x: 0, y: 0 };
            }
            return { x: 0, y: this.verticalSpeed };
        }
        
        // Different patterns based on enemy type
        switch(this.type) {
            case 'darklingboss1':
            case 'darklingboss2':
            case 'darklingboss3':
                // Boss zigzag pattern
                if (this.isCharging) {
                    return { x: 0, y: 0 }; // Don't move while charging
                }
                
                return {
                    x: Math.sin(Date.now() * 0.001) * 1.5,
                    y: Math.sin(Date.now() * 0.0005) * 0.5
                };
                
            case 'darkling4':
                // Stays in place if shield is active
                if (this.shieldActive) {
                    return { x: 0, y: 0 };
                }
                // Slow side-to-side movement
                return {
                    x: Math.sin(Date.now() * 0.001) * 1,
                    y: 0
                };
                
            case 'darkling7':
            case 'darkling8':
                // Faster side-to-side movement
                return {
                    x: Math.sin(Date.now() * 0.002) * 2 * reverseDirection,
                    y: 0
                };
                
            default:
                // Standard sine wave pattern
                return {
                    x: Math.sin(Date.now() * this.frequency) * this.amplitude / 100 * reverseDirection,
                    y: 0
                };
        }
    }
    
    /**
     * Update enemy state
     * @param {number} time - Current time
     * @returns {boolean} - True if the enemy should be removed
     */
    update(time) {
        // Handle shield cooldown
        if (this.shieldCooldown > 0) {
            this.shieldCooldown -= 16.67; // Approximation for 60fps
            if (this.shieldCooldown < 0) this.shieldCooldown = 0;
        }
        
        // Handle death animation
        if (this.isDying) {
            this.fadeAlpha -= 0.05;
            if (this.fadeAlpha <= 0) {
                return true; // Remove this enemy
            }
            return false;
        }
        
        // Apply movement pattern
        const movement = this.getMovementPattern();
        this.x += movement.x;
        this.y += movement.y;
        
        // Keep within screen bounds
        const boundsPadding = 40;
        if (this.x < boundsPadding) this.x = boundsPadding;
        if (this.x > this.game.canvas.width - boundsPadding) this.x = this.game.canvas.width - boundsPadding;
        
        // Handle shooting
        if (this.shootCooldown > 0 && time - this.lastShot >= this.shootCooldown) {
            this.shoot();
            this.lastShot = time;
        }
        
        return false;
    }
    
    /**
     * Draw the enemy
     */
    draw() {
        const sprite = this.game.assets.images[this.type];
        
        this.game.ctx.save();
        
        // Apply fade effect if dying
        if (this.isDying) {
            this.game.ctx.globalAlpha = this.fadeAlpha;
        }
        
        // Apply charging effect
        if (this.isCharging) {
            this.game.ctx.shadowBlur = 20;
            this.game.ctx.shadowColor = '#ff0000';
        }
        
        // Apply shield effect
        if (this.shieldActive) {
            this.game.ctx.beginPath();
            this.game.ctx.arc(this.x + this.width/2, this.y + this.height/2, 
                         this.width * 0.75, 0, Math.PI * 2);
            this.game.ctx.fillStyle = 'rgba(0, 150, 255, 0.3)';
            this.game.ctx.fill();
            
            this.game.ctx.beginPath();
            this.game.ctx.arc(this.x + this.width/2, this.y + this.height/2, 
                         this.width * 0.75, 0, Math.PI * 2);
            this.game.ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
            this.game.ctx.lineWidth = 3;
            this.game.ctx.stroke();
        }
        
        if (sprite) {
            this.game.ctx.drawImage(
                sprite,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } else {
            // Fallback if sprite not found
            this.game.ctx.fillStyle = this.type.includes('boss') ? '#ff5555' : '#77aadd';
            this.game.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Draw health bar for bosses and stronger enemies
        if ((this.type.includes('boss') || this.maxHealth > 1) && !this.isDying) {
            const barWidth = this.width;
            const barHeight = 5;
            const healthPercent = this.health / this.maxHealth;
            
            // Health bar background
            this.game.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.game.ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);
            
            // Health bar fill
            this.game.ctx.fillStyle = this.type.includes('boss') ? '#ff3333' : '#33ff33';
            this.game.ctx.fillRect(
                this.x, 
                this.y - 10, 
                barWidth * healthPercent, 
                barHeight
            );
        }
        
        this.game.ctx.restore();
    }
    
    /**
     * Handle enemy shooting based on type
     */
    shoot() {
        // Skip if the enemy doesn't shoot
        if (this.type === 'darkling1' || this.type === 'darkling9') return;
        
        // Use the game controller to create projectiles
        if (this.game.gameController && typeof this.game.enemyShoot === 'function') {
            this.game.enemyShoot(this);
        }
    }
    
    /**
     * Handle enemy taking damage
     * @param {number} amount - Amount of damage taken
     * @returns {boolean} - True if the enemy was defeated
     */
    takeDamage(amount = 1) {
        // Skip if invulnerable
        if (this.isInvulnerable) return false;
        
        // Reduce health
        this.health -= amount;
        
        // Play hit sound
        const hitSound = this.game.assets.sounds.hit;
        if (hitSound) {
            hitSound.currentTime = 0;
            hitSound.play();
        }
        
        // Check if defeated
        if (this.health <= 0) {
            this.defeat();
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle enemy defeat
     */
    defeat() {
        // Skip if already dying
        if (this.isDying) return;
        
        this.isDying = true;
        
        // Play defeat sound
        const defeatSound = this.type.includes('boss') ? 
                          this.game.assets.sounds.bossDefeat : 
                          this.game.assets.sounds.enemyDefeat;
        if (defeatSound) {
            defeatSound.currentTime = 0;
            defeatSound.play();
        }
        
        // Create defeat particles
        if (this.game.particleSystem) {
            // Create a larger explosion for bosses
            const particleCount = this.type.includes('boss') ? 15 : 5;
            for (let i = 0; i < particleCount; i++) {
                setTimeout(() => {
                    const offsetX = (Math.random() - 0.5) * this.width;
                    const offsetY = (Math.random() - 0.5) * this.height;
                    
                    this.game.particleSystem.createParticle(
                        this.x + this.width/2 + offsetX,
                        this.y + this.height/2 + offsetY,
                        {
                            type: 'defeat',
                            scale: this.type.includes('boss') ? 2 + Math.random() : 1 + Math.random() * 0.5
                        }
                    );
                }, i * 50);
            }
        }
        
        // Spawn a powerup on some defeats (more likely from bosses)
        if (this.game.spawnPowerup && 
            (this.type.includes('boss') || Math.random() < 0.1)) {
            this.game.spawnPowerup(this.x + this.width/2, this.y + this.height/2);
        }
    }
}