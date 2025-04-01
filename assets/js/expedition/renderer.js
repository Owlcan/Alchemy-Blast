/**
     * Draw projectiles
     * @param {Object} state - Current game state
     */
    drawProjectiles(state) {
        if (!state.projectiles) return;
        
        const ctx = this.ctx;
        
        // Draw player projectiles
        for (const projectile of state.projectiles.player) {
            // Get projectile sprite
            const spriteKey = projectile.sprite || 'shot1';
            const sprite = this.assets.images[spriteKey];
            
            if (sprite) {
                ctx.drawImage(
                    sprite,
                    this.canvas.width / 2 + projectile.x - sprite.width / 2,
                    this.canvas.height / 2 + projectile.y - sprite.height / 2,
                    sprite.width,
                    sprite.height
                );
            } else {
                // Fallback if sprite not found
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                ctx.arc(
                    this.canvas.width / 2 + projectile.x,
                    this.canvas.height / 2 + projectile.y,
                    5,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
        
        // Draw enemy projectiles
        for (const projectile of state.projectiles.enemy) {
            // Get enemy projectile sprite - using correct sprites now
            const spriteKey = projectile.sprite || 'darklingshot1';
            const sprite = this.assets.images[spriteKey];
            
            // Calculate projectile's adjusted Y for rendering
            projectile.adjustedY = projectile.y - 350; // Apply the same offset as enemies
            
            if (sprite) {
                // Draw with proper sizing
                const width = projectile.width || sprite.width || 30;
                const height = projectile.height || sprite.height || 30;
                
                ctx.drawImage(
                    sprite,
                    this.canvas.width / 2 + projectile.x - width / 2,
                    this.canvas.height / 2 + projectile.adjustedY - height / 2,
                    width,
                    height
                );
            } else {
                // Fallback if sprite not found
                ctx.fillStyle = '#ff5555';
                ctx.beginPath();
                ctx.arc(
                    this.canvas.width / 2 + projectile.x,
                    this.canvas.height / 2 + projectile.adjustedY,
                    projectile.width ? projectile.width / 3 : 8,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    }
    
    /**
     * Draw special effects
     * @param {Object} state - Current game state
     */
    drawEffects(state) {
        if (!state.effects || state.effects.length === 0) return;
        
        const ctx = this.ctx;
        const currentTime = Date.now();
        
        // Filter out expired effects
        const activeEffects = state.effects.filter(effect => 
            currentTime - effect.startTime < effect.duration);
        
        // Draw active effects
        for (const effect of activeEffects) {
            // Calculate effect progress (0-1)
            const progress = (currentTime - effect.startTime) / effect.duration;
            const alpha = 1 - progress; // Fade out as effect progresses
            
            // Handle specific effect types
            if (effect.type === 'screenFlash') {
                // Screen-clearing flash
                this.drawScreenFlash(ctx, alpha);
            } else if (effect.type === 'flash') {
                // Enemy hit flash
                this.drawEnemyFlash(ctx, effect.position, alpha);
            }
        }
        
        // Update effects array
        state.effects = activeEffects;
    }
    
    /**
     * Draw a full-screen flash effect (for Dere's special ability)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} alpha - Effect opacity
     */
    drawScreenFlash(ctx, alpha) {
        // Save context state
        ctx.save();
        ctx.globalAlpha = alpha * 0.7;
        
        // Draw full-screen gradient
        const gradient = ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.3, 'rgba(255, 240, 180, 0.7)');
        gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Restore context state
        ctx.restore();
    }
    
    /**
     * Draw a flash effect on an enemy (for Dere's special ability)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} position - Position of the flash
     * @param {number} alpha - Effect opacity
     */
    drawEnemyFlash(ctx, position, alpha) {
        // Apply Y offset to enemy position for rendering
        const enemyY = position.y - 350;
        
        // Save context state
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Draw halo effect
        ctx.fillStyle = 'rgba(255, 240, 150, 0.8)';
        ctx.beginPath();
        ctx.arc(
            this.canvas.width / 2 + position.x,
            this.canvas.height / 2 + enemyY,
            30,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = 'rgba(255, 200, 100, 0.9)';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(
            this.canvas.width / 2 + position.x,
            this.canvas.height / 2 + enemyY,
            20,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Restore context state
        ctx.restore();
    }