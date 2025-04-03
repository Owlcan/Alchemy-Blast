/**
 * Audio Manager for Alchemy Blaster
 * 
 * Handles loading and playing sound effects and music
 */
class AudioManager {
    constructor() {
        this.sfx = {};
        this.music = {};
        this.currentMusic = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.muted = false;
        
        // Initialize audio
        this.initAudio();
    }
    
    /**
     * Initialize audio resources
     */
    initAudio() {
        // Load sound effects
        this.loadSfx('playerShot', 'assets/sounds/playershot.wav');
        this.loadSfx('enemyShot', 'assets/sounds/enemyshot.wav');
        this.loadSfx('explosion', 'assets/sounds/explosion.wav');
        this.loadSfx('hit', 'assets/sounds/hit.wav');
        this.loadSfx('powerup', 'assets/sounds/powerup.wav');
        this.loadSfx('waveComplete', 'assets/sounds/wavecomplete.wav');
        this.loadSfx('gameOver', 'assets/sounds/gameover.wav');
        this.loadSfx('victory', 'assets/sounds/victory.wav');
        this.loadSfx('buttonClick', 'assets/sounds/buttonclick.wav');
        this.loadSfx('shieldHit', 'assets/sounds/shieldhit.wav');
        
        // Load character-specific sounds
        // Dere sounds
        this.loadSfx('derehit1', 'assets/sounds/derehit1.wav');
        this.loadSfx('derehit2', 'assets/sounds/derehit2.wav');
        this.loadSfx('derehit3', 'assets/sounds/derehit3.wav');
        this.loadSfx('derespecialattack', 'assets/sounds/derespecialattack.wav');
        
        // Aliza sounds
        this.loadSfx('alizahit1', 'assets/sounds/alizahit1.wav');
        this.loadSfx('alizahit2', 'assets/sounds/alizahit2.wav');
        this.loadSfx('alizaspecialattack', 'assets/sounds/alizaspecialattack.wav');
        
        // Shinshi sounds
        this.loadSfx('shinnyattack1', 'assets/sounds/shinnyattack1.wav');
        this.loadSfx('shinnypewpewpew', 'assets/sounds/shinnypewpewpew.wav');
        this.loadSfx('shinnyvictory1', 'assets/sounds/shinnyvictory1.wav');
        this.loadSfx('shinnyvictory2', 'assets/sounds/shinnyvictory2.wav');
        this.loadSfx('shinnyhit1', 'assets/sounds/shinnyhit1.wav');
        
        // Potion sounds
        this.loadSfx('potion1', 'assets/sounds/potion1.wav');
        this.loadSfx('potion2', 'assets/sounds/potion2.wav');
        this.loadSfx('potion4', 'assets/sounds/potion4.wav');
        
        // Load music
        this.loadMusic('title', 'assets/sounds/titlemusic.mp3');
        this.loadMusic('game', 'assets/sounds/gamemusic.mp3');
        this.loadMusic('boss', 'assets/sounds/bossmusic.mp3');
    }
    
    /**
     * Load a sound effect
     * @param {string} id - Sound effect ID
     * @param {string} src - Source path
     */
    loadSfx(id, src) {
        const audio = new Audio();
        audio.src = src;
        audio.volume = this.sfxVolume;
        audio.load();
        this.sfx[id] = audio;
    }
    
    /**
     * Load music
     * @param {string} id - Music ID
     * @param {string} src - Source path
     */
    loadMusic(id, src) {
        const audio = new Audio();
        audio.src = src;
        audio.volume = this.musicVolume;
        audio.loop = true;
        audio.load();
        this.music[id] = audio;
    }
    
    /**
     * Play a sound effect
     * @param {string} id - Sound effect ID
     */
    playSfx(id) {
        if (this.muted) return;
        
        const sound = this.sfx[id];
        if (sound) {
            // Create a clone to allow overlapping sounds
            const clone = sound.cloneNode();
            clone.volume = this.sfxVolume;
            clone.play();
        } else {
            console.warn(`Sound effect "${id}" not found`);
        }
    }
    
    /**
     * Play music
     * @param {string} id - Music ID
     */
    playMusic(id) {
        if (this.muted) return;
        
        // Stop current music if playing
        this.stopMusic();
        
        const music = this.music[id];
        if (music) {
            music.currentTime = 0;
            music.play();
            this.currentMusic = id;
        } else {
            console.warn(`Music "${id}" not found`);
        }
    }
    
    /**
     * Stop current music
     */
    stopMusic() {
        if (this.currentMusic) {
            const music = this.music[this.currentMusic];
            if (music) {
                music.pause();
                music.currentTime = 0;
            }
            this.currentMusic = null;
        }
    }
    
    /**
     * Set master volume for both music and SFX
     * @param {number} volume - Volume level (0 to 1)
     */
    setMasterVolume(volume) {
        this.setMusicVolume(volume);
        this.setSfxVolume(volume);
    }
    
    /**
     * Set music volume
     * @param {number} volume - Volume level (0 to 1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        // Apply to all music tracks
        for (const id in this.music) {
            this.music[id].volume = this.musicVolume;
        }
    }
    
    /**
     * Set sound effect volume
     * @param {number} volume - Volume level (0 to 1)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        
        // Apply to all sound effects
        for (const id in this.sfx) {
            this.sfx[id].volume = this.sfxVolume;
        }
    }
    
    /**
     * Mute or unmute all audio
     * @param {boolean} muted - Whether audio should be muted
     */
    setMuted(muted) {
        this.muted = muted;
        
        if (muted) {
            this.stopMusic();
        } else if (this.currentMusic) {
            this.playMusic(this.currentMusic);
        }
    }
}