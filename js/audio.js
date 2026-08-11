        // --- オーディオ管理 ---
        const Audio = {
            ctx: null,
            masterGain: null,
            bgmTimer: null,
            currentBgmType: null,
            isMuted: false,
            
            init: function() {
                if (!this.ctx) {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                    this.masterGain = this.ctx.createGain();
                    this.masterGain.gain.value = masterVolume;
                    this.masterGain.connect(this.ctx.destination);
                    this.isMuted = masterVolume <= 0;
                } else if (this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            },

            // 設定画面の音量スライダーから呼ばれる（0.0〜1.0）
            setVolume: function(v) {
                masterVolume = v;
                this.isMuted = v <= 0;
                const el = document.getElementById('mute-status');
                if (el) {
                    el.innerText = this.isMuted ? 'ON' : 'OFF';
                    el.style.color = this.isMuted ? '#ff0000' : '#fff';
                }
                if (this.masterGain) {
                    this.masterGain.gain.value = v;
                }
            },

            // Mキー用のショートカット: 0とその直前の音量をトグルする
            toggleMute: function() {
                if (masterVolume > 0) {
                    this.lastVolume = masterVolume;
                    this.setVolume(0);
                } else {
                    this.setVolume(this.lastVolume || 1.0);
                }
            },

            playTone: function(freq, type, duration, vol = 0.1) {
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                gain.gain.setValueAtTime(vol, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            },

            playNoise: function(duration, vol = 0.1) {
                if (!this.ctx) return;
                const bufferSize = this.ctx.sampleRate * duration;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(vol, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
                noise.connect(gain);
                gain.connect(this.masterGain);
                noise.start();
            },

            shoot: function() { this.playTone(400 + Math.random() * 200, 'square', 0.1, 0.05); },
            gem: function() { this.playTone(800 + Math.random() * 200, 'sine', 0.1, 0.05); },
            explosion: function() { this.playNoise(0.2, 0.1); },
            damage: function() { this.playTone(100, 'sawtooth', 0.3, 0.1); },
            chest: function() { 
                if(!this.ctx) return;
                this.playTone(600, 'sine', 0.1); 
                setTimeout(() => this.playTone(800, 'sine', 0.2), 100);
            },
            unique: function() { this.playTone(1200, 'square', 0.3, 0.1); },
            legend: function() { this.playTone(1500, 'sawtooth', 0.5, 0.2); this.playTone(1000, 'sine', 0.5, 0.2); },
            levelUp: function() {
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.value = f;
                    gain.gain.setValueAtTime(0.1, now + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
                    osc.connect(gain);
                    gain.connect(this.masterGain);
                    osc.start(now + i * 0.1);
                    osc.stop(now + i * 0.1 + 0.3);
                });
            },

            playBGM: function(type) {
                if (this.currentBgmType === type) return;
                this.currentBgmType = type;
                if (this.bgmTimer) clearTimeout(this.bgmTimer);

                let step = 0;
                let sequence = [];
                let waveType = 'triangle';

                if (type === 'opening') {
                    // オープニング
                    waveType = 'sawtooth'; // 金管楽器風
                    sequence = [
                        {f:392.00, d:0.6}, {f:523.25, d:0.2}, {f:523.25, d:0.2}, {f:659.25, d:0.2}, {f:783.99, d:0.6}, {f:493.88, d:0.2}, {f:392.00, d:0.2}, {f:440.00, d:0.2}, {f:493.88, d:0.2},
                        {f:523.25, d:0.6}, {f:493.88, d:0.2}, {f:440.00, d:0.2}, {f:392.00, d:0.2}, {f:349.23, d:0.2}, {f:329.63, d:0.2}, {f:293.66, d:0.2}, {f:261.63, d:0.2},
                        {f:392.00, d:0.6}, {f:523.25, d:0.2}, {f:523.25, d:0.2}, {f:659.25, d:0.2}, {f:783.99, d:0.6}, {f:493.88, d:0.2}, {f:392.00, d:0.2}, {f:440.00, d:0.2}, {f:493.88, d:0.2},
                        {f:523.25, d:0.6}, {f:493.88, d:0.2}, {f:440.00, d:0.2}, {f:392.00, d:0.2}, {f:349.23, d:0.2}, {f:329.63, d:0.2}, {f:293.66, d:0.2}, {f:261.63, d:0.2},
                        {f:783.99, d:0.4}, {f:783.99, d:0.4}, {f:783.99, d:0.4}, {f:698.46, d:0.2}, {f:659.25, d:0.2}, {f:587.33, d:0.2}, {f:523.25, d:0.2}, {f:587.33, d:0.8},
                        {f:659.25, d:0.2}, {f:587.33, d:0.2}, {f:523.25, d:0.2}, {f:587.33, d:0.2}, {f:659.25, d:0.2}, {f:698.46, d:0.2}, {f:783.99, d:0.2}, {f:880.00, d:0.2}, {f:987.77, d:0.2},
                        {f:1046.50, d:0.4}, {f:1046.50, d:0.4}, {f:987.77, d:0.2}, {f:880.00, d:0.2}, {f:783.99, d:0.2}, {f:698.46, d:0.2}, {f:659.25, d:0.2}, {f:587.33, d:0.2}, {f:523.25, d:0.2},
                        {f:587.33, d:0.2}, {f:659.25, d:0.2}, {f:698.46, d:0.2}, {f:659.25, d:0.2}, {f:587.33, d:0.4}, {f:523.25, d:0.8}
                    ];
                } else if (type === 'game') {
                    // ゲーム中BGM
                    sequence = [
                    { f: 293.66, d: 0.2 }, { f: 440.00, d: 0.2 }, { f: 349.23, d: 0.2 }, { f: 146.83, d: 0.2 }, // Dm
                    { f: 233.08, d: 0.2 }, { f: 466.16, d: 0.2 }, { f: 293.66, d: 0.2 }, { f: 116.54, d: 0.2 }, // Bb
                    { f: 196.00, d: 0.2 }, { f: 392.00, d: 0.2 }, { f: 311.13, d: 0.2 }, { f: 98.00, d: 0.2 },  // Gm
                    { f: 220.00, d: 0.2 }, { f: 554.37, d: 0.2 }, { f: 329.63, d: 0.2 }, { f: 110.00, d: 0.2 },  // A major
                    { f: 587.33, d: 0.2 }, { f: 440.00, d: 0.2 }, { f: 493.88, d: 0.2 }, { f: 369.99, d: 0.2 }, // D - A
                    { f: 392.00, d: 0.2 }, { f: 293.66, d: 0.2 }, { f: 392.00, d: 0.2 }, { f: 440.00, d: 0.2 }, // Bm - F#m
                    { f: 293.66, d: 0.2 }, { f: 369.99, d: 0.2 }, { f: 440.00, d: 0.2 }, { f: 587.33, d: 0.2 }, // G - D
                    { f: 392.00, d: 0.2 }, { f: 440.00, d: 0.2 }, { f: 493.88, d: 0.2 }, { f: 554.37, d: 0.2 }, // G - A
                    { f: 587.33, d: 0.2 }, { f: 739.99, d: 0.2 }, { f: 659.25, d: 0.2 }, { f: 554.37, d: 0.2 }, // D
                    { f: 493.88, d: 0.2 }, { f: 587.33, d: 0.2 }, { f: 554.37, d: 0.2 }, { f: 440.00, d: 0.2 }, // A
                    { f: 392.00, d: 0.2 }, { f: 440.00, d: 0.2 }, { f: 493.88, d: 0.2 }, { f: 369.99, d: 0.2 }, // Bm
                    { f: 293.66, d: 0.2 }, { f: 369.99, d: 0.2 }, { f: 440.00, d: 0.2 }, { f: 554.37, d: 0.2 }  // A
                ];
                } else if (type === 'night') {
                    // 夜BGM (少し不気味でゆっくり)
                    waveType = 'sine';
                    sequence = [
                        {f:146.83, d:0.8}, {f:196.00, d:0.8}, {f:174.61, d:0.8}, {f:130.81, d:0.8}, // D G F C
                        {f:110.00, d:0.8}, {f:130.81, d:0.8}, {f:123.47, d:0.8}, {f:98.00, d:0.8},  // A C B G
                        {f:146.83, d:0.4}, {f:196.00, d:0.4}, {f:293.66, d:0.4}, {f:261.63, d:0.4}, {f:220.00, d:0.8}, {f:196.00, d:0.8}
                    ];
                } else if (type === 'dusk') {
                    // 夕暮れBGM (哀愁)
                    waveType = 'sine';
                    sequence = [
                        {f:440.00, d:0.8}, {f:392.00, d:0.8}, {f:349.23, d:0.8}, {f:329.63, d:0.8}, // A G F E
                        {f:293.66, d:0.8}, {f:329.63, d:0.8}, {f:349.23, d:0.8}, {f:261.63, d:0.8}, // D E F C
                        {f:293.66, d:0.4}, {f:261.63, d:0.4}, {f:220.00, d:0.4}, {f:196.00, d:0.4}, {f:174.61, d:0.8}, {f:196.00, d:0.8} // D C A G F G
                    ];
                } else if (type === 'gameover') {
                    // ゲームオーバー
                    waveType = 'sine'; // 柔らかい音
                    sequence = [
                        {f:277.18, d:0.4}, {f:277.18, d:0.4}, {f:261.63, d:0.4}, {f:220.00, d:1.2}, // Db Db C A
                        {f:207.65, d:0.4}, {f:220.00, d:0.4}, {f:277.18, d:0.8}, {f:220.00, d:0.8}, // Ab A Db A
                        {f:185.00, d:0.4}, {f:185.00, d:0.4}, {f:164.81, d:0.4}, {f:138.59, d:1.2}  // Gb Gb E Db
                    ];
                } else if (type === 'ending') {
                    // フィナーレファンファーレ
                    waveType = 'sawtooth';
                    sequence = [
                        {f:523.25, d:0.2}, {f:523.25, d:0.2}, {f:523.25, d:0.2}, {f:523.25, d:0.6}, // C C C C
                        {f:440.00, d:0.6}, {f:493.88, d:0.6}, // A B
                        {f:523.25, d:0.4}, {f:587.33, d:0.4}, {f:659.25, d:1.2}, // C D E
                        {f:523.25, d:0.4}, {f:659.25, d:0.4}, {f:783.99, d:1.6}  // C E G
                    ];
                }
                else if (type === 'final_boss') {
                    // ラスボスBGM
                    waveType = 'sawtooth';
                    sequence = [
                        {f:130.81, d:0.8}, {f:146.83, d:0.8}, {f:130.81, d:0.8}, {f:164.81, d:0.8}, // C D C E
                        {f:130.81, d:0.8}, {f:196.00, d:0.8}, {f:130.81, d:0.8}, {f:185.00, d:0.8}, // C G C G#
                        {f:130.81, d:0.4}, {f:146.83, d:0.4}, {f:164.81, d:0.4}, {f:185.00, d:0.4}, {f:196.00, d:0.4}, {f:220.00, d:0.4}, {f:246.94, d:0.4}, {f:261.63, d:0.4},
                    ];
                }

                const playNext = () => {
                    if (this.ctx && !isPaused) {
                        const note = sequence[step % sequence.length];
                        const duration = note.d;
                        
                        // Melody
                        const osc = this.ctx.createOscillator();
                        const gain = this.ctx.createGain();
                        osc.type = waveType;
                        osc.frequency.value = note.f;
                        
                        const now = this.ctx.currentTime;
                        gain.gain.setValueAtTime(0, now);
                        gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
                        
                        osc.connect(gain);
                        gain.connect(this.masterGain);
                        osc.start(now);
                        osc.stop(now + duration);

                        // Bass (Octave down)
                        const osc2 = this.ctx.createOscillator();
                        const gain2 = this.ctx.createGain();
                        osc2.type = waveType === 'sawtooth' ? 'triangle' : 'sine';
                        osc2.frequency.value = note.f / 2;
                        gain2.gain.setValueAtTime(0, now);
                        gain2.gain.linearRampToValueAtTime(0.05, now + 0.05);
                        gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);
                        osc2.connect(gain2);
                        gain2.connect(this.masterGain);
                        osc2.start(now);
                        osc2.stop(now + duration);

                        step++;
                        this.bgmTimer = setTimeout(playNext, duration * 1000);
                    } else {
                        this.bgmTimer = setTimeout(playNext, 100);
                    }
                };
                playNext();
            },
        };

