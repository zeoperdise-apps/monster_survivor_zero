        // --- クラス定義 ---
        class EnemyBullet {
            constructor(x, y, targetX, targetY, homing = false, type = 'bullet') {
                this.x = x;
                this.y = y;
                this.startX = x;
                this.startY = y;
                this.homing = homing;
                this.type = type;

                if (type === 'shuriken') {
                    this.width = 16;
                    this.height = 16;
                    this.rotation = 0;
                } else {
                    this.width = 10;
                    this.height = 10;
                }

                const dx = targetX - x;
                const dy = targetY - y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                this.speed = homing ? 4 : (type === 'shuriken' ? 5 : 3);
                this.vx = (dx / dist) * this.speed;
                this.vy = (dy / dist) * this.speed;
                this.active = true;
            }
            update(player) {
                if (this.homing && player) {
                    const dx = (player.x + player.width/2) - this.x;
                    const dy = (player.y + player.height/2) - this.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist > 0) {
                        // 誘導
                        const steer = 0.25;
                        this.vx += (dx / dist) * steer;
                        this.vy += (dy / dist) * steer;
                        // 速度正規化
                        const currentSpeed = Math.hypot(this.vx, this.vy);
                        this.vx = (this.vx / currentSpeed) * this.speed;
                        this.vy = (this.vy / currentSpeed) * this.speed;
                    }
                }
                this.x += this.vx;
                this.y += this.vy;

                if (this.type === 'shuriken') {
                    this.rotation += 0.3;
                }

                if (Math.hypot(this.x - this.startX, this.y - this.startY) > 800) {
                    this.active = false;
                }
            }
            draw() {
                if (this.type === 'shuriken') {
                    ctx.save();
                    ctx.translate(this.x + this.width/2, this.y + this.height/2);
                    ctx.rotate(this.rotation);
                    ctx.drawImage(SPRITES.shuriken, -this.width/2, -this.height/2, this.width, this.height);
                    ctx.restore();
                } else {
                    ctx.fillStyle = this.homing ? '#800080' : '#FF4500';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 5, 0, Math.PI*2);
                    ctx.fill();
                    if (this.homing) { ctx.strokeStyle = '#FFF'; ctx.lineWidth = 1; ctx.stroke(); }
                }
            }
        }

        class Player {
            constructor() {
                this.width = 30;
                this.height = 30;
                this.x = SCREEN_WIDTH / 2 - this.width / 2;
                this.y = SCREEN_HEIGHT / 2 - this.height / 2;
                this.hp = 200; // 初期HP増加
                this.maxHp = 200;
                this.mp = 100;
                this.maxMp = 100;
                this.mpRegenTimer = 0;
                this.spells = []; // 習得した魔法ID
                this.spellCooldowns = {}; // id -> frames
                this.color = '#3264FF'; // Blue
                this.speed = 2.5;
                this.bibleCount = 0;
                this.bibleAngle = 0;
                this.bibleDist = 100;
                this.axeLevel = 0;
                this.auraLevel = 0;
                this.novaLevel = 0;
                
                // 新ステータス
                this.damage = 1.2;
                this.area = 1.1;
                this.magnet = 120;
                this.armor = 0;
                this.regen = 0;
                this.luck = 1.0;
                this.amount = 0;
                this.daggerLevel = 0;
                this.wandLevel = 0;
                this.lightningLevel = 0;
                this.fireballLevel = 0;
                this.lastDir = { x: 1, y: 0 };
                this.facing = 'right';
                this.animTimer = 0;
                this.isMoving = false;
                this.evolved = {}; // 進化済みフラグ
                
                // 新規武器レベル
                this.boomerangLevel = 0;
                this.mineLevel = 0;
                this.tornadoLevel = 0;
                this.shurikenLevel = 0;
                this.holyWaterLevel = 0;
                this.spearLevel = 0;
                this.whipLevel = 0;
                this.chakramLevel = 0;
                this.chakramAngle = 0;
                this.chakramDist = 70;
                this.scytheLevel = 0;
                this.bombLevel = 0;
                this.bowLevel = 0;
                this.musketLevel = 0;
                
                // 新規パッシブ
                this.growth = 1.0;
                this.greed = 1.0;
                this.revive = 0;
                this.knockback = 1.0;
                this.duration = 1.0;
                this.curse = 1.0;
                this.critRate = 0.05;
                this.critDamage = 1.5;
                this.dodge = 0;
                this.vampirism = 0;
                this.hasteTimer = 0;
                this.berserkTimer = 0;
                this.invincibleTime = 0;
                this.spawnAnimTimer = 0;
            }

            update() {
                let dx = 0;
                let dy = 0;

                const finalSpeed = this.hasteTimer > 0 ? this.speed * 1.5 : this.speed;

                if (isAutoBattle) {
                    // オートバトルロジック
                    let moveX = 0;
                    let moveY = 0;
                    let actionTaken = false;

                    // 0. 要塞攻略 (仲間が4人以上)
                    if (npcs.filter(n => !n.isDead).length >= 4) {
                        let nearestFortress = null;
                        let minFortressDist = Infinity;
                        for (const f of fortresses) {
                            if (f.triggered) continue; // 既に突入済みの要塞は無視
                            const d = Math.hypot(f.x + f.width/2 - this.x, f.y + f.height/2 - this.y);
                            if (d < minFortressDist) {
                                minFortressDist = d;
                                nearestFortress = f;
                            }
                        }
                        if (nearestFortress) {
                            moveX += (nearestFortress.x + nearestFortress.width/2 - this.x);
                            moveY += (nearestFortress.y + nearestFortress.height/2 - this.y);
                            actionTaken = true; // 最優先行動
                        }
                    }

                    // 0. HP30%以下なら敵から逃げる (最優先)
                    if (!actionTaken && this.hp / this.maxHp <= 0.3) {
                        let closestEnemy = null;
                        let minEnemyDist = 400;
                        for (const e of enemies) {
                            const d = Math.hypot(e.x - this.x, e.y - this.y);
                            if (d < minEnemyDist) {
                                minEnemyDist = d;
                                closestEnemy = e;
                            }
                        }
                        if (closestEnemy) {
                            moveX -= (closestEnemy.x - this.x);
                            moveY -= (closestEnemy.y - this.y);
                            actionTaken = true;
                        }
                    }

                    // 1. 敵の遠距離攻撃をよける
                    if (!actionTaken) {
                        let closestBullet = null;
                        let minBulletDist = 100;
                        for (const b of enemyBullets) {
                            const d = Math.hypot(b.x - this.x, b.y - this.y);
                            if (d < minBulletDist) {
                                minBulletDist = d;
                                closestBullet = b;
                            }
                        }
                        if (closestBullet) {
                            moveX -= (closestBullet.x - this.x);
                            moveY -= (closestBullet.y - this.y);
                            actionTaken = true;
                        }
                    }

                    // 2. 敵から一定の距離を保つ
                    if (!actionTaken) {
                        let closestEnemy = null;
                        let minEnemyDist = Infinity;
                        for (const e of enemies) {
                            const d = Math.hypot(e.x - this.x, e.y - this.y);
                            const safeDist = ENEMY_DATA[e.type].isBoss ? 200 : 75;
                            if (d < safeDist && d < minEnemyDist) {
                                minEnemyDist = d;
                                closestEnemy = e;
                            }
                        }
                        if (closestEnemy) {
                            moveX -= (closestEnemy.x - this.x);
                            moveY -= (closestEnemy.y - this.y);
                            actionTaken = true;
                        }
                    }

                    if (!actionTaken) {
                        let target = null;
                        let minDist = Infinity;

                        // 回復ポーション
                        if (!target && this.hp < this.maxHp) {
                            minDist = Infinity;
                            for (const p of potions) {
                                const d = Math.hypot(p.x - this.x, p.y - this.y);
                                if (d < minDist) { minDist = d; target = p; }
                            }
                        }
                        // NPCを生き返す
                        if (!target) {
                            minDist = Infinity;
                            for (const npc of npcs) {
                                if (npc.isDead) {
                                    const d = Math.hypot(npc.x - this.x, npc.y - this.y);
                                    if (d < minDist) { minDist = d; target = npc; }
                                }
                            }
                        }
                        // 村 (NPC加入)
                        if (!target) {
                            minDist = Infinity;
                            for (const v of villages) {
                                const d = Math.hypot(v.x - this.x, v.y - this.y);
                                if (d < minDist) { minDist = d; target = v; }
                            }
                        }
                        // ダンジョン
                        if (!target) {
                            minDist = Infinity;
                            for (const d of dungeonEntrances) {
                                const dist = Math.hypot(d.x - this.x, d.y - this.y);
                                if (dist < minDist) { minDist = dist; target = d; }
                            }
                        }
                        // 宝箱
                        for (const c of chests) {
                            const d = Math.hypot(c.x - this.x, c.y - this.y);
                            if (d < minDist) { minDist = d; target = c; }
                        }
                        // 妖精の瓶
                        if (!target) {
                            minDist = Infinity;
                            for (const f of fairyItems) {
                                const d = Math.hypot(f.x - this.x, f.y - this.y);
                                if (d < minDist) { minDist = d; target = f; }
                            }
                        }
                        // ジェム
                        if (!target) {
                            minDist = Infinity;
                            for (const g of gems) {
                                const d = Math.hypot(g.x - this.x, g.y - this.y);
                                if (d < minDist) { minDist = d; target = g; }
                            }
                        }
                        // 8. その他アイテム (ユニーク、レジェンド、契約書)
                        if (!target) {
                            minDist = Infinity;
                            const otherItems = [...uniqueDrops, ...legendDrops, ...contracts];
                            for (const item of otherItems) {
                                const d = Math.hypot(item.x - this.x, item.y - this.y);
                                if (d < minDist) { minDist = d; target = item; }
                            }
                        }

                        // 障害物回避 (オートバトル用)
                        const avoid = getAvoidanceVector(this, 3.0);
                        moveX += avoid.x;
                        moveY += avoid.y;

                        if (target) {
                            // NPC蘇生の場合は近づいたら止まる
                            if (target instanceof NPC && target.isDead) {
                                const d = Math.hypot(target.x - this.x, target.y - this.y);
                                if (d > 50) {
                                    moveX += (target.x - this.x);
                                    moveY += (target.y - this.y);
                                }
                            } else {
                                moveX += (target.x - this.x);
                                moveY += (target.y - this.y);
                            }
                        }

                        // 魔法の自動使用
                        if (this.mp > 20) {
                            // HP低下時ヒール
                            if (this.hp < this.maxHp * 0.5 && this.mp >= 50) castSpell('heal');
                            
                            // 敵が多い時
                            const nearbyEnemies = enemies.filter(e => Math.hypot(e.x - this.x, e.y - this.y) < 400).length;
                            if (nearbyEnemies > 15) {
                                if (this.mp >= 100) castSpell('judgment');
                                else if (this.mp >= 80) castSpell('time_stop');
                                else if (this.mp >= 40) castSpell('firestorm');
                            }

                            // 囲まれた時テレポート
                            if (nearbyEnemies > 8 && this.hp < this.maxHp * 0.3 && this.mp >= 20) castSpell('teleport');

                            // 余裕がある時召喚
                            if (this.mp >= 90 && nearbyEnemies > 5) castSpell('summon_golem');
                        }

                    }

                    const len = Math.hypot(moveX, moveY);
                    if (len > 0) {
                        dx = (moveX / len) * this.speed;
                        dy = (moveY / len) * this.speed;
                    }
                } else {
                    // マウス移動
                    if (isMouseDown) {
                        const centerX = SCREEN_WIDTH / 2;
                        const centerY = SCREEN_HEIGHT / 2;
                        const diffX = mouseX - centerX;
                        const diffY = mouseY - centerY;
                        const dist = Math.hypot(diffX, diffY);
                        if (dist > 10) { // デッドゾーン
                            dx = (diffX / dist) * finalSpeed;
                            dy = (diffY / dist) * finalSpeed;
                        }
                    }

                    // ゲームパッド移動
                    if (gamepadIndex !== null) {
                        const gp = navigator.getGamepads()[gamepadIndex];
                        if (gp) {
                            const axisX = gp.axes[0];
                            const axisY = gp.axes[1];
                            if (Math.abs(axisX) > 0.1 || Math.abs(axisY) > 0.1) {
                                dx = axisX * finalSpeed;
                                dy = axisY * finalSpeed;
                            }
                        }
                    }

                    // キーボード移動 (加算)。矢印キーは常に使え、文字キーはキーコンフィグに従う
                    if (keys['ArrowLeft'] || keys[keyBindings.left] || keys[keyBindings.left.toUpperCase()]) dx = -finalSpeed;
                    if (keys['ArrowRight'] || keys[keyBindings.right] || keys[keyBindings.right.toUpperCase()]) dx = finalSpeed;
                    if (keys['ArrowUp'] || keys[keyBindings.up] || keys[keyBindings.up.toUpperCase()]) dy = -finalSpeed;
                    if (keys['ArrowDown'] || keys[keyBindings.down] || keys[keyBindings.down.toUpperCase()]) dy = finalSpeed;
                }

                // 斜め移動の正規化
                // マウス/パッドの場合は既に正規化されている可能性があるので、キーボード入力のみの場合に適用したいが、
                // 簡易的に速度制限をかける
                const moveSpeed = Math.hypot(dx, dy);
                if (moveSpeed > finalSpeed) {
                    dx = (dx / moveSpeed) * finalSpeed;
                    dy = (dy / moveSpeed) * finalSpeed;
                }

                if (dx !== 0 || dy !== 0) {
                    this.lastDir = { x: dx, y: dy };
                    const len = Math.hypot(this.lastDir.x, this.lastDir.y);
                    this.lastDir.x /= len;
                    this.lastDir.y /= len;
                }

                this.x += dx;
                this.y += dy;

                this.isMoving = (dx !== 0 || dy !== 0);
                if (dx > 0) this.facing = 'right';
                if (dx < 0) this.facing = 'left';

                checkObstacleCollision(this);

                // 足踏みアニメーション更新
                if (dx !== 0 || dy !== 0) {
                    this.animTimer += 0.25;
                } else {
                    this.animTimer = 0;
                }

                if (this.invincibleTime > 0) this.invincibleTime--;

                // MP自然回復 (7秒に1回 + regen補正)
                this.mpRegenTimer++;
                if (this.mpRegenTimer >= 420) {
                    this.mp = Math.min(this.maxMp, this.mp + 1 + Math.floor(this.regen * 0.5));
                    this.mpRegenTimer = 0;
                    updateMpBar();
                }
            }

            draw() {
                if (this.invincibleTime > 0 && frameCount % 10 < 5) return; // 無敵時間の点滅
                
                // 出現エフェクト
                if (this.spawnAnimTimer > 0) {
                    ctx.save();
                    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                    const progress = 1 - (this.spawnAnimTimer / 60);
                    ctx.globalAlpha = this.spawnAnimTimer / 60;
                    
                    // 光の柱
                    const grad = ctx.createLinearGradient(0, -300, 0, 50);
                    grad.addColorStop(0, 'rgba(255, 255, 200, 0)');
                    grad.addColorStop(0.5, 'rgba(255, 255, 200, 0.5)');
                    grad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
                    ctx.fillStyle = grad;
                    ctx.fillRect(-40, -600, 80, 650);

                    // 光の球
                    ctx.beginPath();
                    ctx.arc(0, 0, 20 + progress * 100, 0, Math.PI*2);
                    ctx.fillStyle = '#FFF';
                    ctx.shadowColor = '#FFD700';
                    ctx.shadowBlur = 30;
                    ctx.fill();
                    
                    ctx.restore();
                    this.spawnAnimTimer--;
                }

                const sprite = this.facing === 'right' ? SPRITES.player_right : SPRITES.player_left;
                const bounce = Math.sin(this.animTimer * 2) * 2; // 上下動
                const rotate = Math.sin(this.animTimer) * 0.1; // 左右の揺れ
                ctx.save();
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.rotate(rotate);
                ctx.drawImage(sprite, -this.width / 2, -this.height / 2 - Math.abs(bounce), this.width, this.height);

                // HP Bar
                if (this.hp < this.maxHp) {
                    const barWidth = 40;
                    const barHeight = 5;
                    const yOffset = -this.height / 2 - 12 - Math.abs(bounce);
                    ctx.fillStyle = '#333';
                    ctx.fillRect(-barWidth/2, yOffset, barWidth, barHeight);
                    ctx.fillStyle = '#32C832';
                    ctx.fillRect(-barWidth/2, yOffset, barWidth * (this.hp / this.maxHp), barHeight);
                }

                ctx.restore();
            }
            
            getCenter() {
                return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            }
        }

        class Pet {
            constructor(player) {
                this.player = player;
                this.width = 20;
                this.height = 20;
                this.x = player.x;
                this.y = player.y;
                this.attackTimer = 0;
                this.attackCooldown = 60; // 1秒に1回攻撃
            }

            update() {
                // プレイヤーへの追従 (Lerp的な動き)
                const targetX = this.player.x - 30; // 少し左後ろ
                const targetY = this.player.y - 30;
                
                const dx = targetX - this.x;
                const dy = targetY - this.y;
                
                this.x += dx * 0.1;
                this.y += dy * 0.1;

                // 攻撃
                this.attackTimer++;
                if (this.attackTimer >= this.attackCooldown) {
                    const target = getNearestEnemy({x: this.x, y: this.y});
                    if (target) {
                        const pc = {x: this.x + this.width/2, y: this.y + this.height/2};
                        const tc = target.getCenter();
                        bullets.push(new Bullet(pc.x, pc.y, tc.x, tc.y)); // プレイヤーの弾と同じものを使用
                        Audio.shoot();
                        this.attackTimer = 0;
                    }
                }
            }

            draw() {
                // 上下動のアニメーション
                const bounce = Math.sin(frameCount * 0.1) * 5;
                ctx.drawImage(SPRITES.pet, this.x, this.y + bounce, this.width, this.height);
            }
        }

        class Village {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 60;
                this.height = 60;
            }
            draw() {
                ctx.drawImage(SPRITES.village, this.x, this.y, this.width, this.height);
            }
        }

        class Fortress {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 800;
                this.height = 800;
                this.triggered = false;
                this.cleared = false;
                this.enemies = [];
                this.traps = [];
                this.clearTimer = 0;
                this.active = true;
                this.prisoner = null;
                
                // 建設予定地の障害物を除去
                const startX = Math.floor(this.x / 100);
                const endX = Math.floor((this.x + this.width) / 100);
                const startY = Math.floor(this.y / 100);
                const endY = Math.floor((this.y + this.height) / 100);
                
                for(let ix = startX; ix <= endX; ix++) {
                    for(let iy = startY; iy <= endY; iy++) {
                        destroyedObstacles.add(`${ix},${iy}`);
                    }
                }

                // トラップ配置
                for(let i=0; i<15; i++) {
                    const tx = this.x + 100 + Math.random() * (this.width - 200);
                    const ty = this.y + 100 + Math.random() * (this.height - 200);
                    this.traps.push({
                        x: tx, y: ty, width: 32, height: 32,
                        type: Math.random() < 0.5 ? 'mine' : 'spike',
                        active: true
                    });
                }

                // 囚人設定
                const jobs = NPC_JOBS.filter(j => !j.hidden).map(j => j.id);
                const job = jobs[Math.floor(Math.random() * jobs.length)];
                this.prisoner = { x: this.x + this.width/2, y: this.y + this.height/2, job: job };
            }

            update() {
                if (this.triggered && !this.cleared) {
                    // 閉じ込め処理 (結界)
                    const margin = 30;
                    if (player.x < this.x + margin) player.x = this.x + margin;
                    if (player.x + player.width > this.x + this.width - margin) player.x = this.x + this.width - margin - player.width;
                    if (player.y < this.y + margin) player.y = this.y + margin;
                    if (player.y + player.height > this.y + this.height - margin) player.y = this.y + this.height - margin - player.height;

                    // トラップ判定
                    for (const trap of this.traps) {
                        if (!trap.active) continue;
                        if (Math.abs((player.x + player.width/2) - (trap.x + trap.width/2)) < 20 &&
                            Math.abs((player.y + player.height/2) - (trap.y + trap.height/2)) < 20) {
                            
                            if (trap.type === 'mine') {
                                trap.active = false;
                                spawnExplosion(trap.x + 16, trap.y + 16, '#FF0000', 10);
                                Audio.explosion();
                                if (player.invincibleTime <= 0) { player.hp -= 30; damageFlashOpacity = 0.8; player.invincibleTime = 30; }
                            } else if (trap.type === 'spike') {
                                if (player.invincibleTime <= 0) { player.hp -= 5; damageFlashOpacity = 0.3; player.invincibleTime = 20; Audio.damage(); }
                            }
                        }
                    }

                    // 生存している敵をカウント
                    this.enemies = this.enemies.filter(e => e.hp > 0);
                    if (this.enemies.length === 0) {
                        this.cleared = true;
                        showChat("SYSTEM", "FORTRESS CLEARED!", "#FFD700");
                        Audio.legend();
                        
                        // 囚人解放
                        if (this.prisoner) {
                            const npc = new NPC(this.prisoner.x, this.prisoner.y, this.prisoner.job);
                            npcs.push(npc);
                            showChat(NPC_JOBS.find(j=>j.id===npc.job).name, "助かった...恩に着る！", NPC_JOBS.find(j=>j.id===npc.job).color);
                            this.prisoner = null;
                        }
                    }
                } else if (this.cleared) {
                    // クリア演出 (崩壊)
                    this.clearTimer++;
                    
                    // ランダムな爆発
                    if (this.clearTimer % 5 === 0) {
                        const ex = this.x + Math.random() * this.width;
                        const ey = this.y + Math.random() * this.height;
                        spawnExplosion(ex, ey, '#FF4500', 10);
                        Audio.explosion();
                    }

                    // 演出終了
                    if (this.clearTimer > 120) { // 2秒後
                        this.active = false;
                        
                        // 次の要塞を生成
                        const angle = Math.random() * Math.PI * 2;
                        const dist = 4000 + Math.random() * 2000;
                        const fx = player.x + Math.cos(angle)*dist;
                        const fy = player.y + Math.sin(angle)*dist;
                        fortresses.push(new Fortress(fx, fy));
                        showChat("SYSTEM", "NEW FORTRESS DETECTED!", "#FF4500");
                        
                        // 報酬
                        const cx = this.x + this.width/2;
                        const cy = this.y + this.height/2;
                        chests.push(new Chest(cx, cy));
                        for(let i=0; i<8; i++) {
                            const angle = (Math.PI*2/8)*i;
                            gems.push(new Gem(cx + Math.cos(angle)*50, cy + Math.sin(angle)*50, 100));
                        }
                        // レジェンド武器ドロップのチャンス
                        if (Math.random() < 0.5) {
                             legendDrops.push(new LegendWeaponDrop(cx, cy + 50));
                        }
                        
                        // 大爆発
                        spawnExplosion(cx, cy, '#FFD700', 50);
                    }
                } else if (!this.triggered && !this.cleared) {
                    // プレイヤー侵入判定
                    if (player.x > this.x && player.x < this.x + this.width &&
                        player.y > this.y && player.y < this.y + this.height) {
                        
                        this.triggered = true;
                        showChat("SYSTEM", "WARNING: MONSTER HOUSE!", "#FF0000");
                        
                        // 敵スポーン
                        const count = 40 + Math.floor(level);
                        for(let i=0; i<count; i++) {
                            const types = Object.keys(ENEMY_DATA).filter(k => !ENEMY_DATA[k].isBoss);
                            const type = types[Math.floor(Math.random() * types.length)];
                            const e = new Enemy(type, player);
                            e.x = this.x + 50 + Math.random() * (this.width - 100);
                            e.y = this.y + 50 + Math.random() * (this.height - 100);
                            enemies.push(e);
                            this.enemies.push(e);
                            spawnExplosion(e.x, e.y, '#FF0000', 5);
                        }
                        
                        // 中ボス
                        const bossType = ['large_boss', 'boss_hydra', 'boss_lich'][Math.floor(Math.random()*3)];
                        const boss = new Enemy(bossType, player);
                        boss.x = this.x + this.width/2;
                        boss.y = this.y + this.height/2;
                        enemies.push(boss);
                        this.enemies.push(boss);
                    }
                }
            }

            draw() {
                if (!this.active) return;

                ctx.save();
                if (this.cleared) {
                    const shake = 5;
                    ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake);
                    ctx.globalAlpha = Math.max(0, 1.0 - (this.clearTimer / 120)); // 徐々に消える
                }

                // 床
                ctx.fillStyle = '#220000';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                // 格子模様
                ctx.strokeStyle = '#440000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for(let i=0; i<=this.width; i+=50) {
                    ctx.moveTo(this.x + i, this.y); ctx.lineTo(this.x + i, this.y + this.height);
                }
                for(let i=0; i<=this.height; i+=50) {
                    ctx.moveTo(this.x, this.y + i); ctx.lineTo(this.x + this.width, this.y + i);
                }
                ctx.stroke();

                // トラップ描画
                for (const trap of this.traps) {
                    if (!trap.active) continue;
                    const sprite = trap.type === 'mine' ? SPRITES.fortress_mine : SPRITES.fortress_spike;
                    ctx.drawImage(sprite, trap.x, trap.y);
                }

                // 壁 (枠)
                ctx.strokeStyle = '#FF4500';
                ctx.lineWidth = 8;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                
                // 入口の装飾など
                if (!this.triggered) {
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                    ctx.fillStyle = '#FFF';
                    ctx.font = '30px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText("DANGER", this.x + this.width/2, this.y + this.height/2);
                } else if (this.triggered && !this.cleared) {
                    // 戦闘中の結界エフェクト
                    ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(frameCount * 0.2) * 0.3})`;
                    ctx.lineWidth = 10;
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                }

                // 囚人（檻）
                if (this.prisoner) {
                    ctx.strokeStyle = '#FFF';
                    ctx.lineWidth = 4;
                    ctx.strokeRect(this.prisoner.x - 20, this.prisoner.y - 20, 40, 40);
                    ctx.beginPath();
                    for(let i=0; i<=40; i+=10) {
                        ctx.moveTo(this.prisoner.x - 20 + i, this.prisoner.y - 20);
                        ctx.lineTo(this.prisoner.x - 20 + i, this.prisoner.y + 20);
                    }
                    ctx.stroke();
                    ctx.fillStyle = '#FFF';
                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText("HELP!", this.prisoner.x, this.prisoner.y - 25);
                }

                ctx.restore();
            }
        }

        class Dungeon {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 700;
                this.height = 700;
                this.cleared = false;
                this.clearTimer = 0;
                this.enemies = [];

                // 建設予定地の障害物を除去
                const startX = Math.floor(this.x / 100);
                const endX = Math.floor((this.x + this.width) / 100);
                const startY = Math.floor(this.y / 100);
                const endY = Math.floor((this.y + this.height) / 100);
                for (let ix = startX; ix <= endX; ix++) {
                    for (let iy = startY; iy <= endY; iy++) {
                        destroyedObstacles.add(`${ix},${iy}`);
                    }
                }

                // アンデッド系のみで構成された固有の敵編成
                const pool = ['skeleton', 'wraith', 'ghost', 'mummy', 'gargoyle', 'zombie'];
                const count = 15 + Math.floor(level * 1.2);
                for (let i = 0; i < count; i++) {
                    const type = pool[Math.floor(Math.random() * pool.length)];
                    const e = new Enemy(type, player);
                    e.x = this.x + 60 + Math.random() * (this.width - 120);
                    e.y = this.y + 60 + Math.random() * (this.height - 120);
                    enemies.push(e);
                    this.enemies.push(e);
                }

                // 固有の番人（守護者）
                this.guardianType = ['boss_lich', 'boss_hydra'][Math.floor(Math.random() * 2)];
                const guardian = new Enemy(this.guardianType, player);
                guardian.x = this.x + this.width / 2;
                guardian.y = this.y + 100;
                enemies.push(guardian);
                this.enemies.push(guardian);
            }

            update() {
                // 結界で外に出られないようにする
                const margin = 30;
                if (player.x < this.x + margin) player.x = this.x + margin;
                if (player.x + player.width > this.x + this.width - margin) player.x = this.x + this.width - margin - player.width;
                if (player.y < this.y + margin) player.y = this.y + margin;
                if (player.y + player.height > this.y + this.height - margin) player.y = this.y + this.height - margin - player.height;

                if (!this.cleared) {
                    this.enemies = this.enemies.filter(e => e.hp > 0);
                    if (this.enemies.length === 0) {
                        this.cleared = true;
                        showChat("SYSTEM", "DUNGEON CLEARED!", "#00FFFF");
                        Audio.legend();

                        // 固有の報酬: レジェンド武器確定＋ユニーク武器＋大量のジェム
                        const cx = player.getCenter().x;
                        const cy = player.getCenter().y;
                        legendDrops.push(new LegendWeaponDrop(cx, cy));
                        uniqueDrops.push(new UniqueWeaponDrop(cx + 30, cy));
                        for (let j = 0; j < 12; j++) {
                            const angle = (Math.PI * 2 / 12) * j;
                            gems.push(new Gem(cx + Math.cos(angle) * 60, cy + Math.sin(angle) * 60, 150));
                        }
                        spawnExplosion(cx, cy, '#00FFFF', 40);
                    }
                } else {
                    this.clearTimer++;
                    if (this.clearTimer > 180) { // 3秒後に帰還
                        const dx = dungeonReturnX - player.x;
                        const dy = dungeonReturnY - player.y;
                        npcs.forEach(n => { n.x += dx; n.y += dy; });
                        pets.forEach(p => { p.x += dx; p.y += dy; });
                        player.x = dungeonReturnX;
                        player.y = dungeonReturnY;
                        showChat("SYSTEM", "RETURNED FROM DUNGEON", "#00FFFF");
                        currentDungeon = null;
                    }
                }
            }

            draw() {
                // 床
                ctx.fillStyle = '#0a0a2a';
                ctx.fillRect(this.x, this.y, this.width, this.height);

                // 石畳模様
                ctx.strokeStyle = '#1a1a4a';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i <= this.width; i += 50) {
                    ctx.moveTo(this.x + i, this.y); ctx.lineTo(this.x + i, this.y + this.height);
                }
                for (let i = 0; i <= this.height; i += 50) {
                    ctx.moveTo(this.x, this.y + i); ctx.lineTo(this.x + this.width, this.y + i);
                }
                ctx.stroke();

                // 壁 (枠)
                ctx.strokeStyle = '#00BFFF';
                ctx.lineWidth = 8;
                ctx.strokeRect(this.x, this.y, this.width, this.height);

                if (!this.cleared) {
                    ctx.strokeStyle = `rgba(0, 191, 255, ${0.5 + Math.sin(frameCount * 0.2) * 0.3})`;
                    ctx.lineWidth = 10;
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                } else {
                    ctx.fillStyle = `rgba(0, 255, 255, ${0.3 - (this.clearTimer / 180) * 0.3})`;
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            }
        }

        class DungeonEntrance {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 60;
                this.height = 60;
            }
            draw() {
                ctx.drawImage(SPRITES.dungeon_entrance, this.x, this.y, this.width, this.height);
            }
        }

        class Enemy {
            constructor(type = 'normal', player) {
                // 難易度上昇: 30秒(1800フレーム)ごとにHP+20%
                const wave = Math.floor(frameCount / 1800);
                const hpMultiplier = 1 + (wave * 0.3); // 難易度上昇を急に
                
                // エンドレスモード補正
                let endlessMult = 1.0;
                if (isEndlessMode) endlessMult = 1.0 + (wave * 0.5); // さらに強化

                const data = ENEMY_DATA[type] || ENEMY_DATA['normal'];

                this.type = type;
                this.width = data.width;
                this.height = data.height;
                this.hp = data.hp * hpMultiplier * player.curse; // 呪いで敵のHPも強化される
                this.maxHp = this.hp * endlessMult;
                this.speed = ENEMY_SPEED * data.speed;
                this.xpValue = data.xp;

                this.merged = false; // 合体フラグ
                this.invincibleTime = 0;
                this.attackTimer = 0;
                this.state = 0; // 0: Chase, 1: Prep, 2: Charge
                this.kx = 0; // ノックバックX
                this.ky = 0; // ノックバックY
                this.frozenTimer = 0;
                this.slowTimer = 0;
                
                this.shootTimer = 0;
                this.chatTimer = 0;
                this.firebarAngle = 0;
                // 画面外からランダムにスポーン
                const side = Math.floor(Math.random() * 4);
                const pc = player.getCenter();
                if (side === 0) { // Top
                    this.x = pc.x + (Math.random() * SCREEN_WIDTH - SCREEN_WIDTH/2);
                    this.y = pc.y - SCREEN_HEIGHT/2 - 50;
                } else if (side === 1) { // Bottom
                    this.x = pc.x + (Math.random() * SCREEN_WIDTH - SCREEN_WIDTH/2);
                    this.y = pc.y + SCREEN_HEIGHT/2 + 50;
                } else if (side === 2) { // Left
                    this.x = pc.x - SCREEN_WIDTH/2 - 50;
                    this.y = pc.y + (Math.random() * SCREEN_HEIGHT - SCREEN_HEIGHT/2);
                } else { // Right
                    this.x = pc.x + SCREEN_WIDTH/2 + 50;
                    this.y = pc.y + (Math.random() * SCREEN_HEIGHT - SCREEN_HEIGHT/2);
                }
            }

            update(player) {
                if (this.frozenTimer > 0) {
                    this.frozenTimer--;
                    return; // 動けない
                }
                if (this.slowTimer > 0) {
                    this.slowTimer--;
                }

                const pc = player.getCenter();
                const ec = this.getCenter();
                
                const dx = pc.x - ec.x;
                const dy = pc.y - ec.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                const currentSpeed = this.slowTimer > 0 ? this.speed * 0.3 : this.speed;
                
                // 障害物回避ベクトル
                let avoid = {x:0, y:0};
                const isGhost = ['ghost', 'wraith', 'spirit'].includes(this.type);
                if (!isGhost) {
                    avoid = getAvoidanceVector(this, 1.5);
                }
                
                this.attackTimer++;

                let vx = 0;
                let vy = 0;

                // タイプごとの行動パターン
                if (this.type === 'skeleton' || this.type === 'imp' || this.type === 'boss_lich') {
                    // 遠距離攻撃タイプ
                    if (dist > 250) { // 近づきすぎない
                        vx = (dx / dist) * currentSpeed;
                        vy = (dy / dist) * currentSpeed;
                    }
                    if (this.attackTimer > 120 && dist < 500) {
                        enemyBullets.push(new EnemyBullet(ec.x, ec.y, pc.x, pc.y));
                        this.attackTimer = 0;
                    }
                } else if (this.type === 'large_boss') {
                    // ラージボス: 放射状通常弾
                    if (dist > 150) {
                        vx = (dx / dist) * currentSpeed;
                        vy = (dy / dist) * currentSpeed;
                    }
                    if (this.attackTimer > 90) {
                        for (let i = 0; i < 12; i++) {
                            const angle = (Math.PI * 2 / 12) * i;
                            const tx = ec.x + Math.cos(angle) * 100;
                            const ty = ec.y + Math.sin(angle) * 100;
                            enemyBullets.push(new EnemyBullet(ec.x, ec.y, tx, ty));
                        }
                        this.attackTimer = 0;
                    }
                } else if (this.type === 'wolf' || this.type === 'minotaur' || this.type === 'fast' || this.type === 'boar' || this.type === 'boss_phoenix') {
                    if (dist > 0) {
                        vx = (dx / dist) * currentSpeed;
                        vy = (dy / dist) * currentSpeed;
                    }
                } else if (this.type === 'final_boss' || this.type === 'dark_lord') {
                    // ラスボス: 放射状ホーミング弾
                    this.shootTimer++;
                    if (this.shootTimer > 60) {
                        for (let i = 0; i < 8; i++) {
                            const angle = (Math.PI * 2 / 8) * i + (frameCount * 0.05);
                            const tx = ec.x + Math.cos(angle) * 100;
                            const ty = ec.y + Math.sin(angle) * 100;
                            enemyBullets.push(new EnemyBullet(ec.x, ec.y, tx, ty, true));
                        }
                        this.shootTimer = 0;
                    }
                    // 突進タイプ
                    if (this.state === 0) { // 追跡
                        if (dist > 0) {
                            vx = (dx / dist) * currentSpeed;
                            vy = (dy / dist) * currentSpeed;
                        }
                        if (this.attackTimer > 180 && dist < 300) {
                            this.state = 1; // 予備動作
                            this.attackTimer = 0;
                        }
                    } else if (this.state === 1) { // 予備動作 (震える)
                        this.x += (Math.random() - 0.5) * 4;
                        if (this.attackTimer > 40) {
                            this.state = 2; // 突進開始
                            this.attackTimer = 0;
                            this.chargeVx = (dx / dist) * (currentSpeed * 4);
                            this.chargeVy = (dy / dist) * (currentSpeed * 4);
                        }
                    } else if (this.state === 2) { // 突進中
                        vx = this.chargeVx;
                        vy = this.chargeVy;
                        if (this.attackTimer > 30) {
                            this.state = 0; // 追跡に戻る
                            this.attackTimer = 0;
                        }
                    }
                } else if (this.type === 'sorcerer') {
                    // ソーサラー: 低確率でホーミング弾
                    if (dist > 200) {
                        vx = (dx / dist) * currentSpeed;
                        vy = (dy / dist) * currentSpeed;
                    }
                    if (this.attackTimer > 150 && dist < 600) {
                        enemyBullets.push(new EnemyBullet(ec.x, ec.y, pc.x, pc.y, true)); // ホーミング
                        this.attackTimer = 0;
                    }
                } else if (this.type === 'dragon') {
                    // ドラゴン: 常に移動しつつ攻撃
                    if (dist > 0) {
                        vx = (dx / dist) * currentSpeed;
                        vy = (dy / dist) * currentSpeed;
                    }
                    if (this.attackTimer > 120 && dist < 500) {
                        enemyBullets.push(new EnemyBullet(ec.x, ec.y, pc.x, pc.y));
                        this.attackTimer = 0;
                    }
                } else if (this.type === 'bat' || this.type === 'ghost' || this.type === 'spirit') {
                    // 波状移動タイプ
                    const angle = Math.atan2(dy, dx);
                    const wave = Math.sin(frameCount * 0.1) * 1.5;
                    vx = Math.cos(angle) * currentSpeed - Math.sin(angle) * wave;
                    vy = Math.sin(angle) * currentSpeed + Math.cos(angle) * wave;
                } else if (this.type === 'blob' && !this.merged) {
                    // ブロブ: 合体ロジック
                    if (dist > 0) {
                        vx = (dx / dist) * currentSpeed;
                        vy = (dy / dist) * currentSpeed;
                    }
                    // 他のブロブを探す
                    for (const other of enemies) {
                        if (other !== this && other.type === 'blob' && !other.merged && other.hp > 0) {
                            if (Math.hypot(this.x - other.x, this.y - other.y) < (this.width + other.width) / 2) {
                                if (this.hp > other.hp || (this.hp === other.hp && Math.random() < 0.5)) {
                                    this.hp += other.hp; this.maxHp += other.maxHp; this.xpValue += other.xpValue;
                                    this.width = Math.min(80, this.width * 1.2); this.height = Math.min(80, this.height * 1.2);
                                    this.hp = Math.min(this.hp, this.maxHp); // 回復
                                    other.hp = 0; other.merged = true; // 吸収される側
                                    spawnExplosion(this.x + this.width/2, this.y + this.height/2, this.color, 5);
                                }
                            }
                        }
                    }
                } else {
                    // 通常追跡タイプ
                    if (dist > 0) {
                        vx = (dx / dist) * currentSpeed;
                        vy = (dy / dist) * currentSpeed;
                    }
                }

                // ボス: ファイアーバー
                if (this.type === 'boss') {
                    this.firebarAngle += 0.03;
                    const barLength = 150;
                    const numFireballs = 5;
                    for (let i = 1; i <= numFireballs; i++) {
                        const dist = (barLength / numFireballs) * i;
                        const fx = this.x + this.width/2 + Math.cos(this.firebarAngle) * dist;
                        const fy = this.y + this.height/2 + Math.sin(this.firebarAngle) * dist;
                        
                        // プレイヤーとの衝突判定
                        if (Math.hypot(player.x + player.width/2 - fx, player.y + player.height/2 - fy) < 15) {
                             if (player.invincibleTime <= 0) player.hp -= 5; // ダメージ
                        }
                    }
                }

                // ブラックホールに吸い寄せられる
                if (blackHole && blackHole.life > 0) {
                    const bdx = blackHole.x - ec.x;
                    const bdy = blackHole.y - ec.y;
                    const bdist = Math.hypot(bdx, bdy);
                    if (bdist > 0 && bdist < blackHole.radius) {
                        vx += (bdx / bdist) * 5; // 吸い込み力
                        vy += (bdy / bdist) * 5;
                    }
                }

                // 回避ベクトルを加算して移動
                this.x += vx + avoid.x;
                this.y += vy + avoid.y;

                if (!isGhost) {
                    checkObstacleCollision(this);
                }

                // ボスの会話
                if (BOSS_QUOTES[this.type]) {
                    this.chatTimer++;
                    if (this.chatTimer > 600 && Math.random() < 0.005) { // 10秒ごとに確率で
                        this.speak(BOSS_QUOTES[this.type][Math.floor(Math.random() * BOSS_QUOTES[this.type].length)]);
                        this.chatTimer = 0;
                    }
                }

                if (this.invincibleTime > 0) this.invincibleTime--;
            }

            draw() {
                const sprite = SPRITES[this.type] || SPRITES['normal'];
                if (this.frozenTimer > 0) {
                    ctx.save();
                    ctx.filter = 'saturate(0%) brightness(1.5) contrast(2)';
                    ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
                    ctx.restore();
                } else {
                    ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
                }

                // HP Bar
                if (this.hp < this.maxHp) {
                    ctx.fillStyle = '#333';
                    ctx.fillRect(this.x, this.y - 6, this.width, 4);
                    ctx.fillStyle = '#FF0000';
                    ctx.fillRect(this.x, this.y - 6, this.width * Math.max(0, this.hp / this.maxHp), 4);
                }

                // ファイアーバー描画
                if (this.type === 'boss') {
                    const barLength = 150;
                    const numFireballs = 5;
                    for (let i = 1; i <= numFireballs; i++) {
                        const dist = (barLength / numFireballs) * i;
                        const fx = this.x + this.width/2 + Math.cos(this.firebarAngle) * dist;
                        const fy = this.y + this.height/2 + Math.sin(this.firebarAngle) * dist;
                        ctx.drawImage(SPRITES.fireball, fx - 10, fy - 10, 20, 20);
                    }
                }
            }

            getCenter() {
                return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            }

            speak(text) {
                const name = ENEMY_DATA[this.type].name || this.type.toUpperCase().replace('_', ' ');
                showChat(name, text, ENEMY_DATA[this.type].color);
            }
        }

        class Bullet {
            constructor(startX, startY, targetX, targetY, type = 'normal') {
                this.width = 10 * player.area;
                this.height = 10 * player.area;
                this.x = startX - this.width / 2;
                this.y = startY - this.height / 2;
                this.color = '#FFFF00'; // Yellow
                this.type = type;

                const dx = targetX - startX;
                const dy = targetY - startY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                this.vx = (dx / dist) * bulletSpeed;
                this.vy = (dy / dist) * bulletSpeed;
                this.active = true;
            }

            update(player) {
                this.x += this.vx;
                this.y += this.vy;

                // プレイヤーから離れすぎたら無効化
                if (Math.hypot(this.x - player.x, this.y - player.y) > 1000) {
                    this.active = false;
                }
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }

        class Slash {
            constructor(x, y, targetX, targetY, damageMult = 1.0) {
                this.width = 60 * player.area;
                this.height = 60 * player.area;
                
                this.x = x;
                this.y = y;
                this.angle = Math.atan2(targetY - y, targetX - x);
                this.damage = 20 * player.damage * damageMult;

                this.life = Math.max(5, 12 - Math.floor(bulletSpeed / 2)); // 剣速に応じて速く
                this.maxLife = this.life;
                this.active = true;
                this.hitEnemies = [];
            }
            update() {
                this.life--;
                if (this.life <= 0) this.active = false;
            }
            draw() {
                const progress = 1 - (this.life / this.maxLife);
                // 剣を振る動き (-60度から+60度)
                const swing = (progress - 0.5) * (Math.PI * 0.8);

                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle + swing);
                
                // 剣の描画
                ctx.fillStyle = '#4a3c31'; ctx.fillRect(0, -3, 12, 6); // Handle
                ctx.fillStyle = '#FFD700'; ctx.fillRect(12, -10, 4, 20); // Guard
                ctx.fillStyle = '#EEE'; // Blade
                ctx.beginPath();
                ctx.moveTo(16, -4); ctx.lineTo(16 + this.width, 0); ctx.lineTo(16, 4);
                ctx.fill();
                ctx.restore();

                // 軌跡（スウッシュ）の描画
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.beginPath();
                ctx.arc(0, 0, this.width + 10, -Math.PI/2.5, Math.PI/2.5);
                ctx.lineTo(0, 0);
                ctx.fillStyle = `rgba(200, 200, 255, ${this.life / this.maxLife * 0.5})`;
                ctx.fill();
                ctx.restore();
            }
        }

        class Punch {
            constructor(x, y, dirX, dirY, damageMult = 1.0) {
                this.width = 60 * player.area;
                this.height = 60 * player.area;
                
                this.x = x - this.width / 2;
                this.y = y - this.height / 2;
                
                this.vx = dirX * 15;
                this.vy = dirY * 15;
                
                this.life = 12;
                this.maxLife = 12;
                this.active = true;
                this.hitEnemies = [];
                this.damage = 20 * player.damage * damageMult;
                this.knockback = 20 * player.knockback;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                this.life--; if(this.life<=0) this.active = false;
            }
            onHit(e) { return true; }
            draw() {
                ctx.save();
                ctx.translate(this.x + this.width/2, this.y + this.height/2);
                ctx.rotate(Math.atan2(this.vy, this.vx));
                
                // 拳の描画
                ctx.fillStyle = '#FFA500';
                ctx.beginPath();
                ctx.arc(0, 0, this.width/4, 0, Math.PI*2);
                ctx.fill();
                
                // 軌跡
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(-this.width/4, 0);
                ctx.lineTo(-this.width, 0);
                ctx.stroke();
                
                ctx.restore();
            }
        }

        class Gem {
            constructor(x, y, value = 1) {
                this.x = x;
                this.y = y;
                this.value = value;
                this.width = value > 1 ? 20 : 15;
                this.height = value > 1 ? 20 : 15;
                this.active = true;
            }

            update(player) {
                const pc = player.getCenter();
                const dist = Math.hypot(pc.x - this.x, pc.y - this.y);
                if (dist < player.magnet) { // 磁石効果
                    this.x += (pc.x - this.x) * 0.1; // 吸引速度アップ
                    this.y += (pc.y - this.y) * 0.1;
                }
            }

            draw() {
                if (this.value > 1) {
                    ctx.filter = 'hue-rotate(90deg)'; // ボスジェムは色を変える
                }
                ctx.drawImage(SPRITES.gem, this.x, this.y, this.width, this.height);
                ctx.filter = 'none';
            }
        }

        class Chest {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 30;
                this.height = 30;
            }
            draw() {
                ctx.drawImage(SPRITES.chest, this.x, this.y, this.width, this.height);
            }
        }

        class Potion {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 32;
                this.height = 32;
                this.healAmount = 50;
            }

            draw() {
                ctx.drawImage(SPRITES.potion, this.x, this.y, this.width, this.height);
            }
        }

        class MpPotion {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 32;
                this.height = 32;
                this.healAmount = 50;
            }
            draw() {
                ctx.drawImage(SPRITES.mp_potion, this.x, this.y, this.width, this.height);
            }
        }

        class UniqueWeaponDrop {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 24;
                this.height = 24;
            }
            draw() {
                ctx.drawImage(SPRITES.unique_weapon, this.x, this.y, this.width, this.height);
            }
        }

        class FairyItem {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 24;
                this.height = 24;
            }
            draw() {
                ctx.drawImage(SPRITES.fairy_item, this.x, this.y, this.width, this.height);
            }
        }

        class Contract {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 24;
                this.height = 24;
            }
            draw() {
                ctx.drawImage(SPRITES.contract, this.x, this.y, this.width, this.height);
            }
        }

        class LegendWeaponDrop {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 32;
                this.height = 32;
            }
            draw() {
                ctx.drawImage(SPRITES.legend_weapon, this.x, this.y, this.width, this.height);
            }
        }

        class Axe {
            constructor(x, y) {
                this.width = 25 * player.area;
                this.height = 25 * player.area;
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 4; // 横にばらつく
                this.vy = -8; // 上に打ち上げ
                this.gravity = 0.4;
                this.active = true;
            }

            update(player) {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += this.gravity;
                if (this.y > player.y + SCREEN_HEIGHT) this.active = false;
            }

            draw() {
                ctx.drawImage(SPRITES.axe, this.x, this.y, this.width, this.height);
            }
        }

        class Nova {
            constructor(x, y, level) {
                this.x = x;
                this.y = y;
                this.radius = 10 * player.area;
                this.maxRadius = (100 + (level * 20)) * player.area; // 範囲縮小
                this.speed = 8;
                this.damage = (15 + (level * 5)) * player.damage; // ダメージ大幅減
                this.active = true;
                this.hitEnemies = [];
            }

            update() {
                this.radius += this.speed;
                if (this.radius > this.maxRadius) {
                    this.active = false;
                }
            }

            draw() {
                ctx.strokeStyle = '#FF4500';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = 'rgba(255, 69, 0, 0.1)';
                ctx.fill();
            }
        }

        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 5;
                this.vy = (Math.random() - 0.5) * 5;
                this.life = 1.0;
                this.decay = Math.random() * 0.05 + 0.02;
                this.color = color;
                this.size = Math.random() * 4 + 2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life -= this.decay;
            }
            draw() {
                ctx.globalAlpha = Math.max(0, this.life);
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
                ctx.globalAlpha = 1.0;
            }
        }

        class Dagger {
            constructor(x, y, dirX, dirY, evolved = false, damageMult = 1.0) {
                this.width = 20 * player.area;
                this.height = 20 * player.area;
                this.x = x - this.width/2;
                this.y = y - this.height/2;
                this.speed = evolved ? (bulletSpeed + 8) : (bulletSpeed + 3);
                this.vx = dirX * this.speed;
                this.vy = dirY * this.speed;
                this.damage = 15 * player.damage * damageMult;
                this.active = true;
                this.rotation = Math.atan2(dirY, dirX) + Math.PI/2;
            }
            update(player) {
                this.x += this.vx;
                this.y += this.vy;
                if (Math.hypot(this.x - player.x, this.y - player.y) > 1000) this.active = false;
            }
            draw() {
                ctx.save();
                ctx.translate(this.x + this.width/2, this.y + this.height/2);
                ctx.rotate(this.rotation);
                const sprite = player.evolved.dagger ? SPRITES.thousand_edge : SPRITES.dagger;
                ctx.drawImage(sprite, -this.width/2, -this.height/2, this.width, this.height);
                ctx.restore();
            }
        }

        class MagicWand {
            constructor(startX, startY, targetX, targetY, evolved = false, damageMult = 1.0) {
                this.width = 15 * player.area;
                this.height = 15 * player.area;
                this.x = startX - this.width / 2;
                this.y = startY - this.height / 2;
                const dx = targetX - startX;
                const dy = targetY - startY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const speed = evolved ? (bulletSpeed + 2) : (bulletSpeed - 1);
                this.vx = (dx / dist) * speed;
                this.vy = (dy / dist) * speed;
                this.damage = 12 * player.damage * damageMult;
                this.active = true;
            }
            update(player) {
                this.x += this.vx;
                this.y += this.vy;
                if (Math.hypot(this.x - player.x, this.y - player.y) > 1000) this.active = false;
            }
            draw() {
                const sprite = player.evolved.wand ? SPRITES.holy_wand : SPRITES.wand;
                ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
            }
        }

        class Fireball {
            constructor(x, y, evolved = false, angle = null) { // angle引数を追加
                this.evolved = evolved;
                this.width = (evolved ? 50 : 30) * player.area;
                this.height = (evolved ? 50 : 30) * player.area;
                this.x = x;
                this.y = y;
                const finalAngle = angle !== null ? angle : Math.random() * Math.PI * 2; // 角度が指定されていれば使用
                const speed = evolved ? (bulletSpeed + 1) : (bulletSpeed - 2);
                this.vx = Math.cos(finalAngle) * speed;
                this.vy = Math.sin(finalAngle) * speed;
                this.active = true;
                this.hitEnemies = []; // 貫通管理
            }
            update(player) {
                this.x += this.vx;
                this.y += this.vy;
                if (Math.hypot(this.x - player.x, this.y - player.y) > 1000) this.active = false;
            }
            draw() {
                const sprite = this.evolved ? SPRITES.hellfire : SPRITES.fireball;
                ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
            }
        }

        class Lightning {
            constructor(target) {
                this.x = target.x + target.width/2 - 16;
                this.y = target.y - 32;
                this.life = 10;
                this.active = true;
            }
            update() {
                this.life--;
                if (this.life <= 0) this.active = false;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.life / 10;
                ctx.drawImage(SPRITES.lightning, this.x, this.y, 32, 64);
                ctx.restore();
            }
        }

