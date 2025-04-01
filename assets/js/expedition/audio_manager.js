/**
 * Audio Manager for Alchemy Blaster
 * Handles all music and sound effects for the game
 */

class AudioManager {
    constructor() {
        // Main audio tracks
        this.music = {
            menu: null,
            round1: null,
            round2: null,
            round3: null,
            boss1: null,
            boss2: null,
            boss3: null,
            victory: null,
            gameOver: null
        };
        
        // Sound effects
        this.sfx = {
            playerShot: null,
            enemyShot: null,
            playerHit: null,
            enemyHit: null,
            enemyExplode: null,
            powerup: null,
            specialAttack: null
        };
        
        this.currentMusic = null;
        this.isMusicEnabled = true;
        this.isSfxEnabled = true;
        this.volume = 0.6;
        
        // Keep track of the current round and wave for music selection
        this.currentRound = 1;
        this.currentWave = 1;
        this.isBossWave = false;
    }
    
    /**
     * Initialize all audio assets
     */
    init() {
        // Load music tracks
        this.music.menu = new Audio('assets/sounds/menu.mp3');
        this.music.round1 = new Audio('assets/sounds/round1.mp3');
        this.music.round2 = new Audio('assets/sounds/round2.mp3');
        this.music.round3 = new Audio('assets/sounds/round3.mp3');
        this.music.boss1 = new Audio('assets/sounds/boss1.mp3');
        this.music.boss2 = new Audio('assets/sounds/boss2.mp3');
        this.music.boss3 = new Audio('assets/sounds/boss3.mp3');
        this.music.victory = new Audio('assets/sounds/victory.mp3');
        this.music.gameOver = new Audio('assets/sounds/gameover.mp3');
        
        // Load sound effects
        this.sfx.playerShot = new Audio('assets/sounds/player_shot.wav');
        this.sfx.enemyShot = new Audio('assets/sounds/enemy_shot.wav');
        this.sfx.playerHit = new Audio('assets/sounds/player_hit.wav');
        this.sfx.enemyHit = new Audio('assets/sounds/enemy_hit.wav');
        this.sfx.enemyExplode = new Audio('assets/sounds/enemy_explode.wav');
        this.sfx.powerup = new Audio('assets/sounds/powerup.wav');
        this.sfx.specialAttack = new Audio('assets/sounds/special_attack.wav');
        
        // Configure all audio for looping
        for (const track in this.music) {
            if (this.music[track]) {
                this.music[track].loop = true;
                this.music[track].volume = this.volume;
            }
        }
        
        // Set sound effect volumes
        for (const sound in this.sfx) {
            if (this.sfx[sound]) {
                this.sfx[sound].volume = this.volume;
            }
        }
    }
    
    /**
     * Update the current round and wave for music selection
     * @param {number} round - Current game round
     * @param {number} wave - Current wave in the round
     * @param {boolean} isBoss - Whether this is a boss wave
     */
    updateWave(round, wave, isBoss) {
        const previousRound = this.currentRound;
        const previousWave = this.currentWave;
        const wasBossWave = this.isBossWave;
        
        this.currentRound = round;
        this.currentWave = wave;
        this.isBossWave = isBoss;
        
        // Force music change when any of these values change
        if (previousRound !== round || previousWave !== wave || wasBossWave !== isBoss) {
            this.updateMusic(true);
        }
    }
    
    /**
     * Update the currently playing music based on game state
     * @param {boolean} forceChange - Whether to force a music change even if track type is the same
     */
    updateMusic(forceChange = false) {
        let newTrack = null;
        
        if (this.isBossWave) {
            // Boss music depends on which round we're in
            if (this.currentRound === 1) {
                newTrack = this.music.boss1;
            } else if (this.currentRound === 2) {
                newTrack = this.music.boss2;
            } else {
                newTrack = this.music.boss3;
            }
        } else {
            // Regular round music
            if (this.currentRound === 1) {
                newTrack = this.music.round1;
            } else if (this.currentRound === 2) {
                newTrack = this.music.round2;
            } else {
                newTrack = this.music.round3;
            }
        }
        
        // Check if we need to change the music
        if (this.currentMusic !== newTrack || forceChange) {
            this.playMusic(newTrack);
        }
    }
    
    /**
     * Play a music track
     * @param {Audio} track - The music track to play
     */
    playMusic(track) {
        if (!this.isMusicEnabled || !track) return;
        
        // Stop current music
        if (this.currentMusic && !this.currentMusic.paused) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
        
        // Play new track
        this.currentMusic = track;
        this.currentMusic.volume = this.volume;
        this.currentMusic.loop = true;
        this.currentMusic.play().catch(error => {
            console.warn("Audio playback failed:", error);
        });
    }
    
    /**
     * Play a sound effect
     * @param {string} soundName - Name of the sound effect to play
     */
    playSfx(soundName) {
        if (!this.isSfxEnabled) return;
        
        const sound = this.sfx[soundName];
        if (sound) {
            // Clone the sound to allow multiple instances to play simultaneously
            const soundClone = sound.cloneNode();
            soundClone.volume = this.volume;
            soundClone.play().catch(error => {
                console.warn("Audio playback failed:", error);
            });
        }
    }
    
    /**
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update all music volumes
        for (const track in this.music) {
            if (this.music[track]) {
                this.music[track].volume = this.volume;
            }
        }
        
        // Update all sound effect volumes
        for (const sound in this.sfx) {
            if (this.sfx[sound]) {
                this.sfx[sound].volume = this.volume;
            }
        }
    }
    
    /**
     * Toggle music on/off
     * @param {boolean} enabled - Whether music should be enabled
     */
    toggleMusic(enabled) {
        this.isMusicEnabled = enabled;
        
        if (!this.isMusicEnabled && this.currentMusic) {
            this.currentMusic.pause();
        } else if (this.isMusicEnabled && this.currentMusic) {
            this.currentMusic.play().catch(error => {
                console.warn("Audio playback failed:", error);
            });
        }
    }
    
    /**
     * Toggle sound effects on/off
     * @param {boolean} enabled - Whether sound effects should be enabled
     */
    toggleSfx(enabled) {
        this.isSfxEnabled = enabled;
    }
    
    /**
     * Play the menu music
     */
    playMenuMusic() {
        this.playMusic(this.music.menu);
    }
    
    /**
     * Play the game over music
     */
    playGameOverMusic() {
        this.playMusic(this.music.gameOver);
    }
    
    /**
     * Play the victory music
     */
    playVictoryMusic() {
        this.playMusic(this.music.victory);
    }
}

// Export the AudioManager class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioManager };
}