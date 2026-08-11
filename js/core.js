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
        let currentDungeon = null;
        let dungeonInstanceCounter = 0;
        let dungeonReturnX = 0;
        let dungeonReturnY = 0;
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

        // --- 設定（音量・キーコンフィグ） ---
        const SETTINGS_STORAGE_KEY = 'monster_survivors_settings';
        const DEFAULT_KEY_BINDINGS = { up: 'w', down: 's', left: 'a', right: 'd', autoBattle: 'b', autoLevelUp: 'l', pause: '0', mute: 'm' };
        const CORE_ACTION_LABELS = { up: '上', down: '下', left: '左', right: '右', autoBattle: '自動戦闘 切替', autoLevelUp: '自動レベルアップ 切替', pause: 'ポーズ', mute: 'ミュート切替' };
        let keyBindings = Object.assign({}, DEFAULT_KEY_BINDINGS);
        let masterVolume = 1.0;
        let rebindingAction = null; // {type:'core', action} または {type:'spell', id}
        let spellKeyOverrides = null; // SPELLSがまだ定義されていない間、保存されたスペルキー上書きを一時保持
        let defaultSpellKeys = null; // リセット用に最初のSPELLS.keyを保持

        (function loadSettings() {
            try {
                const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || 'null');
                if (saved) {
                    if (typeof saved.volume === 'number') masterVolume = saved.volume;
                    if (saved.keyBindings) Object.assign(keyBindings, saved.keyBindings);
                    if (saved.spellKeys) spellKeyOverrides = saved.spellKeys;
                }
            } catch (e) {}
        })();

        function saveSettings() {
            const spellKeys = {};
            if (typeof SPELLS !== 'undefined') {
                SPELLS.forEach(s => { spellKeys[s.id] = s.key; });
            }
            try {
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ volume: masterVolume, keyBindings: keyBindings, spellKeys: spellKeys }));
            } catch (e) {}
        }

        function applySpellKeyOverrides() {
            if (typeof SPELLS === 'undefined') return;
            if (!defaultSpellKeys) {
                defaultSpellKeys = {};
                SPELLS.forEach(s => { defaultSpellKeys[s.id] = s.key; });
            }
            if (spellKeyOverrides) {
                SPELLS.forEach(s => { if (spellKeyOverrides[s.id]) s.key = spellKeyOverrides[s.id]; });
                spellKeyOverrides = null;
            }
        }

        function displayKey(k) {
            if (k === ' ') return 'Space';
            return k.length === 1 ? k.toUpperCase() : k;
        }

        function updateVolumeUI() {
            const slider = document.getElementById('volume-slider');
            const label = document.getElementById('volume-value');
            const pct = Math.round(masterVolume * 100);
            if (slider) slider.value = pct;
            if (label) label.innerText = pct + '%';
        }

        function updateKeyLabels() {
            ['autoBattle', 'autoLevelUp', 'mute'].forEach(action => {
                const el = document.getElementById('key-label-' + action);
                if (el) el.innerText = displayKey(keyBindings[action]);
            });
        }
        updateKeyLabels();

        function makeKeybindButton(label, currentKey, descriptor) {
            const btn = document.createElement('button');
            const isThis = rebindingAction && rebindingAction.type === descriptor.type &&
                (descriptor.type === 'core' ? rebindingAction.action === descriptor.action : rebindingAction.id === descriptor.id);
            btn.className = 'keybind-btn' + (isThis ? ' rebinding' : '');
            btn.innerHTML = `${label}<span>${isThis ? '...' : displayKey(currentKey)}</span>`;
            btn.onclick = () => { rebindingAction = descriptor; buildSettingsMenu(); };
            return btn;
        }

        function buildSettingsMenu() {
            const movementBox = document.getElementById('keybind-movement');
            const actionsBox = document.getElementById('keybind-actions');
            const spellsBox = document.getElementById('keybind-spells');
            if (!movementBox) return;
            movementBox.innerHTML = '';
            actionsBox.innerHTML = '';
            spellsBox.innerHTML = '';

            ['up', 'down', 'left', 'right'].forEach(action => {
                movementBox.appendChild(makeKeybindButton(CORE_ACTION_LABELS[action], keyBindings[action], { type: 'core', action }));
            });
            ['autoBattle', 'autoLevelUp', 'pause', 'mute'].forEach(action => {
                actionsBox.appendChild(makeKeybindButton(CORE_ACTION_LABELS[action], keyBindings[action], { type: 'core', action }));
            });
            if (typeof SPELLS !== 'undefined') {
                SPELLS.slice().sort((a, b) => a.level - b.level).forEach(spell => {
                    spellsBox.appendChild(makeKeybindButton(spell.name, spell.key, { type: 'spell', id: spell.id }));
                });
            }
        }

        function captureRebind(key) {
            if (key === 'Escape') {
                rebindingAction = null;
                buildSettingsMenu();
                return;
            }
            const displayValue = key.length === 1 ? key.toUpperCase() : key;
            const matchValue = key.length === 1 ? key.toLowerCase() : key;
            if (rebindingAction.type === 'core') {
                keyBindings[rebindingAction.action] = matchValue;
            } else if (rebindingAction.type === 'spell' && typeof SPELLS !== 'undefined') {
                const spell = SPELLS.find(s => s.id === rebindingAction.id);
                if (spell) spell.key = displayValue;
                if (typeof updateSpellUI === 'function') updateSpellUI();
            }
            rebindingAction = null;
            saveSettings();
            buildSettingsMenu();
            updateKeyLabels();
        }

        function openSettings() {
            if (levelUpScreen.style.display === 'flex' || npcSelectScreen.style.display === 'flex' ||
                document.getElementById('chest-screen').style.display === 'flex') return;
            document.getElementById('settings-screen').style.display = 'flex';
            updateVolumeUI();
            buildSettingsMenu();
            if (isGameStarted) isPaused = true;
        }

        function closeSettings() {
            rebindingAction = null;
            document.getElementById('settings-screen').style.display = 'none';
            if (isGameStarted && isPaused) {
                isPaused = false;
                gameLoop();
            }
        }

        function resetSettings() {
            Object.assign(keyBindings, DEFAULT_KEY_BINDINGS);
            if (typeof SPELLS !== 'undefined' && defaultSpellKeys) {
                SPELLS.forEach(s => { s.key = defaultSpellKeys[s.id]; });
                if (typeof updateSpellUI === 'function') updateSpellUI();
            }
            if (typeof Audio !== 'undefined') Audio.setVolume(1.0);
            updateVolumeUI();
            saveSettings();
            buildSettingsMenu();
            updateKeyLabels();
        }

        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const v = parseInt(e.target.value, 10) / 100;
                if (typeof Audio !== 'undefined') Audio.setVolume(v);
                else masterVolume = v;
                updateVolumeUI();
                saveSettings();
            });
        }

        // --- メタプログレッション（ラン間の永続強化） ---
        const META_STORAGE_KEY = 'monster_survivors_meta';
        const META_UPGRADES = [
            { id: 'might', name: '攻撃力強化', desc: '開始時の攻撃力+2%', maxLevel: 10, baseCost: 20, apply: (p, lvl) => { p.damage += 0.02 * lvl; } },
            { id: 'vitality', name: '体力強化', desc: '開始時の最大HP+20', maxLevel: 10, baseCost: 20, apply: (p, lvl) => { p.maxHp += 20 * lvl; p.hp = p.maxHp; } },
            { id: 'mana', name: '魔力強化', desc: '開始時の最大MP+10', maxLevel: 10, baseCost: 15, apply: (p, lvl) => { p.maxMp += 10 * lvl; p.mp = p.maxMp; } },
            { id: 'speed', name: '俊足強化', desc: '開始時の移動速度+0.1', maxLevel: 5, baseCost: 30, apply: (p, lvl) => { p.speed += 0.1 * lvl; } },
            { id: 'luck', name: '幸運強化', desc: '開始時の運+5%（ドロップ率上昇）', maxLevel: 10, baseCost: 20, apply: (p, lvl) => { p.luck += 0.05 * lvl; } },
            { id: 'magnet', name: '収集範囲強化', desc: '開始時のアイテム収集半径+10', maxLevel: 10, baseCost: 15, apply: (p, lvl) => { p.magnet += 10 * lvl; } },
            { id: 'greed', name: '強欲の心得', desc: 'スコア獲得量+5%（獲得できる魂の欠片も比例して増加）', maxLevel: 10, baseCost: 25, apply: (p, lvl) => { p.greed += 0.05 * lvl; } },
            { id: 'revive', name: '不屈の魂', desc: '開始時の復活回数+1', maxLevel: 3, baseCost: 150, apply: (p, lvl) => { p.revive += lvl; } },
        ];
        let metaState = { shards: 0, upgrades: {} };

        (function loadMetaState() {
            try {
                const saved = JSON.parse(localStorage.getItem(META_STORAGE_KEY) || 'null');
                if (saved) {
                    if (typeof saved.shards === 'number') metaState.shards = saved.shards;
                    if (saved.upgrades) metaState.upgrades = saved.upgrades;
                }
            } catch (e) {}
        })();

        function saveMetaState() {
            try {
                localStorage.setItem(META_STORAGE_KEY, JSON.stringify(metaState));
            } catch (e) {}
        }

        function updateShardDisplays() {
            const startEl = document.getElementById('start-shard-count');
            if (startEl) startEl.innerText = metaState.shards;
            const storeEl = document.getElementById('meta-shards');
            if (storeEl) storeEl.innerText = metaState.shards;
        }
        updateShardDisplays();

        // ランで得たスコアの一部を永続通貨（魂の欠片）に変換する。saveScore()から呼ばれる
        function earnMetaShards(finalScore) {
            const earned = Math.floor(finalScore / 10);
            if (earned > 0) {
                metaState.shards += earned;
                saveMetaState();
                updateShardDisplays();
            }
            return earned;
        }

        // ラン開始時（startGame内）に、購入済みの永続強化をプレイヤーに適用する
        function applyMetaUpgrades() {
            META_UPGRADES.forEach(u => {
                const level = metaState.upgrades[u.id] || 0;
                if (level > 0) u.apply(player, level);
            });
        }

        function buildMetaStoreMenu() {
            const list = document.getElementById('meta-store-list');
            if (!list) return;
            list.innerHTML = '';
            META_UPGRADES.forEach(u => {
                const level = metaState.upgrades[u.id] || 0;
                const maxed = level >= u.maxLevel;
                const cost = u.baseCost * (level + 1);
                const row = document.createElement('div');
                row.className = 'meta-store-row';
                row.innerHTML = `
                    <div class="meta-store-info">
                        <div class="meta-store-title">${u.name}<span class="meta-store-level">Lv.${level}/${u.maxLevel}</span></div>
                        <div class="meta-store-desc">${u.desc}</div>
                    </div>
                    <button class="chest-btn meta-buy-btn" ${maxed ? 'disabled' : (metaState.shards < cost ? 'disabled' : '')}>${maxed ? 'MAX' : `💎${cost}`}</button>
                `;
                row.querySelector('.meta-buy-btn').onclick = () => buyMetaUpgrade(u.id);
                list.appendChild(row);
            });
            updateShardDisplays();
        }

        function buyMetaUpgrade(id) {
            const u = META_UPGRADES.find(x => x.id === id);
            if (!u) return;
            const level = metaState.upgrades[id] || 0;
            if (level >= u.maxLevel) return;
            const cost = u.baseCost * (level + 1);
            if (metaState.shards < cost) return;
            metaState.shards -= cost;
            metaState.upgrades[id] = level + 1;
            saveMetaState();
            buildMetaStoreMenu();
        }

        function openMetaStore() {
            document.getElementById('meta-store-screen').style.display = 'flex';
            buildMetaStoreMenu();
        }

        function closeMetaStore() {
            document.getElementById('meta-store-screen').style.display = 'none';
        }

        // --- キーボードのみでの操作用: タイトル画面・エンディング画面のボタン選択 ---
        let selectedStartIndex = 0;
        let selectedEndingIndex = 0;

        function isAnyTitleModalOpen() {
            return document.getElementById('settings-screen').style.display === 'flex' ||
                document.getElementById('meta-store-screen').style.display === 'flex' ||
                document.getElementById('ranking-screen').style.display === 'flex';
        }

        function updateStartSelection() {
            const btns = document.querySelectorAll('.start-menu-btn');
            btns.forEach((b, i) => b.classList.toggle('selected', i === selectedStartIndex));
        }
        updateStartSelection();

        function updateEndingSelection() {
            const btns = document.querySelectorAll('.ending-menu-btn');
            btns.forEach((b, i) => b.classList.toggle('selected', i === selectedEndingIndex));
        }
        updateEndingSelection();

        // --- 入力管理 ---
        const keys = {};
        window.addEventListener('keydown', e => {
            if (rebindingAction) {
                e.preventDefault();
                captureRebind(e.key);
                return;
            }

            if (e.key === 'Escape') {
                if (document.getElementById('settings-screen').style.display === 'flex') {
                    closeSettings();
                } else if (document.getElementById('meta-store-screen').style.display === 'flex') {
                    closeMetaStore();
                } else if (document.getElementById('ranking-screen').style.display === 'flex') {
                    closeRanking();
                } else if (isGameStarted) {
                    openSettings();
                }
                return;
            }

            keys[e.key] = true;

            if (!isGameStarted) {
                // 設定/ストア/ランキングが開いている間は、Tabで選んだボタンのEnter操作などを
                // 妨げないよう「何かキーを押したらゲーム開始」を発動させない
                if (isAnyTitleModalOpen()) return;

                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    selectedStartIndex = (selectedStartIndex - 1 + 3) % 3;
                    updateStartSelection();
                    return;
                }
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    selectedStartIndex = (selectedStartIndex + 1) % 3;
                    updateStartSelection();
                    return;
                }
                if (e.key === 'Enter' || e.key === ' ') {
                    const btns = document.querySelectorAll('.start-menu-btn');
                    if (btns[selectedStartIndex]) btns[selectedStartIndex].click();
                    return;
                }
                startGame();
                return;
            }

            const settingsOpenMidGame = document.getElementById('settings-screen').style.display === 'flex';

            // ゲームオーバー画面のリトライ/タイトルへ（両ボタンとも動作は同じ）
            if (!settingsOpenMidGame && gameOver && gameOverTimer > 150 && (e.key === 'Enter' || e.key === ' ')) {
                location.reload();
                return;
            }

            // エンディング画面のボタン選択
            if (!settingsOpenMidGame && document.getElementById('ending-screen').style.display === 'flex') {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    selectedEndingIndex = (selectedEndingIndex - 1 + 2) % 2;
                    updateEndingSelection();
                    return;
                }
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    selectedEndingIndex = (selectedEndingIndex + 1) % 2;
                    updateEndingSelection();
                    return;
                }
                if (e.key === 'Enter' || e.key === ' ') {
                    const btns = document.querySelectorAll('.ending-menu-btn');
                    if (btns[selectedEndingIndex]) btns[selectedEndingIndex].click();
                    return;
                }
            }

            if (e.key.toLowerCase() === keyBindings.autoBattle) {
                isAutoBattle = !isAutoBattle;
                autoBattleEl.innerText = isAutoBattle ? 'ON' : 'OFF';
                autoBattleEl.style.color = isAutoBattle ? '#00ff00' : '#fff';
            }

            if (e.key.toLowerCase() === keyBindings.autoLevelUp) {
                isAutoLevelUp = !isAutoLevelUp;
                autoLevelupEl.innerText = isAutoLevelUp ? 'ON' : 'OFF';
                autoLevelupEl.style.color = isAutoLevelUp ? '#00ff00' : '#fff';
            }

            if (e.key.toLowerCase() === keyBindings.pause) {
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

            if (e.key.toLowerCase() === keyBindings.mute) {
                Audio.toggleMute();
                updateVolumeUI();
                saveSettings();
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

            // 魔法発動キー（SPELLS配列のkeyプロパティを直接参照するため、キーコンフィグでの変更がそのまま反映される）
            if (typeof SPELLS !== 'undefined') {
                const pressed = e.key.toUpperCase();
                SPELLS.forEach(spell => {
                    if (pressed === spell.key) castSpell(spell.id);
                });
            }
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

