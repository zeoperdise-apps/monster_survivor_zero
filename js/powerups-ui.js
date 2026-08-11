        // --- ゲーム初期化 ---
        const player = new Player();
        const enemies = [];
        const bullets = [];
        const enemyBullets = [];
        const gems = [];
        const mpPotions = [];
        const slashes = [];
        const potions = [];
        const axes = [];
        const novas = [];
        const particles = [];
        const daggers = [];
        const wands = [];
        const fireballs = [];
        const lightnings = [];
        const chests = [];
        const uniqueDrops = [];
        const pets = [];
        const fairyItems = [];
        const legendDrops = [];
        const contracts = [];
        const npcs = [];
        const activeWeapons = []; // 新規武器用配列

        // --- パワーアップシステム ---
        const POWERUPS = [
            { id: 'atk_speed', name: '攻撃速度', desc: '攻撃の間隔が短くなる', weight: 5 },
            { id: 'move_speed', name: '移動速度', desc: '移動スピードが上がる' },
            { id: 'bullet_speed', name: '剣速', desc: '攻撃が速くなる' },
            { id: 'max_hp', name: '最大HP', desc: '最大HPが20増える' },
            { id: 'heal', name: '回復', desc: 'HPを50%回復する' },
            { id: 'bible', name: '聖書', desc: '周囲を回転する聖書を追加' },
            { id: 'axe', name: '斧', desc: '上空へ斧を投げつける' },
            { id: 'aura', name: 'オーラ', desc: '周囲の敵にダメージを与える' },
            { id: 'nova', name: 'ノヴァ', desc: '全方位に広がる衝撃波を放つ' },
            { id: 'might', name: '攻撃力', desc: '与えるダメージが10%増加', weight: 5 },
            { id: 'area', name: '攻撃範囲', desc: '攻撃サイズが10%増加', weight: 5 },
            { id: 'magnet', name: '磁石', desc: 'アイテム回収範囲が広がる' },
            { id: 'armor', name: '防御力', desc: '受けるダメージを1減らす' },
            { id: 'regen', name: '自然回復', desc: 'HPが徐々に回復する' },
            { id: 'luck', name: '運', desc: 'アイテムドロップ率が上がる' },
            { id: 'amount', name: '複製', desc: '発射する弾の数が増える', weight: 2 },
            { id: 'dagger', name: 'ナイフ', desc: '向いている方向にナイフを投げる' },
            { id: 'wand', name: '魔法の杖', desc: '近くの敵に魔法弾を放つ' },
            { id: 'lightning', name: '雷の指輪', desc: 'ランダムな敵に雷を落とす' },
            { id: 'fireball', name: '火の玉', desc: 'ランダムな方向に火の玉を放つ' },
            { id: 'boomerang', name: 'ブーメラン', desc: '戻ってくる武器を投げる' },
            { id: 'mine', name: '地雷', desc: '踏むと爆発する地雷を設置' },
            { id: 'tornado', name: '竜巻', desc: 'ランダムに動く竜巻を発生' },
            { id: 'shuriken', name: '手裏剣', desc: '高速で飛ぶ手裏剣を投げる' },
            { id: 'holy_water', name: '聖水', desc: 'ダメージエリアを生成する' },
            { id: 'spear', name: '槍', desc: '前方を突き刺す' },
            { id: 'whip', name: '鞭', desc: '横方向を攻撃する' },
            { id: 'chakram', name: 'チャクラム', desc: '周囲に滞留する刃' },
            { id: 'scythe', name: '大鎌', desc: '回転する鎌を投げる' },
            { id: 'bomb', name: '爆弾', desc: '爆発する爆弾を投げる' },
            { id: 'bow', name: '弓', desc: '近くの敵に矢を放つ' },
            { id: 'musket', name: 'マスケット銃', desc: '高威力の銃弾を撃ち込む' },
            { id: 'growth', name: '成長', desc: '経験値獲得量が10%増加', weight: 5 },
            { id: 'greed', name: '強欲', desc: 'スコア獲得量が10%増加', weight: 5 },
            { id: 'revive', name: '復活', desc: '復活回数+1' },
            { id: 'knockback', name: 'ノックバック', desc: '敵を吹き飛ばす力が強くなる' },
            { id: 'duration', name: '持続時間', desc: '武器の効果時間が延びる' },
            { id: 'curse', name: '呪い', desc: '敵が強くなるが経験値も増える' },
            { id: 'crit_rate', name: 'クリティカル率', desc: 'クリティカル率が5%増加' },
            { id: 'crit_damage', name: 'クリティカル威力', desc: 'クリティカルダメージが増加' },
            { id: 'dodge', name: '回避', desc: '回避率が5%増加' },
            { id: 'vampirism', name: '吸血', desc: '敵を倒すと稀にHP回復' },
        ];

        function showLevelUpOptions() {
            // ランダムに3つ選ぶ (重複なし)
            const options = [];
            // max_hp と revive を除いたプールを作成 (宝箱限定にする)
            let pool = POWERUPS.filter(p => p.id !== 'max_hp' && p.id !== 'revive');

            for (let i = 0; i < 3; i++) {
                if (pool.length === 0) break;
                
                // 重み付き抽選
                const totalWeight = pool.reduce((sum, p) => sum + (p.weight || 10), 0);
                let r = Math.random() * totalWeight;
                let selectedIdx = -1;
                for(let j=0; j<pool.length; j++) {
                    r -= (pool[j].weight || 10);
                    if (r < 0) { selectedIdx = j; break; }
                }
                
                if (selectedIdx !== -1) {
                    options.push(pool[selectedIdx]);
                    pool.splice(selectedIdx, 1);
                }
            }

            if (isAutoLevelUp && options.length > 0) {
                // オートレベルアップの場合、UIは表示せず自動で選択してゲームを続行する
                applyPowerUp(options[0].id);
                // 他のイベント(宝箱など)でゲームがポーズされている可能性を考慮し、
                // ポーズ状態を解除してゲームループを再開する。
                if (isPaused) {
                    levelUpScreen.style.display = 'none';
                    isPaused = false;
                    gameLoop();
                }
                return; // この後のUI表示処理は行わない
            }

            isPaused = true;
            levelUpScreen.style.display = 'flex';
            powerUpContainer.innerHTML = '';
            
            // ステータス表示更新
            statsContainer.innerHTML = `
                <div>攻撃力: ${Math.round(player.damage * 100)}%</div>
                <div>攻撃範囲: ${Math.round(player.area * 100)}%</div>
                <div>移動速度: ${player.speed.toFixed(1)}</div>
                <div>弾速: ${bulletSpeed.toFixed(1)}</div>
                <div>防御力: ${player.armor}</div>
                <div>回復力: ${player.regen}</div>
                <div>運: ${Math.round(player.luck * 100)}%</div>
                <div>弾数増加: +${player.amount}</div>`;
            selectedOptionIndex = 0;

            options.forEach((opt, index) => {
                const div = document.createElement('div');
                div.className = 'powerup-card';
                if (index === 0) div.classList.add('selected'); // 初期選択
                
                let iconHtml = '';
                if (SPRITES[opt.id]) {
                    iconHtml = `<div style="display:flex;justify-content:center;margin-bottom:10px;"><img src="${SPRITES[opt.id].toDataURL()}" width="64" height="64" style="image-rendering:pixelated;"></div>`;
                }

                div.innerHTML = `${iconHtml}<div class="powerup-title">${opt.name}</div><div>${opt.desc}</div>`;
                div.onclick = () => selectPowerUp(opt.id);
                powerUpContainer.appendChild(div);
            });
        }

        function updateSelection() {
            const cards = document.querySelectorAll('.powerup-card');
            cards.forEach((card, index) => {
                if (index === selectedOptionIndex) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });
        }

        function showNpcSelection() {
            if (isAutoLevelUp) {
                const randomJob = NPC_JOBS[Math.floor(Math.random() * NPC_JOBS.length)];
                selectNpcJob(randomJob.id);
                return;
            }

            isPaused = true;
            npcSelectScreen.style.display = 'flex';
            npcContainer.innerHTML = '';
            selectedNpcIndex = 0;

            // 既に加入している職業と隠し職業を除外
            const currentJobs = npcs.map(n => n.job);
            const availableJobs = NPC_JOBS.filter(job => !currentJobs.includes(job.id) && !job.hidden);
            
            availableJobs.forEach((job, index) => {
                const div = document.createElement('div');
                div.className = 'powerup-card';
                if (index === 0) div.classList.add('selected');
                div.style.borderColor = job.color;
                div.title = NPC_RECRUIT_COMMENTS[job.id] || ""; // ツールチップ
                div.innerHTML = `<div class="powerup-title" style="color:${job.color}">${job.name}</div><div>${job.desc}</div>`;
                div.onclick = () => selectNpcJob(job.id);
                npcContainer.appendChild(div);
            });
        }

        function updateNpcSelection() {
            const cards = document.querySelectorAll('#npc-container .powerup-card');
            cards.forEach((card, index) => {
                if (index === selectedNpcIndex) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });
        }

        function showDialog(name, text, callback, duration = 0) {
            const box = document.getElementById('dialog-box');
            box.style.display = 'block';
            box.innerHTML = `<div style="font-weight:bold; color:#FFD700; margin-bottom:5px;">${name}</div><div>${text}</div><div style="font-size:12px; margin-top:10px; color:#AAA;">${duration > 0 ? '' : '(CLICK TO CONTINUE)'}</div>`;
            
            let timeoutId = null;
            function onClick() {
                if (timeoutId) clearTimeout(timeoutId);
                box.style.display = 'none';
                document.removeEventListener('click', onClick);
                document.removeEventListener('keydown', onKey);
                if (callback) callback();
            }
            function onKey(e) {
                if (e.key === ' ' || e.key === 'Enter') onClick();
            }
            
            if (duration > 0) {
                timeoutId = setTimeout(onClick, duration);
            } else {
                setTimeout(() => {
                    document.addEventListener('click', onClick);
                    document.addEventListener('keydown', onKey);
                }, 100);
            }
        }

        let chatTimeout = null;
        function showChat(name, text, color) {
            const box = document.getElementById('chat-box');
            box.style.display = 'block';
            box.style.borderColor = color || '#333';
            box.innerHTML = `<span style="color:${color||'#000'}; font-weight:900;">${name}</span>: ${text}`;
            
            if (chatTimeout) clearTimeout(chatTimeout);
            // 3秒後に消える
            chatTimeout = setTimeout(() => { box.style.display = 'none'; }, 3000);
        }

        function selectNpcJob(jobId) {
            const pc = player.getCenter();
            npcs.push(new NPC(pc.x + (Math.random()-0.5)*50, pc.y + (Math.random()-0.5)*50, jobId));
            npcSelectScreen.style.display = 'none';
            
            // 村を削除（プレイヤーに近い村を探して削除）
            let nearestVillageIndex = -1;
            let minDist = Infinity;
            villages.forEach((v, i) => {
                const d = Math.hypot(v.x - player.x, v.y - player.y);
                if (d < minDist) { minDist = d; nearestVillageIndex = i; }
            });
            if (nearestVillageIndex !== -1) villages.splice(nearestVillageIndex, 1);

            const jobName = NPC_JOBS.find(j => j.id === jobId)?.name || "NPC";
            showChat(jobName, NPC_QUOTES[jobId] || "よろしく頼む。", NPC_JOBS.find(j=>j.id===jobId)?.color);
            
            if (isPaused) {
                isPaused = false;
                gameLoop();
            }
        }

        function applyPowerUp(id) {
            if (id === 'atk_speed') {
                attackCooldown = Math.max(5, attackCooldown - 2);
            } else if (id === 'move_speed') {
                player.speed += 0.5;
            } else if (id === 'bullet_speed') {
                bulletSpeed += 1;
            } else if (id === 'max_hp') {
                player.maxHp += 20;
                player.hp += 20;
                hpBar.style.width = (player.hp / player.maxHp * 100) + "%";
                hpText.innerText = Math.max(0, Math.floor(player.hp));
            } else if (id === 'heal') {
                player.hp = Math.min(player.hp + player.maxHp * 0.5, player.maxHp);
                hpBar.style.width = (player.hp / player.maxHp * 100) + "%";
                hpText.innerText = Math.max(0, Math.floor(player.hp));
            } else if (id === 'bible') {
                player.bibleCount++;
            } else if (id === 'axe') {
                player.axeLevel++;
            } else if (id === 'aura') {
                player.auraLevel++;
            } else if (id === 'nova') {
                player.novaLevel++;
            } else if (id === 'might') {
                player.damage += 0.1;
            } else if (id === 'area') {
                player.area += 0.1;
            } else if (id === 'magnet') {
                player.magnet += 25;
            } else if (id === 'armor') {
                player.armor += 1;
            } else if (id === 'regen') {
                player.regen += 1;
            } else if (id === 'luck') {
                player.luck += 0.2;
            } else if (id === 'amount') {
                player.amount += 1;
            } else if (id === 'dagger') {
                player.daggerLevel++;
            } else if (id === 'wand') {
                player.wandLevel++;
            } else if (id === 'lightning') {
                player.lightningLevel++;
            } else if (id === 'fireball') {
                player.fireballLevel++;
            } else if (id === 'boomerang') player.boomerangLevel++;
            else if (id === 'mine') player.mineLevel++;
            else if (id === 'tornado') player.tornadoLevel++;
            else if (id === 'shuriken') player.shurikenLevel++;
            else if (id === 'holy_water') player.holyWaterLevel++;
            else if (id === 'spear') player.spearLevel++;
            else if (id === 'whip') player.whipLevel++;
            else if (id === 'chakram') player.chakramLevel++;
            else if (id === 'scythe') player.scytheLevel++;
            else if (id === 'bomb') player.bombLevel++;
            else if (id === 'bow') player.bowLevel++;
            else if (id === 'musket') player.musketLevel++;
            else if (id === 'growth') player.growth += 0.1;
            else if (id === 'greed') player.greed += 0.1;
            else if (id === 'revive') player.revive++;
            else if (id === 'knockback') player.knockback += 0.2;
            else if (id === 'duration') player.duration += 0.1;
            else if (id === 'curse') player.curse += 0.1;
            else if (id === 'crit_rate') player.critRate += 0.05;
            else if (id === 'crit_damage') player.critDamage += 0.2;
            else if (id === 'dodge') player.dodge += 0.05;
            else if (id === 'vampirism') player.vampirism += 0.01;
            
            acquiredItems[id] = (acquiredItems[id] || 0) + 1;
            updateInventory();
            Audio.levelUp(); // レベルアップ音は選択時ではなく画面表示時の方が良いかもだが、ここでは適用時に鳴らす
        }

        function selectPowerUp(id) {
            applyPowerUp(id);
            levelUpScreen.style.display = 'none';
            isPaused = false;
            gameLoop();
        }

        function updateInventory() {
            const container = document.getElementById('inventory');
            container.innerHTML = '';
            for (const [id, level] of Object.entries(acquiredItems)) {
                const slot = document.createElement('div');
                slot.className = 'inv-slot';
                
                // ツールチップ用の情報を設定
                let perk = POWERUPS.find(p => p.id === id);
                if (!perk) { // POWERUPSにない特殊アイテムの情報を補完
                    if (id === 'legend_weapon') perk = { name: 'レジェンドソード', desc: '自律攻撃する伝説の剣' };
                    else if (id === 'pet') perk = { name: '妖精', desc: 'プレイヤーを追従して攻撃する' };
                }

                if (perk) slot.setAttribute('data-tooltip', `${perk.name || id}\n${perk.desc || ''}\nLv.${level}`);
                
                const canvas = SPRITES[id];
                if (canvas) {
                    const img = document.createElement('img');
                    img.src = canvas.toDataURL();
                    slot.appendChild(img);
                }
                
                const lvlDiv = document.createElement('div');
                lvlDiv.className = 'inv-level';
                lvlDiv.innerText = level;
                slot.appendChild(lvlDiv);
                
                container.appendChild(slot);
            }
        }

        function getNearestEnemy(origin = player.getCenter()) {
            let nearest = null;
            let minDist = Infinity;

            for (const enemy of enemies) {
                const ec = enemy.getCenter();
                const dist = Math.hypot(origin.x - ec.x, origin.y - ec.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = enemy;
                }
            }
            return nearest;
        }

        function getBiome(x, y) {
            const scale = 0.0005;
            const noise = Math.sin(x * scale) + Math.cos(y * scale);
            if (noise > 1.0) return 'forest';
            if (noise > 0.2) return 'grassland';
            if (noise > -0.8) return 'wasteland';
            return 'cursed';
        }

        function checkEvolution() {
            for (const evo of EVOLUTIONS) {
                const weaponLevel = player[evo.weapon + 'Level'];
                const passiveLevel = acquiredItems[evo.passive] || 0;
                const isEvolved = player.evolved[evo.weapon];

                if (weaponLevel >= 8 && passiveLevel >= 1 && !isEvolved) {
                    return evo;
                }
            }
            return null;
        }

        function spawnLoot(e) {
            enemiesDefeated++;
            if (ENEMY_DATA[e.type].isBoss) {
                whiteFlashOpacity = 1.0;
                slowMotionTimer = 180; // 3秒間スローモーション
                
                if (Math.random() < 0.01 * player.luck) {
                    // ボスはレジェンド武器を確定ドロップ (運 * 1%)
                    legendDrops.push(new LegendWeaponDrop(e.x, e.y));
                } else {
                    chests.push(new Chest(e.x, e.y));
                }
            } else {
                // 盗賊ボーナス: 盗賊1人につきドロップ率 +100% (2倍)
                const thiefCount = npcs.filter(n => n.job === 'thief' && !n.isDead).length;
                const dropBonus = 1 + thiefCount;

                // 妖精アイテムドロップ (0.2% * 運)
                if (Math.random() < 0.002 * player.luck * dropBonus) {
                    fairyItems.push(new FairyItem(e.x, e.y));
                }

                gems.push(new Gem(e.x, e.y, e.xpValue * player.curse)); // 呪いでXP増加
            }
            
            if (e.type === 'large_boss') {
                largeBossDefeatedCount++;
            }

            // ボス撃破カウントとラージボス出現判定 (全ての武器での撃破に対応するためここに移動)
            if (ENEMY_DATA[e.type].isBoss && e.type !== 'large_boss' && e.type !== 'final_boss') {
                bossDefeatedCount++;
                if (bossDefeatedCount % 4 === 0) {
                    const lb = new Enemy('large_boss', player);
                    enemies.push(lb);
                    if (BOSS_QUOTES['large_boss']) lb.speak(BOSS_QUOTES['large_boss'][0]);
                }
            }
        }

        function spawnExplosion(x, y, color, count = 5) {
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(x, y, color));
            }
        }

        function spawnHitEffect(x, y) {
            for (let i = 0; i < 3; i++) {
                const p = new Particle(x, y, '#FFF');
                p.vx *= 2; p.vy *= 2;
                p.life = 0.5;
                particles.push(p);
            }
        }

        function openChest() {
            Audio.chest();
            isPaused = true;
            const chestScreen = document.getElementById('chest-screen');
            const chestItems = document.getElementById('chest-items');
            chestScreen.style.display = 'flex';
            chestItems.innerHTML = ''; 
            
            // 進化チェック
            const evolution = checkEvolution();
            
            if (evolution) {
                // 進化イベント
                player.evolved[evolution.weapon] = true;
                Audio.legend();
                
                const div = document.createElement('div');
                div.className = 'chest-item';
                div.style.width = '300px';
                div.style.borderColor = '#00FFFF';
                div.style.boxShadow = '0 0 20px #00FFFF';
                div.innerHTML = `<div class="powerup-title" style="font-size:28px; color:#00FFFF">EVOLUTION!</div>
                                 <div class="powerup-title">${evolution.name}</div>
                                 <div style="font-size:16px">${evolution.desc}</div>`;
                chestItems.appendChild(div);
            } else {
                // 通常の宝箱 (3つのランダムアイテム)
                const chestPool = POWERUPS.filter(p => p.id !== 'legend_weapon' && p.id !== 'pet');
                for(let i=0; i<3; i++) {
                    const opt = chestPool[Math.floor(Math.random() * chestPool.length)];
                    applyPowerUp(opt.id); // Apply immediately
                    
                    const div = document.createElement('div');
                    div.className = 'chest-item';
                    div.style.animationDelay = (i * 0.2) + 's';
                    div.innerHTML = `<div class="powerup-title" style="font-size:18px">${opt.name}</div><div style="font-size:14px">${opt.desc}</div>`;
                    chestItems.appendChild(div);
                }
            }
            
            if (isAutoLevelUp) {
                setTimeout(() => closeChest(), 500);
            }

            // Gamepad polling for chest
            function checkChestInput() {
                if (chestScreen.style.display !== 'flex') return;
                const gamepads = navigator.getGamepads();
                for (const gp of gamepads) {
                    if (gp && gp.buttons[0].pressed) { // Button A/Cross
                        closeChest();
                        return;
                    }
                }
                requestAnimationFrame(checkChestInput);
            }
            requestAnimationFrame(checkChestInput);
        }

        function closeChest() {
            const screen = document.getElementById('chest-screen');
            if (screen.style.display === 'none') return;
            screen.style.display = 'none';
            isPaused = false;
            gameLoop();
        }

        function drawEnding() {
            const screen = document.getElementById('ending-screen');
            const h1 = screen.querySelector('h1');
            const p = screen.querySelector('p');
            
            if (isTrueEnding) {
                h1.innerText = "TRUE ENDING";
                h1.style.color = "#FF00FF";
                p.innerHTML = "裏魔王を倒し、真の平和が訪れた。<br>伝説の英雄として、その名は永遠に語り継がれるだろう。";
            } else {
                h1.innerText = "CONGRATULATIONS!";
                h1.style.color = "#FFD700";
                p.innerText = "あなたは魔王を倒した。そして世界に平和が訪れた";
            }
            
            document.getElementById('ending-screen').style.display = 'flex';
            Audio.playBGM('ending');
        }

        function continueGame() {
            document.getElementById('ending-screen').style.display = 'none';
            gameClear = false;
            finalBossSpawned = false; // クリア判定ループを防ぐためにリセット
            largeBossDefeatedCount = 0;
            bossDefeatedCount = 0;
            gameLoop();
        }

        function getObstacle(cellX, cellY) {
            // スタート地点周辺は障害物なし
            if (destroyedObstacles.has(`${cellX},${cellY}`)) return null;
            if (Math.abs(cellX) < 5 && Math.abs(cellY) < 5) return null;
            
            const hash = Math.abs((cellX * 73856093) ^ (cellY * 19349663));
            if (hash % 40 === 0) return 'obstacle'; // 岩
            if (hash % 40 === 1) return 'obstacle_tree'; // 木
            if (hash % 40 === 2) return 'obstacle_ruin'; // 遺跡
            return null;
        }

        function getAvoidanceVector(entity, strength) {
            const gridX = Math.floor((entity.x + entity.width/2) / 100);
            const gridY = Math.floor((entity.y + entity.height/2) / 100);
            
            let moveX = 0;
            let moveY = 0;

            for (let x = gridX - 1; x <= gridX + 1; x++) {
                for (let y = gridY - 1; y <= gridY + 1; y++) {
                    if (getObstacle(x, y)) {
                        const obsCX = x * 100 + 50;
                        const obsCY = y * 100 + 50;
                        const dist = Math.hypot((entity.x + entity.width/2) - obsCX, (entity.y + entity.height/2) - obsCY);
                        
                        if (dist < 100) { // Detection radius
                            const angle = Math.atan2((entity.y + entity.height/2) - obsCY, (entity.x + entity.width/2) - obsCX);
                            moveX += Math.cos(angle) * strength;
                            moveY += Math.sin(angle) * strength;
                        }
                    }
                }
            }
            return { x: moveX, y: moveY };
        }

        function checkObstacleCollision(entity) {
            const gridSize = 100;
            const startX = Math.floor(entity.x / gridSize);
            const endX = Math.floor((entity.x + entity.width) / gridSize);
            const startY = Math.floor(entity.y / gridSize);
            const endY = Math.floor((entity.y + entity.height) / gridSize);

            for (let x = startX; x <= endX; x++) {
                for (let y = startY; y <= endY; y++) {
                    if (getObstacle(x, y)) {
                        const obsX = x * gridSize + 10;
                        const obsY = y * gridSize + 10;
                        const obsW = 80;
                        const obsH = 80;

                        if (entity.x < obsX + obsW && entity.x + entity.width > obsX &&
                            entity.y < obsY + obsH && entity.y + entity.height > obsY) {
                            
                            const ecx = entity.x + entity.width/2;
                            const ecy = entity.y + entity.height/2;
                            const ocx = obsX + obsW/2;
                            const ocy = obsY + obsH/2;
                            const dx = ecx - ocx;
                            const dy = ecy - ocy;
                            
                            const overlapX = (entity.width + obsW)/2 - Math.abs(dx);
                            const overlapY = (entity.height + obsH)/2 - Math.abs(dy);

                            if (overlapX < overlapY) entity.x += dx > 0 ? overlapX : -overlapX;
                            else entity.y += dy > 0 ? overlapY : -overlapY;
                        }
                    }
                }
            }
        }

        function checkObstacleInteraction() {
            const lists = [bullets, slashes, axes, novas, daggers, wands, fireballs, activeWeapons];
            for (const list of lists) {
                for (const w of list) {
                    if (!w.active) continue;
                    // 武器本体（ランチャー）は障害物に干渉しない
                    if (w instanceof BowWeapon || w instanceof MusketWeapon) continue;

                    // 武器の中心座標のグリッドを確認
                    const cx = w.x + (w.width ? w.width/2 : 0);
                    const cy = w.y + (w.height ? w.height/2 : 0);
                    const gx = Math.floor(cx / 100);
                    const gy = Math.floor(cy / 100);
                    
                    const obsType = getObstacle(gx, gy);
                    if (obsType) {
                        const key = `${gx},${gy}`;
                        let data = obstacleHP.get(key);
                        if (!data) {
                            let hp = 20000;
                            if (obsType === 'obstacle_tree') hp = 5000;
                            else if (obsType === 'obstacle_ruin') hp = 50000;
                            data = { hp: hp, invincibility: 0 }; // HP管理オブジェクト (HP増加)
                            obstacleHP.set(key, data);
                        }

                        // 継続ダメージ武器のヒット間隔制限
                        if (data.invincibility > 0) {
                            data.invincibility--;
                            // 弾丸系は無敵時間を無視してヒット（そして消滅）
                            if (!(w instanceof Bullet || w instanceof Dagger || w instanceof MagicWand || w instanceof Arrow || w instanceof MusketShot || w instanceof Shuriken)) {
                                continue;
                            }
                        }
                        
                        const dmg = w.damage || 10 * player.damage;
                        data.hp -= dmg;
                        data.invincibility = 10; // ヒット後無敵時間
                        
                        if (frameCount % 4 === 0) spawnHitEffect(cx, cy); // ヒットエフェクト

                        // 弾丸系は障害物に当たったら消滅
                        if (w instanceof Bullet || w instanceof Dagger || w instanceof MagicWand || w instanceof Arrow || w instanceof MusketShot || w instanceof Shuriken) {
                            w.active = false;
                            data.invincibility = 0; // 弾丸は連続ヒット許容（別の弾が当たるように）
                        }

                        if (data.hp <= 0) {
                            destroyedObstacles.add(key);
                            obstacleHP.delete(key);
                            spawnExplosion(gx * 100 + 50, gy * 100 + 50, '#888', 20);
                            Audio.explosion();
                            
                            // 障害物破壊時の爆発 (周囲の敵を巻き込む)
                            const ex = new Explosion(gx * 100 + 50, gy * 100 + 50);
                            ex.width = 150 * player.area;
                            ex.height = 150 * player.area;
                            ex.x = (gx * 100 + 50) - ex.width / 2;
                            ex.y = (gy * 100 + 50) - ex.height / 2;
                            ex.damage = 100 * player.damage;
                            activeWeapons.push(ex);

                            // ドロップ判定
                            if (Math.random() < 0.05) { // 5%でダンジョン入口
                                dungeonEntrances.push(new DungeonEntrance(gx * 100 + 20, gy * 100 + 20));
                            } else if (Math.random() < 0.2) { // 20%でアイテム
                                if (Math.random() < 0.5) potions.push(new Potion(gx * 100 + 34, gy * 100 + 34));
                                else gems.push(new Gem(gx * 100 + 34, gy * 100 + 34, 10));
                            }
                        }
                    }
                }
            }
        }

        function enterDungeon() {
            if (currentDungeon) return;

            dungeonReturnX = player.x;
            dungeonReturnY = player.y;
            dungeonInstanceCounter++;
            const ax = 2000000;
            const ay = 2000000 + dungeonInstanceCounter * 2000;

            const dx = (ax + 100) - player.x;
            const dy = (ay + 100) - player.y;
            npcs.forEach(n => { n.x += dx; n.y += dy; });
            pets.forEach(p => { p.x += dx; p.y += dy; });
            player.x = ax + 100;
            player.y = ay + 100;

            currentDungeon = new Dungeon(ax, ay);

            Audio.legend();
            spawnExplosion(player.x + player.width/2, player.y + player.height/2, '#00BFFF', 50);
            const guardianName = ENEMY_DATA[currentDungeon.guardianType].name;
            showDialog("HIDDEN DUNGEON", `隠されたダンジョンに足を踏み入れた！<br>アンデッドの群れと番人「${guardianName}」を全滅させるまで脱出できない。`, null, 4000);
        }

        function killPlayer(cause) {
            if (player.revive > 0) {
                player.revive--;
                player.hp = player.maxHp * 0.5;
                player.invincibleTime = 120; // 2秒の無敵猶予
                hpText.innerText = Math.max(0, Math.floor(player.hp));
                hpBar.style.width = (player.hp / player.maxHp * 100) + "%";
                whiteFlashOpacity = 1.0;
                spawnExplosion(player.x + player.width/2, player.y + player.height/2, '#FFD700', 30);
                showChat("SYSTEM", `REVIVE! (残り${player.revive}回)`, "#FFD700");
                Audio.legend();
                return;
            }
            gameOver = true;
            killedBy = cause;
        }

        function checkCollisions() {
            // 弾丸と敵の衝突
            for (let i = bullets.length - 1; i >= 0; i--) {
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const b = bullets[i];
                    const e = enemies[j];
                    
                    // AABB衝突判定
                    if (b.x < e.x + e.width &&
                        b.x + b.width > e.x &&
                        b.y < e.y + e.height &&
                        b.y + b.height > e.y) {
                        
                        bullets.splice(i, 1);
                        
                        let dmg = 10 * player.damage;
                        if (Math.random() < player.critRate) dmg *= player.critDamage; // クリティカル
                        
                        e.hp -= dmg;
                        Audio.shoot(); // ヒット音として使用

                        if (e.hp <= 0 && e.type === 'slime_king') {
                            // キングスライム分裂
                            for(let k=0; k<4; k++) {
                                const s = new Enemy('slime', player);
                                s.x = e.x + (Math.random()-0.5)*40;
                                s.y = e.y + (Math.random()-0.5)*40;
                                enemies.push(s);
                            }
                        }

                        if (e.hp <= 0) {
                            enemies.splice(j, 1); // 敵を消す
                            spawnLoot(e); // ドロップ出現
                            spawnExplosion(e.x + e.width/2, e.y + e.height/2, ENEMY_DATA[e.type].color, 10);
                            
                            // ポーションドロップ判定 (5%)
                            if (Math.random() < 0.05 * player.luck) {
                                potions.push(new Potion(e.x, e.y));
                            }
                            // MPポーションドロップ判定 (5%)
                            if (Math.random() < 0.05 * player.luck) {
                                mpPotions.push(new MpPotion(e.x, e.y));
                            }
                            
                            // ユニーク武器ドロップ判定 (0.5% * 運)
                            if (Math.random() < 0.005 * player.luck) {
                                uniqueDrops.push(new UniqueWeaponDrop(e.x, e.y));
                            }

                            score += (ENEMY_DATA[e.type].isBoss ? 500 : 10) * player.greed; // 強欲
                            scoreDisplay.innerText = score;
                            Audio.explosion();
                                
                                // 裏ボス撃破判定
                                if (e.type === 'dark_lord') {
                                    isTrueEnding = true;
                                    gameClear = true;
                                    saveScore(score, Math.floor(frameCount / 1800) + 1, true);
                                }

                            if (Math.random() < player.vampirism) { // 吸血
                                player.hp = Math.min(player.maxHp, player.hp + 1);
                                hpText.innerText = Math.max(0, Math.floor(player.hp));
                                hpBar.style.width = (player.hp / player.maxHp * 100) + "%";
                            }
                        }
                        break; // 1つの弾で1体の敵のみ倒す
                    }
                }
            }

            // スラッシュと敵の衝突
            for (let i = slashes.length - 1; i >= 0; i--) {
                const s = slashes[i];
                
                // 対 敵
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    if (s.hitEnemies.includes(e)) continue;

                    // 扇状の当たり判定 (距離と角度)
                    const ec = e.getCenter();
                    const dx = ec.x - s.x;
                    const dy = ec.y - s.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist < s.width + e.width) {
                        const angleToEnemy = Math.atan2(dy, dx);
                        let angleDiff = angleToEnemy - s.angle;
                        while (angleDiff <= -Math.PI) angleDiff += Math.PI*2;
                        while (angleDiff > Math.PI) angleDiff -= Math.PI*2;

                        if (Math.abs(angleDiff) < Math.PI / 1.5) { // 広めの判定
                            let dmg = s.damage;
                            if (Math.random() < player.critRate) dmg *= player.critDamage;
                            e.hp -= dmg;
                            s.hitEnemies.push(e);
                            Audio.shoot();

                            // ノックバック強化
                            const kbAngle = Math.atan2(e.y - player.y, e.x - player.x);
                            e.kx = Math.cos(kbAngle) * 30; // ノックバック力を増加
                            e.ky = Math.sin(kbAngle) * 30;
                            spawnHitEffect(e.x + e.width/2, e.y + e.height/2);

                            if (e.hp <= 0) {
                                enemies.splice(j, 1);
                                spawnLoot(e);
                                spawnExplosion(e.x + e.width/2, e.y + e.height/2, ENEMY_DATA[e.type].color, 10);
                                if (Math.random() < 0.05 * player.luck) potions.push(new Potion(e.x, e.y));
                                if (Math.random() < 0.005 * player.luck) uniqueDrops.push(new UniqueWeaponDrop(e.x, e.y));
                                score += ENEMY_DATA[e.type].isBoss ? 500 : 10;
                                scoreDisplay.innerText = score;
                                Audio.explosion();
                                
                                // 裏ボス撃破判定
                                if (e.type === 'dark_lord') {
                                    isTrueEnding = true;
                                    gameClear = true;
                                    saveScore(score, Math.floor(frameCount / 1800) + 1, true);
                                }

                                if (Math.random() < player.vampirism) {
                                    player.hp = Math.min(player.maxHp, player.hp + 1);
                                    hpText.innerText = Math.max(0, Math.floor(player.hp));
                                    hpBar.style.width = (player.hp / player.maxHp * 100) + "%";
                                }
                            }
                        }
                    }
                }

                // 対 敵の弾 (剣で消す)
                for (let k = enemyBullets.length - 1; k >= 0; k--) {
                    const b = enemyBullets[k];
                    const dx = b.x - s.x;
                    const dy = b.y - s.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    if (dist < s.width) {
                        const angleToBullet = Math.atan2(dy, dx);
                        let angleDiff = angleToBullet - s.angle;
                        while (angleDiff <= -Math.PI) angleDiff += Math.PI*2;
                        while (angleDiff > Math.PI) angleDiff -= Math.PI*2;

                        if (Math.abs(angleDiff) < Math.PI / 1.5) {
                            enemyBullets.splice(k, 1);
                            Audio.shoot(); // 弾き音
                        }
                    }
                }
            }

            // 新規武器と敵の衝突
            for (let i = activeWeapons.length - 1; i >= 0; i--) {
                const w = activeWeapons[i];
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    if (w.hitEnemies.includes(e)) continue;
                    
                    if (w.x < e.x + e.width && w.x + w.width > e.x && w.y < e.y + e.height && w.y + w.height > e.y) {
                        if (w.onHit(e)) {
                            let dmg = w.damage;
                            if (Math.random() < player.critRate) dmg *= player.critDamage;
                            e.hp -= dmg;
                            w.hitEnemies.push(e);
                            
                            // ノックバック
                            const angle = Math.atan2(e.y - w.y, e.x - w.x);
                            e.kx = Math.cos(angle) * w.knockback;
                            e.ky = Math.sin(angle) * w.knockback;

                            if (e.hp <= 0) {
                                enemies.splice(j, 1);
                                spawnLoot(e);
                                spawnExplosion(e.x + e.width/2, e.y + e.height/2, ENEMY_DATA[e.type].color, 10);
                                if (Math.random() < 0.05 * player.luck) potions.push(new Potion(e.x, e.y));
                                if (Math.random() < 0.005 * player.luck) uniqueDrops.push(new UniqueWeaponDrop(e.x, e.y));
                                score += (ENEMY_DATA[e.type].isBoss ? 500 : 10) * player.greed;
                                scoreDisplay.innerText = Math.floor(score);
                                Audio.explosion();
                                
                                // 裏ボス撃破判定
                                if (e.type === 'dark_lord') {
                                    isTrueEnding = true;
                                    gameClear = true;
                                    saveScore(score, Math.floor(frameCount / 1800) + 1, true);
                                }

                                if (Math.random() < player.vampirism) {
                                    player.hp = Math.min(player.maxHp, player.hp + 1);
                                    hpText.innerText = Math.max(0, Math.floor(player.hp));
                                    hpBar.style.width = (player.hp / player.maxHp * 100) + "%";
                                }
                            }
                        }
                    }
                }
            }

            // 聖書と敵の衝突
            if (player.bibleCount > 0) {
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const e = enemies[i];
                    if (e.invincibleTime > 0) continue;

                    const count = player.bibleCount;
                    for (let b = 0; b < count; b++) {
                        const angle = player.bibleAngle + (Math.PI * 2 / count) * b;
                        const bx = player.getCenter().x + Math.cos(angle) * player.bibleDist - 10;
                        const by = player.getCenter().y + Math.sin(angle) * player.bibleDist - 10;

                        if (bx < e.x + e.width && bx + 20 > e.x &&
                            by < e.y + e.height && by + 20 > e.y) {
                            
                            e.hp -= (player.evolved.bible ? 10 : 5) * player.damage;
                            e.invincibleTime = player.evolved.bible ? 5 : 15; // ヒット間隔
                            if (e.hp <= 0) {
                                enemies.splice(i, 1);
                                spawnLoot(e);
                                spawnExplosion(e.x + e.width/2, e.y + e.height/2, ENEMY_DATA[e.type].color, 10);

                                // ポーションドロップ判定 (5%)
                                if (Math.random() < 0.05 * player.luck) {
                                    potions.push(new Potion(e.x, e.y));
                                }
                                
                                // ユニーク武器ドロップ判定
                                if (Math.random() < 0.005 * player.luck) {
                                    uniqueDrops.push(new UniqueWeaponDrop(e.x, e.y));
                                }

                                score += ENEMY_DATA[e.type].isBoss ? 500 : 10;
                                scoreDisplay.innerText = score;
                                Audio.explosion();
                                
                                // 裏ボス撃破判定
                                if (e.type === 'dark_lord') {
                                    isTrueEnding = true;
                                    gameClear = true;
                                    saveScore(score, Math.floor(frameCount / 1800) + 1, true);
                                }
                            }
                            break; // 1フレームに複数の聖書が当たっても1回分
                        }
                    }
                }
            }

            // チャクラムと敵の衝突
            if (player.chakramLevel > 0) {
                const count = player.chakramLevel;
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const e = enemies[i];
                    if (e.chakramInvincible > 0) { e.chakramInvincible--; continue; }

                    for (let c = 0; c < count; c++) {
                        const angle = player.chakramAngle + (Math.PI * 2 / count) * c;
                        const cx = player.getCenter().x + Math.cos(angle) * player.chakramDist - 10;
                        const cy = player.getCenter().y + Math.sin(angle) * player.chakramDist - 10;

                        if (cx < e.x + e.width && cx + 20 > e.x &&
                            cy < e.y + e.height && cy + 20 > e.y) {

                            e.hp -= 8 * player.damage;
                            e.chakramInvincible = 12; // ヒット間隔
                            if (e.hp <= 0) {
                                enemies.splice(i, 1);
                                spawnLoot(e);
                                spawnExplosion(e.x + e.width/2, e.y + e.height/2, ENEMY_DATA[e.type].color, 10);

                                if (Math.random() < 0.05 * player.luck) {
                                    potions.push(new Potion(e.x, e.y));
                                }
                                if (Math.random() < 0.005 * player.luck) {
                                    uniqueDrops.push(new UniqueWeaponDrop(e.x, e.y));
                                }

                                score += ENEMY_DATA[e.type].isBoss ? 500 : 10;
                                scoreDisplay.innerText = score;
                                Audio.explosion();

                                if (e.type === 'dark_lord') {
                                    isTrueEnding = true;
                                    gameClear = true;
                                    saveScore(score, Math.floor(frameCount / 1800) + 1, true);
                                }
                            }
                            break; // 1フレームに複数の刃が当たっても1回分
                        }
                    }
                }
            }

            // 斧と敵の衝突
            for (let i = axes.length - 1; i >= 0; i--) {
                const a = axes[i];
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    if (a.x < e.x + e.width && a.x + a.width > e.x &&
                        a.y < e.y + e.height && a.y + a.height > e.y) {
                        
                        e.hp -= 20 * player.damage; // 斧のダメージ
                        if (e.hp <= 0) {
                            enemies.splice(j, 1);
                            spawnLoot(e);
                            spawnExplosion(e.x + e.width/2, e.y + e.height/2, ENEMY_DATA[e.type].color, 10);
                            if (Math.random() < 0.05 * player.luck) potions.push(new Potion(e.x, e.y));
                            if (Math.random() < 0.005 * player.luck) uniqueDrops.push(new UniqueWeaponDrop(e.x, e.y));
                            score += ENEMY_DATA[e.type].isBoss ? 500 : 10;
                            scoreDisplay.innerText = score;
                            Audio.explosion();
                            
                            // 裏ボス撃破判定
                            if (e.type === 'dark_lord') {
                                isTrueEnding = true;
                                gameClear = true;
                                saveScore(score, Math.floor(frameCount / 1800) + 1, true);
                            }
                        }
                        // 斧は貫通するので消さない
                    }
                }
            }

            // ノヴァと敵の衝突
            for (let i = novas.length - 1; i >= 0; i--) {
                const n = novas[i];
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    if (n.hitEnemies.includes(e)) continue;

                    const ec = e.getCenter();
                    const dist = Math.hypot(n.x - ec.x, n.y - ec.y);
                    
                    if (dist < n.radius + e.width / 2) {
                        e.hp -= n.damage;
                        n.hitEnemies.push(e);
                        
                        if (e.hp <= 0) {
                            enemies.splice(j, 1);
                            spawnLoot(e);
                            spawnExplosion(e.x + e.width/2, e.y + e.height/2, ENEMY_DATA[e.type].color, 10);
                            if (Math.random() < 0.05 * player.luck) potions.push(new Potion(e.x, e.y));
                            if (Math.random() < 0.005 * player.luck) uniqueDrops.push(new UniqueWeaponDrop(e.x, e.y));
                            score += ENEMY_DATA[e.type].isBoss ? 500 : 10;
                            scoreDisplay.innerText = score;
                            Audio.explosion();
                            
                            // 裏ボス撃破判定
                            if (e.type === 'dark_lord') {
                                isTrueEnding = true;
                                gameClear = true;
                                saveScore(score, Math.floor(frameCount / 1800) + 1, true);
                            }
                        }
                    }
                }
            }

            // オーラと敵の衝突
            if (player.auraLevel > 0) {
                const radius = (50 + player.auraLevel * 10) * player.area;
                const pc = player.getCenter();
                
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const e = enemies[i];
                    if (e.invincibleTime > 0) continue;

                    const ec = e.getCenter();
                    const dist = Math.hypot(pc.x - ec.x, pc.y - ec.y);

                    if (dist < radius) {
                        e.hp -= 2 * player.damage; // オーラのダメージ(低めだが継続的)
                        e.invincibleTime = 10;
                        
                        if (e.hp <= 0) {
                            enemies.splice(i, 1);
                            spawnLoot(e);
                            spawnExplosion(e.x + e.width/2, e.y + e.height/2, ENEMY_DATA[e.type].color, 10);
                            if (Math.random() < 0.05 * player.luck) potions.push(new Potion(e.x, e.y));
                            if (Math.random() < 0.005 * player.luck) uniqueDrops.push(new UniqueWeaponDrop(e.x, e.y));
                            score += ENEMY_DATA[e.type].isBoss ? 500 : 10;
                            scoreDisplay.innerText = score;
                            Audio.explosion();
                            
                            // 裏ボス撃破判定
                            if (e.type === 'dark_lord') {
                                isTrueEnding = true;
                                gameClear = true;
                                saveScore(score, Math.floor(frameCount / 1800) + 1, true);
                            }
                        }
                    }
                }
            }

            // ナイフと敵の衝突
            for (let i = daggers.length - 1; i >= 0; i--) {
                const d = daggers[i];
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    if (d.x < e.x + e.width && d.x + d.width > e.x &&
                        d.y < e.y + e.height && d.y + d.height > e.y) {
                        
                        daggers.splice(i, 1);
                        e.hp -= d.damage;
                        if (e.hp <= 0) {
                            enemies.splice(j, 1);
                            spawnLoot(e);
                            spawnExplosion(e.x + e.width/2, e.y + e.height/2, ENEMY_DATA[e.type].color, 10);
                            if (Math.random() < 0.05 * player.luck) potions.push(new Potion(e.x, e.y));
                            if (Math.random() < 0.005 * player.luck) uniqueDrops.push(new UniqueWeaponDrop(e.x, e.y));
                            score += ENEMY_DATA[e.type].isBoss ? 500 : 10;
                            scoreDisplay.innerText = score;
                            Audio.explosion();
                            
                            // 裏ボス撃破判定
                            if (e.type === 'dark_lord') {
                                isTrueEnding = true;
                                gameClear = true;
                                saveScore(score, Math.floor(frameCount / 1800) + 1, true);
                            }
                        }
                        break;
                    }
                }
            }

            // 魔法の杖と敵の衝突
            for (let i = wands.length - 1; i >= 0; i--) {
                const w = wands[i];
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    if (w.x < e.x + e.width && w.x + w.width > e.x &&
                        w.y < e.y + e.height && w.y + w.height > e.y) {
                        
                        wands.splice(i, 1);
                        e.hp -= w.damage;
                        if (e.hp <= 0) {
                            enemies.splice(j, 1);
                            spawnLoot(e);
                            spawnExplosion(e.x + e.width/2, e.y + e.height/2, ENEMY_DATA[e.type].color, 10);
                            if (Math.random() < 0.05 * player.luck) potions.push(new Potion(e.x, e.y));
                            if (Math.random() < 0.005 * player.luck) uniqueDrops.push(new UniqueWeaponDrop(e.x, e.y));
                            score += ENEMY_DATA[e.type].isBoss ? 500 : 10;
                            scoreDisplay.innerText = score;
                            Audio.explosion();
                            
                            // 裏ボス撃破判定
                            if (e.type === 'dark_lord') {
                                isTrueEnding = true;
                                gameClear = true;
                                saveScore(score, Math.floor(frameCount / 1800) + 1, true);
                            }
                        }
                        break;
                    }
                }
            }

            // ファイアボールと敵の衝突
            for (let i = fireballs.length - 1; i >= 0; i--) {
                const f = fireballs[i];
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    if (!f.evolved && f.hitEnemies.includes(e)) continue; // 通常は貫通制限あり
                    if (f.evolved && f.hitEnemies.includes(e) && frameCount % 10 !== 0) continue; // 進化版は連続ヒット

                    if (f.x < e.x + e.width && f.x + f.width > e.x &&
                        f.y < e.y + e.height && f.y + f.height > e.y) {
                        
                        e.hp -= (f.evolved ? 50 : 25) * player.damage;
                        f.hitEnemies.push(e);
                        if (e.hp <= 0) {
                            enemies.splice(j, 1);
                            spawnLoot(e);
                            spawnExplosion(e.x + e.width/2, e.y + e.height/2, ENEMY_DATA[e.type].color, 10);
                            if (Math.random() < 0.05 * player.luck) potions.push(new Potion(e.x, e.y));
                            if (Math.random() < 0.005 * player.luck) uniqueDrops.push(new UniqueWeaponDrop(e.x, e.y));
                            score += ENEMY_DATA[e.type].isBoss ? 500 : 10;
                            scoreDisplay.innerText = score;
                            Audio.explosion();
                            
                            // 裏ボス撃破判定
                            if (e.type === 'dark_lord') {
                                isTrueEnding = true;
                                gameClear = true;
                                saveScore(score, Math.floor(frameCount / 1800) + 1, true);
                            }
                        }
                    }
                }
            }

            // 敵とプレイヤーの衝突
            if (player.invincibleTime <= 0 && !isDebugInvincible) {
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const e = enemies[i];
                    if (player.x < e.x + e.width &&
                        player.x + player.width > e.x &&
                        player.y < e.y + e.height &&
                        player.y + player.height > e.y) {
                        
                        // 回避判定
                        if (Math.random() < player.dodge) {
                            continue; // 回避成功
                        }
                        const finalArmor = berserkTimer > 0 ? 0 : player.armor;
                        player.hp -= Math.max(1, 10 - finalArmor); // 防御力適用
                        hpText.innerText = Math.max(0, Math.floor(player.hp));
                        hpBar.style.width = (player.hp / player.maxHp * 100) + "%";
                        damageFlashOpacity = 0.5; // ダメージフラッシュ
                        Audio.damage();
                        player.invincibleTime = 30; // 無敵時間 (0.5秒)
                        
                        if (player.hp <= 0) {
                            killPlayer(e.type.toUpperCase().replace('_', ' '));
                        }
                        break; // 1フレームに1回ダメージ
                    }
                }
            }

            // 敵とNPCの衝突
            for (const npc of npcs) {
                if (npc.isDead) continue;
                for (const enemy of enemies) {
                    if (Math.hypot(npc.x - enemy.x, npc.y - enemy.y) < 30) {
                        npc.hp -= Math.max(1, 1 - npc.defense); // NPCへのダメージ (防御力適用)
                        if (npc.hp <= 0 && !npc.isDead) {
                            if (!npc.isDead) {
                                const msgs = NPC_MESSAGES[npc.job]?.dead || ["..."];
                                showChat(NPC_JOBS.find(j=>j.id===npc.job).name, msgs[Math.floor(Math.random()*msgs.length)], '#333');
                            }
                            npc.isDead = true;
                            npc.hp = 0;
                        }
                    }
                }
            }

            // プレイヤーとジェムの衝突
            for (let i = gems.length - 1; i >= 0; i--) {
                const g = gems[i];
                const pc = player.getCenter();
                // 簡易的な距離判定
                if (Math.hypot(pc.x - (g.x + g.width/2), pc.y - (g.y + g.height/2)) < 30 + (player.magnet - 100)/2) {
                    gems.splice(i, 1);
                    xp += g.value * player.growth; // 成長
                    Audio.gem();
                    if (xp >= nextLevelXp) {
                        level++;
                        xp = 0;
                        nextLevelXp = Math.floor(nextLevelXp * 1.5);
                        levelText.innerText = level;
                        Audio.levelUp();
                        showLevelUpOptions();
                    }
                    xpBar.style.width = (xp / nextLevelXp * 100) + "%";
                }
            }

            // プレイヤーと宝箱の衝突
            for (let i = chests.length - 1; i >= 0; i--) {
                const c = chests[i];
                if (player.x < c.x + c.width &&
                    player.x + player.width > c.x &&
                    player.y < c.y + c.height &&
                    player.y + player.height > c.y) {
                    chests.splice(i, 1);
                    openChest();
                }
            }

            // プレイヤーと村の衝突
            for (let i = 0; i < villages.length; i++) {
                const v = villages[i];
                if (Math.hypot(player.x - v.x, player.y - v.y) < 50) {
                    // MP完全回復
                    if (player.mp < player.maxMp) {
                        player.mp = player.maxMp;
                        updateMpBar();
                        showChat("SYSTEM", "MP FULLY RESTORED!", "#1E90FF");
                    }
                    
                    player.hp = player.maxHp;
                    hpText.innerText = Math.max(0, Math.floor(player.hp));
                    hpBar.style.width = "100%";
                    spawnExplosion(player.x + player.width/2, player.y + player.height/2, '#00FF00', 20);
                    showNpcSelection();
                    break; // 一度に1つの村
                }
            }

            // プレイヤーとユニーク武器の衝突
            for (let i = uniqueDrops.length - 1; i >= 0; i--) {
                const u = uniqueDrops[i];
                if (player.x < u.x + u.width &&
                    player.x + player.width > u.x &&
                    player.y < u.y + u.height &&
                    player.y + player.height > u.y) {
                    
                    uniqueDrops.splice(i, 1);
                    Audio.unique();
                    // ランダムな武器を強化
                    const weaponTypes = ['bible', 'axe', 'aura', 'nova', 'dagger', 'wand', 'lightning', 'fireball'];
                    const randomWeapon = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
                    applyPowerUp(randomWeapon);
                    
                    // 効果フィードバック
                    const weaponName = POWERUPS.find(p => p.id === randomWeapon)?.name || randomWeapon;
                    showChat("SYSTEM", `UNIQUE WEAPON: ${weaponName} UP!`, "#00FFFF");
                    spawnExplosion(player.x + player.width/2, player.y + player.height/2, '#00FFFF', 20);
                }
            }

            // プレイヤーと妖精アイテムの衝突
            for (let i = fairyItems.length - 1; i >= 0; i--) {
                const f = fairyItems[i];
                if (player.x < f.x + f.width &&
                    player.x + player.width > f.x &&
                    player.y < f.y + f.height &&
                    player.y + player.height > f.y) {
                    
                    fairyItems.splice(i, 1);
                    Audio.unique();
                    pets.push(new Pet(player)); // ペット追加
                    acquiredItems['pet'] = (acquiredItems['pet'] || 0) + 1;
                    updateInventory();
                    spawnExplosion(player.x + player.width/2, player.y + player.height/2, '#FF69B4', 20);
                }
            }

            // プレイヤーとレジェンド武器の衝突
            for (let i = legendDrops.length - 1; i >= 0; i--) {
                const l = legendDrops[i];
                if (player.x < l.x + l.width &&
                    player.x + player.width > l.x &&
                    player.y < l.y + l.height &&
                    player.y + player.height > l.y) {
                    
                    legendDrops.splice(i, 1);
                    Audio.legend();
                    
                    // レジェンド効果: ホーミングオーブ追加
                    activeWeapons.push(new LegendHomingOrb(player));
                    acquiredItems['legend_weapon'] = (acquiredItems['legend_weapon'] || 0) + 1;
                    updateInventory();
                    
                    spawnExplosion(player.x + player.width/2, player.y + player.height/2, '#FFD700', 50);
                    showChat("SYSTEM", "レジェンド武器を手に入れた!", "#FFD700");
                }
            }

            // プレイヤーと契約書の衝突
            for (let i = contracts.length - 1; i >= 0; i--) {
                const c = contracts[i];
                if (player.x < c.x + c.width &&
                    player.x + player.width > c.x &&
                    player.y < c.y + c.height &&
                    player.y + player.height > c.y) {
                    
                    contracts.splice(i, 1);
                    Audio.unique();
                    showNpcSelection();
                }
            }

            // プレイヤーとポーションの衝突
            for (let i = potions.length - 1; i >= 0; i--) {
                const p = potions[i];
                if (player.x < p.x + p.width &&
                    player.x + player.width > p.x &&
                    player.y < p.y + p.height &&
                    player.y + player.height > p.y) {
                    
                    player.hp = Math.min(player.hp + p.healAmount, player.maxHp);
                    hpText.innerText = Math.max(0, Math.floor(player.hp));
                    hpBar.style.width = (player.hp / player.maxHp * 100) + "%";
                    Audio.gem(); // ポーション取得音（ジェムと同じで代用）
                    potions.splice(i, 1);
                }
            }

            // プレイヤーとMPポーションの衝突
            for (let i = mpPotions.length - 1; i >= 0; i--) {
                const p = mpPotions[i];
                if (player.x < p.x + p.width &&
                    player.x + player.width > p.x &&
                    player.y < p.y + p.height &&
                    player.y + player.height > p.y) {

                    player.mp = Math.min(player.mp + p.healAmount, player.maxMp);
                    updateMpBar();
                    Audio.gem();
                    mpPotions.splice(i, 1);
                }
            }
        }

