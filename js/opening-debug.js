        // --- オープニングアニメーション ---
        let openingParticles = [];
        function openingLoop() {
            if (isGameStarted) return;

            // 背景: 魔王城のイメージ
            const grad = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
            grad.addColorStop(0, '#000022'); // 夜空
            grad.addColorStop(0.6, '#663399'); // 地平線付近 (少し明るくポップに)
            grad.addColorStop(1, '#333'); // 地面
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

            // 月
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath(); ctx.arc(SCREEN_WIDTH * 0.8, 100, 40, 0, Math.PI*2); ctx.fill();

            // 魔王城シルエット
            ctx.fillStyle = '#777'; // 真っ黒ではなく濃いグレーに
            ctx.beginPath();
            ctx.moveTo(0, SCREEN_HEIGHT);
            ctx.lineTo(0, SCREEN_HEIGHT - 50);
            // 山と城
            ctx.lineTo(100, SCREEN_HEIGHT - 150);
            ctx.lineTo(200, SCREEN_HEIGHT - 100);
            ctx.lineTo(300, SCREEN_HEIGHT - 300); // メインの塔
            ctx.lineTo(350, SCREEN_HEIGHT - 250);
            ctx.lineTo(400, SCREEN_HEIGHT - 350); // 高い塔
            ctx.lineTo(450, SCREEN_HEIGHT - 250);
            ctx.lineTo(500, SCREEN_HEIGHT - 300);
            ctx.lineTo(600, SCREEN_HEIGHT - 100);
            ctx.lineTo(700, SCREEN_HEIGHT - 150);
            ctx.lineTo(SCREEN_WIDTH, SCREEN_HEIGHT - 50);
            ctx.lineTo(SCREEN_WIDTH, SCREEN_HEIGHT);
            ctx.fill();

            // 魔王のシルエット (巨大)
            const bossX = SCREEN_WIDTH / 2;
            const bossY = SCREEN_HEIGHT / 2 - 20;

            // 魔王
            // マント (丸みのある形状)
            ctx.fillStyle = '#800080'; // 紫
            ctx.beginPath();
            ctx.moveTo(bossX, bossY - 100);
            ctx.quadraticCurveTo(bossX - 150, bossY + 50, bossX - 120, bossY + 250);
            ctx.lineTo(bossX + 120, bossY + 250);
            ctx.quadraticCurveTo(bossX + 150, bossY + 50, bossX, bossY - 100);
            ctx.fill();

            // 顔 (肌色、丸顔)
            ctx.fillStyle = '#FFE0B0';
            ctx.beginPath();
            ctx.arc(bossX, bossY - 120, 60, 0, Math.PI * 2);
            ctx.fill();

            // 髪の毛 (黒、もこもこ)
            ctx.fillStyle = '#666';
            ctx.beginPath();
            ctx.arc(bossX, bossY - 130, 65, Math.PI, 0);
            ctx.lineTo(bossX + 65, bossY - 100);
            ctx.quadraticCurveTo(bossX, bossY - 90, bossX - 65, bossY - 100);
            ctx.fill();

            // 角 (黄色、丸っこい)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.ellipse(bossX - 40, bossY - 170, 15, 30, -0.3, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(bossX + 40, bossY - 170, 15, 30, 0.3, 0, Math.PI*2);
            ctx.fill();

            // 目 (黒い点)
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(bossX - 20, bossY - 90, 5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(bossX + 20, bossY - 90, 5, 0, Math.PI*2); ctx.fill();

            // 口
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(bossX, bossY - 65, 10, Math.PI+0.5, Math.PI*2-0.5);
            ctx.stroke();

            // 魔王の攻撃 (ビーム)
            if (Math.random() < 0.1) {
                ctx.strokeStyle = `rgba(255, 0, 255, ${Math.random()})`;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(bossX, bossY -140);
                ctx.lineTo(SCREEN_WIDTH / 2 + (Math.random()-0.5)*100, SCREEN_HEIGHT - 100);
                ctx.stroke();
            }

            // 火の粉パーティクル (既存ロジック流用)
            if (Math.random() < 0.4) {
                openingParticles.push({
                    x: Math.random() * SCREEN_WIDTH,
                    y: SCREEN_HEIGHT,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -Math.random() * 3 - 1,
                    size: Math.random() * 3 + 1,
                    color: `rgba(255, ${50 + Math.random()*100}, 0,`,
                    life: 1.0,
                    decay: 0.005 + Math.random() * 0.01
                });
            }
            for (let i = openingParticles.length - 1; i >= 0; i--) {
                const p = openingParticles[i];
                p.x += p.vx; p.y += p.vy; p.life -= p.decay;
                if (p.life <= 0) { openingParticles.splice(i, 1); continue; }
                ctx.fillStyle = p.color + p.life + ')';
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }

            requestAnimationFrame(openingLoop);
        }
        
        // 描画ループ内での時間停止エフェクト
        // drawGame関数の最後に追加
        if (timeStopTimer > 0) {
            ctx.fillStyle = 'rgba(0, 0, 50, 0.2)';
            ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        }

        Audio.init();
        Audio.playBGM('opening');

        openingLoop();

        // --- Debug Functions ---
        let debugMenuInitialized = false;
        function initDebugMenu() {
            if (debugMenuInitialized) return;
            debugMenuInitialized = true;

            const itemContainer = document.getElementById('debug-items');
            POWERUPS.forEach(p => {
                const btn = document.createElement('button');
                btn.className = 'debug-btn';
                btn.innerText = p.name;
                btn.onclick = () => { applyPowerUp(p.id); console.log('Added ' + p.name); };
                itemContainer.appendChild(btn);
            });

            // 特殊アイテムの追加
            const specialItems = [
                { id: 'legend_weapon', name: '★レジェンド武器' },
                { id: 'pet', name: '★妖精(ペット)' },
                { id: 'contract', name: '★契約書(NPC)' },
                { id: 'unique_weapon', name: '★ユニーク武器(強化)' },
                { id: 'chest', name: '★宝箱イベント' }
            ];

            specialItems.forEach(item => {
                const btn = document.createElement('button');
                btn.className = 'debug-btn';
                btn.innerText = item.name;
                btn.style.borderColor = '#FFD700';
                btn.style.color = '#FFD700';
                btn.onclick = () => {
                    if (item.id === 'legend_weapon') {
                        activeWeapons.push(new LegendHomingOrb(player));
                        acquiredItems['legend_weapon'] = (acquiredItems['legend_weapon'] || 0) + 1;
                        updateInventory();
                    } else if (item.id === 'pet') {
                        pets.push(new Pet(player));
                        acquiredItems['pet'] = (acquiredItems['pet'] || 0) + 1;
                        updateInventory();
                    } else if (item.id === 'contract') showNpcSelection();
                    else if (item.id === 'unique_weapon') uniqueDrops.push(new UniqueWeaponDrop(player.x, player.y));
                    else if (item.id === 'chest') openChest();
                    console.log('Added ' + item.name);
                };
                itemContainer.appendChild(btn);
            });

            const npcContainer = document.getElementById('debug-npcs');
            NPC_JOBS.forEach(j => {
                const btn = document.createElement('button');
                btn.className = 'debug-btn';
                btn.innerText = j.name;
                btn.style.color = j.color;
                btn.onclick = () => {
                    const pc = player.getCenter();
                    npcs.push(new NPC(pc.x + (Math.random()-0.5)*50, pc.y + (Math.random()-0.5)*50, j.id));
                };
                npcContainer.appendChild(btn);
            });

            const enemyContainer = document.getElementById('debug-enemies');
            Object.keys(ENEMY_DATA).forEach(key => {
                const btn = document.createElement('button');
                btn.className = 'debug-btn';
                btn.innerText = ENEMY_DATA[key].name || key;
                btn.onclick = () => {
                    const pc = player.getCenter();
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 200 + Math.random() * 100;
                    const e = new Enemy(key, player);
                    e.x = pc.x + Math.cos(angle) * dist;
                    e.y = pc.y + Math.sin(angle) * dist;
                    enemies.push(e);
                };
                enemyContainer.appendChild(btn);
            });
        }

        window.debugLevelUp = function(amount = 1) {
            for(let i=0; i<amount; i++) {
                level++;
                // ステータス上昇などの処理が必要ならここに追加
            }
            levelText.innerText = level;
            Audio.levelUp();
        };
        window.debugKillAll = function() {
            enemies.forEach(e => spawnExplosion(e.x, e.y, '#fff', 5));
            enemies.length = 0;
        };
        window.debugHeal = function() {
            player.hp = player.maxHp;
            hpText.innerText = Math.floor(player.hp);
            hpBar.style.width = '100%';
        };
        window.debugInvincible = function() {
            isDebugInvincible = !isDebugInvincible;
            document.getElementById('debug-status').innerText = 'Invincible: ' + (isDebugInvincible ? 'ON' : 'OFF');
        };
