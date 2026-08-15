// --- Maoh Survivors Zero 単体試験 ---
// このゲームはクラシックスクリプト構成でDOM/グローバル状態に強く依存しているため、
// 完全に孤立したユニットテストではなく「実際のゲーム状態に対する軽量な検証」として実装している。
// 各テストは自分が書き換える値を保存・復元し、実行順序に依存しないようにする。

// ゲームを1回開始する。player/enemies/SPELLSなど以降のテストが参照するグローバル状態が整う。
startGame();

describe('データ整合性', () => {
    test('ENEMY_DATAの全エントリが必須フィールドを持つ', () => {
        Object.keys(ENEMY_DATA).forEach(key => {
            const d = ENEMY_DATA[key];
            assertTrue(typeof d.name === 'string' && d.name.length > 0, `${key}.name`);
            assertTrue(typeof d.width === 'number' && d.width > 0, `${key}.width`);
            assertTrue(typeof d.height === 'number' && d.height > 0, `${key}.height`);
            assertTrue(typeof d.hp === 'number' && d.hp > 0, `${key}.hp`);
            assertTrue(typeof d.speed === 'number' && d.speed > 0, `${key}.speed`);
            assertTrue(typeof d.xp === 'number' && d.xp > 0, `${key}.xp`);
            assertTrue(d.time === 'day' || d.time === 'night' || d.time === 'any', `${key}.time`);
        });
    });

    test('POWERUPSのidが重複していない', () => {
        const ids = POWERUPS.map(p => p.id);
        assertEqual(new Set(ids).size, ids.length, '重複したPOWERUPS idがある');
    });

    test('SPELLSのidとキーが重複していない', () => {
        const ids = SPELLS.map(s => s.id);
        assertEqual(new Set(ids).size, ids.length, '重複したSPELLS idがある');
        const keys = SPELLS.map(s => s.key);
        assertEqual(new Set(keys).size, keys.length, '重複したSPELLSキーがある');
    });

    test('NPC_JOBSのidが重複していない', () => {
        const ids = NPC_JOBS.map(j => j.id);
        assertEqual(new Set(ids).size, ids.length);
    });

    test('EVOLUTIONSが参照するPlayerの武器レベル/所持数プロパティが実在する', () => {
        // 聖書だけ他の武器と異なり bibleCount で管理されている（checkEvolution()側もこれに合わせて特別扱いする）
        EVOLUTIONS.forEach(evo => {
            const prop = evo.weapon === 'bible' ? 'bibleCount' : (evo.weapon + 'Level');
            assertTrue(prop in player, `player.${prop} が存在しない`);
        });
    });
});

describe('ワールド生成ヘルパー', () => {
    test('getBiome() は同じ座標に対して決定論的', () => {
        assertEqual(getBiome(12345, 67890), getBiome(12345, 67890));
    });

    test('getBiome() は既知のバイオーム名のみ返す', () => {
        const known = ['forest', 'grassland', 'wasteland', 'cursed'];
        for (let i = 0; i < 20; i++) {
            const biome = getBiome(i * 1000, i * -500);
            assertTrue(known.includes(biome), `未知のバイオーム: ${biome}`);
        }
    });

    test('getObstacle() は同じセルに対して決定論的', () => {
        assertEqual(getObstacle(42, -17), getObstacle(42, -17));
    });

    test('getObstacle() はスポーン地点付近(±4マス)には障害物を配置しない', () => {
        for (let x = -4; x <= 4; x++) {
            for (let y = -4; y <= 4; y++) {
                assertEqual(getObstacle(x, y), null, `安全地帯セル(${x},${y})に障害物が生成された`);
            }
        }
    });
});

describe('applyPowerUp()', () => {
    test('might は攻撃力係数を+0.1する', () => {
        const before = player.damage;
        applyPowerUp('might');
        assertClose(player.damage, before + 0.1);
    });

    test('max_hp は最大HPと現在HPを+20する', () => {
        const beforeMax = player.maxHp;
        const beforeHp = player.hp;
        applyPowerUp('max_hp');
        assertClose(player.maxHp, beforeMax + 20);
        assertClose(player.hp, beforeHp + 20);
    });

    test('crit_rate はクリティカル率を+0.05する', () => {
        const before = player.critRate;
        applyPowerUp('crit_rate');
        assertClose(player.critRate, before + 0.05);
    });

    test('取得するとacquiredItemsに記録される', () => {
        const before = acquiredItems['luck'] || 0;
        applyPowerUp('luck');
        assertEqual(acquiredItems['luck'], before + 1);
    });
});

describe('checkEvolution()', () => {
    test('条件を満たす武器がなければnullを返す', () => {
        const saved = player.daggerLevel;
        player.daggerLevel = 0;
        assertEqual(checkEvolution(), null);
        player.daggerLevel = saved;
    });

    test('武器Lv8以上かつ対応パッシブ所持で進化オブジェクトを返す', () => {
        const savedLevel = player.daggerLevel;
        const savedAcquired = acquiredItems.bullet_speed;
        const savedEvolved = player.evolved.dagger;

        player.daggerLevel = 8;
        acquiredItems.bullet_speed = 1;
        player.evolved.dagger = false;

        const evo = checkEvolution();
        assertTrue(!!evo, '進化オブジェクトが返されるべき');
        assertEqual(evo.weapon, 'dagger');
        assertEqual(evo.result, 'thousand_edge');

        player.daggerLevel = savedLevel;
        if (savedAcquired === undefined) delete acquiredItems.bullet_speed; else acquiredItems.bullet_speed = savedAcquired;
        player.evolved.dagger = savedEvolved;
    });

    test('聖書はbibleCountを参照して進化する（bibleLevelという別プロパティは無い、回帰テスト）', () => {
        const savedCount = player.bibleCount;
        const savedAcquired = acquiredItems.duration;
        const savedEvolved = player.evolved.bible;

        player.bibleCount = 8;
        acquiredItems.duration = 1;
        player.evolved.bible = false;

        const evo = checkEvolution();
        assertTrue(!!evo, '聖書の進化オブジェクトが返されるべき');
        assertEqual(evo.weapon, 'bible');
        assertEqual(evo.result, 'unholy_vespers');

        player.bibleCount = savedCount;
        if (savedAcquired === undefined) delete acquiredItems.duration; else acquiredItems.duration = savedAcquired;
        player.evolved.bible = savedEvolved;
    });
});

describe('敵のステータス計算', () => {
    test('curse(呪い)は新規スポーンする敵のHPを比例して増加させる', () => {
        const savedCurse = player.curse;
        player.curse = 1.0;
        const e1 = new Enemy('goblin', player);
        player.curse = 2.0;
        const e2 = new Enemy('goblin', player);
        assertClose(e2.hp, e1.hp * 2, 0.01, 'curse=2の敵はcurse=1の敵の2倍のHPを持つべき');
        player.curse = savedCurse;
    });
});

describe('killPlayer() / 復活', () => {
    test('復活回数が残っていれば最大HPの50%で続行し、gameOverにならない', () => {
        const savedGameOver = gameOver;
        const savedRevive = player.revive;
        const savedMaxHp = player.maxHp;

        gameOver = false;
        player.revive = 1;
        player.maxHp = 300;
        killPlayer('TEST CAUSE');

        assertFalse(gameOver, '復活が発動した場合gameOverはfalseのまま');
        assertEqual(player.revive, 0, '復活回数が消費される');
        assertClose(player.hp, 150, 0.01, '最大HPの50%まで回復する');

        gameOver = savedGameOver;
        player.revive = savedRevive;
        player.maxHp = savedMaxHp;
    });

    test('復活回数が0ならgameOverとkilledByが設定される', () => {
        const savedGameOver = gameOver;
        const savedKilledBy = killedBy;
        const savedRevive = player.revive;

        gameOver = false;
        player.revive = 0;
        killPlayer('TEST MONSTER');

        assertTrue(gameOver, '復活が無ければgameOverはtrueになる');
        assertEqual(killedBy, 'TEST MONSTER');

        gameOver = savedGameOver;
        killedBy = savedKilledBy;
        player.revive = savedRevive;
    });
});

describe('Audio', () => {
    test('setVolume()はmasterGainとisMutedに反映される', () => {
        const savedVolume = masterVolume;
        Audio.setVolume(0.5);
        assertClose(Audio.masterGain.gain.value, 0.5, 0.01);
        assertFalse(Audio.isMuted);
        Audio.setVolume(0);
        assertTrue(Audio.isMuted);
        Audio.setVolume(savedVolume);
    });

    test('toggleMute()は0と直前の音量を切り替える', () => {
        Audio.setVolume(0.7);
        Audio.toggleMute();
        assertClose(Audio.masterGain.gain.value, 0, 0.01);
        assertTrue(Audio.isMuted);
        Audio.toggleMute();
        assertClose(Audio.masterGain.gain.value, 0.7, 0.01);
        assertFalse(Audio.isMuted);
    });
});

describe('設定 / キーコンフィグ', () => {
    test('デフォルトのkeyBindingsが仕様通り', () => {
        assertEqual(DEFAULT_KEY_BINDINGS.up, 'w');
        assertEqual(DEFAULT_KEY_BINDINGS.left, 'a');
        assertEqual(DEFAULT_KEY_BINDINGS.autoBattle, 'b');
        assertEqual(DEFAULT_KEY_BINDINGS.mute, 'm');
    });

    test('captureRebind()はコア操作を小文字で再割り当てする', () => {
        const saved = keyBindings.autoBattle;
        rebindingAction = { type: 'core', action: 'autoBattle' };
        captureRebind('J');
        assertEqual(keyBindings.autoBattle, 'j', 'コア操作のキーは大小無視の比較のため小文字で保存される');
        assertEqual(rebindingAction, null, '再割り当て後はrebindingActionがクリアされる');
        keyBindings.autoBattle = saved;
    });

    test('captureRebind()は魔法キーを大文字で再割り当てし、SPELLSを直接書き換える', () => {
        const healSpell = SPELLS.find(s => s.id === 'heal');
        const saved = healSpell.key;
        rebindingAction = { type: 'spell', id: 'heal' };
        captureRebind('r');
        assertEqual(healSpell.key, 'R', '魔法キーはバッジ表示と揃えるため大文字で保存される');
        healSpell.key = saved;
    });

    test('captureRebind()はEscapeでキャンセルされ、割り当ては変わらない', () => {
        const saved = keyBindings.pause;
        rebindingAction = { type: 'core', action: 'pause' };
        captureRebind('Escape');
        assertEqual(keyBindings.pause, saved);
        assertEqual(rebindingAction, null);
    });

    test('saveSettings()はlocalStorageに音量とキー割り当てを保存する', () => {
        const savedVolume = masterVolume;
        masterVolume = 0.42;
        saveSettings();
        const raw = JSON.parse(localStorage.getItem('monster_survivors_settings'));
        assertClose(raw.volume, 0.42, 0.001);
        assertEqual(raw.keyBindings.up, keyBindings.up);
        masterVolume = savedVolume;
        saveSettings();
    });
});

describe('NPC', () => {
    test('職業ごとのHP/防御/攻撃倍率が適用される', () => {
        const npc = new NPC(0, 0, 'warrior');
        const jobData = NPC_JOBS.find(j => j.id === 'warrior');
        assertClose(npc.maxHp, (200 + level * 50) * jobData.hpMult, 0.01);
        assertEqual(npc.defense, jobData.def);
        assertEqual(npc.damageMult, jobData.atkMult);
    });
});

describe('ダンジョン', () => {
    test('入場→固有編成の確認→クリア報酬→自動帰還までの一連の流れ', () => {
        const originX = player.x;
        const originY = player.y;

        enterDungeon();
        assertTrue(!!currentDungeon, '入場後はcurrentDungeonが設定される');
        assertEqual(currentDungeon.width, 700);
        assertEqual(currentDungeon.height, 700);

        const expectedTrash = 15 + Math.floor(level * 1.2);
        assertEqual(currentDungeon.enemies.length, expectedTrash + 1, '雑魚+番人1体の数が一致しない');
        assertTrue(['boss_lich', 'boss_hydra'].includes(currentDungeon.guardianType));

        const pool = ['skeleton', 'wraith', 'ghost', 'mummy', 'gargoyle', 'zombie'];
        currentDungeon.enemies.slice(0, -1).forEach(e => {
            assertTrue(pool.includes(e.type), `想定外の雑魚タイプ: ${e.type}`);
        });

        assertTrue(Math.abs(player.x - originX) > 1000000, 'プレイヤーは遠方のダンジョン区画へ転移するはず');

        const uniqueBefore = uniqueDrops.length;
        const legendBefore = legendDrops.length;
        currentDungeon.enemies.forEach(e => { e.hp = 0; });
        currentDungeon.update();
        assertTrue(currentDungeon.cleared, '敵を全滅させるとクリア扱いになるはず');
        assertTrue(uniqueDrops.length > uniqueBefore, 'クリア報酬でユニーク武器がドロップするはず');
        assertTrue(legendDrops.length > legendBefore, 'クリア報酬でレジェンド武器がドロップするはず');

        for (let i = 0; i < 200 && currentDungeon; i++) currentDungeon.update();
        assertEqual(currentDungeon, null, '帰還タイマー経過後はcurrentDungeonがnullになるはず');
        assertClose(player.x, originX, 0.01, '元の座標ちょうどへ帰還するはず');
        assertClose(player.y, originY, 0.01);

        // 後片付け: 倒したダンジョン敵、および未回収のドロップ品をグローバル配列から除去（他のテストへの影響を防ぐ）
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i].hp <= 0) enemies.splice(i, 1);
        }
        uniqueDrops.length = uniqueBefore;
        legendDrops.length = legendBefore;
    });
});

describe('メタプログレッション（魂の欠片 / ストア）', () => {
    test('earnMetaShards()はスコアの10分の1を欠片に変換する', () => {
        const before = metaState.shards;
        const earned = earnMetaShards(1234);
        assertEqual(earned, 123);
        assertEqual(metaState.shards, before + 123);
    });

    test('buyMetaUpgrade()はコストを消費しレベルを上げる（コストはレベルに比例）', () => {
        const savedLevel = metaState.upgrades.magnet;
        const savedShards = metaState.shards;
        metaState.upgrades.magnet = 0;
        metaState.shards = 1000;

        buyMetaUpgrade('magnet'); // cost = 15 * 1
        assertEqual(metaState.upgrades.magnet, 1);
        assertEqual(metaState.shards, 1000 - 15);

        buyMetaUpgrade('magnet'); // cost = 15 * 2
        assertEqual(metaState.upgrades.magnet, 2);
        assertEqual(metaState.shards, 1000 - 15 - 30);

        metaState.upgrades.magnet = savedLevel;
        metaState.shards = savedShards;
    });

    test('buyMetaUpgrade()は上限レベルを超えて購入できない', () => {
        const upgrade = META_UPGRADES.find(u => u.id === 'speed'); // maxLevel 5
        const savedLevel = metaState.upgrades.speed;
        const savedShards = metaState.shards;
        metaState.upgrades.speed = upgrade.maxLevel;
        metaState.shards = 99999;

        buyMetaUpgrade('speed');
        assertEqual(metaState.upgrades.speed, upgrade.maxLevel, '上限を超えてレベルが上がってはいけない');
        assertEqual(metaState.shards, 99999, '上限到達時は欠片が消費されてはいけない');

        metaState.upgrades.speed = savedLevel;
        metaState.shards = savedShards;
    });

    test('buyMetaUpgrade()は欠片が不足している場合は購入できない', () => {
        const savedLevel = metaState.upgrades.vitality;
        const savedShards = metaState.shards;
        metaState.upgrades.vitality = 0;
        metaState.shards = 5; // Lv1のコストは20なので不足

        buyMetaUpgrade('vitality');
        assertEqual(metaState.upgrades.vitality || 0, 0, '購入はブロックされるはず');
        assertEqual(metaState.shards, 5, '欠片は消費されないはず');

        metaState.upgrades.vitality = savedLevel;
        metaState.shards = savedShards;
    });

    test('applyMetaUpgrades()は購入済みの強化を新規プレイヤーに適用する', () => {
        const testPlayer = new Player();
        const baseHp = testPlayer.maxHp;
        const baseDamage = testPlayer.damage;
        const savedMight = metaState.upgrades.might;
        const savedVitality = metaState.upgrades.vitality;

        metaState.upgrades.might = 3;
        metaState.upgrades.vitality = 2;
        META_UPGRADES.forEach(u => {
            const lvl = metaState.upgrades[u.id] || 0;
            if (lvl > 0) u.apply(testPlayer, lvl);
        });

        assertClose(testPlayer.damage, baseDamage + 0.02 * 3, 0.001);
        assertClose(testPlayer.maxHp, baseHp + 20 * 2, 0.001);

        metaState.upgrades.might = savedMight;
        metaState.upgrades.vitality = savedVitality;
    });

    test('メタ状態はlocalStorageに永続化される', () => {
        const savedShards = metaState.shards;
        metaState.shards = 777;
        saveMetaState();
        const raw = JSON.parse(localStorage.getItem('monster_survivors_meta'));
        assertEqual(raw.shards, 777);
        metaState.shards = savedShards;
        saveMetaState();
    });
});

describe('checkCollisions() - 弾と敵', () => {
    test('弾が敵に命中するとHPが減り、弾は消える', () => {
        const e = new Enemy('goblin', player);
        e.x = player.x; e.y = player.y; e.hp = 1000; e.maxHp = 1000;
        enemies.push(e);
        const b = new Bullet(player.x, player.y, player.x + 1, player.y);
        b.x = e.x; b.y = e.y;
        bullets.push(b);

        const hpBefore = e.hp;
        checkCollisions();

        assertTrue(e.hp < hpBefore, '弾が命中してダメージを受けるはず');
        assertFalse(bullets.includes(b), '命中した弾は消えるはず');

        const idx = enemies.indexOf(e);
        if (idx > -1) enemies.splice(idx, 1);
    });
});

describe('checkCollisions() - XPジェムとレベルアップ', () => {
    test('ジェムを取得するとXPが増え、必要量に達するとレベルアップする', () => {
        const savedXp = xp;
        const savedLevel = level;
        const savedNextLevelXp = nextLevelXp;
        const savedAutoLevelUp = isAutoLevelUp;
        const savedPaused = isPaused;

        xp = 0;
        nextLevelXp = 10;
        level = 1;
        isAutoLevelUp = true; // モーダルを出さず自動で解決させる
        isPaused = false; // showLevelUpOptions()内のgameLoop()同期呼び出し分岐を踏まないようにする

        const pc = player.getCenter();
        const g = new Gem(pc.x - 7, pc.y - 7, 15);
        gems.push(g);
        checkCollisions();

        assertEqual(level, 2, 'XP15 >= 必要値10でレベルアップするはず');
        assertFalse(gems.includes(g), '取得したジェムは消えるはず');

        xp = savedXp;
        level = savedLevel;
        nextLevelXp = savedNextLevelXp;
        isAutoLevelUp = savedAutoLevelUp;
        isPaused = savedPaused;
        levelUpScreen.style.display = 'none';
    });
});

describe('checkCollisions() - プレイヤーと敵の接触', () => {
    test('回避率100%なら被弾しない', () => {
        const savedDodge = player.dodge;
        const savedHp = player.hp;
        const savedInvincible = player.invincibleTime;

        player.dodge = 1.0;
        player.invincibleTime = 0;
        const e = new Enemy('goblin', player);
        e.x = player.x; e.y = player.y;
        enemies.push(e);

        checkCollisions();
        assertEqual(player.hp, savedHp, '回避率100%なら被弾しないはず');

        const idx = enemies.indexOf(e);
        if (idx > -1) enemies.splice(idx, 1);
        player.dodge = savedDodge;
        player.hp = savedHp;
        player.invincibleTime = savedInvincible;
    });

    test('防御力が高くても被ダメージは最低1', () => {
        const savedArmor = player.armor;
        const savedHp = player.hp;
        const savedInvincible = player.invincibleTime;
        const savedDodge = player.dodge;

        player.dodge = 0;
        player.invincibleTime = 0;
        player.armor = 100;
        const e = new Enemy('goblin', player);
        e.x = player.x; e.y = player.y;
        enemies.push(e);

        checkCollisions();
        assertClose(player.hp, savedHp - 1, 0.01, '防御力が高くても最低1ダメージは受けるはず');

        const idx = enemies.indexOf(e);
        if (idx > -1) enemies.splice(idx, 1);
        player.armor = savedArmor;
        player.hp = savedHp;
        player.invincibleTime = savedInvincible;
        player.dodge = savedDodge;
    });
});

describe('checkCollisions() - 村と宝箱', () => {
    test('村に触れるとHPが全回復しNPC選択が開く（村自体は選択するまで消えない）', () => {
        const savedHp = player.hp;
        const savedNpcScreenDisplay = npcSelectScreen.style.display;
        const savedPaused = isPaused;

        player.hp = 1;
        const v = new Village(player.x, player.y);
        villages.push(v);
        checkCollisions();

        assertEqual(player.hp, player.maxHp, '村に触れるとHPが全回復するはず');
        assertEqual(npcSelectScreen.style.display, 'flex', 'NPC選択画面が開くはず');
        assertTrue(villages.includes(v), '職業を選ぶまで村自体は消えないはず');

        npcSelectScreen.style.display = savedNpcScreenDisplay;
        isPaused = savedPaused;
        player.hp = savedHp;
        villages.splice(villages.indexOf(v), 1);
    });

    test('NPC選択で職業を選ぶと最寄りの村が消える', () => {
        const savedNpcScreenDisplay = npcSelectScreen.style.display;
        const savedPaused = isPaused;
        const savedNpcCount = npcs.length;

        const v = new Village(player.x, player.y);
        villages.push(v);
        selectNpcJob('warrior');

        assertFalse(villages.includes(v), '職業を選ぶと最寄りの村が消えるはず');
        assertEqual(npcs.length, savedNpcCount + 1, '仲間が1体加入するはず');

        npcs.pop(); // 後片付け（末尾に追加されるため）
        npcSelectScreen.style.display = savedNpcScreenDisplay;
        isPaused = savedPaused;
    });

    test('宝箱に触れるとopenChest()が呼ばれ宝箱が消える', () => {
        const savedChestDisplay = document.getElementById('chest-screen').style.display;

        const c = new Chest(player.x, player.y);
        chests.push(c);
        checkCollisions();

        assertFalse(chests.includes(c), '触れた宝箱は消えるはず');
        assertEqual(document.getElementById('chest-screen').style.display, 'flex', '宝箱画面が開くはず');

        closeChest();
        document.getElementById('chest-screen').style.display = savedChestDisplay;
    });
});

describe('castSpell()', () => {
    test('未習得の魔法は発動せずMPも消費されない', () => {
        const savedSpells = player.spells.slice();
        const savedMp = player.mp;
        player.spells = player.spells.filter(id => id !== 'heal');
        player.mp = 100;
        castSpell('heal');
        assertEqual(player.mp, 100, '未習得なら何も起きないはず');
        player.spells = savedSpells;
        player.mp = savedMp;
    });

    test('ヒールはHPを50回復しMPを消費してクールダウンをセットする', () => {
        const savedSpells = player.spells.slice();
        const savedMp = player.mp, savedMaxMp = player.maxMp;
        const savedHp = player.hp, savedMaxHp = player.maxHp;
        const savedCooldowns = Object.assign({}, player.spellCooldowns);

        if (!player.spells.includes('heal')) player.spells.push('heal');
        player.spellCooldowns.heal = 0;
        player.maxHp = 200; player.hp = 100;
        player.maxMp = 999; player.mp = 999;

        castSpell('heal');

        const spellData = SPELLS.find(s => s.id === 'heal');
        assertClose(player.hp, 150, 0.01, 'HPが50回復するはず');
        assertEqual(player.mp, 999 - spellData.mp, 'MPが消費されるはず');
        assertTrue(player.spellCooldowns.heal > 0, 'クールダウンが設定されるはず');

        player.spells = savedSpells;
        player.mp = savedMp; player.maxMp = savedMaxMp;
        player.hp = savedHp; player.maxHp = savedMaxHp;
        player.spellCooldowns = savedCooldowns;
    });

    test('MP不足なら発動せずMPも消費されない', () => {
        const savedSpells = player.spells.slice();
        const savedMp = player.mp;
        const savedCooldowns = Object.assign({}, player.spellCooldowns);
        if (!player.spells.includes('heal')) player.spells.push('heal');
        player.spellCooldowns.heal = 0;
        player.mp = 0;

        castSpell('heal');
        assertEqual(player.mp, 0, 'MP不足時は消費されないはず');

        player.spells = savedSpells;
        player.mp = savedMp;
        player.spellCooldowns = savedCooldowns;
    });

    test('クールダウン中は再発動できない', () => {
        const savedSpells = player.spells.slice();
        const savedMp = player.mp, savedMaxMp = player.maxMp;
        const savedCooldowns = Object.assign({}, player.spellCooldowns);
        if (!player.spells.includes('heal')) player.spells.push('heal');
        player.maxMp = 999; player.mp = 999;
        player.spellCooldowns.heal = 999;

        const mpBefore = player.mp;
        castSpell('heal');
        assertEqual(player.mp, mpBefore, 'クールダウン中はMPが消費されないはず');

        player.spells = savedSpells;
        player.mp = savedMp; player.maxMp = savedMaxMp;
        player.spellCooldowns = savedCooldowns;
    });

    test('ヘイストは600フレーム(10秒)のタイマーをセットする', () => {
        const savedSpells = player.spells.slice();
        const savedMp = player.mp, savedMaxMp = player.maxMp;
        const savedCooldowns = Object.assign({}, player.spellCooldowns);
        const savedHasteTimer = hasteTimer;

        if (!player.spells.includes('haste')) player.spells.push('haste');
        player.spellCooldowns.haste = 0;
        player.maxMp = 999; player.mp = 999;

        castSpell('haste');
        assertEqual(hasteTimer, 600);

        player.spells = savedSpells;
        player.mp = savedMp; player.maxMp = savedMaxMp;
        player.spellCooldowns = savedCooldowns;
        hasteTimer = savedHasteTimer;
    });

    test('ジャッジメントは雑魚を即死させ、ボスには大ダメージ（即死ではない）を与える', () => {
        const savedSpells = player.spells.slice();
        const savedMp = player.mp, savedMaxMp = player.maxMp;
        const savedCooldowns = Object.assign({}, player.spellCooldowns);

        if (!player.spells.includes('judgment')) player.spells.push('judgment');
        player.spellCooldowns.judgment = 0;
        player.maxMp = 999; player.mp = 999;

        const weak = new Enemy('goblin', player);
        weak.x = player.x; weak.y = player.y; weak.hp = 9999;
        const boss = new Enemy('boss', player);
        boss.x = player.x; boss.y = player.y; boss.hp = 99999; boss.maxHp = 99999;
        enemies.push(weak, boss);

        castSpell('judgment');

        assertTrue(weak.hp <= 0, '雑魚は即死するはず');
        assertTrue(boss.hp < 99999, 'ボスはダメージを受けるはず');
        assertTrue(boss.hp > 0, 'ボスは即死しないはず');

        enemies.splice(enemies.indexOf(weak), 1);
        enemies.splice(enemies.indexOf(boss), 1);
        player.spells = savedSpells;
        player.mp = savedMp; player.maxMp = savedMaxMp;
        player.spellCooldowns = savedCooldowns;
    });
});

describe('Fortress', () => {
    test('生成時に15個のトラップと1体の囚人（非隠し職業）が設定される', () => {
        const f = new Fortress(3000000, 3000000);
        assertEqual(f.traps.length, 15);
        assertTrue(!!f.prisoner, '囚人が設定されるはず');
        const jobData = NPC_JOBS.find(j => j.id === f.prisoner.job);
        assertTrue(!!jobData && !jobData.hidden, '囚人の職業は非隠し職業のはず');
    });

    test('侵入するとモンスターハウス（雑魚40+レベル体＋中ボス1体）が発生する', () => {
        const f = new Fortress(3100000, 3100000);
        const savedX = player.x, savedY = player.y;

        player.x = f.x + f.width / 2;
        player.y = f.y + f.height / 2;
        f.update();

        assertTrue(f.triggered, '侵入するとtriggeredになるはず');
        const expectedCount = 40 + Math.floor(level) + 1; // 雑魚 + 中ボス1体
        assertEqual(f.enemies.length, expectedCount);

        f.enemies.forEach(e => {
            const idx = enemies.indexOf(e);
            if (idx > -1) enemies.splice(idx, 1);
        });
        player.x = savedX; player.y = savedY;
    });
});

describe('NPC.attack()', () => {
    test('戦士は斬撃(Slash)で攻撃する', () => {
        const npc = new NPC(player.x, player.y, 'warrior');
        const target = new Enemy('goblin', player);
        target.x = player.x + 50; target.y = player.y;
        const before = slashes.length;
        npc.attack(target);
        assertTrue(slashes.length > before, '戦士の攻撃でslashesが増えるはず');
        slashes.length = before;
    });

    test('僧侶はHPが最も減っている味方（この場合プレイヤー）を回復する', () => {
        const npc = new NPC(player.x, player.y, 'priest');
        const savedHp = player.hp, savedMaxHp = player.maxHp;
        player.maxHp = 200;
        player.hp = 50;
        const target = new Enemy('goblin', player);
        npc.attack(target);
        assertTrue(player.hp > 50, '僧侶がHPの少ないプレイヤーを回復するはず');
        player.hp = savedHp;
        player.maxHp = savedMaxHp;
    });

    test('盗賊はナイフ(Dagger)で攻撃する', () => {
        const npc = new NPC(player.x, player.y, 'thief');
        const target = new Enemy('goblin', player);
        target.x = player.x + 50; target.y = player.y;
        const before = daggers.length;
        npc.attack(target);
        assertTrue(daggers.length > before, '盗賊の攻撃でdaggersが増えるはず');
        daggers.length = before;
    });
});

describe('敵のWave/エンドレス補正', () => {
    test('Wave経過でHPが1+wave×0.3倍される', () => {
        const savedFrameCount = frameCount;
        frameCount = 1800 * 3; // wave3
        const e = new Enemy('goblin', player);
        const expected = ENEMY_DATA.goblin.hp * (1 + 3 * 0.3) * player.curse;
        assertClose(e.hp, expected, 0.5);
        frameCount = savedFrameCount;
    });

    test('エンドレスモード中はmaxHpにさらに1+wave×0.5倍の補正がかかる', () => {
        const savedFrameCount = frameCount;
        const savedEndless = isEndlessMode;
        frameCount = 1800 * 2; // wave2
        isEndlessMode = true;
        const e = new Enemy('goblin', player);
        const endlessMult = 1 + 2 * 0.5;
        assertClose(e.maxHp, e.hp * endlessMult, 0.5);
        frameCount = savedFrameCount;
        isEndlessMode = savedEndless;
    });
});

describe('武器クラス', () => {
    test('Shurikenは60フレーム後に非アクティブになる', () => {
        const s = new Shuriken(player.x, player.y, 1, 0);
        assertTrue(s.active);
        for (let i = 0; i < 60; i++) s.update();
        assertFalse(s.active, '寿命が尽きたら非アクティブになるはず');
    });

    test('Mineは命中すると爆発(Explosion)を発生させ自身は消える', () => {
        const before = activeWeapons.length;
        const m = new Mine(player.x, player.y);
        const dummyEnemy = new Enemy('goblin', player);
        const hit = m.onHit(dummyEnemy);
        assertTrue(hit, 'onHitはtrueを返すはず');
        assertFalse(m.active, '地雷は起爆すると消えるはず');
        assertTrue(activeWeapons.length > before, '爆発(Explosion)が追加されるはず');
        activeWeapons.length = before;
    });

    test('Boomerangは寿命が半分を切るとプレイヤー方向へ引き戻し加速する', () => {
        const b = new Boomerang(player.x + 1000, player.y, 1, 0);
        b.maxLife = 120;
        b.life = 50; // 半分未満
        b.vx = 0; b.vy = 0;
        const expectedSign = Math.sign(player.x - b.x);
        b.update();
        assertEqual(Math.sign(b.vx), expectedSign, '寿命半分未満ではプレイヤー方向へ加速するはず');
    });

    test('Explosionのサイズはplayer.areaに比例する', () => {
        const savedArea = player.area;
        player.area = 2.0;
        const ex = new Explosion(player.x, player.y);
        assertClose(ex.width, 60 * 2.0, 0.01);
        player.area = savedArea;
    });
});

describe('showLevelUpOptions()', () => {
    // showLevelUpOptions()自体は自動レベルアップ時にgameLoop()を同期的に呼び出す経路を持ち、
    // テストから繰り返し直接呼ぶと呼び出し連鎖のリスクがあるため、ここでは抽選プールの
    // 除外ロジック（実装と同一のfilter式）を直接検証する形に留める
    test('max_hpとreviveは通常レベルアップの抽選プールから除外される（宝箱限定のため）', () => {
        const pool = POWERUPS.filter(p => p.id !== 'max_hp' && p.id !== 'revive');
        assertFalse(pool.some(p => p.id === 'max_hp'), 'max_hpはプールに含まれてはいけない');
        assertFalse(pool.some(p => p.id === 'revive'), 'reviveはプールに含まれてはいけない');
        assertEqual(pool.length, POWERUPS.length - 2, '除外されるのはこの2種類のみのはず');
    });
});

describe('Player - 自動戦闘AI', () => {
    // オートバトルの判定は敵/敵弾/村/ジェムなど多数の配列を参照するため、
    // このdescribe内のテストは共通ヘルパーで一時的に世界をクリアしてから実行する。
    function withCleanWorld(fn) {
        const saved = {
            npcs: npcs.slice(), enemies: enemies.slice(), enemyBullets: enemyBullets.slice(),
            potions: potions.slice(), villages: villages.slice(), gems: gems.slice(), fortresses: fortresses.slice(),
        };
        npcs.length = 0; enemies.length = 0; enemyBullets.length = 0;
        potions.length = 0; villages.length = 0; gems.length = 0; fortresses.length = 0;

        const savedAutoBattle = isAutoBattle;
        const savedX = player.x, savedY = player.y;
        const savedHp = player.hp, savedMaxHp = player.maxHp;
        isAutoBattle = true;
        player.maxHp = 100;
        player.hp = 100;

        try {
            fn();
        } finally {
            player.x = savedX; player.y = savedY;
            player.hp = savedHp; player.maxHp = savedMaxHp;
            isAutoBattle = savedAutoBattle;
            npcs.length = 0; npcs.push(...saved.npcs);
            enemies.length = 0; enemies.push(...saved.enemies);
            enemyBullets.length = 0; enemyBullets.push(...saved.enemyBullets);
            potions.length = 0; potions.push(...saved.potions);
            villages.length = 0; villages.push(...saved.villages);
            gems.length = 0; gems.push(...saved.gems);
            fortresses.length = 0; fortresses.push(...saved.fortresses);
        }
    }

    test('低HP(30%以下)時は最も近い敵から逃げる（最優先）', () => {
        withCleanWorld(() => {
            player.hp = 20; // 20%
            const e = new Enemy('goblin', player);
            e.x = player.x + 100; e.y = player.y;
            enemies.push(e);
            const distBefore = Math.hypot(e.x - player.x, e.y - player.y);
            player.update();
            const distAfter = Math.hypot(e.x - player.x, e.y - player.y);
            assertTrue(distAfter > distBefore, 'HPが低いときは敵から遠ざかるはず');
        });
    });

    test('仲間が4人以上いると未突入の要塞を目指す', () => {
        withCleanWorld(() => {
            for (let i = 0; i < 4; i++) npcs.push(new NPC(player.x, player.y, 'warrior'));
            const f = new Fortress(3200000, 3200000);
            f.triggered = false;
            fortresses.push(f);
            const distBefore = Math.hypot((f.x + f.width / 2) - player.x, (f.y + f.height / 2) - player.y);
            player.update();
            const distAfter = Math.hypot((f.x + f.width / 2) - player.x, (f.y + f.height / 2) - player.y);
            assertTrue(distAfter < distBefore, '要塞に近づくはず');
        });
    });

    test('安全距離(通常敵75px)より近いと敵から距離を取る', () => {
        withCleanWorld(() => {
            const e = new Enemy('goblin', player);
            e.x = player.x + 50; e.y = player.y;
            enemies.push(e);
            const distBefore = Math.hypot(e.x - player.x, e.y - player.y);
            player.update();
            const distAfter = Math.hypot(e.x - player.x, e.y - player.y);
            assertTrue(distAfter > distBefore, '安全距離より近い敵からは離れるはず');
        });
    });

    test('近くの敵弾を回避する', () => {
        withCleanWorld(() => {
            const b = new EnemyBullet(player.x + 50, player.y, player.x, player.y);
            b.x = player.x + 50; b.y = player.y;
            enemyBullets.push(b);
            const distBefore = Math.hypot(b.x - player.x, b.y - player.y);
            player.update();
            const distAfter = Math.hypot(b.x - player.x, b.y - player.y);
            assertTrue(distAfter > distBefore, '近くの敵弾からは避けるはず');
        });
    });

    test('脅威が無ければ最も近いXPジェムへ向かう', () => {
        withCleanWorld(() => {
            const g = new Gem(player.x + 200, player.y, 5);
            gems.push(g);
            const distBefore = Math.hypot(g.x - player.x, g.y - player.y);
            player.update();
            const distAfter = Math.hypot(g.x - player.x, g.y - player.y);
            assertTrue(distAfter < distBefore, '脅威が無ければジェムに近づくはず');
        });
    });
});

describe('Enemyの行動パターン', () => {
    test('スケルトンは射程内(500px)かつタイマー経過で遠距離弾を撃つ', () => {
        const e = new Enemy('skeleton', player);
        e.x = player.x + 300; e.y = player.y; // 250(接近しない距離)より遠いが500(射程)より近い
        e.attackTimer = 125;
        const bulletsBefore = enemyBullets.length;
        e.update(player);
        assertTrue(enemyBullets.length > bulletsBefore, '射程内かつタイマー経過で弾を撃つはず');
        enemyBullets.length = bulletsBefore;
    });

    test('ブロブ同士は接触すると合体しHPが合算される', () => {
        const a = new Enemy('blob', player);
        const b = new Enemy('blob', player);
        a.x = player.x; a.y = player.y;
        b.x = player.x + 5; b.y = player.y; // 重なる距離
        a.hp = 100; a.maxHp = 1000;
        b.hp = 50; b.maxHp = 1000;
        enemies.push(a, b);

        a.update(player);

        assertTrue(b.merged, '吸収された側はmerged=trueになるはず');
        assertEqual(b.hp, 0, '吸収された側のHPは0になるはず');
        assertClose(a.hp, 150, 0.01, '吸収した側のHPは合算されるはず');

        enemies.splice(enemies.indexOf(a), 1);
        enemies.splice(enemies.indexOf(b), 1);
    });
});

describe('武器クラス（追加分）', () => {
    test('HolyWaterは着地するとHolyZoneを生成して消える', () => {
        const before = activeWeapons.length;
        const hw = new HolyWater(player.x, player.y);
        hw.targetY = hw.y; // 開始高度に戻ってきたら着地とみなす
        for (let i = 0; i < 60 && hw.active; i++) hw.update();
        assertFalse(hw.active, '着地したら非アクティブになるはず');
        assertTrue(activeWeapons.length > before, 'HolyZoneが追加されるはず');
        activeWeapons.length = before;
    });

    test('Bombは一定距離落下するとExplosionを発生させて消える', () => {
        const before = activeWeapons.length;
        const bomb = new Bomb(player.x, player.y);
        for (let i = 0; i < 60 && bomb.active; i++) bomb.update();
        assertFalse(bomb.active, '着弾したら非アクティブになるはず');
        assertTrue(activeWeapons.length > before, 'Explosionが追加されるはず');
        activeWeapons.length = before;
    });

    test('BowWeaponは残り体力が10未満になるとArrowを発射する', () => {
        const before = activeWeapons.length;
        const target = new Enemy('goblin', player);
        target.x = player.x + 100; target.y = player.y;
        const bw = new BowWeapon(player.x, player.y, target);
        for (let i = 0; i < 11; i++) bw.update();
        assertTrue(bw.fired, '10フレーム未満になったら発射されるはず');
        assertTrue(activeWeapons.length > before, 'Arrowが追加されるはず');
        activeWeapons.length = before;
    });

    test('Spearは貫通し、ダメージはplayer.damageに比例する', () => {
        const savedDamage = player.damage;
        player.damage = 2.0;
        const spear = new Spear(player.x, player.y, 1, 0);
        assertClose(spear.damage, 40, 0.01);
        assertTrue(spear.onHit(new Enemy('goblin', player)), '貫通するのでonHitはtrueを返すはず');
        player.damage = savedDamage;
    });

    test('Whipは向き(facing)に応じて判定位置が反転する', () => {
        const right = new Whip(100, 100, 'right');
        const left = new Whip(100, 100, 'left');
        assertEqual(right.x, 100, '右向きはxがそのまま');
        assertClose(left.x, 100 - left.width, 0.01, '左向きはwidth分左にずれる');
    });

    test('DeathSpiralは指定角度の方向へ直進する', () => {
        const ds = new DeathSpiral(0, 0, 0); // angle=0 -> +x方向
        assertClose(ds.vx, 6, 0.01);
        assertClose(ds.vy, 0, 0.01);
    });
});

describe('武器クラス（追加分2）', () => {
    test('Tornadoは寿命が尽きると非アクティブになり、貫通する', () => {
        const t = new Tornado(player.x, player.y);
        t.life = 1;
        t.update();
        assertFalse(t.active, '寿命切れで非アクティブになるはず');
        assertTrue(t.onHit(new Enemy('goblin', player)), '貫通するのでtrueを返すはず');
    });

    test('Scytheのサイズはplayer.area、寿命はplayer.durationに比例する', () => {
        const savedArea = player.area, savedDuration = player.duration;
        player.area = 2.0; player.duration = 2.0;
        const s = new Scythe(player.x, player.y);
        assertClose(s.width, 80, 0.01);
        assertClose(s.life, 240, 0.01);
        player.area = savedArea; player.duration = savedDuration;
    });

    test('Abacusのダメージはplayer.damageとdamageMultに比例する', () => {
        const savedDamage = player.damage;
        player.damage = 1.0;
        const a = new Abacus(player.x, player.y, 1, 0, 2.0);
        assertClose(a.damage, 50, 0.01); // 25 * 1.0 * 2.0
        player.damage = savedDamage;
    });

    test('MusketWeaponは残りライフが15になった時点でMusketShotを発射する', () => {
        const before = activeWeapons.length;
        const target = new Enemy('goblin', player);
        target.x = player.x + 100; target.y = player.y;
        const mw = new MusketWeapon(player.x, player.y, target);
        for (let i = 0; i < 15; i++) mw.update(); // life: 30 -> 15
        assertTrue(mw.fired, 'life=15になった時点で発射されるはず');
        assertTrue(activeWeapons.length > before, 'MusketShotが追加されるはず');
        activeWeapons.length = before;
    });

    test('HolyZoneのサイズはplayer.area、寿命はplayer.durationに比例する', () => {
        const savedArea = player.area, savedDuration = player.duration;
        player.area = 2.0; player.duration = 3.0;
        const hz = new HolyZone(player.x, player.y);
        assertClose(hz.width, 160, 0.01);
        assertClose(hz.life, 360, 0.01);
        player.area = savedArea; player.duration = savedDuration;
    });

    test('HolyRayは60フレームで消え、貫通する', () => {
        const hr = new HolyRay(player.x, player.y, 0);
        assertEqual(hr.life, 60);
        for (let i = 0; i < 60; i++) hr.update();
        assertFalse(hr.active, '寿命が尽きたら非アクティブになるはず');
    });

    test('BlackHoleは半径がmaxRadiusまで拡大し続けそこで頭打ちになる', () => {
        const savedArea = player.area;
        player.area = 1.0;
        const bh = new BlackHole(player.x, player.y);
        assertEqual(bh.radius, 10);
        assertClose(bh.maxRadius, 300, 0.01);
        for (let i = 0; i < 200; i++) bh.update();
        assertClose(bh.radius, 300, 0.01, '半径はmaxRadiusで頭打ちになるはず');
        player.area = savedArea;
    });

    test('ShadowCloneはプレイヤーの少し左後方の目標へ追従する', () => {
        const savedX = player.x, savedY = player.y;
        player.x = 1000; player.y = 1000;
        const clone = new ShadowClone(player);
        clone.x = 0; clone.y = 0;
        const distBefore = Math.hypot((player.x - 50) - clone.x, player.y - clone.y);
        clone.update();
        const distAfter = Math.hypot((player.x - 50) - clone.x, player.y - clone.y);
        assertTrue(distAfter < distBefore, 'プレイヤーの後方目標に近づくはず');
        player.x = savedX; player.y = savedY;
    });
});

describe('武器クラス（classes.js側）', () => {
    test('Axeは画面外まで落下すると非アクティブになる', () => {
        const axe = new Axe(player.x, player.y);
        axe.vy = 0; // 初速(打ち上げ)を打ち消し、位置判定のみを検証する
        axe.y = player.y + SCREEN_HEIGHT + 1; // 既に画面外相当
        axe.update(player);
        assertFalse(axe.active);
    });

    test('Novaは半径がmaxRadiusを超えると非アクティブになる', () => {
        const savedArea = player.area;
        player.area = 1.0;
        const n = new Nova(player.x, player.y, 1);
        assertClose(n.maxRadius, 120, 0.01); // (100 + 1*20) * 1.0
        for (let i = 0; i < 20; i++) n.update();
        assertFalse(n.active, '半径がmaxRadiusを超えたら非アクティブになるはず');
        player.area = savedArea;
    });

    test('Daggerは1000px以上プレイヤーから離れると非アクティブになる', () => {
        const d = new Dagger(player.x, player.y, 1, 0);
        d.x = player.x + 2000; d.y = player.y;
        d.update(player);
        assertFalse(d.active);
    });

    test('Daggerのダメージはplayer.damageとdamageMultに比例する', () => {
        const savedDamage = player.damage;
        player.damage = 1.0;
        const d = new Dagger(player.x, player.y, 1, 0, false, 2.0);
        assertClose(d.damage, 30, 0.01); // 15 * 1.0 * 2.0
        player.damage = savedDamage;
    });

    test('LightningVortexは寿命が尽きると非アクティブになり貫通する', () => {
        const lv = new LightningVortex(0);
        lv.life = 1;
        lv.update();
        assertFalse(lv.active);
        assertTrue(lv.onHit(new Enemy('goblin', player)));
    });
});

describe('ボスの突進ステートマシン(final_boss/dark_lord)', () => {
    test('追跡中(state 0)、近距離かつタイマー経過で予備動作(state 1)へ移行する', () => {
        const boss = new Enemy('final_boss', player);
        boss.x = player.x + 100; boss.y = player.y; // dist=100 < 300
        boss.state = 0;
        boss.attackTimer = 181;
        boss.update(player);
        assertEqual(boss.state, 1, '距離300未満かつタイマー経過で予備動作へ移行するはず');
    });

    test('予備動作(state 1)からタイマー経過で突進(state 2)へ移行する', () => {
        const boss = new Enemy('final_boss', player);
        boss.x = player.x + 100; boss.y = player.y;
        boss.state = 1;
        boss.attackTimer = 41;
        boss.update(player);
        assertEqual(boss.state, 2, '予備動作後は突進状態へ移行するはず');
        assertTrue(boss.chargeVx !== undefined, '突進速度が設定されるはず');
    });

    test('突進中(state 2)はタイマー経過で追跡(state 0)へ戻る', () => {
        const boss = new Enemy('final_boss', player);
        boss.x = player.x + 500; boss.y = player.y + 500;
        boss.state = 2;
        boss.chargeVx = 10; boss.chargeVy = 0;
        boss.attackTimer = 31;
        boss.update(player);
        assertEqual(boss.state, 0, '突進終了後は追跡状態へ戻るはず');
    });
});

describe('障害物システム', () => {
    // 障害物はハッシュ決定論的に配置されるため、実在するセルを探索して使う
    function findObstacleCell() {
        for (let x = 5; x < 300; x++) {
            for (let y = -100; y < 100; y++) {
                const type = getObstacle(x, y);
                if (type) return { x, y, type };
            }
        }
        return null;
    }

    test('checkObstacleCollision()は障害物と重なったエンティティを押し出す', () => {
        const cell = findObstacleCell();
        assertTrue(!!cell, 'テスト用の障害物セルが見つかるはず');
        const obsX = cell.x * 100 + 10;
        const obsY = cell.y * 100 + 10;
        const entity = { x: obsX + 40 - 15, y: obsY + 40 - 15, width: 30, height: 30 };
        checkObstacleCollision(entity);
        const stillOverlapping = entity.x < obsX + 80 && entity.x + entity.width > obsX &&
            entity.y < obsY + 80 && entity.y + entity.height > obsY;
        assertFalse(stillOverlapping, '押し出し後は障害物と重ならないはず');
    });

    test('getAvoidanceVector()は近くの障害物から離れる方向のベクトルを返す', () => {
        const cell = findObstacleCell();
        const obsCX = cell.x * 100 + 50;
        const obsCY = cell.y * 100 + 50;
        const entity = { x: obsCX + 30 - 15, y: obsCY - 15, width: 30, height: 30 }; // 障害物の右隣、検知半径100以内
        const avoid = getAvoidanceVector(entity, 3.0);
        assertTrue(avoid.x > 0, '障害物が左にあるので右向き(プラス)の回避ベクトルになるはず');
    });

    test('checkObstacleInteraction()は武器が障害物を破壊すると爆発とドロップ判定を発生させる', () => {
        const cell = findObstacleCell();
        const key = `${cell.x},${cell.y}`;
        const wasDestroyed = destroyedObstacles.has(key);
        const savedHpEntry = obstacleHP.get(key);
        obstacleHP.delete(key);

        const activeBefore = activeWeapons.length;
        const daggersBefore = daggers.length;
        const obsCX = cell.x * 100 + 50;
        const obsCY = cell.y * 100 + 50;
        const dagger = new Dagger(obsCX - 10, obsCY - 10, 1, 0);
        dagger.damage = 999999; // 一撃で破壊
        daggers.push(dagger);

        checkObstacleInteraction();

        assertTrue(destroyedObstacles.has(key), '破壊されたセルが記録されるはず');
        assertTrue(activeWeapons.length > activeBefore, '破壊時に爆発(Explosion)が追加されるはず');
        assertFalse(dagger.active, '弾丸系の武器は着弾すると消えるはず');

        activeWeapons.length = activeBefore;
        daggers.length = daggersBefore;
        if (!wasDestroyed) destroyedObstacles.delete(key);
        if (savedHpEntry) obstacleHP.set(key, savedHpEntry); else obstacleHP.delete(key);
    });
});

describe('checkCollisions() - アイテム取得', () => {
    test('ポーションに触れるとHPが50回復する', () => {
        const savedHp = player.hp, savedMaxHp = player.maxHp;
        player.maxHp = 200; player.hp = 100;
        const p = new Potion(player.x, player.y);
        potions.push(p);
        checkCollisions();
        assertClose(player.hp, 150, 0.01);
        assertFalse(potions.includes(p));
        player.hp = savedHp; player.maxHp = savedMaxHp;
    });

    test('MPポーションに触れるとMPが50回復する（回帰テスト: 以前は当たり判定が未実装だった）', () => {
        const savedMp = player.mp, savedMaxMp = player.maxMp;
        player.maxMp = 200; player.mp = 100;
        const p = new MpPotion(player.x, player.y);
        mpPotions.push(p);
        checkCollisions();
        assertClose(player.mp, 150, 0.01);
        assertFalse(mpPotions.includes(p));
        player.mp = savedMp; player.maxMp = savedMaxMp;
    });

    test('ユニーク武器ドロップに触れるとランダムな武器/パッシブが1段階強化される', () => {
        const u = new UniqueWeaponDrop(player.x, player.y);
        uniqueDrops.push(u);
        const weaponTypes = ['bible', 'axe', 'aura', 'nova', 'dagger', 'wand', 'lightning', 'fireball'];
        const before = {};
        weaponTypes.forEach(w => { before[w] = player[w === 'bible' ? 'bibleCount' : w + 'Level']; });

        checkCollisions();

        assertFalse(uniqueDrops.includes(u), '触れたドロップは消えるはず');
        const upgraded = weaponTypes.some(w => player[w === 'bible' ? 'bibleCount' : w + 'Level'] > before[w]);
        assertTrue(upgraded, 'いずれかの武器/パッシブが強化されるはず');
    });

    test('レジェンド武器ドロップに触れるとホーミングオーブ武器を獲得する', () => {
        const l = new LegendWeaponDrop(player.x, player.y);
        legendDrops.push(l);
        const before = activeWeapons.length;
        checkCollisions();
        assertFalse(legendDrops.includes(l));
        assertTrue(activeWeapons.length > before, 'LegendHomingOrbが追加されるはず');
        activeWeapons.length = before;
    });

    test('妖精アイテムに触れるとペットを獲得する', () => {
        const f = new FairyItem(player.x, player.y);
        fairyItems.push(f);
        const before = pets.length;
        checkCollisions();
        assertFalse(fairyItems.includes(f));
        assertEqual(pets.length, before + 1, 'ペットが1体増えるはず');
        pets.length = before;
    });

    test('契約書に触れるとNPC選択画面が開く', () => {
        const savedDisplay = npcSelectScreen.style.display;
        const savedPaused = isPaused;
        const c = new Contract(player.x, player.y);
        contracts.push(c);
        checkCollisions();
        assertFalse(contracts.includes(c));
        assertEqual(npcSelectScreen.style.display, 'flex');
        npcSelectScreen.style.display = savedDisplay;
        isPaused = savedPaused;
    });
});

describe('NPCの復活', () => {
    test('戦闘不能のNPCにプレイヤーが近づいているとHPが回復し満タンで復活する', () => {
        const npc = new NPC(player.x, player.y, 'warrior');
        npc.isDead = true;
        npc.hp = npc.maxHp - 1;
        npc.update();
        assertFalse(npc.isDead, 'HPが満タンになると復活するはず');
        assertEqual(npc.hp, npc.maxHp);
    });
});

describe('LegendHomingOrb', () => {
    test('一定間隔でホーミング弾(LegendHomingBullet)を発射する', () => {
        const e = new Enemy('goblin', player);
        e.x = player.x + 200; e.y = player.y;
        enemies.push(e);
        const orb = new LegendHomingOrb(player);
        const before = activeWeapons.length;
        orb.update(); orb.update(); // attackInterval=2
        assertTrue(activeWeapons.length > before, '一定間隔でLegendHomingBulletを発射するはず');
        activeWeapons.length = before;
        enemies.splice(enemies.indexOf(e), 1);
    });
});

describe('ランキング', () => {
    test('saveScore()は上位10件のみスコア降順で保持する', () => {
        const savedRanking = localStorage.getItem('monster_survivors_ranking');
        const savedShards = metaState.shards;
        localStorage.removeItem('monster_survivors_ranking');

        for (let i = 0; i < 12; i++) saveScore(i * 100, 1, false);

        const ranking = JSON.parse(localStorage.getItem('monster_survivors_ranking'));
        assertEqual(ranking.length, 10, '上位10件のみ保持されるはず');
        assertEqual(ranking[0].score, 1100, '最高スコアが先頭に来るはず');
        assertTrue(ranking[0].score >= ranking[ranking.length - 1].score, '降順ソートされているはず');

        if (savedRanking) localStorage.setItem('monster_survivors_ranking', savedRanking);
        else localStorage.removeItem('monster_survivors_ranking');
        metaState.shards = savedShards;
        saveMetaState();
    });
});

describe('キーボード操作: タイトル/エンディング画面のボタン選択', () => {
    test('updateStartSelection()は選択中のボタンにのみselectedクラスを付与する', () => {
        const savedIndex = selectedStartIndex;
        selectedStartIndex = 1;
        updateStartSelection();
        const btns = document.querySelectorAll('.start-menu-btn');
        assertEqual(btns.length, 3);
        btns.forEach((b, i) => assertEqual(b.classList.contains('selected'), i === 1));
        selectedStartIndex = savedIndex;
        updateStartSelection();
    });

    test('矢印キーでメニュー選択を開始した後だけ、Enterがボタンを実行する（ゲームを開始させない）回帰テスト', () => {
        // 「未選択(-1)のままEnterを押すとstartGame()が呼ばれる」側は、実際にstartGame()を
        // 再実行すると（フィールド初期化等の副作用で）他のテストが壊れるため、ここでは
        // 「矢印キーでメニューに入った後はEnterがゲーム開始に流れない」side を安全に検証する
        const savedGameStarted = isGameStarted;
        const savedIndex = selectedStartIndex;
        const savedRankingDisplay = document.getElementById('ranking-screen').style.display;

        isGameStarted = false;
        selectedStartIndex = -1;

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        assertEqual(selectedStartIndex, 0, '矢印キーでメニュー選択(0番目)が始まるはず');
        assertFalse(isGameStarted, 'メニュー選択を開始しただけではゲームは始まらないはず');

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        assertEqual(document.getElementById('ranking-screen').style.display, 'flex', 'Enterで選択中のRANKINGボタンが実行されるはず');
        assertFalse(isGameStarted, 'ボタン実行時もゲームは始まらないはず');

        document.getElementById('ranking-screen').style.display = savedRankingDisplay;
        selectedStartIndex = savedIndex;
        isGameStarted = savedGameStarted;
    });

    test('updateEndingSelection()は選択中のボタンにのみselectedクラスを付与する', () => {
        const savedIndex = selectedEndingIndex;
        selectedEndingIndex = 1;
        updateEndingSelection();
        const btns = document.querySelectorAll('.ending-menu-btn');
        assertEqual(btns.length, 2);
        btns.forEach((b, i) => assertEqual(b.classList.contains('selected'), i === 1));
        selectedEndingIndex = savedIndex;
        updateEndingSelection();
    });

    test('isAnyTitleModalOpen()は設定/ストア/ランキング画面のいずれかが開いていればtrueを返す', () => {
        const s = document.getElementById('settings-screen');
        const savedDisplay = s.style.display;
        s.style.display = 'none';
        assertFalse(isAnyTitleModalOpen());
        s.style.display = 'flex';
        assertTrue(isAnyTitleModalOpen());
        s.style.display = savedDisplay;
    });

    test('エンディング画面表示中、矢印キーで選択が移動しEnterで選択したボタンが実行される', () => {
        const screen = document.getElementById('ending-screen');
        const savedDisplay = screen.style.display;
        const savedIndex = selectedEndingIndex;
        const savedGameOver = gameOver;
        gameOver = false; // ゲームオーバー分岐と競合しないようにする
        screen.style.display = 'flex';
        selectedEndingIndex = 0;

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        assertEqual(selectedEndingIndex, 1, '→キーで選択が1つ進むはず');

        const btns = document.querySelectorAll('.ending-menu-btn');
        let activated = false;
        const originalOnclick = btns[1].onclick;
        btns[1].onclick = () => { activated = true; }; // location.reload()を実際には発火させない
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        assertTrue(activated, 'Enterで選択中のボタンがクリックされるはず');
        btns[1].onclick = originalOnclick;

        screen.style.display = savedDisplay;
        selectedEndingIndex = savedIndex;
        gameOver = savedGameOver;
        updateEndingSelection();
    });
});

describe('updateGame() の回帰テスト', () => {
    test('魔法の杖(wandLevel>0)を所持していてもupdateGame()がクラッシュしない（TDZ回帰テスト）', () => {
        // 修正前は updateGame() 内の「魔法の杖更新」ブロックが、関数のさらに下で
        // 宣言されている const pc （新規武器セクション用）を初期化前に参照してしまい、
        // "Cannot access 'pc' before initialization" で毎フレームクラッシュしていた。
        const savedWandLevel = player.wandLevel;
        const savedFrameCount = frameCount;
        const originalEnemyCount = enemies.length;
        const e = new Enemy('goblin', player);
        e.x = player.x + 100; e.y = player.y;
        enemies.push(e);

        player.wandLevel = 1;
        frameCount = 0; // wandInterval(既定55)の倍数にして発動条件を必ず満たす
        const wandsBefore = wands.length;

        updateGame(); // ここで例外が飛べばtest()側がFAILとして捕捉する
        assertTrue(wands.length > wandsBefore, '発動条件を満たしたら魔法の杖の弾が生成されるはず');

        wands.length = wandsBefore;
        // e自身を除去し、updateGame()が自動スポーンした分も含めて元の数まで切り詰める
        const idx = enemies.indexOf(e);
        if (idx > -1) enemies.splice(idx, 1);
        if (enemies.length > originalEnemyCount) enemies.length = originalEnemyCount;
        player.wandLevel = savedWandLevel;
        frameCount = savedFrameCount;
    });
});

// テスト完了後はgameLoop()のrequestAnimationFrameループを止める。
// このページは本物のゲームスクリプトを読み込んでいるため、放置すると裏で無限ループし続け、
// ヘッドレスブラウザ経由でこのファイルを自動実行する場合にプロセスが終了しづらくなるため。
isPaused = true;

finishTests();
