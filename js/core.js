        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const hpText = document.getElementById('hp-text');
        const hpBar = document.getElementById('hp-bar');
        const mpText = document.getElementById('mp-text');
        const mpBar = document.getElementById('mp-bar');
        const levelText = document.getElementById('level-text');
        const xpBar = document.getElementById('xp-bar');
        const waveText = document.getElementById('wave-text');
        const scoreDisplay = document.getElementById('score');
        const levelUpScreen = document.getElementById('levelup-screen');
        const powerUpContainer = document.getElementById('powerup-container');
        const npcSelectScreen = document.getElementById('npc-select-screen');
        const npcContainer = document.getElementById('npc-container');
        const statsContainer = document.getElementById('stats-container');
        const startScreen = document.getElementById('start-screen');
        const autoBattleEl = document.getElementById('auto-battle');
        const autoLevelupEl = document.getElementById('auto-levelup');
        const speedText = document.getElementById('speed-text');
        const timeText = document.getElementById('time-text');
        const spellsContainer = document.getElementById('spells-container');

        // --- 定数設定 ---
        const SCREEN_WIDTH = 800;
        const SCREEN_HEIGHT = 600;
        const ENEMY_SPEED = 1.0; // 敵のスピードを少し速く
        const ENEMY_SPAWN_RATE = 120; // フレーム数 (出現頻度を下げる)
        const BOSS_SPAWN_RATE = 7200; // フレーム数 (約120秒)
        const DAY_LENGTH = 7200; // 1日の長さ (フレーム数)

        // --- ゲーム状態 ---
        let score = 0;
        let gameOver = false;
        let gameClear = false;
        let endingTimer = 0;
        let finalBossSpawned = false;
        let darkLordSpawned = false;
        let killedBy = '';
        const villages = [];
        const fortresses = [];
        const destroyedObstacles = new Set();
        const obstacleHP = new Map();
        const dungeonEntrances = [];
        let largeBossDefeatedCount = 0;
        let bossDefeatedCount = 0;
        let enemiesDefeated = 0;
        let gameOverTimer = 0;
        let gameOverSnapshot = null;
        let frameCount = 0;
        let level = 1;
        let xp = 0;
        let nextLevelXp = 10;
        let attackCooldown = 40; // 初期攻撃速度
        let attackTimer = 0;
        let bulletSpeed = 4;
        let isPaused = false;
        let isGameStarted = false;
        let axeTimer = 0;
        let novaTimer = 0;
        let damageFlashOpacity = 0;
        let whiteFlashOpacity = 0;
        let slowMotionTimer = 0;
        let selectedOptionIndex = 0;
        let selectedNpcIndex = 0;
        const acquiredItems = {};
        let isAutoBattle = false;
        let isAutoLevelUp = false;
        let gameSpeed = 1.0;
        let speedAccumulator = 0.0;
        let dayTime = 0.5; // 0.0-1.0 (0.5=Noon)
        let isDebugInvincible = false;
        let isEndlessMode = false;
        let timeStopTimer = 0;
        let isTrueEnding = false;
        
        // Spell effect timers
        let hasteTimer = 0;
        let berserkTimer = 0;
        let reflectTimer = 0;
        let blackHole = null;
        let holyRay = null;
        let shadowClones = [];
        let screenShakeTimer = 0;

        // マウス・ゲームパッド入力用
        let mouseX = 0;
        let mouseY = 0;
        let isMouseDown = false;
        let gamepadIndex = null;

        // --- 入力管理 ---
        const keys = {};
        window.addEventListener('keydown', e => {
            keys[e.key] = true;

            if (!isGameStarted) {
                startGame();
                return;
            }

            if (e.key === 'b' || e.key === 'B') {
                isAutoBattle = !isAutoBattle;
                autoBattleEl.innerText = isAutoBattle ? 'ON' : 'OFF';
                autoBattleEl.style.color = isAutoBattle ? '#00ff00' : '#fff';
            }

            if (e.key === 'l' || e.key === 'L') {
                isAutoLevelUp = !isAutoLevelUp;
                autoLevelupEl.innerText = isAutoLevelUp ? 'ON' : 'OFF';
                autoLevelupEl.style.color = isAutoLevelUp ? '#00ff00' : '#fff';
            }

            if (e.key === '0') {
                isPaused = !isPaused;
                if (!isPaused) {
                    gameLoop();
                } else {
                    // ポーズ画面描画
                    ctx.save();
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
                    ctx.fillStyle = '#FFF';
                    ctx.font = 'bold 40px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('PAUSED', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
                    ctx.restore();
                }
            }

            if (e.key === '1') setGameSpeed(0.5);
            if (e.key === '2') setGameSpeed(1.0);
            if (e.key === '3') setGameSpeed(1.5);
            if (e.key === '4') setGameSpeed(2.0);

            if (e.key === '-' || e.key === '_') {
                let s = parseFloat((gameSpeed - 0.1).toFixed(1));
                if (s < 0.1) s = 0.1;
                setGameSpeed(s);
            }
            if (e.key === '+' || e.key === '=' || e.key === ';' || e.key === '^') {
                let s = parseFloat((gameSpeed + 0.1).toFixed(1));
                if (s > 5.0) s = 5.0;
                setGameSpeed(s);
            }
            
            if (e.key === 'm' || e.key === 'M') {
                Audio.toggleMute();
            }
            
            if (e.key === 'F8') {
                const menu = document.getElementById('debug-menu');
                menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            }

            // 宝箱画面のキーボード操作
            if (document.getElementById('chest-screen').style.display === 'flex') {
                if (e.key === 'Enter' || e.key === ' ') {
                    closeChest();
                }
            }
            
            // レベルアップ画面のキーボード操作
            if (levelUpScreen.style.display === 'flex') {
                const cards = document.querySelectorAll('.powerup-card');
                if (cards.length > 0) {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        selectedOptionIndex = (selectedOptionIndex - 1 + cards.length) % cards.length;
                        updateSelection();
                    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        selectedOptionIndex = (selectedOptionIndex + 1) % cards.length;
                        updateSelection();
                    } else if (e.key === 'Enter' || e.key === ' ') {
                        cards[selectedOptionIndex].click();
                    }
                }
            }

            // NPC選択画面のキーボード操作
            if (npcSelectScreen.style.display === 'flex') {
                const cards = document.querySelectorAll('#npc-container .powerup-card');
                if (cards.length > 0) {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        selectedNpcIndex = (selectedNpcIndex - 1 + cards.length) % cards.length;
                        updateNpcSelection();
                    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        selectedNpcIndex = (selectedNpcIndex + 1) % cards.length;
                        updateNpcSelection();
                    } else if (e.key === 'Enter' || e.key === ' ') {
                        cards[selectedNpcIndex].click();
                    }
                }
            }

            // 魔法発動キー
            if (e.key === 'z' || e.key === 'Z') castSpell('heal');
            if (e.key === 'x' || e.key === 'X') castSpell('firestorm');
            if (e.key === 'c' || e.key === 'C') castSpell('judgment');
            if (e.key === 'v' || e.key === 'V') castSpell('teleport');
            if (e.key === 't' || e.key === 'T') castSpell('time_stop');
            if (e.key === 'n' || e.key === 'N') castSpell('summon_golem');
            if (e.key === 'g' || e.key === 'G') castSpell('meteor');
            if (e.key === 'h' || e.key === 'H') castSpell('black_hole');
            if (e.key === 'j' || e.key === 'J') castSpell('haste');
            if (e.key === 'k' || e.key === 'K') castSpell('berserk');
            if (e.key === 'y' || e.key === 'Y') castSpell('ice_nova');
            if (e.key === 'u' || e.key === 'U') castSpell('reflect_shield');
            if (e.key === 'i' || e.key === 'I') castSpell('holy_ray');
            if (e.key === 'o' || e.key === 'O') castSpell('earthquake');
            if (e.key === 'p' || e.key === 'P') castSpell('chain_lightning');
            if (e.key === 'q' || e.key === 'Q') castSpell('shadow_clone');
        });
        window.addEventListener('keyup', e => keys[e.key] = false);
        
        startScreen.addEventListener('click', () => {
            if (!isGameStarted) startGame();
        });

        // マウス移動対応
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            mouseX = (e.clientX - rect.left) * scaleX;
            mouseY = (e.clientY - rect.top) * scaleY;
        });
        canvas.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            // ゲーム開始前ならクリックでスタート
            if (!isGameStarted && document.getElementById('start-screen').style.display !== 'none') {
                startGame();
            }
        });
        canvas.addEventListener('mouseup', () => isMouseDown = false);

        // タッチ操作対応（モバイル）: マウスドラッグ移動と同じ仕組み(isMouseDown/mouseX/mouseY)を再利用する
        function updateTouchPos(touch) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            mouseX = (touch.clientX - rect.left) * scaleX;
            mouseY = (touch.clientY - rect.top) * scaleY;
        }
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 0) return;
            updateTouchPos(e.touches[0]);
            isMouseDown = true;
        }, { passive: true });
        canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 0) return;
            updateTouchPos(e.touches[0]);
            e.preventDefault(); // ドラッグ中にページがスクロール/ズームしないようにする
        }, { passive: false });
        canvas.addEventListener('touchend', () => { isMouseDown = false; });
        canvas.addEventListener('touchcancel', () => { isMouseDown = false; });

        // ゲームパッド接続
        window.addEventListener("gamepadconnected", (e) => {
            gamepadIndex = e.gamepad.index;
            showChat("SYSTEM", "GAMEPAD CONNECTED", "#FFF");
        });
        window.addEventListener("gamepaddisconnected", (e) => {
            if (gamepadIndex === e.gamepad.index) gamepadIndex = null;
            showChat("SYSTEM", "GAMEPAD DISCONNECTED", "#FFF");
        });

        canvas.addEventListener('click', (e) => {
            if (gameOver && gameOverTimer > 150) {
                // マウス座標はmousemoveで更新済みだが、クリック時の座標計算をここで行う（object-fit考慮済み座標が必要な場合）
                // 簡易的に現在のmouseX, mouseYを使用（mousemoveで計算済みと仮定、ただしobject-fit補正は別途必要）
                // ここでは既存のロジックを維持しつつ、マウス座標変数を活用
                // ※mousemoveの計算はcanvas内座標なので、クリック判定にはそのまま使える

                const retryButton = { x: SCREEN_WIDTH / 2 - 160, y: SCREEN_HEIGHT / 2 + 110, width: 140, height: 40 };
                const titleButton = { x: SCREEN_WIDTH / 2 + 20, y: SCREEN_HEIGHT / 2 + 110, width: 140, height: 40 };

                // 座標補正（mousemoveと同様の計算が必要だが、ここでは簡略化のため既存ロジックを修正して使用）
                if ((mouseX > retryButton.x && mouseX < retryButton.x + retryButton.width && mouseY > retryButton.y && mouseY < retryButton.y + retryButton.height) ||
                    (mouseX > titleButton.x && mouseX < titleButton.x + titleButton.width && mouseY > titleButton.y && mouseY < titleButton.y + titleButton.height) ||
                    (mouseX > SCREEN_WIDTH / 2 - 100 && mouseX < SCREEN_WIDTH / 2 + 100 && mouseY > SCREEN_HEIGHT / 2 + 150 && mouseY < SCREEN_HEIGHT / 2 + 200)) { // テキストクリックも許容
                    location.reload();
                }
            }
        });

