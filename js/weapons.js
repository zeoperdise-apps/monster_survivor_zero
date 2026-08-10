        // --- 新規武器クラス (共通管理用) ---
        class GenericWeapon {
            constructor(x, y, type) {
                this.x = x; this.y = y;
                this.type = type;
                this.active = true;
                this.hitEnemies = [];
                this.damage = 10 * player.damage;
                this.knockback = 10 * player.knockback;
                this.width = 20; this.height = 20;
            }
            update() {}
            draw() { ctx.drawImage(SPRITES[this.type], this.x, this.y, this.width, this.height); }
            onHit(e) { return true; } // trueならヒット処理継続
        }

        class LightningVortex extends GenericWeapon {
            constructor(angle) {
                super(player.getCenter().x, player.getCenter().y, 'lightning');
                this.angle = angle;
                this.distance = 20;
                this.life = 180 * player.duration; // 3秒持続
                this.damage = 8 * player.damage;
                this.width = 20;
                this.height = 40;
            }
            update() {
                this.angle += 0.05; // 回転
                this.distance += 0.5; // 広がる
                
                const pc = player.getCenter();
                this.x = pc.x + Math.cos(this.angle) * this.distance - this.width/2;
                this.y = pc.y + Math.sin(this.angle) * this.distance - this.height/2;

                this.life--;
                if (this.life <= 0) this.active = false;
            }
            draw() {
                ctx.save();
                ctx.translate(this.x + this.width/2, this.y + this.height/2);
                ctx.rotate(this.angle + Math.PI/2);
                ctx.drawImage(SPRITES.lightning, -this.width/2, -this.height/2, this.width, this.height);
                ctx.restore();
            }
            onHit(e) { return true; } // 貫通
        }

        class LegendHomingOrb extends GenericWeapon {
            constructor(player) {
                super(player.x, player.y, 'legend_weapon');
                this.player = player;
                this.angle = 0;
                this.distance = 60;
                this.attackTimer = 0;
                this.attackInterval = 2; // 超高速連射
                this.width = 24;
                this.height = 24;
            }
            update() {
                this.angle += 0.05;
                this.x = this.player.getCenter().x + Math.cos(this.angle) * this.distance - this.width/2;
                this.y = this.player.getCenter().y + Math.sin(this.angle) * this.distance - this.height/2;
                
                this.attackTimer++;
                if (this.attackTimer >= this.attackInterval) {
                    this.attackTimer = 0;
                    const target = getNearestEnemy({x:this.x, y:this.y});
                    if (target) {
                        activeWeapons.push(new LegendHomingBullet(this.x + this.width/2, this.y + this.height/2, target));
                        Audio.shoot();
                    }
                }
            }
            draw() {
                ctx.save();
                ctx.translate(this.x + this.width/2, this.y + this.height/2);
                ctx.rotate(this.angle * 2);
                ctx.drawImage(SPRITES.legend_weapon, -this.width/2, -this.height/2, this.width, this.height);
                ctx.restore();
            }
            onHit(e) { return false; }
        }

        class LegendHomingBullet extends GenericWeapon {
            constructor(x, y, target) {
                super(x, y, 'legend_bullet'); // ダミータイプ、drawで描画
                this.target = target;
                this.speed = 25; // 弾速アップ
                this.vx = (Math.random()-0.5) * 4;
                this.vy = -5;
                this.homingStrength = 2.0; // 追尾性能アップ
                this.life = 300;
                this.damage = 300 * player.damage; // ダメージ3倍
                this.width = 12;
                this.height = 12;
            }
            update() {
                if (this.target && this.target.hp > 0) {
                    const tc = this.target.getCenter();
                    const dx = tc.x - (this.x + this.width/2);
                    const dy = tc.y - (this.y + this.height/2);
                    const dist = Math.hypot(dx, dy);
                    if (dist > 0) {
                        this.vx += (dx / dist) * this.homingStrength;
                        this.vy += (dy / dist) * this.homingStrength;
                    }
                } else {
                     const newTarget = getNearestEnemy({x:this.x, y:this.y});
                     if (newTarget) this.target = newTarget;
                }
                
                const speed = Math.hypot(this.vx, this.vy);
                if (speed > this.speed) {
                    this.vx = (this.vx / speed) * this.speed;
                    this.vy = (this.vy / speed) * this.speed;
                }
                
                this.x += this.vx;
                this.y += this.vy;
                this.life--;
                if (this.life <= 0) this.active = false;
                
                if (frameCount % 3 === 0) {
                    particles.push(new Particle(this.x + this.width/2, this.y + this.height/2, '#00FFFF'));
                }
            }
            draw() {
                ctx.fillStyle = '#00FFFF';
                ctx.beginPath(); ctx.arc(this.x + this.width/2, this.y + this.height/2, 6, 0, Math.PI*2); ctx.fill();
                ctx.shadowColor = '#00FFFF'; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;
            }
            onHit(e) {
                // this.active = false; // 貫通するように変更
                spawnExplosion(this.x, this.y, '#00FFFF', 5);
                return true;
            }
        }

        class Boomerang extends GenericWeapon {
            constructor(x, y, dirX, dirY, evolved = false) {
                super(x, y, evolved ? 'heaven_sword' : 'boomerang');
                this.evolved = evolved;
                this.vx = dirX * (evolved ? 12 : 8); this.vy = dirY * (evolved ? 12 : 8);
                this.life = 120 * player.duration;
                this.maxLife = this.life;
                this.damage = 15 * player.damage;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                this.life--;
                if (this.life < this.maxLife / 2) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    this.vx += dx * 0.05; this.vy += dy * 0.05;
                }
                if (this.life <= 0) this.active = false;
                // プレイヤーに戻ったら消える
                if (this.life < this.maxLife / 2 && Math.hypot(player.x - this.x, player.y - this.y) < 30) this.active = false;
            }
        }

        class Mine extends GenericWeapon {
            constructor(x, y) {
                super(x, y, 'mine');
                this.damage = 50 * player.damage;
                this.life = 600 * player.duration;
            }
            update() { this.life--; if(this.life<=0) this.active = false; }
            onHit(e) {
                this.active = false;
                activeWeapons.push(new Explosion(this.x, this.y));
                return true;
            }
        }

        class Explosion extends GenericWeapon {
            constructor(x, y) {
                super(x, y, 'explosion');
                this.width = 60 * player.area; this.height = 60 * player.area;
                this.x -= this.width/2; this.y -= this.height/2;
                this.life = 10;
                this.damage = 30 * player.damage;
            }
            update() { this.life--; if(this.life<=0) this.active = false; }
        }

        class Tornado extends GenericWeapon {
            constructor(x, y) {
                super(x, y, 'tornado');
                this.vx = (Math.random()-0.5)*4; this.vy = (Math.random()-0.5)*4;
                this.life = 180 * player.duration;
                this.width = 40 * player.area; this.height = 40 * player.area;
                this.damage = 5 * player.damage;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                this.vx += (Math.random()-0.5); this.vy += (Math.random()-0.5);
                this.life--; if(this.life<=0) this.active = false;
            }
            onHit(e) { return true; } // 貫通
        }

        class Shuriken extends GenericWeapon {
            constructor(x, y, dirX, dirY) {
                super(x, y, 'shuriken');
                this.vx = dirX * 12; this.vy = dirY * 12;
                this.life = 60;
                this.damage = 12 * player.damage;
            }
            update() { this.x += this.vx; this.y += this.vy; this.life--; if(this.life<=0) this.active = false; }
            onHit(e) { this.active = false; return true; }
        }

        class HolyWater extends GenericWeapon {
            constructor(x, y) {
                super(x, y, 'holy_water');
                this.targetY = y + (Math.random()*100 - 50);
                this.vy = -5; this.gravity = 0.5;
            }
            update() {
                this.y += this.vy; this.vy += this.gravity;
                if (this.y >= this.targetY) {
                    this.active = false;
                    activeWeapons.push(new HolyZone(this.x, this.y));
                }
            }
            onHit(e) { return false; } // 落下中は当たらない
        }

        class Spear extends GenericWeapon {
            constructor(x, y, dirX, dirY) {
                super(x, y, 'spear');
                this.vx = dirX * 15;
                this.vy = dirY * 15;
                this.angle = Math.atan2(dirY, dirX);
                this.life = 20;
                this.damage = 20 * player.damage;
                this.knockback = 15 * player.knockback;
                this.width = 80 * player.area;
                this.height = 15 * player.area;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life--;
                if (this.life <= 0) this.active = false;
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                
                // 槍の描画
                ctx.fillStyle = '#8B4513'; ctx.fillRect(-this.width/2, -2, this.width * 0.7, 4); // 柄
                ctx.fillStyle = '#C0C0C0'; // 穂先
                ctx.beginPath(); ctx.moveTo(this.width * 0.2, -6); ctx.lineTo(this.width/2, 0); ctx.lineTo(this.width * 0.2, 6); ctx.fill();
                
                // 軌跡
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(-this.width, 0); ctx.lineTo(-this.width/2, 0); ctx.stroke();
                
                ctx.restore();
            }
            onHit(e) { return true; } // 貫通
        }

        class Whip extends GenericWeapon {
            constructor(x, y, facing) {
                super(x, y, 'whip');
                this.facing = facing; // 'left' or 'right'
                this.life = 15;
                this.maxLife = 15;
                this.width = 120 * player.area; // 長くする
                this.height = 60 * player.area;
                // 当たり判定の位置調整
                if (facing === 'left') {
                    this.x -= this.width;
                }
                this.y -= this.height / 2;
                this.damage = 15 * player.damage;
                this.knockback = 25 * player.knockback;
            }
            update() {
                this.life--;
                if (this.life <= 0) this.active = false;
            }
            draw() {
                const progress = 1 - (this.life / this.maxLife);
                ctx.save();
                ctx.translate(this.x + (this.facing === 'right' ? 0 : this.width), this.y + this.height/2);
                if (this.facing === 'left') ctx.scale(-1, 1);

                // 鞭の描画
                ctx.strokeStyle = '#FF4500'; // OrangeRed
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.shadowColor = '#FF0000';
                ctx.shadowBlur = 10;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                
                // しなる動き
                const length = this.width * Math.sin(progress * Math.PI);
                const wave = Math.sin(progress * Math.PI * 2) * 30;

                ctx.quadraticCurveTo(length / 2, -wave, length, 0);
                ctx.stroke();

                // 先端の輝き
                ctx.fillStyle = '#FFFF00';
                ctx.beginPath();
                ctx.arc(length, 0, 4, 0, Math.PI*2);
                ctx.fill();

                ctx.restore();
            }
            onHit(e) { return true; } // 貫通
        }

        class Abacus extends GenericWeapon {
            constructor(x, y, dirX, dirY, damageMult = 1.0) {
                super(x, y, 'abacus');
                this.vx = dirX * 10;
                this.vy = dirY * 10;
                this.life = 60;
                this.angle = 0;
                this.damage = 25 * player.damage * damageMult; // High damage
                this.width = 30; this.height = 30;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.angle += 0.3; // Spin
                this.life--;
                if (this.life <= 0) this.active = false;
                
                // Effect
                if (frameCount % 5 === 0) {
                     particles.push(new Particle(this.x + this.width/2, this.y + this.height/2, '#FFD700'));
                }
            }
            draw() {
                ctx.save();
                ctx.translate(this.x + this.width/2, this.y + this.height/2);
                ctx.rotate(this.angle);
                ctx.drawImage(SPRITES.abacus, -this.width/2, -this.height/2, this.width, this.height);
                ctx.restore();
            }
            onHit(e) {
                // Coin sound effect could be added here
                return true; // Pierce
            }
        }

        class BowWeapon {
            constructor(x, y, target) {
                this.x = x; this.y = y; this.target = target;
                this.life = 20; this.maxLife = 20;
                this.angle = Math.atan2(target.y - y, target.x - x);
                this.fired = false;
                this.active = true;
                this.hitEnemies = [];
            }
            update() {
                this.life--;
                if (this.life < 10 && !this.fired) {
                    activeWeapons.push(new Arrow(this.x, this.y, this.angle));
                    this.fired = true;
                    Audio.shoot();
                }
                if (this.life <= 0) this.active = false;
            }
            draw() {
                ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
                const pull = this.fired ? 0 : (1 - (this.life - 10)/10) * 10;
                ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(-5, 0, 20, -Math.PI/2, Math.PI/2); ctx.stroke(); // Bow
                ctx.strokeStyle = '#EEE'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(-5, -20); ctx.lineTo(-5 - pull, 0); ctx.lineTo(-5, 20); ctx.stroke(); // String
                ctx.restore();
            }
            onHit(e) { return false; }
        }

        class Arrow extends GenericWeapon {
            constructor(x, y, angle) {
                super(x, y, 'arrow');
                this.vx = Math.cos(angle) * 15; this.vy = Math.sin(angle) * 15;
                this.angle = angle;
                this.life = 60;
                this.damage = 15 * player.damage;
                this.width = 32; this.height = 8;
            }
            update() { this.x += this.vx; this.y += this.vy; this.life--; if(this.life<=0) this.active = false; }
            draw() { ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle); ctx.drawImage(SPRITES.arrow, -16, -4, 32, 8); ctx.restore(); }
            onHit(e) { this.active = false; return true; }
        }

        class MusketWeapon {
            constructor(x, y, target) {
                this.x = x; this.y = y; this.target = target;
                this.life = 30; this.maxLife = 30;
                this.angle = Math.atan2(target.y - y, target.x - x);
                this.fired = false;
                this.active = true;
                this.hitEnemies = [];
            }
            update() {
                this.life--;
                if (this.life === 15) {
                    activeWeapons.push(new MusketShot(this.x + Math.cos(this.angle)*30, this.y + Math.sin(this.angle)*30, this.angle));
                    this.fired = true;
                    Audio.explosion();
                    for(let i=0; i<5; i++) particles.push(new Particle(this.x + Math.cos(this.angle)*30, this.y + Math.sin(this.angle)*30, '#888'));
                }
                if (this.life <= 0) this.active = false;
            }
            draw() {
                ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
                ctx.drawImage(SPRITES.musket, 0, -5, 30, 10);
                if (this.fired && this.life > 10) { ctx.fillStyle = '#FFFF00'; ctx.beginPath(); ctx.arc(35, 0, 10 + Math.random()*5, 0, Math.PI*2); ctx.fill(); }
                ctx.restore();
            }
            onHit(e) {
                // Coin sound effect could be added here
                return true; // Pierce
            }
        }

        class MusketShot extends GenericWeapon {
            constructor(x, y, angle) {
                super(x, y, 'explosion'); // Use explosion sprite or simple rect
                this.vx = Math.cos(angle) * 25; this.vy = Math.sin(angle) * 25;
                this.life = 40;
                this.damage = 40 * player.damage;
                this.width = 10; this.height = 10;
            }
            update() { this.x += this.vx; this.y += this.vy; this.life--; if(this.life<=0) this.active = false; }
            draw() { ctx.fillStyle = '#FFFF00'; ctx.fillRect(this.x, this.y, this.width, this.height); }
            onHit(e) { this.active = false; return true; }
        }

        class HolyZone extends GenericWeapon {
            constructor(x, y) {
                super(x, y, 'holy_zone');
                this.width = 80 * player.area; this.height = 80 * player.area;
                this.x -= this.width/2; this.y -= this.height/2;
                this.life = 120 * player.duration;
                this.damage = 2 * player.damage;
            }
            update() { this.life--; if(this.life<=0) this.active = false; }
        }

        class Bomb extends GenericWeapon {
            constructor(x, y) {
                super(x, y, 'bomb');
                this.vx = (Math.random()-0.5)*6; this.vy = -8; this.gravity = 0.4;
                this.startY = y;
            }
            update() {
                this.x += this.vx; this.y += this.vy; this.vy += this.gravity;
                if (this.y > this.startY + 50) {
                    this.active = false;
                    activeWeapons.push(new Explosion(this.x, this.y));
                }
            }
            onHit(e) { return false; }
        }

        class Scythe extends GenericWeapon {
            constructor(x, y) {
                super(x, y, 'scythe');
                this.vx = (Math.random()-0.5)*6; this.vy = (Math.random()-0.5)*6;
                this.life = 120 * player.duration;
                this.width = 40 * player.area; this.height = 40 * player.area;
                this.damage = 20 * player.damage;
                this.angle = 0;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                this.angle += 0.2;
                this.life--; if(this.life<=0) this.active = false;
            }
            draw() {
                ctx.save(); ctx.translate(this.x+this.width/2, this.y+this.height/2);
                ctx.rotate(this.angle);
                ctx.drawImage(SPRITES[this.type], -this.width/2, -this.height/2, this.width, this.height);
                ctx.restore();
            }
        }

        class DeathSpiral extends GenericWeapon {
            constructor(x, y, angle) {
                super(x, y, 'death_spiral');
                this.width = 40 * player.area; this.height = 40 * player.area;
                this.vx = Math.cos(angle) * 6;
                this.vy = Math.sin(angle) * 6;
                this.life = 100;
                this.damage = 25 * player.damage;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                this.life--; if(this.life<=0) this.active = false;
            }
            onHit(e) { return true; } // 貫通
        }

        class HolyRay extends GenericWeapon {
            constructor(x, y, angle) {
                super(x, y, 'holy_ray');
                this.angle = angle;
                this.life = 60; // 1秒持続
                this.width = 500;
                this.height = 50 * player.area;
                this.damage = 10 * player.damage;
            }
            update() {
                this.x = player.getCenter().x;
                this.y = player.getCenter().y;
                this.life--;
                if (this.life <= 0) this.active = false;
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                const grad = ctx.createLinearGradient(0, -this.height/2, 0, this.height/2);
                grad.addColorStop(0, 'rgba(255, 255, 224, 0)');
                grad.addColorStop(0.5, `rgba(255, 255, 224, ${this.life / 60 * 0.8})`);
                grad.addColorStop(1, 'rgba(255, 255, 224, 0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, -this.height/2, this.width, this.height);
                ctx.restore();
            }
            onHit(e) { return true; } // 貫通
        }

        class BlackHole {
            constructor(x, y) {
                this.x = x; this.y = y;
                this.life = 300; // 5秒持続
                this.radius = 10;
                this.maxRadius = 300 * player.area;
            }
            update() {
                this.life--;
                if (this.radius < this.maxRadius) this.radius += 2;
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(frameCount * 0.1);
                const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, this.radius);
                grad.addColorStop(0, '#000');
                grad.addColorStop(0.8, '#4B0082');
                grad.addColorStop(1, 'rgba(75, 0, 130, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
            }
        }

        class ShadowClone {
            constructor(player) {
                this.player = player;
                this.x = player.x;
                this.y = player.y;
                this.life = 900; // 15秒
                this.attackTimer = 0;
            }
            update() {
                this.life--;
                this.x += (this.player.x - 50 - this.x) * 0.1;
                this.y += (this.player.y - this.y) * 0.1;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = 0.5;
                ctx.drawImage(SPRITES[`player_${this.player.facing}`], this.x, this.y, this.player.width, this.player.height);
                ctx.restore();
            }
        }

        class NPC {
            constructor(x, y, job) {
                this.x = x;
                this.y = y;
                this.job = job;
                this.width = 24;
                this.height = 24;
                this.speed = 2.5;
                this.attackTimer = 0;
                this.attackCooldown = this.getCooldown(job);
                this.facing = 'right';
                this.animTimer = 0;
                
                const jobData = NPC_JOBS.find(j => j.id === job);
                this.maxHp = (200 + (level * 50)) * (jobData.hpMult || 1.0);
                this.defense = jobData.def || 0;
                this.damageMult = jobData.atkMult || 1.0;
                this.hp = this.maxHp;
                this.isDead = false;
                this.reviveTimer = 0;
                this.reviveDuration = 180; // 3秒
                this.chatTimer = Math.random() * 600; // 会話タイマー
                this.evolved = false;
            }

            update() {
                if (this.isDead) {
                    // プレイヤーと重なったら回復
                    if (Math.abs(player.x - this.x) < 40 && Math.abs(player.y - this.y) < 40) {
                        this.hp += 2; // 回復速度
                        if (this.hp >= this.maxHp) {
                            this.isDead = false;
                            this.hp = this.maxHp;
                            Audio.levelUp();
                        }
                    }
                    return;
                }
                
                // 遊び人 -> 賢者 転職 (Lv20)
                if (this.job === 'gadabout' && level >= 20 && !this.evolved) {
                    this.job = 'sage';
                    this.evolved = true;
                    showChat(this.name || '遊び人', "覚醒しました！", '#9370DB');
                    Audio.levelUp();
                }

                const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
                let moved = false;

                if (distToPlayer > 500) {
                    // プレイヤーから離れすぎたら戻る
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const dist = Math.hypot(dx, dy);
                    this.x += (dx / dist) * (this.speed * 1.5);
                    this.y += (dy / dist) * (this.speed * 1.5);
                    this.facing = dx > 0 ? 'right' : 'left';
                    this.animTimer += 0.2;
                    moved = true;
                } else {
                    // 最も近い敵に向かう
                    const target = getNearestEnemy({x: this.x, y: this.y});
                    if (target) {
                        const dx = target.x - this.x;
                        const dy = target.y - this.y;
                        const dist = Math.hypot(dx, dy);
                        
                        if (dist > 100) { // 一定距離まで近づく
                            this.x += (dx / dist) * this.speed;
                            this.y += (dy / dist) * this.speed;
                            this.facing = dx > 0 ? 'right' : 'left';
                            this.animTimer += 0.2;
                            moved = true;
                        }
                    } else if (distToPlayer > 100) {
                        // 敵がいなくてプレイヤーから少し離れていれば近づく
                        const dx = player.x - this.x;
                        const dy = player.y - this.y;
                        const dist = Math.hypot(dx, dy);
                        this.x += (dx / dist) * this.speed;
                        this.y += (dy / dist) * this.speed;
                        this.facing = dx > 0 ? 'right' : 'left';
                        this.animTimer += 0.2;
                        moved = true;
                    }
                }
                
                if (!moved) this.animTimer += 0.05;

                // ランダム会話 (約15秒に1回)
                this.chatTimer++;
                if (!this.isDead && this.chatTimer > 900 && Math.random() < 0.005) {
                    this.chatTimer = 0;
                    const msgs = NPC_MESSAGES[this.job]?.idle || ["..."];
                    showChat(NPC_JOBS.find(j=>j.id===this.job).name, msgs[Math.floor(Math.random()*msgs.length)], NPC_JOBS.find(j=>j.id===this.job).color);
                }

                // 仲間同士の重なり回避
                for (const other of npcs) {
                    if (other === this) continue;
                    const dx = this.x - other.x;
                    const dy = this.y - other.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 30 && dist > 0) {
                        this.x += (dx / dist) * 1.0;
                        this.y += (dy / dist) * 1.0;
                    }
                }
                checkObstacleCollision(this);

                // 生存時もプレイヤーと重なったら回復
                if (Math.abs(player.x - this.x) < 40 && Math.abs(player.y - this.y) < 40) {
                    this.hp = Math.min(this.maxHp, this.hp + 1);
                }

                this.attackTimer++;
                if (this.attackTimer >= this.attackCooldown) {
                    const target = getNearestEnemy({x: this.x, y: this.y});
                    if (target) {
                        this.attack(target);
                        this.attackTimer = 0;
                    }
                }
            }

            getCooldown(job) {
                if (job === 'monk') return 20;
                if (job === 'mage') return 60;
                if (job === 'thief') return 30;
                return 40;
            }

            attack(target) {
                const cx = this.x + this.width/2;
                const cy = this.y + this.height/2;
                const tx = target.x + target.width/2;
                const ty = target.y + target.height/2;

                let action = this.job;
                if (this.job === 'gadabout') {
                    const jobs = NPC_JOBS.map(j => j.id).filter(id => id !== 'gadabout');
                    action = jobs[Math.floor(Math.random() * jobs.length)];
                }

                if (action === 'warrior') {
                    slashes.push(new Slash(cx, cy, tx, ty, this.damageMult));
                } else if (action === 'monk') {
                    const angle = Math.atan2(ty - cy, tx - cx);
                    activeWeapons.push(new Punch(cx, cy, Math.cos(angle), Math.sin(angle), this.damageMult));
                } else if (action === 'mage') {
                    fireballs.push(new Fireball(cx, cy)); // Random direction fireball or targeted? Fireball class is random. Let's use Wand for targeted.
                    // Let's make Mage use MagicWand for targeted attack
                    wands.push(new MagicWand(cx, cy, tx, ty, false, this.damageMult));
                } else if (action === 'priest') {
                    // 味方（プレイヤーとNPC）の中でHPが減っている対象を探す
                    const allies = [player, ...npcs.filter(n => !n.isDead)];
                    let targetAlly = null;
                    let minHpRatio = 1.0;

                    for (const ally of allies) {
                        const ratio = ally.hp / ally.maxHp;
                        if (ratio < 1.0 && ratio < minHpRatio && Math.hypot(ally.x - this.x, ally.y - this.y) < 600) {
                            minHpRatio = ratio;
                            targetAlly = ally;
                        }
                    }

                    if (targetAlly) {
                        const healAmount = 1 + level;
                        targetAlly.hp = Math.min(targetAlly.maxHp, targetAlly.hp + healAmount);
                        spawnExplosion(targetAlly.x + targetAlly.width/2, targetAlly.y + targetAlly.height/2, '#00FF00', 15);
                        if (targetAlly === player) {
                            hpText.innerText = Math.max(0, Math.floor(player.hp));
                            hpBar.style.width = (player.hp / player.maxHp * 100) + "%";
                        }
                    } else {
                        activeWeapons.push(new HolyZone(tx, ty));
                    }
                } else if (action === 'merchant') {
                    activeWeapons.push(new Abacus(cx, cy, (tx-cx)/Math.hypot(tx-cx, ty-cy), (ty-cy)/Math.hypot(tx-cx, ty-cy), this.damageMult));
                } else if (action === 'thief') {
                    daggers.push(new Dagger(cx, cy, (tx-cx)/Math.hypot(tx-cx, ty-cy), (ty-cy)/Math.hypot(tx-cx, ty-cy), false, this.damageMult));
                }
                else if (action === 'summoned_golem') {
                    // ゴーレム: 強力なパンチ（衝撃波）
                    const angle = Math.atan2(ty - cy, tx - cx);
                    const punch = new Punch(cx, cy, Math.cos(angle), Math.sin(angle), this.damageMult * 2); // ダメージ倍
                    punch.width *= 1.5; punch.height *= 1.5; // サイズ大
                    activeWeapons.push(punch);
                }
                else if (action === 'sage') {
                    // 賢者: 魔法弾 + 確率で回復
                    wands.push(new MagicWand(cx, cy, tx, ty, true, this.damageMult)); // 進化版魔法弾
                    if (Math.random() < 0.2) { // 20%で回復行動も行う
                        const allies = [player, ...npcs.filter(n => !n.isDead)];
                        let targetAlly = null;
                        let minHpRatio = 1.0;
                        for (const ally of allies) {
                            const ratio = ally.hp / ally.maxHp;
                            if (ratio < 1.0 && ratio < minHpRatio) { minHpRatio = ratio; targetAlly = ally; }
                        }
                        if (targetAlly) {
                            targetAlly.hp = Math.min(targetAlly.maxHp, targetAlly.hp + 50);
                            spawnExplosion(targetAlly.x + targetAlly.width/2, targetAlly.y + targetAlly.height/2, '#00FF00', 15);
                        }
                    }
                }
                
                Audio.shoot();
            }

            draw() {
                if (this.isDead) {
                    ctx.save();
                    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                    ctx.rotate(Math.PI / 2); // 横たわる
                    ctx.globalAlpha = 0.5;
                    ctx.drawImage(SPRITES[`npc_${this.job}_${this.facing}`] || SPRITES['npc_warrior_right'], -this.width / 2, -this.height / 2, this.width, this.height);
                    ctx.restore();

                    // 復活ゲージ
                    if (this.hp > 0) {
                        ctx.fillStyle = '#000';
                        ctx.fillRect(this.x, this.y - 15, this.width, 6);
                        ctx.fillStyle = '#00FFFF';
                        ctx.fillRect(this.x, this.y - 15, this.width * (this.hp / this.maxHp), 6);
                    }
                    return;
                }

                const spriteName = `npc_${this.job}_${this.facing}`;
                const sprite = SPRITES[spriteName] || SPRITES['npc_warrior_right'];
                // グニグニ動くアニメーション (Squash & Stretch)
                const squash = Math.sin(this.animTimer * 2) * 0.2;
                ctx.save();
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.scale(1 + squash, 1 - squash);
                ctx.drawImage(sprite, -this.width / 2, -this.height / 2, this.width, this.height);
                ctx.restore();

                // HPバー
                ctx.fillStyle = '#333';
                ctx.fillRect(this.x, this.y - 8, this.width, 4);
                ctx.fillStyle = '#32C832';
                ctx.fillRect(this.x, this.y - 8, this.width * (this.hp / this.maxHp), 4);
            }
        }

