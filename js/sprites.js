        // --- スプライト生成 (簡易的な図形を描画してCanvasとして保持) ---
        function createSprite(color, type) {
            const c = document.createElement('canvas');
            c.width = 32;
            c.height = 32;
            const cx = c.getContext('2d');
            
            // 共通: 影をつけて立体感を出す
            cx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            cx.shadowBlur = 4;
            cx.shadowOffsetX = 2;
            cx.shadowOffsetY = 2;

            if (type === 'player_right') {
                // プレイヤー右向き
                // マント (左になびく)
                cx.fillStyle = '#8B0000';
                cx.beginPath(); cx.moveTo(10, 16); cx.lineTo(4, 28); cx.lineTo(20, 28); cx.lineTo(22, 16); cx.fill();
                // 鎧
                cx.fillStyle = '#C0C0C0';
                cx.beginPath(); cx.arc(16, 10, 8, 0, Math.PI*2); cx.fill(); // Helmet
                cx.fillRect(10, 16, 12, 14); // Body
                // タバード
                cx.fillStyle = '#F5F5F5'; cx.fillRect(10, 16, 12, 14);
                cx.fillStyle = '#DC143C'; cx.fillRect(14, 16, 4, 14); cx.fillRect(12, 20, 8, 4); // Cross
                // 目のスリット (右側)
                cx.fillStyle = '#000'; cx.fillRect(18, 9, 6, 2);
            } else if (type === 'player_left') {
                // プレイヤー左向き
                // マント (右になびく)
                cx.fillStyle = '#8B0000';
                cx.beginPath(); cx.moveTo(22, 16); cx.lineTo(28, 28); cx.lineTo(12, 28); cx.lineTo(10, 16); cx.fill();
                // 鎧
                cx.fillStyle = '#C0C0C0';
                cx.beginPath(); cx.arc(16, 10, 8, 0, Math.PI*2); cx.fill(); // Helmet
                cx.fillRect(10, 16, 12, 14); // Body
                // タバード
                cx.fillStyle = '#F5F5F5'; cx.fillRect(10, 16, 12, 14);
                cx.fillStyle = '#DC143C'; cx.fillRect(14, 16, 4, 14); cx.fillRect(12, 20, 8, 4); // Cross
                // 目のスリット (左側)
                cx.fillStyle = '#000'; cx.fillRect(8, 9, 6, 2);
            } else if (type === 'gem') {
                // ジェム: グラデーション
                const grad = cx.createRadialGradient(16, 16, 2, 16, 16, 12);
                grad.addColorStop(0, '#fff');
                grad.addColorStop(0.5, color);
                grad.addColorStop(1, '#000');
                cx.fillStyle = grad;
                cx.beginPath(); cx.moveTo(16, 4); cx.lineTo(28, 16); cx.lineTo(16, 28); cx.lineTo(4, 16); cx.fill();
            } else if (type === 'boss' || type === 'large_boss') {
                // ボス: 禍々しいオーラ
                cx.fillStyle = color;
                cx.beginPath(); cx.arc(16, 16, 15, 0, Math.PI*2); cx.fill();
                cx.fillStyle = '#000'; // Eyes
                cx.beginPath(); cx.moveTo(10, 12); cx.lineTo(16, 18); cx.lineTo(22, 12); cx.fill();
                cx.strokeStyle = '#fff'; cx.lineWidth = 2; // Horns
                cx.beginPath(); cx.moveTo(8, 8); cx.lineTo(4, 2); cx.stroke();
                cx.beginPath(); cx.moveTo(24, 8); cx.lineTo(28, 2); cx.stroke();
                if (type === 'large_boss') {
                    cx.strokeStyle = '#f00'; cx.lineWidth = 1;
                    cx.beginPath(); cx.arc(16, 16, 15, 0, Math.PI*2); cx.stroke();
                }
            } else if (type === 'boss_hydra') {
                cx.fillStyle = color;
                cx.beginPath(); cx.arc(16, 20, 10, 0, Math.PI*2); cx.fill(); // Body
                cx.beginPath(); cx.arc(8, 10, 6, 0, Math.PI*2); cx.fill(); // Head 1
                cx.beginPath(); cx.arc(24, 10, 6, 0, Math.PI*2); cx.fill(); // Head 2
                cx.beginPath(); cx.arc(16, 6, 6, 0, Math.PI*2); cx.fill(); // Head 3
            } else if (type === 'boss_lich') {
                cx.fillStyle = color;
                cx.beginPath(); cx.moveTo(16, 2); cx.lineTo(28, 30); cx.lineTo(4, 30); cx.fill(); // Robe
                cx.fillStyle = '#EEE'; cx.beginPath(); cx.arc(16, 10, 6, 0, Math.PI*2); cx.fill(); // Skull
            } else if (type === 'boss_behemoth') {
                cx.fillStyle = color;
                cx.fillRect(2, 10, 28, 18); // Body
                cx.fillRect(2, 2, 10, 10); // Head
                cx.fillStyle = '#FFF'; cx.beginPath(); cx.moveTo(2, 8); cx.lineTo(6, 2); cx.lineTo(10, 8); cx.fill(); // Horn
            } else if (type === 'boss_phoenix') {
                cx.fillStyle = color;
                cx.beginPath(); cx.moveTo(16, 28); cx.lineTo(2, 10); cx.lineTo(16, 4); cx.lineTo(30, 10); cx.fill();
            } else if (type === 'boss_kraken') {
                cx.fillStyle = color;
                cx.beginPath(); cx.arc(16, 12, 10, 0, Math.PI*2); cx.fill(); // Head
                cx.strokeStyle = color; cx.lineWidth = 4;
                cx.beginPath(); cx.moveTo(8, 20); cx.quadraticCurveTo(4, 28, 0, 24); cx.stroke();
                cx.beginPath(); cx.moveTo(12, 20); cx.quadraticCurveTo(12, 30, 8, 32); cx.stroke();
                cx.beginPath(); cx.moveTo(20, 20); cx.quadraticCurveTo(20, 30, 24, 32); cx.stroke();
                cx.beginPath(); cx.moveTo(24, 20); cx.quadraticCurveTo(28, 28, 32, 24); cx.stroke();
            } else if (type === 'chest') {
                cx.fillStyle = '#8B4513';
                cx.fillRect(4, 8, 24, 18);
                cx.fillStyle = '#FFD700';
                cx.fillRect(4, 12, 24, 2); // Band
                cx.fillRect(14, 10, 4, 6); // Lock
                cx.strokeStyle = '#FFD700'; cx.lineWidth = 2;
                cx.strokeRect(4, 8, 24, 18);
            } else if (type === 'village') {
                cx.fillStyle = '#8B4513';
                cx.fillRect(4, 12, 24, 20); // House body
                cx.fillStyle = '#A52A2A';
                cx.beginPath(); cx.moveTo(16, 2); cx.lineTo(30, 12); cx.lineTo(2, 12); cx.fill(); // Roof
                cx.fillStyle = '#444';
                cx.fillRect(12, 20, 8, 12); // Door
                cx.fillStyle = '#FFD700';
                cx.fillRect(6, 16, 4, 4); cx.fillRect(22, 16, 4, 4); // Windows
            } else if (type === 'obstacle') {
                // 地形（岩山）
                cx.fillStyle = '#444';
                cx.beginPath(); cx.moveTo(0, 32); cx.lineTo(12, 8); cx.lineTo(20, 16); cx.lineTo(28, 4); cx.lineTo(32, 32); cx.fill();
                cx.fillStyle = '#666'; // Highlight
                cx.beginPath(); cx.moveTo(12, 8); cx.lineTo(16, 20); cx.lineTo(8, 32); cx.fill();
                cx.beginPath(); cx.moveTo(28, 4); cx.lineTo(32, 16); cx.lineTo(24, 32); cx.fill();
            } else if (type === 'obstacle_tree') {
                // 木
                cx.fillStyle = '#8B4513'; cx.fillRect(12, 20, 8, 12); // Trunk
                cx.fillStyle = '#228B22'; // Leaves
                cx.beginPath(); cx.moveTo(16, 2); cx.lineTo(28, 22); cx.lineTo(4, 22); cx.fill();
                cx.beginPath(); cx.moveTo(16, 8); cx.lineTo(30, 28); cx.lineTo(2, 28); cx.fill();
            } else if (type === 'obstacle_ruin') {
                // 遺跡の柱
                cx.fillStyle = '#A9A9A9';
                cx.fillRect(8, 4, 16, 24);
                cx.fillRect(6, 2, 20, 4); // Top cap
                cx.fillRect(6, 26, 20, 4); // Bottom base
                cx.fillStyle = '#808080'; cx.fillRect(10, 6, 4, 20); cx.fillRect(18, 6, 4, 20); // Detail
            } else if (type === 'dungeon_entrance') {
                // 地下への入り口
                cx.fillStyle = '#111';
                cx.fillRect(2, 2, 28, 28); // Dark hole
                cx.fillStyle = '#444'; // Stairs
                for(let i=0; i<5; i++) {
                    cx.fillRect(4 + i*2, 4 + i*4, 24 - i*4, 4);
                }
                cx.strokeStyle = '#666'; cx.strokeRect(2, 2, 28, 28); // Frame
            } else if (type === 'abacus') {
                // そろばん
                cx.fillStyle = '#8B4513'; cx.fillRect(2, 4, 28, 24); // Frame
                cx.fillStyle = '#DEB887'; cx.fillRect(4, 6, 24, 20); // Background
                cx.strokeStyle = '#000'; cx.lineWidth = 1;
                for(let i=0; i<5; i++) {
                    cx.beginPath(); cx.moveTo(4, 8+i*4); cx.lineTo(28, 8+i*4); cx.stroke(); // Rods
                    cx.fillStyle = '#FFD700'; // Gold beads
                    cx.beginPath(); cx.arc(10 + (i%2)*6, 8+i*4, 2, 0, Math.PI*2); cx.fill(); cx.beginPath(); cx.arc(18 + (i%2)*6, 8+i*4, 2, 0, Math.PI*2); cx.fill();
                }
            } else if (type === 'bow') {
                cx.strokeStyle = '#8B4513'; cx.lineWidth = 3;
                cx.beginPath(); cx.arc(16, 16, 14, -Math.PI/2, Math.PI/2); cx.stroke(); // Bow
                cx.strokeStyle = '#EEE'; cx.lineWidth = 1;
                cx.beginPath(); cx.moveTo(16, 2); cx.lineTo(16, 30); cx.stroke(); // String
            } else if (type === 'arrow') {
                cx.strokeStyle = '#8B4513'; cx.lineWidth = 2;
                cx.beginPath(); cx.moveTo(2, 16); cx.lineTo(30, 16); cx.stroke(); // Shaft
                cx.fillStyle = '#C0C0C0'; cx.beginPath(); cx.moveTo(30, 16); cx.lineTo(24, 12); cx.lineTo(24, 20); cx.fill(); // Head
                cx.fillStyle = '#FFF'; cx.beginPath(); cx.moveTo(2, 16); cx.lineTo(8, 12); cx.lineTo(8, 20); cx.fill(); // Fletching
            } else if (type === 'musket') {
                cx.fillStyle = '#8B4513'; cx.fillRect(2, 14, 12, 6); // Stock
                cx.fillStyle = '#444'; cx.fillRect(14, 12, 16, 4); // Barrel
                cx.fillStyle = '#222'; cx.fillRect(14, 14, 4, 6); // Mechanism
            } else if (type === 'ninja') {
                // ニンジャ
                cx.fillStyle = color; // DarkSlateGray
                cx.fillRect(8, 4, 16, 24); // Body
                cx.fillStyle = '#B22222'; // Red Scarf
                cx.beginPath(); cx.moveTo(8, 28); cx.lineTo(0, 16); cx.lineTo(8, 18); cx.fill();
                cx.beginPath(); cx.moveTo(24, 28); cx.lineTo(32, 16); cx.lineTo(24, 18); cx.fill();
                cx.fillStyle = '#FFF'; // Headband
                cx.fillRect(6, 8, 20, 4);
                cx.fillStyle = '#000'; // Eyeslit
                cx.fillRect(8, 9, 16, 2);
            } else if (type === 'sorcerer') {
                cx.fillStyle = '#4B0082'; // Indigo
                cx.beginPath(); cx.moveTo(16, 2); cx.lineTo(28, 30); cx.lineTo(4, 30); cx.fill(); // Robe
                cx.fillStyle = '#FFD700'; cx.beginPath(); cx.arc(16, 10, 6, 0, Math.PI*2); cx.fill(); // Hood/Head
            } else if (type === 'final_boss' || type === 'dark_lord') {
                // ラスボス: 魔王
                // マントと体
                cx.fillStyle = '#000';
                cx.beginPath(); cx.moveTo(16, 2); cx.lineTo(2, 30); cx.lineTo(30, 30); cx.fill();
                // 鎧
                cx.fillStyle = '#4B0082'; // Indigo
                cx.beginPath(); cx.moveTo(16, 30); cx.lineTo(8, 10); cx.lineTo(24, 10); cx.fill();
                // 頭部
                cx.fillStyle = '#222';
                cx.beginPath(); cx.arc(16, 8, 6, 0, Math.PI*2); cx.fill();
                // 角
                cx.strokeStyle = '#FFD700'; cx.lineWidth = 2;
                cx.beginPath(); cx.moveTo(12, 6); cx.lineTo(6, 0); cx.stroke(); 
                cx.beginPath(); cx.moveTo(20, 6); cx.lineTo(26, 0); cx.stroke();
                // 目 (光る)
                cx.fillStyle = '#F00';
                cx.shadowColor = '#F00'; cx.shadowBlur = 5;
                cx.fillRect(13, 7, 2, 2); cx.fillRect(17, 7, 2, 2);
                cx.shadowBlur = 0;
                // 剣
                cx.strokeStyle = '#800000'; cx.lineWidth = 3;
                if (type === 'dark_lord') {
                    cx.strokeStyle = '#FF0000';
                    cx.shadowColor = '#FF0000'; cx.shadowBlur = 10;
                }
                cx.beginPath(); cx.moveTo(22, 16); cx.lineTo(30, 28); cx.stroke();
            } else if (type === 'bible') {
                cx.fillStyle = color;
                cx.fillRect(6, 4, 20, 24);
                cx.fillStyle = '#FFD700'; // Cross
                cx.fillRect(14, 8, 4, 16);
                cx.fillRect(10, 12, 12, 4);
            } else if (type === 'potion') {
                // 大きなポーション
                cx.fillStyle = '#8B4513'; cx.fillRect(10, 2, 12, 6); // Cork
                cx.fillStyle = color; // Liquid
                cx.beginPath(); cx.arc(16, 20, 11, 0, Math.PI*2); cx.fill(); // Body
                cx.fillRect(12, 6, 8, 10); // Neck
                cx.fillStyle = 'rgba(255,255,255,0.6)'; // Shine
                cx.beginPath(); cx.ellipse(12, 16, 3, 6, Math.PI / 4, 0, Math.PI * 2); cx.fill();
                cx.strokeStyle = 'rgba(255,255,255,0.4)'; cx.lineWidth = 1;
                cx.beginPath(); cx.arc(16, 20, 11, 0, Math.PI*2); cx.stroke();
            } else if (type === 'mp_potion') {
                // MPポーション
                cx.fillStyle = '#8B4513'; cx.fillRect(10, 2, 12, 6); // Cork
                cx.fillStyle = '#1E90FF'; // Liquid (Blue)
                cx.beginPath(); cx.arc(16, 20, 11, 0, Math.PI*2); cx.fill(); // Body
                cx.fillRect(12, 6, 8, 10); // Neck
                cx.fillStyle = 'rgba(255,255,255,0.6)'; // Shine
                cx.beginPath(); cx.ellipse(12, 16, 3, 6, Math.PI / 4, 0, Math.PI * 2); cx.fill();
                cx.strokeStyle = 'rgba(255,255,255,0.4)'; cx.lineWidth = 1;
                cx.beginPath(); cx.arc(16, 20, 11, 0, Math.PI*2); cx.stroke();
            } else if (type === 'axe') {
                cx.fillStyle = '#8B4513'; cx.fillRect(14, 16, 4, 16); // Handle
                cx.fillStyle = '#aaa'; // Blade
                cx.beginPath(); cx.arc(16, 16, 12, Math.PI, 0); cx.fill();
            } else if (type === 'fireball') {
                const grad = cx.createRadialGradient(16, 16, 2, 16, 16, 14);
                grad.addColorStop(0, '#ffff00');
                grad.addColorStop(0.5, '#ff4500');
                grad.addColorStop(1, 'rgba(255,0,0,0)');
                cx.fillStyle = grad;
                cx.beginPath(); cx.arc(16, 16, 14, 0, Math.PI*2); cx.fill();
            } else if (type === 'lightning') {
                cx.strokeStyle = '#FFFF00'; cx.lineWidth = 3;
                cx.beginPath(); cx.moveTo(16, 0); cx.lineTo(8, 16); cx.lineTo(24, 16); cx.lineTo(16, 32); cx.stroke();
                cx.shadowColor = '#FFFF00'; cx.shadowBlur = 10;
            } else if (type === 'wand') {
                cx.fillStyle = '#8B4513'; cx.fillRect(14, 14, 4, 18);
                cx.fillStyle = '#f0f'; cx.beginPath(); cx.arc(16, 12, 6, 0, Math.PI*2); cx.fill();
            } else if (type === 'dagger') {
                cx.fillStyle = '#ccc'; cx.beginPath(); cx.moveTo(16, 4); cx.lineTo(20, 24); cx.lineTo(12, 24); cx.fill();
                cx.fillStyle = '#8B4513'; cx.fillRect(14, 24, 4, 6);
            } else if (type === 'unique_weapon') {
                // ユニーク武器ドロップ (輝く剣)
                cx.shadowColor = '#00FFFF'; cx.shadowBlur = 10;
                cx.fillStyle = '#E0FFFF';
                cx.beginPath(); cx.moveTo(16, 2); cx.lineTo(22, 22); cx.lineTo(16, 30); cx.lineTo(10, 22); cx.fill();
                cx.fillStyle = '#FFD700';
                cx.fillRect(14, 22, 4, 8); cx.fillRect(10, 22, 12, 2);
            } else if (type === 'pet') {
                // ペット（精霊）
                cx.fillStyle = '#FF69B4'; // HotPink
                cx.beginPath(); cx.arc(16, 16, 8, 0, Math.PI*2); cx.fill();
                cx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Wings
                cx.beginPath(); cx.ellipse(8, 16, 6, 10, -0.2, 0, Math.PI*2); cx.fill();
                cx.beginPath(); cx.ellipse(24, 16, 6, 10, 0.2, 0, Math.PI*2); cx.fill();
            } else if (type === 'fairy_item') {
                // 妖精アイテム（ボトル入り）
                cx.fillStyle = 'rgba(255, 255, 255, 0.3)'; cx.beginPath(); cx.arc(16, 18, 12, 0, Math.PI*2); cx.fill(); // Bottle
                cx.fillStyle = '#FF69B4'; cx.beginPath(); cx.arc(16, 18, 6, 0, Math.PI*2); cx.fill(); // Fairy inside
                cx.fillStyle = '#8B4513'; cx.fillRect(12, 4, 8, 4); // Cork
            } else if (type === 'boomerang') {
                cx.fillStyle = '#8B4513';
                cx.beginPath(); cx.moveTo(16, 4); cx.lineTo(28, 28); cx.lineTo(16, 20); cx.lineTo(4, 28); cx.fill();
            } else if (type === 'mine') {
                cx.fillStyle = '#333';
                cx.beginPath(); cx.arc(16, 16, 10, 0, Math.PI*2); cx.fill();
                cx.fillStyle = '#F00'; cx.beginPath(); cx.arc(16, 16, 3, 0, Math.PI*2); cx.fill();
            } else if (type === 'tornado') {
                cx.strokeStyle = '#EEE'; cx.lineWidth = 2;
                cx.beginPath(); 
                for(let i=0; i<4; i++) { cx.ellipse(16, 8+i*6, 10-i*2, 4, 0, 0, Math.PI*2); }
                cx.stroke();
            } else if (type === 'shuriken') {
                cx.fillStyle = '#CCC';
                cx.beginPath(); cx.moveTo(16, 0); cx.lineTo(20, 12); cx.lineTo(32, 16); cx.lineTo(20, 20); cx.lineTo(16, 32); cx.lineTo(12, 20); cx.lineTo(0, 16); cx.lineTo(12, 12); cx.fill();
                cx.beginPath(); cx.arc(16, 16, 4, 0, Math.PI*2); cx.fillStyle = '#000'; cx.fill();
            } else if (type === 'holy_water') {
                cx.fillStyle = '#00F';
                cx.beginPath(); cx.arc(16, 20, 10, 0, Math.PI*2); cx.fill();
                cx.fillRect(12, 8, 8, 8);
            } else if (type === 'spear') {
                cx.strokeStyle = '#8B4513'; cx.lineWidth = 4;
                cx.beginPath(); cx.moveTo(4, 28); cx.lineTo(28, 4); cx.stroke();
                cx.fillStyle = '#C0C0C0';
                cx.beginPath(); cx.moveTo(28, 4); cx.lineTo(20, 4); cx.lineTo(28, 12); cx.fill();
            } else if (type === 'whip') {
                cx.strokeStyle = '#8B0000'; cx.lineWidth = 3;
                cx.beginPath(); cx.moveTo(4, 28); cx.quadraticCurveTo(16, 4, 28, 16); cx.stroke();
            } else if (type === 'chakram') {
                cx.strokeStyle = '#FFD700'; cx.lineWidth = 4;
                cx.beginPath(); cx.arc(16, 16, 12, 0, Math.PI*2); cx.stroke();
            } else if (type === 'scythe') {
                cx.strokeStyle = '#4B0082'; cx.lineWidth = 3;
                cx.beginPath(); cx.moveTo(28, 28); cx.quadraticCurveTo(16, 16, 4, 4); cx.stroke();
                cx.fillStyle = '#AAA';
                cx.beginPath(); cx.moveTo(4, 4); cx.quadraticCurveTo(20, 4, 20, 20); cx.lineTo(16, 16); cx.fill();
            } else if (type === 'bomb') {
                cx.fillStyle = '#000';
                cx.beginPath(); cx.arc(16, 18, 10, 0, Math.PI*2); cx.fill();
                cx.strokeStyle = '#FFF'; cx.lineWidth = 2;
                cx.beginPath(); cx.moveTo(16, 8); cx.quadraticCurveTo(20, 4, 24, 4); cx.stroke();
                cx.fillStyle = '#F00'; cx.fillRect(24, 2, 4, 4);
            } else if (type === 'holy_zone') {
                cx.fillStyle = 'rgba(0, 0, 255, 0.3)';
                cx.beginPath(); cx.arc(16, 16, 16, 0, Math.PI*2); cx.fill();
            } else if (type === 'explosion') {
                cx.fillStyle = 'rgba(255, 69, 0, 0.5)';
                cx.beginPath(); cx.arc(16, 16, 16, 0, Math.PI*2); cx.fill();
                cx.fillStyle = '#FFFF00';
                cx.beginPath(); cx.arc(16, 16, 10, 0, Math.PI*2); cx.fill();
            } else if (type.startsWith('npc_')) {
                // NPC描画 (job_facing)
                const parts = type.split('_');
                let job = parts[1];
                if (job === 'summoned') job = 'summoned_golem'; // 修正
                const facing = parts[2]; // right or left
                
                const jobColor = NPC_JOBS.find(j => j.id === job)?.color || '#CCC';

                // Body/Cape
                cx.fillStyle = jobColor;
                if (facing === 'right') {
                    cx.beginPath(); cx.moveTo(10, 16); cx.lineTo(4, 28); cx.lineTo(20, 28); cx.lineTo(22, 16); cx.fill();
                } else {
                    cx.beginPath(); cx.moveTo(22, 16); cx.lineTo(28, 28); cx.lineTo(12, 28); cx.lineTo(10, 16); cx.fill();
                }

                // Head/Armor
                cx.fillStyle = '#EEE';
                cx.beginPath(); cx.arc(16, 10, 8, 0, Math.PI*2); cx.fill();
                cx.fillRect(10, 16, 12, 14);

                // Job specific details
                cx.fillStyle = jobColor;
                if (job === 'warrior') { cx.fillRect(10, 8, 12, 4); } // Helmet band
                else if (job === 'mage') { cx.beginPath(); cx.moveTo(10, 6); cx.lineTo(16, 0); cx.lineTo(22, 6); cx.fill(); } // Hat
                else if (job === 'merchant') { cx.fillStyle='#FFD700'; cx.fillRect(12, 18, 8, 8); } // Bag
                else if (job === 'summoned_golem') {
                    // ゴーレムの見た目
                    cx.fillStyle = '#8B4513';
                    cx.fillRect(4, 4, 24, 24); // Body
                    cx.fillStyle = '#00FFFF'; // Eyes (Blue)
                    if (facing === 'right') { cx.fillRect(20, 10, 4, 4); }
                    else { cx.fillRect(8, 10, 4, 4); }
                }
                
                // Eyes
                cx.fillStyle = '#000';
                if (facing === 'right') cx.fillRect(18, 9, 4, 2);
                else cx.fillRect(10, 9, 4, 2);
                
                if (job === 'sage') {
                    cx.fillStyle = '#FFD700'; // Sage hat/staff
                    cx.beginPath(); cx.moveTo(10, 6); cx.lineTo(16, 0); cx.lineTo(22, 6); cx.fill();
                }

            } else if (type === 'contract') {
                // 契約書
                cx.fillStyle = '#F5DEB3'; // Beige
                cx.fillRect(6, 4, 20, 24);
                cx.fillStyle = '#8B4513'; // Text lines
                cx.fillRect(10, 8, 12, 2);
                cx.fillRect(10, 12, 12, 2);
                cx.fillRect(10, 16, 8, 2);
                cx.fillStyle = '#B22222'; // Seal
                cx.beginPath(); cx.arc(16, 22, 4, 0, Math.PI*2); cx.fill();
            } else if (type === 'legend_weapon') {
                // レジェンド武器 (虹色の剣)
                const grad = cx.createLinearGradient(0, 0, 32, 32);
                grad.addColorStop(0, 'red'); grad.addColorStop(0.2, 'orange'); grad.addColorStop(0.4, 'yellow');
                grad.addColorStop(0.6, 'green'); grad.addColorStop(0.8, 'blue'); grad.addColorStop(1, 'violet');
                cx.fillStyle = grad;
                cx.beginPath(); cx.moveTo(16, 2); cx.lineTo(24, 24); cx.lineTo(16, 30); cx.lineTo(8, 24); cx.fill();
                cx.shadowColor = '#FFF'; cx.shadowBlur = 15;
            } else if (type === 'fortress_mine') {
                // 要塞の地雷
                cx.fillStyle = '#222'; cx.beginPath(); cx.arc(16, 16, 12, 0, Math.PI*2); cx.fill();
                cx.fillStyle = '#F00'; cx.beginPath(); cx.arc(16, 16, 4, 0, Math.PI*2); cx.fill(); // 点滅ランプ
                cx.strokeStyle = '#F00'; cx.lineWidth = 2; cx.beginPath(); cx.arc(16, 16, 8, 0, Math.PI*2); cx.stroke();
            } else if (type === 'fortress_spike') {
                // 要塞のスパイク
                cx.fillStyle = '#888';
                cx.beginPath(); cx.moveTo(4, 28); cx.lineTo(8, 4); cx.lineTo(12, 28); cx.fill();
                cx.beginPath(); cx.moveTo(12, 28); cx.lineTo(16, 4); cx.lineTo(20, 28); cx.fill();
                cx.beginPath(); cx.moveTo(20, 28); cx.lineTo(24, 4); cx.lineTo(28, 28); cx.fill();
            } else if (type === 'thousand_edge') {
                cx.fillStyle = '#00FFFF'; cx.beginPath(); cx.moveTo(16, 2); cx.lineTo(22, 26); cx.lineTo(10, 26); cx.fill();
                cx.shadowColor = '#00FFFF'; cx.shadowBlur = 10;
                cx.fillStyle = '#FFF'; cx.fillRect(14, 26, 4, 6);
            } else if (type === 'holy_wand') {
                cx.fillStyle = '#FFD700'; cx.fillRect(13, 10, 6, 22);
                cx.fillStyle = '#FFF'; cx.beginPath(); cx.arc(16, 6, 8, 0, Math.PI*2); cx.fill();
                cx.shadowColor = '#FFD700'; cx.shadowBlur = 15;
            } else if (type === 'death_spiral') {
                cx.fillStyle = '#FF0000';
                cx.beginPath(); cx.arc(16, 16, 14, 0, Math.PI*2); cx.fill();
                cx.fillStyle = '#000';
                cx.beginPath(); cx.arc(16, 16, 10, 0, Math.PI*2); cx.fill();
                cx.strokeStyle = '#FF0000'; cx.lineWidth = 3;
                cx.beginPath(); cx.moveTo(16, 2); cx.lineTo(16, 30); cx.moveTo(2, 16); cx.lineTo(30, 16); cx.stroke();
            } else if (type === 'unholy_vespers') {
                cx.fillStyle = '#4B0082'; cx.fillRect(6, 4, 20, 24);
                cx.fillStyle = '#FF0000'; // Inverted Cross
                cx.fillRect(14, 12, 4, 16); cx.fillRect(10, 20, 12, 4);
                cx.shadowColor = '#FF0000'; cx.shadowBlur = 10;
            } else if (type === 'hellfire') {
                const grad = cx.createRadialGradient(16, 16, 2, 16, 16, 16);
                grad.addColorStop(0, '#FFF'); grad.addColorStop(0.5, '#F0F'); grad.addColorStop(1, '#000');
                cx.fillStyle = grad;
                cx.beginPath(); cx.arc(16, 16, 16, 0, Math.PI*2); cx.fill();
                cx.shadowColor = '#F0F'; cx.shadowBlur = 15;
            } else if (type === 'heaven_sword') {
                cx.translate(16, 16); cx.rotate(Math.PI/4); cx.translate(-16, -16);
                cx.fillStyle = '#E0FFFF';
                cx.beginPath(); cx.moveTo(16, 0); cx.lineTo(20, 24); cx.lineTo(16, 32); cx.lineTo(12, 24); cx.fill();
                cx.fillStyle = '#FFD700';
                cx.beginPath(); cx.moveTo(8, 24); cx.lineTo(24, 24); cx.lineTo(16, 32); cx.fill();
                cx.shadowColor = '#E0FFFF'; cx.shadowBlur = 15;
            } else if (type === 'thunder_loop') {
                cx.strokeStyle = '#FFF'; cx.lineWidth = 4;
                cx.beginPath(); cx.arc(16, 16, 12, 0, Math.PI*2); cx.stroke();
                cx.shadowColor = '#00FFFF'; cx.shadowBlur = 10;
            } else {
                // 敵キャラクター (バリエーション)
                // 共通の影
                cx.shadowColor = 'rgba(0,0,0,0.5)';
                cx.shadowBlur = 3;

                cx.fillStyle = color;
                if (type === 'bat') {
                    cx.beginPath(); cx.moveTo(16, 20); cx.quadraticCurveTo(2, 10, 2, 2); cx.lineTo(10, 12); cx.lineTo(16, 6); cx.lineTo(22, 12); cx.lineTo(30, 2); cx.quadraticCurveTo(30, 10, 16, 20); cx.fill();
                } else if (type === 'skeleton') {
                    cx.beginPath(); cx.arc(16, 10, 8, 0, Math.PI*2); cx.fill(); // Skull
                    cx.fillRect(14, 18, 4, 10); // Spine
                    cx.fillRect(10, 20, 12, 2); // Ribs
                    cx.fillRect(10, 24, 12, 2);
                } else if (type === 'goblin') {
                    cx.beginPath(); cx.arc(16, 16, 10, 0, Math.PI*2); cx.fill(); // Head
                    cx.beginPath(); cx.moveTo(6, 16); cx.lineTo(2, 10); cx.lineTo(10, 14); cx.fill(); // Ears
                    cx.beginPath(); cx.moveTo(26, 16); cx.lineTo(30, 10); cx.lineTo(22, 14); cx.fill();
                    cx.fillStyle = '#FFFF00'; cx.beginPath(); cx.arc(12, 14, 2, 0, Math.PI*2); cx.arc(20, 14, 2, 0, Math.PI*2); cx.fill(); // Eyes
                } else if (type === 'orc') {
                    cx.fillRect(6, 6, 20, 24); // Body
                    cx.fillStyle = '#FFF'; // Tusks
                    cx.beginPath(); cx.moveTo(10, 20); cx.lineTo(10, 14); cx.lineTo(12, 20); cx.fill();
                    cx.beginPath(); cx.moveTo(22, 20); cx.lineTo(22, 14); cx.lineTo(20, 20); cx.fill();
                } else if (type === 'zombie') {
                    cx.fillRect(8, 4, 16, 24); // Body
                    cx.fillStyle = '#2F4F4F'; cx.fillRect(4, 12, 24, 4); // Arms
                } else if (type === 'wolf') {
                    cx.beginPath(); cx.moveTo(8, 16); cx.lineTo(24, 16); cx.lineTo(16, 28); cx.fill(); // Head
                    cx.beginPath(); cx.moveTo(8, 16); cx.lineTo(4, 4); cx.lineTo(12, 12); cx.fill(); // Ears
                    cx.beginPath(); cx.moveTo(24, 16); cx.lineTo(28, 4); cx.lineTo(20, 12); cx.fill();
                } else if (type === 'boar') {
                    cx.beginPath(); cx.ellipse(16, 16, 12, 8, 0, 0, Math.PI*2); cx.fill(); // Body
                    cx.fillStyle = '#FFF'; cx.beginPath(); cx.moveTo(6, 18); cx.lineTo(2, 14); cx.lineTo(8, 16); cx.fill(); // Tusks
                    cx.beginPath(); cx.moveTo(26, 18); cx.lineTo(30, 14); cx.lineTo(24, 16); cx.fill();
                    cx.beginPath(); cx.moveTo(24, 16); cx.lineTo(28, 4); cx.lineTo(20, 12); cx.fill();
                } else if (type === 'dragon') {
                    cx.beginPath(); cx.moveTo(16, 4); cx.lineTo(24, 16); cx.lineTo(16, 28); cx.lineTo(8, 16); cx.fill(); // Head
                    cx.fillStyle = '#8B0000'; cx.fillRect(0, 12, 32, 4); // Wings
                } else if (type === 'golem') {
                    cx.fillRect(4, 4, 24, 24); // Body
                    cx.fillStyle = '#000'; cx.fillRect(8, 10, 4, 4); cx.fillRect(20, 10, 4, 4); // Eyes
                } else if (type === 'imp') {
                    cx.beginPath(); cx.arc(16, 16, 8, 0, Math.PI*2); cx.fill();
                    cx.beginPath(); cx.moveTo(10, 10); cx.lineTo(6, 2); cx.lineTo(14, 8); cx.fill(); // Horns
                    cx.beginPath(); cx.moveTo(22, 10); cx.lineTo(26, 2); cx.lineTo(18, 8); cx.fill();
                } else if (type === 'treant') {
                    cx.fillRect(10, 4, 12, 28); // Trunk
                    cx.strokeStyle = color; cx.lineWidth = 3;
                    cx.beginPath(); cx.moveTo(16, 10); cx.lineTo(4, 4); cx.moveTo(16, 16); cx.lineTo(28, 10); cx.stroke(); // Branches
                } else if (type === 'harpy') {
                    cx.beginPath(); cx.arc(16, 16, 8, 0, Math.PI*2); cx.fill();
                    cx.fillStyle = '#87CEEB'; cx.beginPath(); cx.moveTo(8, 16); cx.lineTo(0, 8); cx.lineTo(8, 24); cx.fill(); // Wings
                    cx.beginPath(); cx.moveTo(24, 16); cx.lineTo(32, 8); cx.lineTo(24, 24); cx.fill();
                } else if (type === 'minotaur') {
                    cx.fillRect(6, 6, 20, 20);
                    cx.fillStyle = '#FFF'; cx.beginPath(); cx.moveTo(6, 6); cx.lineTo(2, 0); cx.lineTo(12, 6); cx.fill(); // Horns
                    cx.beginPath(); cx.moveTo(26, 6); cx.lineTo(30, 0); cx.lineTo(20, 6); cx.fill();
                } else if (type === 'demon') {
                    cx.beginPath(); cx.arc(16, 16, 10, 0, Math.PI*2); cx.fill();
                    cx.fillStyle = '#000'; cx.beginPath(); cx.moveTo(16, 16); cx.lineTo(4, 4); cx.lineTo(28, 4); cx.fill(); // Wings/Horns
                } else if (type === 'ghost' || type === 'wraith') {
                    cx.globalAlpha = 0.7;
                    cx.beginPath(); cx.arc(16, 14, 12, Math.PI, 0); cx.lineTo(28, 30); cx.quadraticCurveTo(22, 24, 16, 30); cx.quadraticCurveTo(10, 24, 4, 30); cx.lineTo(4, 14); cx.fill();
                    cx.globalAlpha = 1.0;
                } else if (type === 'spirit') {
                    cx.beginPath(); cx.arc(16, 16, 8, 0, Math.PI*2); cx.fill();
                    cx.globalAlpha = 0.5; cx.beginPath(); cx.arc(16, 16, 12, 0, Math.PI*2); cx.fill(); cx.globalAlpha = 1.0;
                } else if (type === 'slime') {
                    cx.beginPath(); cx.arc(16, 20, 12, Math.PI, 0); cx.quadraticCurveTo(28, 30, 16, 30); cx.quadraticCurveTo(4, 30, 4, 20); cx.fill();
                    cx.fillStyle = 'rgba(255,255,255,0.5)'; cx.beginPath(); cx.arc(12, 16, 3, 0, Math.PI*2); cx.fill();
            } else if (type === 'slime_king') {
                cx.fillStyle = color;
                cx.beginPath(); cx.arc(16, 20, 14, Math.PI, 0); cx.quadraticCurveTo(30, 32, 16, 32); cx.quadraticCurveTo(2, 32, 2, 20); cx.fill();
                // 王冠
                cx.fillStyle = '#FFD700';
                cx.beginPath(); cx.moveTo(8, 10); cx.lineTo(8, 2); cx.lineTo(12, 6); cx.lineTo(16, 0); cx.lineTo(20, 6); cx.lineTo(24, 2); cx.lineTo(24, 10); cx.fill();
                // 顔
                cx.fillStyle = '#FFF'; cx.beginPath(); cx.arc(12, 18, 3, 0, Math.PI*2); cx.fill(); cx.beginPath(); cx.arc(20, 18, 3, 0, Math.PI*2); cx.fill();
                cx.fillStyle = '#000'; cx.beginPath(); cx.arc(12, 18, 1, 0, Math.PI*2); cx.fill(); cx.beginPath(); cx.arc(20, 18, 1, 0, Math.PI*2); cx.fill();
            } else if (type === 'blob') {
                cx.fillStyle = color;
                // 不定形
                cx.beginPath(); cx.moveTo(16, 4); cx.quadraticCurveTo(28, 4, 28, 16); cx.quadraticCurveTo(28, 28, 16, 28); cx.quadraticCurveTo(4, 28, 4, 16); cx.quadraticCurveTo(4, 4, 16, 4); cx.fill();
                // 目
                cx.fillStyle = '#CCFF00';
                cx.beginPath(); cx.arc(12, 14, 2, 0, Math.PI*2); cx.fill(); cx.beginPath(); cx.arc(20, 14, 2, 0, Math.PI*2); cx.fill();
                } else if (type === 'spider') {
                    cx.beginPath(); cx.arc(16,16,8,0,Math.PI*2); cx.fill(); cx.strokeStyle=color; cx.lineWidth=2; cx.beginPath(); cx.moveTo(16,16); cx.lineTo(4,4); cx.moveTo(16,16); cx.lineTo(28,4); cx.moveTo(16,16); cx.lineTo(4,28); cx.moveTo(16,16); cx.lineTo(28,28); cx.stroke();
                } else if (type === 'snake') {
                    cx.strokeStyle = color; cx.lineWidth = 5; cx.lineCap = 'round';
                    cx.beginPath(); cx.moveTo(8, 24); cx.bezierCurveTo(8, 8, 24, 8, 24, 24); cx.stroke();
                } else if (type === 'rat') {
                    cx.beginPath(); cx.ellipse(16, 16, 10, 6, 0, 0, Math.PI*2); cx.fill(); cx.fillRect(26, 15, 6, 2); // Tail
                } else {
                    // 汎用 (丸に目)
                    cx.beginPath(); cx.arc(16, 16, 14, 0, Math.PI*2); cx.fill();
                    cx.fillStyle = '#000';
                    cx.beginPath(); cx.arc(12, 14, 2, 0, Math.PI*2); cx.arc(20, 14, 2, 0, Math.PI*2); cx.fill();
                }
            }
            return c;
        }

        // パッシブアイコン生成
        function createPassiveSprite(type, color) {
             const c = document.createElement('canvas');
             c.width = 32; c.height = 32;
             const cx = c.getContext('2d');
             
             // 背景
             const grad = cx.createRadialGradient(16, 16, 0, 16, 16, 16);
             grad.addColorStop(0, '#444');
             grad.addColorStop(1, '#222');
             cx.fillStyle = grad;
             cx.fillRect(0,0,32,32);
             
             // 枠線
             cx.strokeStyle = color;
             cx.lineWidth = 2;
             cx.strokeRect(1,1,30,30);
             
             cx.fillStyle = color;
             cx.strokeStyle = color;
             cx.lineWidth = 2;
             cx.lineCap = 'round';
             cx.lineJoin = 'round';

             if (type === 'luck') {
                 // 四つ葉のクローバー
                 cx.fillStyle = '#32CD32';
                 cx.beginPath();
                 for(let i=0; i<4; i++) {
                     const angle = i * Math.PI/2;
                     const x = 16 + Math.cos(angle)*5;
                     const y = 16 + Math.sin(angle)*5;
                     cx.moveTo(x, y);
                     cx.arc(x, y, 5, angle, angle + Math.PI, false);
                 }
                 cx.fill();
             } else if (type === 'aura') {
                 // 放射状の波
                 cx.strokeStyle = '#FF4500';
                 cx.beginPath(); cx.arc(16, 16, 4, 0, Math.PI*2); cx.stroke();
                 cx.beginPath(); cx.arc(16, 16, 8, 0, Math.PI*2); cx.stroke();
                 cx.beginPath(); cx.arc(16, 16, 12, 0, Math.PI*2); cx.stroke();
             } else if (type === 'armor') {
                 // 盾
                 cx.fillStyle = '#C0C0C0';
                 cx.beginPath();
                 cx.moveTo(8, 6); cx.lineTo(24, 6);
                 cx.lineTo(24, 14); cx.quadraticCurveTo(16, 28, 8, 14);
                 cx.closePath();
                 cx.fill();
                 cx.strokeStyle = '#FFF'; cx.stroke();
             } else if (type === 'atk_speed') {
                 // 剣と風
                 cx.strokeStyle = '#FFFF00';
                 cx.beginPath(); cx.moveTo(8, 24); cx.lineTo(24, 8); cx.stroke(); // 剣身
                 cx.beginPath(); cx.moveTo(20, 24); cx.quadraticCurveTo(28, 20, 24, 12); cx.stroke(); // 風
             } else if (type === 'move_speed') {
                 // 羽付きブーツ
                 cx.fillStyle = '#00FF00';
                 cx.beginPath(); cx.moveTo(6, 24); cx.lineTo(18, 24); cx.lineTo(18, 14); cx.lineTo(6, 14); cx.fill(); // ブーツ
                 cx.beginPath(); cx.moveTo(18, 14); cx.quadraticCurveTo(28, 6, 24, 20); cx.stroke(); // 羽
             } else if (type === 'bullet_speed') {
                 // 速い弾丸
                 cx.fillStyle = '#00FFFF';
                 cx.beginPath(); cx.arc(20, 16, 6, 0, Math.PI*2); cx.fill();
                 cx.strokeStyle = '#FFF'; cx.beginPath(); cx.moveTo(4, 16); cx.lineTo(14, 16); cx.stroke();
                 cx.beginPath(); cx.moveTo(6, 12); cx.lineTo(12, 12); cx.stroke();
                 cx.beginPath(); cx.moveTo(6, 20); cx.lineTo(12, 20); cx.stroke();
             } else if (type === 'max_hp') {
                 // ハート
                 cx.fillStyle = '#FF0000';
                 cx.beginPath();
                 cx.moveTo(16, 26);
                 cx.bezierCurveTo(16, 26, 4, 18, 4, 10);
                 cx.bezierCurveTo(4, 4, 12, 4, 16, 10);
                 cx.bezierCurveTo(20, 4, 28, 4, 28, 10);
                 cx.bezierCurveTo(28, 18, 16, 26, 16, 26);
                 cx.fill();
             } else if (type === 'heal') {
                 // 十字
                 cx.fillStyle = '#FF69B4';
                 cx.fillRect(12, 6, 8, 20);
                 cx.fillRect(6, 12, 20, 8);
             } else if (type === 'might') {
                 // 筋肉/拳
                 cx.fillStyle = '#FF4500';
                 cx.beginPath(); cx.arc(16, 16, 10, 0, Math.PI*2); cx.fill();
                 cx.fillStyle = '#FFF'; cx.font='bold 16px sans-serif'; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('P', 16, 16);
             } else if (type === 'area') {
                 // 広がる矢印
                 cx.strokeStyle = '#800080';
                 cx.beginPath(); cx.moveTo(16, 16); cx.lineTo(26, 6); cx.stroke();
                 cx.beginPath(); cx.moveTo(16, 16); cx.lineTo(6, 26); cx.stroke();
                 cx.beginPath(); cx.moveTo(16, 16); cx.lineTo(26, 26); cx.stroke();
                 cx.beginPath(); cx.moveTo(16, 16); cx.lineTo(6, 6); cx.stroke();
             } else if (type === 'magnet') {
                 // U字磁石
                 cx.strokeStyle = '#0000FF'; cx.lineWidth = 4;
                 cx.beginPath(); cx.arc(16, 16, 8, Math.PI, 0); cx.lineTo(24, 24); cx.lineTo(8, 24); cx.lineTo(8, 16); cx.stroke();
             } else if (type === 'regen') {
                 // ハートに＋
                 cx.fillStyle = '#FF1493';
                 cx.beginPath(); cx.arc(16, 16, 10, 0, Math.PI*2); cx.fill();
                 cx.fillStyle = '#FFF'; cx.fillRect(14, 10, 4, 12); cx.fillRect(10, 14, 12, 4);
             } else if (type === 'amount') {
                 // 複数の弾
                 cx.fillStyle = '#FFA500';
                 cx.beginPath(); cx.arc(10, 16, 4, 0, Math.PI*2); cx.fill();
                 cx.beginPath(); cx.arc(16, 10, 4, 0, Math.PI*2); cx.fill();
                 cx.beginPath(); cx.arc(22, 16, 4, 0, Math.PI*2); cx.fill();
             } else if (type === 'growth') {
                 // 若葉
                 cx.fillStyle = '#00FF7F';
                 cx.beginPath(); cx.moveTo(16, 28); cx.quadraticCurveTo(16, 16, 8, 10); cx.quadraticCurveTo(4, 16, 16, 28); cx.fill();
                 cx.beginPath(); cx.moveTo(16, 28); cx.quadraticCurveTo(16, 12, 24, 8); cx.quadraticCurveTo(28, 14, 16, 28); cx.fill();
             } else if (type === 'greed') {
                 // コイン
                 cx.fillStyle = '#FFD700';
                 cx.beginPath(); cx.arc(16, 16, 10, 0, Math.PI*2); cx.fill();
                 cx.fillStyle = '#DAA520'; cx.font='bold 14px sans-serif'; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('$', 16, 16);
             } else if (type === 'revive') {
                 // 羽
                 cx.fillStyle = '#FF00FF';
                 cx.beginPath(); cx.moveTo(16, 26); cx.quadraticCurveTo(26, 16, 26, 8); cx.quadraticCurveTo(16, 16, 16, 26); cx.fill();
                 cx.beginPath(); cx.moveTo(16, 26); cx.quadraticCurveTo(6, 16, 6, 8); cx.quadraticCurveTo(16, 16, 16, 26); cx.fill();
             } else if (type === 'knockback') {
                 // 衝撃
                 cx.strokeStyle = '#8B0000';
                 cx.beginPath(); cx.arc(16, 16, 6, 0, Math.PI*2); cx.stroke();
                 cx.beginPath(); cx.moveTo(16, 8); cx.lineTo(16, 4); cx.stroke();
                 cx.beginPath(); cx.moveTo(24, 16); cx.lineTo(28, 16); cx.stroke();
                 cx.beginPath(); cx.moveTo(16, 24); cx.lineTo(16, 28); cx.stroke();
                 cx.beginPath(); cx.moveTo(8, 16); cx.lineTo(4, 16); cx.stroke();
             } else if (type === 'duration') {
                 // 砂時計
                 cx.fillStyle = '#00CED1';
                 cx.beginPath(); cx.moveTo(8, 6); cx.lineTo(24, 6); cx.lineTo(16, 16); cx.lineTo(24, 26); cx.lineTo(8, 26); cx.lineTo(16, 16); cx.fill();
             } else if (type === 'curse') {
                 // ドクロ
                 cx.fillStyle = '#4B0082';
                 cx.beginPath(); cx.arc(16, 12, 8, 0, Math.PI*2); cx.fill();
                 cx.fillRect(12, 18, 8, 6);
                 cx.fillStyle = '#000'; cx.beginPath(); cx.arc(13, 12, 2, 0, Math.PI*2); cx.fill(); cx.beginPath(); cx.arc(19, 12, 2, 0, Math.PI*2); cx.fill();
             } else if (type === 'crit_rate') {
                 // スコープ
                 cx.strokeStyle = '#FF4500';
                 cx.beginPath(); cx.arc(16, 16, 10, 0, Math.PI*2); cx.stroke();
                 cx.beginPath(); cx.moveTo(16, 6); cx.lineTo(16, 26); cx.stroke();
                 cx.beginPath(); cx.moveTo(6, 16); cx.lineTo(26, 16); cx.stroke();
             } else if (type === 'crit_damage') {
                 // 爆発マーク
                 cx.fillStyle = '#DC143C';
                 cx.beginPath();
                 for(let i=0; i<8; i++) {
                     const a = i * Math.PI/4;
                     cx.lineTo(16 + Math.cos(a)*12, 16 + Math.sin(a)*12);
                     cx.lineTo(16 + Math.cos(a+Math.PI/8)*6, 16 + Math.sin(a+Math.PI/8)*6);
                 }
                 cx.fill();
             } else if (type === 'dodge') {
                 // 残像
                 cx.fillStyle = '#ADD8E6';
                 cx.globalAlpha = 0.5; cx.beginPath(); cx.arc(12, 16, 6, 0, Math.PI*2); cx.fill();
                 cx.globalAlpha = 1.0; cx.beginPath(); cx.arc(20, 16, 6, 0, Math.PI*2); cx.fill();
             } else if (type === 'vampirism') {
                 // 牙
                 cx.fillStyle = '#800000';
                 cx.beginPath(); cx.moveTo(8, 10); cx.lineTo(12, 22); cx.lineTo(16, 10); cx.fill();
                 cx.beginPath(); cx.moveTo(16, 10); cx.lineTo(20, 22); cx.lineTo(24, 10); cx.fill();
             } else if (type === 'nova') {
                 // ノヴァ (武器だがパッシブアイコン生成を使っている場合があるため)
                 cx.strokeStyle = '#FF4500';
                 cx.beginPath(); cx.arc(16, 16, 12, 0, Math.PI*2); cx.stroke();
                 cx.beginPath(); cx.moveTo(16, 16); cx.lineTo(28, 16); cx.stroke();
                 cx.beginPath(); cx.moveTo(16, 16); cx.lineTo(4, 16); cx.stroke();
                 cx.beginPath(); cx.moveTo(16, 16); cx.lineTo(16, 28); cx.stroke();
                 cx.beginPath(); cx.moveTo(16, 16); cx.lineTo(16, 4); cx.stroke();
             } else {
                 // デフォルト: 文字
                 cx.fillStyle = color;
                 cx.textAlign = 'center';
                 cx.textBaseline = 'middle';
                 cx.font = 'bold 14px sans-serif';
                 let symbol = type.substring(0, 2).toUpperCase();
                 cx.fillText(symbol, 16, 16);
             }
             
             return c;
        }

        const SPRITES = {
            player_left: createSprite('#3264FF', 'player_left'),
            player_right: createSprite('#3264FF', 'player_right'),
            gem: createSprite('#00FFFF', 'gem'),
            bible: createSprite('#A52A2A', 'bible'),
            mp_potion: createSprite('#1E90FF', 'mp_potion'),
            potion: createSprite('#FF0000', 'potion'),
            axe: createSprite('#CCCCCC', 'axe'),
            dagger: createSprite('#C0C0C0', 'dagger'),
            wand: createSprite('#FFD700', 'wand'),
            lightning: createSprite('#FFFF00', 'lightning'),
            fireball: createSprite('#FF4500', 'fireball'),
            chest: createSprite('#8B4513', 'chest'),
            village: createSprite('#8B4513', 'village'),
            obstacle: createSprite('#696969', 'obstacle'),
            obstacle_tree: createSprite('#228B22', 'obstacle_tree'),
            obstacle_ruin: createSprite('#A9A9A9', 'obstacle_ruin'),
            dungeon_entrance: createSprite('#000', 'dungeon_entrance'),
            abacus: createSprite('#8B4513', 'abacus'),
            bow: createSprite('#8B4513', 'bow'),
            arrow: createSprite('#8B4513', 'arrow'),
            musket: createSprite('#444', 'musket'),
            unique_weapon: createSprite('#E0FFFF', 'unique_weapon'),
            pet: createSprite('#FF69B4', 'pet'),
            fairy_item: createSprite('#FF69B4', 'fairy_item'),
            contract: createSprite('#F5DEB3', 'contract'),
            legend_weapon: createSprite('#FFD700', 'legend_weapon'),
            fortress_mine: createSprite(null, 'fortress_mine'),
            fortress_spike: createSprite(null, 'fortress_spike'),
            // 進化武器
            thousand_edge: createSprite('#00FFFF', 'thousand_edge'),
            holy_wand: createSprite('#FFD700', 'holy_wand'),
            death_spiral: createSprite('#FF0000', 'death_spiral'),
            unholy_vespers: createSprite('#4B0082', 'unholy_vespers'),
            hellfire: createSprite('#F0F', 'hellfire'),
            heaven_sword: createSprite('#E0FFFF', 'heaven_sword'),
            // 新規武器
            boomerang: createSprite('#8B4513', 'boomerang'),
            mine: createSprite('#555', 'mine'),
            tornado: createSprite('#EEE', 'tornado'),
            shuriken: createSprite('#CCC', 'shuriken'),
            holy_water: createSprite('#00F', 'holy_water'),
            spear: createSprite('#A52A2A', 'spear'),
            whip: createSprite('#8B0000', 'whip'),
            chakram: createSprite('#FFD700', 'chakram'),
            scythe: createSprite('#4B0082', 'scythe'),
            bomb: createSprite('#000', 'bomb'),
            holy_zone: createSprite('#00F', 'holy_zone'),
            explosion: createSprite('#F00', 'explosion'),
            aura: createPassiveSprite('aura', '#FF6347'),
            nova: createPassiveSprite('nova', '#FF4500'),
            // パッシブアイコン
            atk_speed: createPassiveSprite('atk_speed', '#FFFF00'),
            move_speed: createPassiveSprite('move_speed', '#00FF00'),
            bullet_speed: createPassiveSprite('bullet_speed', '#00FFFF'),
            max_hp: createPassiveSprite('max_hp', '#FF0000'),
            heal: createPassiveSprite('heal', '#FF69B4'),
            might: createPassiveSprite('might', '#FF4500'),
            area: createPassiveSprite('area', '#800080'),
            magnet: createPassiveSprite('magnet', '#0000FF'),
            armor: createPassiveSprite('armor', '#808080'),
            regen: createPassiveSprite('regen', '#FF1493'),
            luck: createPassiveSprite('luck', '#008000'),
            amount: createPassiveSprite('amount', '#FFA500'),
            // 新規パッシブ
            growth: createPassiveSprite('growth', '#00FF7F'),
            greed: createPassiveSprite('greed', '#FFD700'),
            revive: createPassiveSprite('revive', '#FF00FF'),
            knockback: createPassiveSprite('knockback', '#8B0000'),
            duration: createPassiveSprite('duration', '#00CED1'),
            curse: createPassiveSprite('curse', '#4B0082'),
            crit_rate: createPassiveSprite('crit_rate', '#FF4500'),
            crit_damage: createPassiveSprite('crit_damage', '#DC143C'),
            dodge: createPassiveSprite('dodge', '#ADD8E6'),
            vampirism: createPassiveSprite('vampirism', '#800000')
        };
        
        // 敵スプライト生成
        for (const [type, data] of Object.entries(ENEMY_DATA)) {
            SPRITES[type] = createSprite(data.color, type);
        }
        // NPCスプライト生成
        NPC_JOBS.forEach(job => {
            SPRITES[`npc_${job.id}_left`] = createSprite(null, `npc_${job.id}_left`);
            SPRITES[`npc_${job.id}_right`] = createSprite(null, `npc_${job.id}_right`);
        });

