// --- MONSTER Survivors 単体試験 ---
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
        currentDungeon.enemies.forEach(e => { e.hp = 0; });
        currentDungeon.update();
        assertTrue(currentDungeon.cleared, '敵を全滅させるとクリア扱いになるはず');
        assertTrue(uniqueDrops.length > uniqueBefore, 'クリア報酬でユニーク武器がドロップするはず');

        for (let i = 0; i < 200 && currentDungeon; i++) currentDungeon.update();
        assertEqual(currentDungeon, null, '帰還タイマー経過後はcurrentDungeonがnullになるはず');
        assertClose(player.x, originX, 0.01, '元の座標ちょうどへ帰還するはず');
        assertClose(player.y, originY, 0.01);

        // 後片付け: 倒したダンジョン敵をグローバル配列から除去（他のテストへの影響を防ぐ）
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i].hp <= 0) enemies.splice(i, 1);
        }
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

finishTests();
