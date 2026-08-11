        function setGameSpeed(speed) {
            gameSpeed = speed;
            speedText.innerText = speed.toFixed(1);
        }

        function gameLoop() {
            if (isPaused) return;

            if (gameOver) {
                if (!gameOverSnapshot) {
                    gameOverSnapshot = new Image();
                    gameOverSnapshot.src = canvas.toDataURL();
                }

                // スナップショットを描画 (背景)
                if (gameOverSnapshot.complete) {
                    ctx.drawImage(gameOverSnapshot, 0, 0);
                }

                gameOverTimer++;

                // 暗転エフェクト
                ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.8, gameOverTimer * 0.01)})`;
                ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

                // GAME OVER テキスト
                if (gameOverTimer > 30) {
                    if (gameOverTimer === 31) saveScore(score, Math.floor(frameCount / 1800) + 1, false); // スコア保存
                    Audio.playBGM('gameover');
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // 最終ステータス表示
                    if (gameOverTimer > 60) {
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
                        ctx.fillRect(SCREEN_WIDTH/2 - 300, SCREEN_HEIGHT/2 - 80, 600, 300);
                        
                        ctx.fillStyle = '#FFF';
                        ctx.font = '24px sans-serif';
                        ctx.fillText(`KILLED BY: ${killedBy || 'UNKNOWN'}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 40);
                        
                        const seconds = Math.floor(frameCount / 60);
                        const m = Math.floor(seconds / 60);
                        const s = seconds % 60;
                        const timeStr = `${m}:${s.toString().padStart(2, '0')}`;
                        
                        ctx.fillStyle = '#FFD700';
                        ctx.fillText(`SURVIVED: ${timeStr}   DEFEATED: ${enemiesDefeated}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
                        
                        ctx.fillStyle = '#FFF';
                        ctx.font = '16px sans-serif';
                        ctx.fillText(`LV: ${level}  HP: ${Math.max(0, Math.floor(player.hp))}/${player.maxHp}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 40);
                        ctx.fillText(`DMG: ${Math.round(player.damage*100)}%  AREA: ${Math.round(player.area*100)}%  SPD: ${player.speed.toFixed(1)}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 65);
                        
                        // 取得パーク表示
                        let iconX = SCREEN_WIDTH / 2 - (Object.keys(acquiredItems).length * 34) / 2;
                        for (const [id, lvl] of Object.entries(acquiredItems)) {
                            if (SPRITES[id]) ctx.drawImage(SPRITES[id], iconX, SCREEN_HEIGHT / 2 + 90, 32, 32);
                            iconX += 34;
                        }
                    }

                    ctx.shadowColor = '#FF0000'; ctx.shadowBlur = 20; ctx.fillStyle = '#FF0000'; ctx.font = 'bold 80px sans-serif';

                    // ズームイン演出
                    const scale = Math.max(1, 5 - (gameOverTimer - 30) * 0.2);
                    ctx.translate(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 60);
                    ctx.scale(scale, scale);
                    ctx.fillText('GAME OVER', 0, 0);
                    ctx.restore();
                }

                // スコア表示
                if (gameOverTimer > 90) {
                    ctx.fillStyle = '#FFF';
                    ctx.font = 'bold 30px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.shadowColor = '#000';
                    ctx.shadowBlur = 5;
                    ctx.fillText(`SCORE: ${Math.floor(score)}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 140);
                    ctx.fillText(`WAVE: ${Math.floor(frameCount / 1800) + 1}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 100);

                    // 獲得した魂の欠片表示
                    ctx.fillStyle = '#00FFFF';
                    ctx.font = '18px sans-serif';
                    ctx.fillText(`💎 魂の欠片 +${Math.floor(score / 10)} (STOREで永続強化に使用可)`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 80);

                    // ランキングボタン表示
                    ctx.fillStyle = '#FFF';
                    ctx.font = '20px sans-serif';
                    ctx.fillText('(Check Ranking on Title Screen)', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 55);
                }

                // リトライメッセージ
                if (gameOverTimer > 150) {
                    const retryButton = { x: SCREEN_WIDTH / 2 - 160, y: SCREEN_HEIGHT / 2 + 110, width: 140, height: 40, text: 'リトライ' };
                    const titleButton = { x: SCREEN_WIDTH / 2 + 20, y: SCREEN_HEIGHT / 2 + 110, width: 140, height: 40, text: 'タイトルへ' };
                    const buttons = [retryButton, titleButton];

                    buttons.forEach(button => {
                        ctx.fillStyle = '#FFD700';
                        ctx.fillRect(button.x, button.y, button.width, button.height);
                        ctx.fillStyle = '#000';
                        ctx.font = 'bold 20px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
                    });

                    const alpha = (Math.sin(gameOverTimer * 0.1) + 1) / 2;
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.font = '20px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('CLICK OR PRESS ENTER TO CONTINUE', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 170);
                }

                requestAnimationFrame(gameLoop);
                return;
            }

            if (gameClear) {
                drawEnding();
                return;
            }

            // 画面クリア
            ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

            // ゲームスピード制御 (更新処理を分離)
            let currentSpeed = gameSpeed;
            if (slowMotionTimer > 0) {
                currentSpeed *= 0.1; // スローモーション
                slowMotionTimer--;
            }
            speedAccumulator += currentSpeed;

            while (speedAccumulator >= 1.0) {
                updateGame();
                speedAccumulator -= 1.0;
                if (isPaused) break;
            }

            drawGame();

            if (!isPaused) {
                requestAnimationFrame(gameLoop);
            }
        }

        function drawGame() {
            ctx.save(); // このフレームの描画状態全体を保存

            // 地震エフェクト
            if (screenShakeTimer > 0) {
                const shakeX = (Math.random() - 0.5) * 10;
                const shakeY = (Math.random() - 0.5) * 10;
                ctx.translate(shakeX, shakeY);
                screenShakeTimer--;
            }

            // カメラ位置計算 (プレイヤー中心)
            const cameraX = player.x - SCREEN_WIDTH / 2 + player.width / 2;
            const cameraY = player.y - SCREEN_HEIGHT / 2 + player.height / 2;

            ctx.save();
            ctx.translate(-cameraX, -cameraY);

            // 背景描画 (バイオーム)
            const gridSize = 100;
            const startX = Math.floor(cameraX / gridSize) * gridSize;
            const endX = startX + SCREEN_WIDTH + gridSize;
            const startY = Math.floor(cameraY / gridSize) * gridSize;
            const endY = startY + SCREEN_HEIGHT + gridSize;

            for (let x = startX; x <= endX; x += gridSize) {
                for (let y = startY; y <= endY; y += gridSize) {
                    // バイオーム判定 (簡易ノイズ)
                    const biome = getBiome(x, y);
                    
                    let color;
                    let detailColor;
                    
                    if (biome === 'forest') { color = '#228B22'; detailColor = '#006400'; }
                    else if (biome === 'grassland') { color = '#3CB371'; detailColor = '#2E8B57'; }
                    else if (biome === 'wasteland') { color = '#CD853F'; detailColor = '#8B4513'; }
                    else { // cursed
                        color = '#2F2F4F'; detailColor = '#191970';
                    }

                    ctx.fillStyle = color;
                    ctx.fillRect(x, y, gridSize, gridSize);

                    // 簡易的なディテール
                    const hash = Math.abs((x * 73856093) ^ (y * 19349663));
                    ctx.fillStyle = detailColor;
                    if (hash % 3 === 0) ctx.fillRect(x + 20, y + 20, 10, 10);
                    if (hash % 7 === 0) ctx.fillRect(x + 60, y + 70, 8, 8);
                    if (hash % 5 === 0) {
                        ctx.globalAlpha = 0.2;
                        ctx.fillRect(x + 10, y + 50, 20, 20);
                        ctx.globalAlpha = 1.0;
                    }
                    
                    // グリッドの境界を薄く描画
                    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, gridSize, gridSize);

                    // 障害物描画
                    const obsType = getObstacle(x / gridSize, y / gridSize);
                    if (obsType) {
                        const obsX = x + 10;
                        const obsY = y + 10;
                        const obsW = 80;
                        const obsH = 80;
                        ctx.drawImage(SPRITES[obsType], obsX, obsY, obsW, obsH);
                    }
                }
            }
            
            // 要塞の描画
            for (const f of fortresses) {
                f.draw();
            }

            // ダンジョン内部の描画
            if (currentDungeon) {
                currentDungeon.draw();
            }

            // 影分身の描画
            for (const clone of shadowClones) {
                clone.draw();
            }

            // ブラックホールの描画
            if (blackHole) {
                blackHole.draw();
            }

            // プレイヤー描画
            player.draw();

            // ペットの描画
            for (const pet of pets) {
                pet.draw();
            }

            // NPCの描画
            for (const npc of npcs) {
                npc.draw();
            }

            // 聖書の描画
            const bibleCount = player.bibleCount;
            if (bibleCount > 0) {
                for (let i = 0; i < bibleCount; i++) {
                    const angle = player.bibleAngle + (Math.PI * 2 / bibleCount) * i;
                    const bx = player.getCenter().x + Math.cos(angle) * player.bibleDist - 10;
                    const by = player.getCenter().y + Math.sin(angle) * player.bibleDist - 10;
                    ctx.drawImage(SPRITES.bible, bx, by, 20, 20);
                }
            }

            // チャクラムの描画
            const chakramCount = player.chakramLevel;
            if (chakramCount > 0) {
                for (let i = 0; i < chakramCount; i++) {
                    const angle = player.chakramAngle + (Math.PI * 2 / chakramCount) * i;
                    const cx = player.getCenter().x + Math.cos(angle) * player.chakramDist - 10;
                    const cy = player.getCenter().y + Math.sin(angle) * player.chakramDist - 10;
                    ctx.save();
                    ctx.translate(cx + 10, cy + 10);
                    ctx.rotate(angle * 2);
                    ctx.drawImage(SPRITES.chakram, -10, -10, 20, 20);
                    ctx.restore();
                }
            }

            // 斧の描画
            for (let i = axes.length - 1; i >= 0; i--) {
                axes[i].draw();
            }

            // ノヴァの描画
            for (let i = novas.length - 1; i >= 0; i--) {
                novas[i].draw();
            }

            // オーラの描画
            if (player.auraLevel > 0) {
                const radius = (50 + player.auraLevel * 10) * player.area;
                ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
                ctx.beginPath(); ctx.arc(player.getCenter().x, player.getCenter().y, radius, 0, Math.PI * 2); ctx.fill();
            }

            // ナイフ描画
            for (let i = daggers.length - 1; i >= 0; i--) {
                daggers[i].draw();
            }

            // 魔法の杖描画
            for (let i = wands.length - 1; i >= 0; i--) {
                wands[i].draw();
            }

            // 雷描画
            for (let i = lightnings.length - 1; i >= 0; i--) {
                lightnings[i].draw();
            }

            // ファイアボール描画
            for (let i = fireballs.length - 1; i >= 0; i--) {
                fireballs[i].draw();
            }

            // 新規武器の描画
            for (let i = activeWeapons.length - 1; i >= 0; i--) {
                activeWeapons[i].draw();
            }

            // 敵の描画
            for (const enemy of enemies) {
                enemy.draw();
            }

            // 弾丸の描画
            for (let i = bullets.length - 1; i >= 0; i--) {
                bullets[i].draw();
            }

            // 近接攻撃(Slash)の描画
            for (let i = slashes.length - 1; i >= 0; i--) {
                slashes[i].draw();
            }

            // 敵の弾丸の描画
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const b = enemyBullets[i];
                b.draw();
            }

            // ジェムの描画
            for (let i = gems.length - 1; i >= 0; i--) {
                gems[i].draw();
            }

            // 宝箱の描画
            for (const chest of chests) {
                chest.draw();
            }

            // 村の描画
            for (const v of villages) {
                v.draw();
            }
            
            // ダンジョン入口の描画
            for (const d of dungeonEntrances) {
                d.draw();
            }

            // MPポーションの描画
            for (const potion of mpPotions) {
                potion.draw();
            }

            // ユニーク武器の描画
            for (const u of uniqueDrops) {
                u.draw();
            }

            // 妖精アイテムの描画
            for (const f of fairyItems) {
                f.draw();
            }

            // レジェンド武器の描画
            for (const l of legendDrops) {
                l.draw();
            }

            // 契約書の描画
            for (const c of contracts) {
                c.draw();
            }

            // ポーションの描画
            for (const potion of potions) {
                potion.draw();
            }

            // パーティクルの描画
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].draw();
            }

            // 聖なる光線の描画
            if (holyRay) {
                holyRay.draw();
            }


            ctx.restore();

            // ダメージフラッシュ描画
            if (damageFlashOpacity > 0) {
                ctx.fillStyle = `rgba(255, 0, 0, ${damageFlashOpacity})`;
                ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
                damageFlashOpacity -= 0.05;
            }

            // ボス撃破フラッシュ描画
            if (whiteFlashOpacity > 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${whiteFlashOpacity})`;
                ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
                whiteFlashOpacity -= 0.02;
            }

            // 昼夜のオーバーレイ
            let ambientLight = 0;
            if (dayTime > 0.7 && dayTime < 0.8) ambientLight = (dayTime - 0.7) * 5; // Dusk
            else if (dayTime >= 0.8 || dayTime < 0.2) ambientLight = 0.5; // Night
            else if (dayTime >= 0.2 && dayTime < 0.3) ambientLight = 0.5 - (dayTime - 0.2) * 5; // Dawn

            if (ambientLight > 0) {
                ctx.fillStyle = `rgba(0, 0, 20, ${ambientLight})`;
                ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            }

            // NPC位置インジケーター (画面外のNPCの方向を表示)
            const targets = [...npcs, ...villages, ...fortresses]; // NPCと村と要塞
            targets.forEach(npc => {
                // スクリーン座標
                const screenX = npc.x - cameraX;
                const screenY = npc.y - cameraY;
                
                // 画面内判定 (マージンを含める)
                if (screenX >= -npc.width && screenX <= SCREEN_WIDTH &&
                    screenY >= -npc.height && screenY <= SCREEN_HEIGHT) {
                    return;
                }

                // 画面外の場合、方向を計算
                const centerX = SCREEN_WIDTH / 2;
                const centerY = SCREEN_HEIGHT / 2;
                const npcCenterX = screenX + npc.width / 2;
                const npcCenterY = screenY + npc.height / 2;
                
                const dx = npcCenterX - centerX;
                const dy = npcCenterY - centerY;
                const angle = Math.atan2(dy, dx);
                
                // 画面端の座標を計算
                const margin = 20;
                const borderX = SCREEN_WIDTH / 2 - margin;
                const borderY = SCREEN_HEIGHT / 2 - margin;
                
                let targetX, targetY;
                
                // 画面の矩形に合わせて位置を決定
                if (Math.abs(dx * borderY) > Math.abs(dy * borderX)) {
                    targetX = dx > 0 ? borderX : -borderX;
                    targetY = targetX * Math.tan(angle);
                } else {
                    targetY = dy > 0 ? borderY : -borderY;
                    targetX = targetY / Math.tan(angle);
                }

                ctx.save();
                ctx.translate(centerX + targetX, centerY + targetY);
                ctx.rotate(angle);
                
                if (npc instanceof Village) {
                    ctx.fillStyle = '#00FF00'; // 村は緑
                } else if (npc instanceof Fortress) {
                    if (npcs.length < 3) {
                        ctx.restore();
                        return;
                    }
                    ctx.fillStyle = '#FF4500'; // 要塞は赤
                } else if (npc.isDead) {
                    ctx.fillStyle = 'rgba(128, 128, 128, 0.7)'; // 死亡しているNPCは灰色で表示
                } else {
                    ctx.fillStyle = NPC_JOBS.find(j => j.id === npc.job)?.color || '#FFF';
                }
                
                ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-10, 8); ctx.lineTo(-10, -8); ctx.fill();
                ctx.restore();
            });

            ctx.restore(); // フレーム開始時の状態に完全に戻す
        }

        function updateGame() {
            // Wave表示更新
            waveText.innerText = Math.floor(frameCount / 1800) + 1;
            
            // 魔法習得チェック
            SPELLS.sort((a, b) => a.level - b.level).forEach(spell => {
                if (level >= spell.level && !player.spells.includes(spell.id)) {
                    player.spells.push(spell.id);
                    showDialog("SPELL LEARNED!", `魔法「${spell.name}」を覚えました！<br>キー: [${spell.key}]<br>効果: ${spell.desc}`, null, 4000);
                    Audio.legend();
                    updateSpellUI();
                }
            });
            // 魔法クールダウン更新
            for(let id in player.spellCooldowns) {
                if (player.spellCooldowns[id] > 0) player.spellCooldowns[id]--;
            }
            updateSpellUI();

            // スペル効果タイマー更新
            if (hasteTimer > 0) hasteTimer--;
            if (berserkTimer > 0) berserkTimer--;
            if (reflectTimer > 0) reflectTimer--;
            if (blackHole && blackHole.life > 0) blackHole.update(); else blackHole = null;
            if (holyRay && holyRay.life > 0) holyRay.update(); else holyRay = null;
            shadowClones.forEach(c => c.update());
            shadowClones = shadowClones.filter(c => c.life > 0);

            // 昼夜サイクル更新
            // 朝(DAWN/DAY)から開始するためにオフセットを加算 (0.25 * 7200 = 1800)
            const timeOffset = DAY_LENGTH * 0.25;
            dayTime = ((frameCount + timeOffset) % DAY_LENGTH) / DAY_LENGTH;
            let timeStr = "DAY";
            if (dayTime > 0.7 && dayTime < 0.8) timeStr = "DUSK";
            else if (dayTime >= 0.8 || dayTime < 0.2) timeStr = "NIGHT";
            else if (dayTime >= 0.2 && dayTime < 0.3) timeStr = "DAWN";
            timeText.innerText = timeStr;
            
            // BGM切り替え
            let targetBgm;
            if (timeStr === "NIGHT") {
                targetBgm = 'night';
            } else if (timeStr === "DUSK") {
                targetBgm = 'dusk';
            } else {
                targetBgm = 'game';
            }
            
            // 要塞戦中ならBGM上書き
            const activeFortress = fortresses.find(f => f.triggered && !f.cleared);
            if (activeFortress || finalBossSpawned) { targetBgm = 'final_boss'; }
            // ダンジョン内ならBGM上書き
            if (currentDungeon && !currentDungeon.cleared) { targetBgm = 'final_boss'; }
            // 裏ボスBGM
            const darkLord = enemies.find(e => e.type === 'dark_lord');
            if (darkLord) {
                targetBgm = 'dark_lord';
            }

            Audio.playBGM(targetBgm);

            // 自然回復
            if (frameCount % 60 === 0 && player.regen > 0 && player.hp < player.maxHp) {
                player.hp = Math.min(player.maxHp, player.hp + player.regen);
                hpText.innerText = Math.max(0, Math.floor(player.hp));
                hpBar.style.width = (player.hp / player.maxHp * 100) + "%";
            }

            // プレイヤー更新
            player.update();

            // ペットの更新
            for (const pet of pets) {
                pet.update();
            }

            // NPCの更新
            if (timeStopTimer > 0) {
                // 時間停止中はNPCも止める？いや、味方は動けるようにしよう
                for (const npc of npcs) npc.update();
            } else {
                for (const npc of npcs) {
                    npc.update();
                }
            }

            // 要塞の更新
            for (let i = fortresses.length - 1; i >= 0; i--) {
                fortresses[i].update();
            }

            // 聖書の更新
            if (player.bibleCount > 0) {
                player.bibleAngle += 0.03;
            }

            // チャクラムの更新
            if (player.chakramLevel > 0) {
                player.chakramAngle -= 0.05;
            }

            // 斧の生成・更新
            if (player.axeLevel > 0 && !isPaused) {
                if (player.evolved.axe) {
                    if (frameCount % 40 === 0) { // デス・スパイラル
                        const pc = player.getCenter();
                        for(let i=0; i<9; i++) activeWeapons.push(new DeathSpiral(pc.x, pc.y, (Math.PI*2/9)*i));
                    }
                } else {
                    axeTimer++;
                    if (axeTimer > 60 - (player.axeLevel * 5)) {
                        axeTimer = 0;
                        const pc = player.getCenter();
                        axes.push(new Axe(pc.x, pc.y));
                    }
                }
            }
            for (let i = axes.length - 1; i >= 0; i--) {
                axes[i].update(player);
                if (!axes[i].active) axes.splice(i, 1);
            }

            // ノヴァの生成・更新
            if (player.novaLevel > 0 && !isPaused) {
                novaTimer++;
                if (novaTimer > 180 - (player.novaLevel * 10)) { // クールダウン増加 (発動頻度低下)
                    novaTimer = 0;
                    const pc = player.getCenter();
                    novas.push(new Nova(pc.x, pc.y, player.novaLevel));
                }
            }
            for (let i = novas.length - 1; i >= 0; i--) {
                novas[i].update();
                if (!novas[i].active) novas.splice(i, 1);
            }

            // ナイフ更新
            const daggerInterval = player.evolved.dagger ? 5 : Math.max(10, (hasteTimer > 0 ? 20 : 40) - player.daggerLevel * 2);
            if (player.daggerLevel > 0 && frameCount % daggerInterval === 0) {
                const pc = player.getCenter();
                for(let i=0; i<=player.amount; i++) {
                    daggers.push(new Dagger(pc.x, pc.y, player.lastDir.x, player.lastDir.y, player.evolved.dagger));
                }
            }
            for (let i = daggers.length - 1; i >= 0; i--) {
                daggers[i].update(player);
                if (!daggers[i].active) daggers.splice(i, 1);
            }

            // 魔法の杖更新
            const wandInterval = player.evolved.wand ? 10 : Math.max(20, (hasteTimer > 0 ? 30 : 60) - player.wandLevel * 5);
            if (player.wandLevel > 0 && frameCount % wandInterval === 0) {
                const target = getNearestEnemy(pc);
                if (target) {
                    const pc = player.getCenter();
                    const tc = target.getCenter();
                    for(let i=0; i<=player.amount; i++) {
                        wands.push(new MagicWand(pc.x, pc.y, tc.x, tc.y, player.evolved.wand));
                    }
                }
            }
            for (let i = wands.length - 1; i >= 0; i--) {
                wands[i].update(player);
                if (!wands[i].active) wands.splice(i, 1);
            }

            // 雷更新
            if (player.lightningLevel > 0 && frameCount % Math.max(30, 90 - player.lightningLevel * 5) === 0) {
                // 画面内の敵からランダムに選ぶ
                const visibleEnemies = enemies.filter(e => Math.hypot(e.x - player.x, e.y - player.y) < 500);
                if (visibleEnemies.length > 0) {
                    for(let i=0; i<1 + Math.floor(player.lightningLevel/2); i++) {
                        const target = visibleEnemies[Math.floor(Math.random() * visibleEnemies.length)];
                        lightnings.push(new Lightning(target));
                        target.hp -= 50 * player.damage;
                        if (target.hp <= 0) {
                            const index = enemies.indexOf(target);
                            if (index > -1 && target.hp <= 0) {
                                enemies.splice(index, 1);
                                spawnLoot(target);
                                spawnExplosion(target.x + target.width/2, target.y + target.height/2, ENEMY_DATA[target.type].color, 10);
                                if (Math.random() < 0.05 * player.luck) potions.push(new Potion(target.x, target.y));
                                if (Math.random() < 0.005 * player.luck) uniqueDrops.push(new UniqueWeaponDrop(target.x, target.y));
                                score += ENEMY_DATA[target.type].isBoss ? 500 : 10;
                                scoreDisplay.innerText = score;
                                Audio.explosion();
                                
                                // 裏ボス撃破判定
                                if (target.type === 'dark_lord') {
                                    isTrueEnding = true;
                                    gameClear = true;
                                    saveScore(score, Math.floor(frameCount / 1800) + 1, true);
                                }
                            }
                        }
                    }
                }
            }
            for (let i = lightnings.length - 1; i >= 0; i--) {
                lightnings[i].update();
                if (!lightnings[i].active) lightnings.splice(i, 1);
            }

            // ファイアボール更新
            if (player.fireballLevel > 0 && frameCount % Math.max(40, 100 - player.fireballLevel * 5) === 0) {
                const pc = player.getCenter(); // pc is not defined here
                fireballs.push(new Fireball(pc.x, pc.y, player.evolved.fireball));
            }
            for (let i = fireballs.length - 1; i >= 0; i--) {
                fireballs[i].update(player);
                if (!fireballs[i].active) fireballs.splice(i, 1);
            }

            // 新規武器の生成・更新
            const pc = player.getCenter();
            if (player.boomerangLevel > 0 && frameCount % 90 === 0) {
                for(let i=0; i<player.amount+1; i++) activeWeapons.push(new Boomerang(pc.x, pc.y, player.lastDir.x + (Math.random()-0.5), player.lastDir.y + (Math.random()-0.5), player.evolved.boomerang));
            }
            if (player.mineLevel > 0 && frameCount % 120 === 0) {
                activeWeapons.push(new Mine(pc.x, pc.y));
            }
            if (player.tornadoLevel > 0 && frameCount % 150 === 0) {
                activeWeapons.push(new Tornado(pc.x, pc.y));
            }
            if (player.shurikenLevel > 0 && frameCount % 30 === 0) {
                for(let i=0; i<player.amount+1; i++) activeWeapons.push(new Shuriken(pc.x, pc.y, player.lastDir.x, player.lastDir.y));
            }
            if (player.holyWaterLevel > 0 && frameCount % 180 === 0) {
                activeWeapons.push(new HolyWater(pc.x, pc.y));
            }
            if (player.bombLevel > 0 && frameCount % 100 === 0) {
                activeWeapons.push(new Bomb(pc.x, pc.y));
            }
            if (player.scytheLevel > 0 && frameCount % 100 === 0) {
                for(let i=0; i<player.amount+1; i++) activeWeapons.push(new Scythe(pc.x, pc.y));
            }
            if (player.spearLevel > 0 && frameCount % 60 === 0) {
                activeWeapons.push(new Spear(pc.x, pc.y, player.lastDir.x, player.lastDir.y));
            }
            if (player.whipLevel > 0 && frameCount % 60 === 0) {
                activeWeapons.push(new Whip(pc.x, pc.y, player.facing));
            }
            if (player.bowLevel > 0 && frameCount % Math.max(20, 60 - player.bowLevel * 5) === 0) {
                const target = getNearestEnemy(pc);
                if (target) {
                    for(let i=0; i<player.amount+1; i++) 
                        activeWeapons.push(new BowWeapon(pc.x + (Math.random()-0.5)*20, pc.y + (Math.random()-0.5)*20, target));
                }
            }
            if (player.musketLevel > 0 && frameCount % Math.max(60, 120 - player.musketLevel * 10) === 0) {
                const target = getNearestEnemy(pc);
                if (target) {
                    for(let i=0; i<player.amount+1; i++) 
                        activeWeapons.push(new MusketWeapon(pc.x + (Math.random()-0.5)*20, pc.y + (Math.random()-0.5)*20, target));
                }
            }

            for (let i = activeWeapons.length - 1; i >= 0; i--) {
                activeWeapons[i].update();
                if (!activeWeapons[i].active) activeWeapons.splice(i, 1);
            }

            // 敵のスポーン
            const wave = Math.floor(frameCount / 1800);
            const spawnRate = Math.max(10, ENEMY_SPAWN_RATE - (wave * 5));
            if (!currentDungeon && frameCount % spawnRate === 0 && enemies.length < 250) {
                const isNight = (dayTime >= 0.75 || dayTime < 0.25);
                // 出現地点(プレイヤー周辺)のバイオームに応じて出現候補を絞り込む
                const biome = getBiome(player.x, player.y);
                const biomePool = BIOME_ENEMIES[biome] || Object.keys(ENEMY_DATA).filter(k => !ENEMY_DATA[k].isBoss);
                let types = biomePool.filter(k => {
                    const data = ENEMY_DATA[k];
                    if (data.time === 'day' && isNight) return false;
                    if (data.time === 'night' && !isNight) return false;
                    return true;
                });
                if (types.length === 0) {
                    // 現在の時間帯に合う敵がそのバイオームにいない場合は全種類から選ぶ
                    types = Object.keys(ENEMY_DATA).filter(k => {
                        const data = ENEMY_DATA[k];
                        if (data.isBoss) return false;
                        if (data.time === 'day' && isNight) return false;
                        if (data.time === 'night' && !isNight) return false;
                        return true;
                    });
                }
                const type = types[Math.floor(Math.random() * types.length)];
                enemies.push(new Enemy(type, player));
            }

            let bossSpawned = null;
            // ボスのスポーン
            if (!currentDungeon && frameCount > 0) {
                if (frameCount % (BOSS_SPAWN_RATE * 3) === 0) {
                    const specialBosses = ['boss_hydra', 'boss_lich', 'boss_behemoth', 'boss_phoenix', 'boss_kraken'];
                    bossSpawned = new Enemy(specialBosses[Math.floor(Math.random() * specialBosses.length)], player);
                    enemies.push(bossSpawned);
                }
                if (frameCount % BOSS_SPAWN_RATE === 0) {
                    bossSpawned = new Enemy('boss', player);
                    enemies.push(bossSpawned);
                }
            }

            // ラスボス出現 (ラージボス2体撃破後)
            if (!currentDungeon && largeBossDefeatedCount >= 2 && !finalBossSpawned) {
                bossSpawned = new Enemy('final_boss', player);
                enemies.push(bossSpawned);
                finalBossSpawned = true;
                Audio.playBGM('final_boss');
            }

            // 裏魔王出現 (エンドレスモードでラージボスをさらに3体撃破後)
            if (!currentDungeon && isEndlessMode && largeBossDefeatedCount >= 5 && !darkLordSpawned) {
                bossSpawned = new Enemy('dark_lord', player);
                enemies.push(bossSpawned);
                darkLordSpawned = true;
                Audio.playBGM('dark_lord');
            }

            // ボス出現時の会話
            if (bossSpawned) {
                if (BOSS_QUOTES[bossSpawned.type]) {
                    bossSpawned.speak(BOSS_QUOTES[bossSpawned.type][0]);
                }
                // 仲間の反応
                npcs.forEach(npc => {
                    if (!npc.isDead && NPC_BOSS_REACTIONS[npc.job]) {
                        setTimeout(() => {
                            showChat(NPC_JOBS.find(j=>j.id===npc.job).name, NPC_BOSS_REACTIONS[npc.job], NPC_JOBS.find(j=>j.id===npc.job).color);
                        }, 1000 + Math.random() * 1000);
                    }
                });
            }

            // 自動攻撃
            attackTimer++;
            if (attackTimer >= (hasteTimer > 0 ? attackCooldown / 2 : attackCooldown)) {
                attackTimer = 0;
                const target = getNearestEnemy();
                if (target) {
                    const pc = player.getCenter();
                    const tc = target.getCenter();
                    for(let i=0; i<=player.amount; i++) {
                        slashes.push(new Slash(pc.x, pc.y, tc.x, tc.y));
                        Audio.shoot();
                    }
                }

                // 影分身の攻撃
                shadowClones.forEach(clone => {
                    clone.attackTimer++;
                    if (clone.attackTimer >= (hasteTimer > 0 ? attackCooldown / 2 : attackCooldown)) {
                        clone.attackTimer = 0;
                        const target = getNearestEnemy({x: clone.x, y: clone.y});
                        if (target) slashes.push(new Slash(clone.x, clone.y, target.x, target.y, 0.5)); // 半分のダメージ
                    }
                });
            }

            // 敵の更新
            if (timeStopTimer > 0) {
                timeStopTimer--;
                // 時間停止中は敵のupdateを呼ばない
            } else {
                for (const enemy of enemies) {
                    enemy.update(player);
                }
            }
            
            // 死んだ敵の掃除 (魔法などで倒れた場合)
            for (let i = enemies.length - 1; i >= 0; i--) {
                if (enemies[i].hp <= 0) {
                    spawnLoot(enemies[i]);
                    spawnExplosion(enemies[i].x + enemies[i].width/2, enemies[i].y + enemies[i].height/2, ENEMY_DATA[enemies[i].type].color, 10);
                    enemies.splice(i, 1);
                }
            }
            // 合体で消滅した敵の削除
            for (let i = enemies.length - 1; i >= 0; i--) {
                if (enemies[i].type === 'blob' && enemies[i].merged) enemies.splice(i, 1);
            }

            // 弾丸の更新
            for (let i = bullets.length - 1; i >= 0; i--) {
                bullets[i].update(player);
                if (!bullets[i].active) {
                    bullets.splice(i, 1);
                }
            }

            // 近接攻撃(Slash)の更新
            for (let i = slashes.length - 1; i >= 0; i--) {
                slashes[i].update();
                if (!slashes[i].active) {
                    slashes.splice(i, 1);
                }
            }

            // 敵の弾丸の更新
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                if (timeStopTimer > 0) break; // 時間停止中は弾も止まる

                const b = enemyBullets[i]; 
                b.update(player);

                // プレイヤーとの衝突
                if (reflectTimer > 0 && Math.hypot(b.x - player.x, b.y - player.y) < 50) {
                    // 弾を反射
                    b.vx *= -1;
                    b.vy *= -1;
                    b.homing = false; // 反射弾はホーミングしない
                    // 敵の弾としてではなく、プレイヤーの武器として扱う？
                    // 簡単のため、そのまま敵の弾として進ませる。敵同士の当たり判定はないので効果は薄い。
                    // ここでは単純に跳ね返すだけ。
                } else if (b.active && 
                    b.x < player.x + player.width && b.x + b.width > player.x &&
                    b.y < player.y + player.height && b.y + b.height > player.y) {
                    
                    if (!isDebugInvincible) {
                        player.hp -= Math.max(1, 5 - player.armor);
                        hpText.innerText = Math.max(0, Math.floor(player.hp));
                        hpBar.style.width = (player.hp / player.maxHp * 100) + "%";
                        damageFlashOpacity = 0.5;
                        Audio.damage();
                        b.active = false;
                        if (player.hp <= 0) {
                            killPlayer("ENEMY BULLET");
                        }
                    }
                }

                if (!b.active) enemyBullets.splice(i, 1);
            }

            // ジェムの更新
            for (let i = gems.length - 1; i >= 0; i--) {
                gems[i].update(player);
            }

            // パーティクルの更新
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                if (particles[i].life <= 0) {
                    particles.splice(i, 1);
                }
            }

            checkObstacleInteraction();

            // ダンジョン入口との衝突
            if (!currentDungeon) {
                for (let i = dungeonEntrances.length - 1; i >= 0; i--) {
                    const d = dungeonEntrances[i];
                    if (Math.hypot(player.x - d.x, player.y - d.y) < 50) {
                        dungeonEntrances.splice(i, 1);
                        enterDungeon();
                        break;
                    }
                }
            }

            // ダンジョン内部の更新
            if (currentDungeon) {
                currentDungeon.update();
            }

            checkCollisions();

            // ゲームパッド入力によるメニュー操作
            if (gamepadIndex !== null) {
                const gp = navigator.getGamepads()[gamepadIndex];
                if (gp) {
                    // Aボタン (Button 0)
                    if (gp.buttons[0].pressed) {
                        if (levelUpScreen.style.display === 'flex') {
                            const cards = document.querySelectorAll('.powerup-card');
                            if (cards[selectedOptionIndex]) cards[selectedOptionIndex].click();
                        } else if (npcSelectScreen.style.display === 'flex') {
                            const cards = document.querySelectorAll('#npc-container .powerup-card');
                            if (cards[selectedNpcIndex]) cards[selectedNpcIndex].click();
                        } else if (document.getElementById('chest-screen').style.display === 'flex') {
                            closeChest();
                        }
                    }
                    // 魔法発動 (Button 2, 3, 4, 5) -> X, Y, L1, R1
                    if (gp.buttons[2].pressed) castSpell('heal');
                    if (gp.buttons[3].pressed) castSpell('firestorm');
                    if (gp.buttons[4].pressed) castSpell('judgment');
                    if (gp.buttons[5].pressed) castSpell('teleport');
                }
            }

            // 勝利判定 (checkCollisionsの後に行う)
            if (!isEndlessMode && finalBossSpawned && !gameClear && !isTrueEnding) { // エンドレスモードではクリアしない
                const boss = enemies.find(e => e.type === 'final_boss');
                // final_bossが見つからなくなったらクリア
                if (!boss) {
                    gameClear = true;
                    saveScore(score, Math.floor(frameCount / 1800) + 1, true); // クリア時保存
                    // endingTimer = 0; // この変数は現在使われていない
                }
            }

            frameCount++;
        }

        function startGame() {
            isGameStarted = true;
            startScreen.style.display = 'none';
            applySpellKeyOverrides();
            applyMetaUpgrades();
            frameCount = 0;
            isEndlessMode = false;
            enemiesDefeated = 0;
            destroyedObstacles.clear();
            obstacleHP.clear();
            dungeonEntrances.length = 0;
            player.spawnAnimTimer = 60;
            timeStopTimer = 0;
            isTrueEnding = false;
            
            initDebugMenu();
            // 村の初期配置
            villages.length = 0;
            for(let i=0; i<3; i++) {
                let vx, vy;
                let attempts = 0;
                do {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 5000 + Math.random() * 20000;
                    vx = player.x + Math.cos(angle)*dist;
                    vy = player.y + Math.sin(angle)*dist;
                    
                    // 村の中心座標のグリッドに障害物があるか確認
                    const cellX = Math.floor((vx + 30) / 100);
                    const cellY = Math.floor((vy + 30) / 100);
                    if (!getObstacle(cellX, cellY)) break;
                    attempts++;
                } while (attempts < 100);
                villages.push(new Village(vx, vy));
            }
            
            // 要塞の初期配置
            fortresses.length = 0;
            for(let i=0; i<2; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 3000 + Math.random() * 5000;
                const fx = player.x + Math.cos(angle)*dist;
                const fy = player.y + Math.sin(angle)*dist;
                fortresses.push(new Fortress(fx, fy));
            }

            Audio.playBGM('game');
            gameLoop();
        }

        function updateMpBar() {
            mpText.innerText = Math.floor(player.mp);
            mpBar.style.width = (player.mp / player.maxMp * 100) + "%";
        }

        function updateSpellUI() {
            spellsContainer.innerHTML = '';
            player.spells.forEach(spellId => {
                const spell = SPELLS.find(s => s.id === spellId);
                const cd = player.spellCooldowns[spellId] || 0;
                const maxCd = spell.cd * 60;
                const cdPercent = maxCd > 0 ? (cd / maxCd) * 100 : 0;
                
                const div = document.createElement('div');
                div.className = 'spell-slot';
                if (cd > 0) div.classList.add('cooldown');
                div.style.borderColor = spell.color;

                // ツールチップとクリックイベントを追加
                div.setAttribute('data-tooltip', `${spell.name}\nMP: ${spell.mp} / CD: ${spell.cd}s\n${spell.desc}`);
                div.onclick = (e) => { e.stopPropagation(); castSpell(spellId); };

                div.innerHTML = `
                    <div class="spell-key">${spell.key}</div>
                    <div style="font-size:10px; text-align:center;">${spell.name}</div>
                    <div style="font-size:10px; color:#1E90FF;">${spell.mp} MP</div>
                    <div class="spell-cooldown" style="height:${cdPercent}%"></div>
                `;
                spellsContainer.appendChild(div);
            });
        }

        function castSpell(spellId) {
            if (!player.spells.includes(spellId)) return;
            const spell = SPELLS.find(s => s.id === spellId);
            
            if (player.spellCooldowns[spellId] > 0) {
                showChat("SYSTEM", "SPELL NOT READY", "#888");
                return;
            }
            if (player.mp < spell.mp) {
                showChat("SYSTEM", "NOT ENOUGH MP", "#888");
                return;
            }

            // 発動処理
            player.mp -= spell.mp;
            player.spellCooldowns[spellId] = spell.cd * 60;
            updateMpBar();
            Audio.legend(); // 魔法発動音
            const finalDamage = berserkTimer > 0 ? player.damage * 2 : player.damage;

            if (spellId === 'heal') {
                player.hp = Math.min(player.maxHp, player.hp + 50);
                hpText.innerText = Math.floor(player.hp);
                hpBar.style.width = (player.hp / player.maxHp * 100) + "%";
                spawnExplosion(player.x + player.width/2, player.y + player.height/2, '#00FF00', 30);
            } else if (spellId === 'firestorm') {
                // 画面全体に放射状に火の玉を飛ばす
                const pc = player.getCenter();
                const numFireballs = 36; // 36方向に発射
                for (let i = 0; i < numFireballs; i++) {
                    const angle = (Math.PI * 2 / numFireballs) * i;
                    fireballs.push(new Fireball(pc.x, pc.y, false, angle));
                }
                spawnExplosion(player.x + player.width/2, player.y + player.height/2, '#FF4500', 10);
            } else if (spellId === 'judgment') {
                // 画面内の雑魚即死、ボス大ダメージ
                const visibleEnemies = enemies.filter(e => Math.hypot(e.x - player.x, e.y - player.y) < 600);
                visibleEnemies.forEach(e => {
                    if (ENEMY_DATA[e.type].isBoss) {
                        e.hp -= 1000 * finalDamage;
                    } else {
                        e.hp = 0;
                    }
                    spawnExplosion(e.x + e.width/2, e.y + e.height/2, '#FFD700', 20);
                });
            } else if (spellId === 'teleport') {
                // ランダムな安全な場所へ
                for(let i=0; i<10; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 300 + Math.random() * 300;
                    const tx = player.x + Math.cos(angle) * dist;
                    const ty = player.y + Math.sin(angle) * dist;
                    // 障害物チェック
                    if (!getObstacle(Math.floor(tx/100), Math.floor(ty/100))) {
                        spawnExplosion(player.x + player.width/2, player.y + player.height/2, '#00FFFF', 20);
                        player.x = tx; player.y = ty;
                        spawnExplosion(player.x + player.width/2, player.y + player.height/2, '#00FFFF', 20);
                        break;
                    }
                }
            } else if (spellId === 'time_stop') {
                timeStopTimer = 300; // 5秒 (60fps)
                showChat("SYSTEM", "TIME STOP!", "#800080");
            } else if (spellId === 'summon_golem') {
                npcs.push(new NPC(player.x + 50, player.y, 'summoned_golem')); // 専用ゴーレム召喚
                spawnExplosion(player.x + 50 + 12, player.y + 12, '#8B4513', 20);
            } else if (spellId === 'haste') {
                hasteTimer = 600; // 10秒
                showChat("SYSTEM", "HASTE!", spell.color);
            } else if (spellId === 'berserk') {
                berserkTimer = 600; // 10秒
                showChat("SYSTEM", "BERSERK!", spell.color);
            } else if (spellId === 'ice_nova') {
                const visibleEnemies = enemies.filter(e => Math.hypot(e.x - player.x, e.y - player.y) < 600);
                visibleEnemies.forEach(e => {
                    e.frozenTimer = 300; // 5秒
                });
                spawnExplosion(player.getCenter().x, player.getCenter().y, spell.color, 50);
            } else if (spellId === 'reflect_shield') {
                reflectTimer = 300; // 5秒
                showChat("SYSTEM", "REFLECT SHIELD!", spell.color);
            } else if (spellId === 'meteor') {
                const target = getNearestEnemy();
                if (target) {
                    const ex = new Explosion(target.x, target.y);
                    ex.width *= 3; ex.height *= 3; ex.damage = 500 * finalDamage;
                    activeWeapons.push(ex);
                    showChat("SYSTEM", "METEOR!", spell.color);
                }
            } else if (spellId === 'chain_lightning') {
                // 自機中心に渦巻き状の光の刃
                const numBlades = 8;
                for(let i=0; i<numBlades; i++) {
                    const angle = (Math.PI * 2 / numBlades) * i;
                    activeWeapons.push(new LightningVortex(angle));
                }
            } else if (spellId === 'black_hole') {
                blackHole = new BlackHole(player.x + player.lastDir.x * 200, player.y + player.lastDir.y * 200);
            } else if (spellId === 'holy_ray') {
                holyRay = new HolyRay(player.getCenter().x, player.getCenter().y, Math.atan2(player.lastDir.y, player.lastDir.x));
            } else if (spellId === 'earthquake') {
                screenShakeTimer = 30;
                enemies.forEach(e => {
                    e.hp -= 150 * finalDamage;
                    e.slowTimer = 300; // 5秒
                });
                showChat("SYSTEM", "EARTHQUAKE!", spell.color);
            } else if (spellId === 'shadow_clone') {
                for(let i=0; i<2; i++) shadowClones.push(new ShadowClone(player));
                showChat("SYSTEM", "SHADOW CLONE!", spell.color);
            }
        }

        function startEndlessMode() {
            isEndlessMode = true;
            document.getElementById('ending-screen').style.display = 'none';
            gameClear = false;
            // ラスボス撃破フラグは維持したまま、敵が無限に湧くようにする
            // finalBossSpawned = true; // 既に倒しているのでtrueのまま
            // finalBossSpawned = false; // これをfalseにするとまたラスボスが出るので、trueのままにする
            
            // 敵を全回復して強化して再配置...ではなく、そのまま続行
            showChat("SYSTEM", "ENDLESS MODE START!", "#FF0000");
            gameLoop();
        }

        // --- ランキング機能 ---
        function saveScore(newScore, wave, cleared) {
            const ranking = JSON.parse(localStorage.getItem('monster_survivors_ranking') || '[]');
            ranking.push({ score: Math.floor(newScore), wave: wave, date: new Date().toLocaleDateString(), cleared: cleared });
            ranking.sort((a, b) => b.score - a.score);
            ranking.splice(10); // Top 10
            localStorage.setItem('monster_survivors_ranking', JSON.stringify(ranking));
            earnMetaShards(newScore);
        }

        function showRanking() {
            const ranking = JSON.parse(localStorage.getItem('monster_survivors_ranking') || '[]');
            const list = document.getElementById('ranking-list');
            list.innerHTML = '';
            if (ranking.length === 0) list.innerHTML = '<div style="text-align:center">NO DATA</div>';
            ranking.forEach((r, i) => {
                const status = r.cleared ? '<span style="color:#FFD700">★</span>' : '';
                list.innerHTML += `<div class="rank-row"><span>${i+1}. ${status} SCORE: ${r.score}</span><span>Wave ${r.wave} (${r.date})</span></div>`;
            });
            document.getElementById('ranking-screen').style.display = 'flex';
        }

        function closeRanking() {
            document.getElementById('ranking-screen').style.display = 'none';
        }

