        // --- 敵データ定義 ---
        const ENEMY_DATA = {
            normal: { name: '彷徨う目玉', width: 20, height: 20, hp: 10, speed: 1.0, xp: 1, color: '#C83232', time: 'any' },
            fast: { name: 'ウィスプ', width: 15, height: 15, hp: 5, speed: 1.8, xp: 2, color: '#FFD700', time: 'night' },
            tank: { name: 'ヘビーナイト', width: 25, height: 25, hp: 40, speed: 0.7, xp: 3, color: '#8B4513', time: 'any' },
            boss: { name: 'デーモンロード', width: 60, height: 60, hp: 500, speed: 1.1, xp: 50, color: '#4B0082', isBoss: true, time: 'any' },
            boss_hydra: { name: 'ヒドラ', width: 80, height: 80, hp: 8000, speed: 0.6, xp: 200, color: '#2E8B57', isBoss: true, time: 'any' },
            boss_lich: { name: 'リッチ', width: 50, height: 70, hp: 6000, speed: 0.7, xp: 200, color: '#4B0082', isBoss: true, time: 'any' },
            boss_behemoth: { name: 'ベヒーモス', width: 120, height: 80, hp: 15000, speed: 0.4, xp: 300, color: '#8B4513', isBoss: true, time: 'any' },
            boss_phoenix: { name: 'フェニックス', width: 90, height: 60, hp: 7000, speed: 1.2, xp: 250, color: '#FF4500', isBoss: true, time: 'any' },
            boss_kraken: { name: 'クラーケン', width: 100, height: 100, hp: 10000, speed: 0.5, xp: 300, color: '#008080', isBoss: true, time: 'any' },
            boar: { name: 'イノシシ', width: 28, height: 20, hp: 35, speed: 1.3, xp: 4, color: '#8B4513', time: 'day' },
            final_boss: { name: '魔王', width: 140, height: 140, hp: 50000, speed: 0.6, xp: 10000, color: '#000000', isBoss: true, time: 'any' },
            dark_lord: { name: '裏・魔王', width: 160, height: 160, hp: 100000, speed: 0.8, xp: 50000, color: '#000', isBoss: true, time: 'any' },
            sorcerer: { name: 'ソーサラー', width: 24, height: 30, hp: 25, speed: 0.8, xp: 8, color: '#4B0082', time: 'any' },
            large_boss: { name: 'アークデーモン', width: 100, height: 100, hp: 5000, speed: 0.9, xp: 500, color: '#191970', isBoss: true, time: 'any' },
            bat: { name: 'コウモリ', width: 18, height: 18, hp: 8, speed: 1.5, xp: 2, color: '#4B0082', time: 'night' },
            skeleton: { name: 'スケルトン', width: 20, height: 20, hp: 15, speed: 0.9, xp: 2, color: '#E0E0E0', time: 'night' },
            goblin: { name: 'ゴブリン', width: 18, height: 18, hp: 12, speed: 1.2, xp: 2, color: '#32CD32', time: 'day' },
            slime: { name: 'スライム', width: 22, height: 18, hp: 25, speed: 0.6, xp: 2, color: '#00CED1', time: 'day' },
            ghost: { name: '悪霊', width: 20, height: 20, hp: 15, speed: 0.8, xp: 2, color: '#F8F8FF', time: 'night' },
            orc: { name: 'オーク', width: 28, height: 28, hp: 60, speed: 0.6, xp: 4, color: '#556B2F', time: 'day' },
            spider: { name: '大蜘蛛', width: 24, height: 20, hp: 20, speed: 1.4, xp: 3, color: '#2F4F4F', time: 'any' },
            wolf: { name: 'ウルフ', width: 26, height: 16, hp: 30, speed: 1.6, xp: 3, color: '#808080', time: 'any' },
            zombie: { name: 'ゾンビ', width: 22, height: 30, hp: 45, speed: 0.4, xp: 3, color: '#2E8B57', time: 'night' },
            wraith: { name: 'レイス', width: 25, height: 35, hp: 50, speed: 1.0, xp: 5, color: '#191970', time: 'night' },
            golem: { name: 'ゴーレム', width: 35, height: 35, hp: 120, speed: 0.3, xp: 8, color: '#A9A9A9', time: 'day' },
            imp: { name: 'インプ', width: 14, height: 14, hp: 10, speed: 2.0, xp: 2, color: '#FF4500', time: 'night' },
            treant: { name: 'トレント', width: 30, height: 40, hp: 90, speed: 0.4, xp: 6, color: '#8B4513', time: 'day' },
            snake: { name: '大蛇', width: 28, height: 10, hp: 15, speed: 1.3, xp: 2, color: '#006400', time: 'day' },
            rat: { name: 'ジャイアントラット', width: 16, height: 10, hp: 8, speed: 1.7, xp: 1, color: '#696969', time: 'day' },
            harpy: { name: 'ハーピー', width: 24, height: 24, hp: 35, speed: 1.3, xp: 4, color: '#87CEEB', time: 'day' },
            minotaur: { name: 'ミノタウロス', width: 40, height: 40, hp: 180, speed: 0.5, xp: 10, color: '#8B0000', time: 'any' },
            dragon: { name: 'ドラゴン', width: 50, height: 50, hp: 250, speed: 0.6, xp: 15, color: '#DC143C', time: 'any' },
            demon: { name: 'デーモン', width: 32, height: 38, hp: 140, speed: 0.8, xp: 12, color: '#B22222', time: 'night' },
            ninja: { name: 'ニンジャ', width: 22, height: 28, hp: 60, speed: 1.5, xp: 10, color: '#2F4F4F', time: 'any' },
            spirit: { name: 'スピリット', width: 16, height: 16, hp: 12, speed: 1.4, xp: 3, color: '#E6E6FA', time: 'night' },
            slime_king: { name: 'キングスライム', width: 60, height: 60, hp: 400, speed: 0.4, xp: 50, color: '#00CED1', time: 'day' },
            blob: { name: 'マージブロブ', width: 20, height: 20, hp: 20, speed: 0.6, xp: 3, color: '#9400D3', time: 'any' },
            lizard: { name: 'リザードマン', width: 24, height: 24, hp: 40, speed: 1.1, xp: 5, color: '#32CD32', time: 'day' },
            toad: { name: 'ジャイアントトード', width: 28, height: 24, hp: 50, speed: 0.5, xp: 6, color: '#006400', time: 'day' },
            bear: { name: 'キラーベア', width: 32, height: 30, hp: 100, speed: 0.8, xp: 12, color: '#8B4513', time: 'day' },
            scorpion: { name: 'サソリ', width: 24, height: 20, hp: 30, speed: 1.2, xp: 5, color: '#DAA520', time: 'day' },
            vulture: { name: 'ハゲタカ', width: 24, height: 24, hp: 25, speed: 1.4, xp: 5, color: '#2F4F4F', time: 'day' },
            mummy: { name: 'マミー', width: 22, height: 28, hp: 60, speed: 0.5, xp: 8, color: '#F5DEB3', time: 'night' },
            gargoyle: { name: 'ガーゴイル', width: 26, height: 26, hp: 70, speed: 0.9, xp: 10, color: '#708090', time: 'night' },
            fire_elem: { name: 'ファイアエレメンタル', width: 24, height: 24, hp: 45, speed: 1.0, xp: 7, color: '#FF4500', time: 'any' },
            ice_elem: { name: 'アイスエレメンタル', width: 24, height: 24, hp: 45, speed: 1.0, xp: 7, color: '#00FFFF', time: 'any' },
            wind_elem: { name: 'ウィンドエレメンタル', width: 24, height: 24, hp: 35, speed: 1.6, xp: 7, color: '#F0FFFF', time: 'any' },
            bandit: { name: '盗賊', width: 22, height: 26, hp: 35, speed: 1.2, xp: 5, color: '#A0522D', time: 'day' },
            cultist: { name: '狂信者', width: 22, height: 26, hp: 30, speed: 0.9, xp: 6, color: '#4B0082', time: 'night' },
            assassin: { name: 'アサシン', width: 20, height: 26, hp: 40, speed: 1.7, xp: 10, color: '#000000', time: 'night' },
            troll: { name: 'トロール', width: 40, height: 40, hp: 150, speed: 0.4, xp: 20, color: '#556B2F', time: 'night' },
            cyclops: { name: 'サイクロプス', width: 45, height: 45, hp: 200, speed: 0.3, xp: 25, color: '#F4A460', time: 'day' },
            chimera: { name: 'キメラ', width: 35, height: 30, hp: 120, speed: 0.9, xp: 18, color: '#CD853F', time: 'any' },
            basilisk: { name: 'バジリスク', width: 30, height: 20, hp: 80, speed: 1.0, xp: 15, color: '#20B2AA', time: 'any' },
            cockatrice: { name: 'コカトリス', width: 28, height: 28, hp: 70, speed: 1.1, xp: 12, color: '#BDB76B', time: 'day' },
            griffin: { name: 'グリフォン', width: 40, height: 30, hp: 130, speed: 1.2, xp: 22, color: '#FFD700', time: 'day' },
            wyvern: { name: 'ワイバーン', width: 35, height: 25, hp: 90, speed: 1.3, xp: 16, color: '#483D8B', time: 'night' }
        };

        const BIOME_ENEMIES = {
            grassland: ['goblin', 'slime', 'rat', 'snake', 'normal', 'sorcerer', 'ninja', 'slime_king', 'lizard', 'wind_elem', 'bandit', 'griffin'],
            forest: ['wolf', 'spider', 'treant', 'boar', 'bat', 'sorcerer', 'ninja', 'blob', 'toad', 'bear', 'troll', 'wyvern'],
            wasteland: ['orc', 'skeleton', 'harpy', 'minotaur', 'golem', 'tank', 'sorcerer', 'blob', 'scorpion', 'vulture', 'fire_elem', 'cyclops', 'cockatrice'],
            cursed: ['ghost', 'zombie', 'wraith', 'imp', 'demon', 'spirit', 'dragon', 'fast', 'sorcerer', 'ninja', 'slime_king', 'blob', 'mummy', 'gargoyle', 'ice_elem', 'cultist', 'assassin', 'chimera', 'basilisk']
        };

        const NPC_JOBS = [
            { id: 'warrior', name: '戦士', desc: '高い耐久力と近接攻撃', color: '#B22222', hpMult: 1.5, def: 5, atkMult: 1.2 },
            { id: 'monk', name: '武闘家', desc: '素早い連続攻撃', color: '#FFA500', hpMult: 1.2, def: 2, atkMult: 0.9 },
            { id: 'mage', name: '魔法使い', desc: '強力な魔法攻撃', color: '#800080', hpMult: 0.7, def: 0, atkMult: 1.8 },
            { id: 'priest', name: '僧侶', desc: '回復魔法を使用', color: '#FFFFFF', hpMult: 0.9, def: 1, atkMult: 0.5 },
            { id: 'merchant', name: '商人', desc: 'お金(スコア)を稼ぐ', color: '#006400', hpMult: 1.0, def: 0, atkMult: 0.8 },
            { id: 'thief', name: '盗賊', desc: 'アイテムドロップ率UP', color: '#4B0082', hpMult: 0.8, def: 0, atkMult: 1.1 },
            { id: 'gadabout', name: '遊び人', desc: '気まぐれな行動。成長すると・・・', color: '#FF69B4', hpMult: 1.0, def: 0, atkMult: 0.5 },
            { id: 'sage', name: '賢者', desc: '強力な魔法と回復', color: '#9370DB', hidden: true, hpMult: 1.3, def: 3, atkMult: 1.5 },
            { id: 'summoned_golem', name: 'ゴーレム', desc: '召喚された守護者', color: '#8B4513', hidden: true, hpMult: 3.0, def: 10, atkMult: 2.0 }
        ];

        const NPC_MESSAGES = {
            warrior: {
                idle: ["背中は任せろ！", "敵が多いな...", "まだまだ戦えるぞ！", "俺の剣技を見ろ！", "切り伏せる！", "守ってみせる。", "油断するなよ。"],
                dead: ["ぐはっ...不覚...", "ここまでか...", "すまない..."]
            },
            monk: {
                idle: ["修行の成果を見せる時！", "精神統一...", "拳が唸るぜ！", "隙あり！", "気合だ！", "動きが見える。", "一撃必殺！"],
                dead: ["修行が足りん...", "無念...", "体が動かん..."]
            },
            mage: {
                idle: ["マナが満ちてきたわ。", "燃え尽きなさい！", "魔法の力、見せてあげる。", "詠唱開始...", "消えなさい。", "知識は力よ。", "集中させて。"],
                dead: ["魔力が...尽きた...", "嘘でしょ...", "きゃああっ！"]
            },
            priest: {
                idle: ["神のご加護を。", "癒やしが必要ですか？", "祈りましょう。", "邪悪な気配を感じます。", "光よ...", "浄化します。", "恐れないで。"],
                dead: ["神よ...お許しを...", "光が消える...", "皆様、どうかご無事で..."]
            },
            merchant: {
                idle: ["金儲けのチャンス！", "これ売れるかな？", "経費で落ちますかね？", "毎度あり！", "損はさせませんよ。", "チップ弾みます？", "在庫処分だ！"],
                dead: ["赤字だぁ...", "商品が...", "破産だ..."]
            },
            thief: {
                idle: ["お宝の匂いがするぜ。", "ササッといただくよ。", "後ろががら空きだ。", "へへっ、ちょろいね。", "いただきっ！", "静かに...", "逃げ足には自信があるんだ。"],
                dead: ["逃げ遅れたか...", "ドジった...", "ちくしょう..."]
            },
            gadabout: {
                idle: ["あー、暇だなぁ。", "なんか面白いことない？", "ねえねえ、遊ぼうよ！", "お腹すいたー。", "わーい！", "あっち行ってみようよ。", "眠くなってきた..."],
                dead: ["痛いのは嫌だぁ...", "もう遊べない...", "つまんないの..."]
            },
            sage: {
                idle: ["真理が見えます。", "魔力の流れを感じる...", "回復が必要ですか？", "私の魔法で..."],
                dead: ["真理には...届かなかった...", "無念...", "ここまでとは..."]
            },
            summoned_golem: {
                idle: ["ゴゴゴ...", "命令ヲ...", "守ル...", "排除スル..."],
                dead: ["崩レル...", "機能停止..."]
            }
        };

        const NPC_QUOTES = {
            warrior: "俺の剣がお前の盾になろう。",
            monk: "拳で語り合おうじゃないか。",
            mage: "私の魔法知識が役に立つはずです。",
            priest: "神のご加護があらんことを。",
            merchant: "金儲けの匂いがしますねぇ...",
            thief: "お宝は全部いただきだ！",
            gadabout: "へへっ、面白そうだからついていくよ！",
            sage: "世界の理、共に解き明かしましょう。",
            summoned_golem: "ゴゴゴ... (召喚に応じ現れた)"
        };

        // 魔法データ
        const SPELLS = [
            { id: 'teleport', name: 'テレポート', level: 2, mp: 20, cd: 10, key: 'V', desc: 'ランダムな安全地帯へ移動', color: '#00FFFF' },
            { id: 'heal', name: 'ヒール', level: 3, mp: 50, cd: 60, key: 'Z', desc: 'HPを50回復', color: '#00FF00' },
            { id: 'haste', name: 'ヘイスト', level: 5, mp: 30, cd: 60, key: 'J', desc: '10秒間、移動と攻撃速度UP', color: '#00FF7F' },
            { id: 'firestorm', name: 'ファイアストーム', level: 6, mp: 40, cd: 30, key: 'X', desc: '画面内の敵を焼き払う', color: '#FF4500' },
            { id: 'berserk', name: 'バーサク', level: 7, mp: 60, cd: 90, key: 'K', desc: '10秒間、攻撃力2倍、防御力0', color: '#DC143C' },
            { id: 'time_stop', name: 'タイムストップ', level: 8, mp: 90, cd: 90, key: 'T', desc: '5秒間時を止める', color: '#800080' },
            { id: 'ice_nova', name: 'アイスノヴァ', level: 10, mp: 70, cd: 45, key: 'Y', desc: '周囲の敵を凍結させる', color: '#00BFFF' },
            { id: 'chain_lightning', name: 'チェインライトニング', level: 12, mp: 50, cd: 20, key: 'P', desc: '敵から敵へ飛び移る稲妻', color: '#FFD700' },
            { id: 'judgment', name: 'ジャッジメント', level: 13, mp: 80, cd: 120, key: 'C', desc: '画面内の雑魚敵を消滅', color: '#FFD700' },
            { id: 'reflect_shield', name: '反射シールド', level: 14, mp: 80, cd: 120, key: 'U', desc: '5秒間、敵の弾を反射する', color: '#C0C0C0' },
            { id: 'summon_golem', name: 'ゴーレム召喚', level: 15, mp: 100, cd: 60, key: 'N', desc: '味方のゴーレムを召喚', color: '#8B4513' },
            { id: 'meteor', name: 'メテオ', level: 16, mp: 120, cd: 120, key: 'G', desc: '巨大な隕石を落下させる', color: '#FF8C00' },
            { id: 'black_hole', name: 'ブラックホール', level: 17, mp: 150, cd: 180, key: 'H', desc: '敵を吸い寄せる特異点', color: '#4B0082' },
            { id: 'holy_ray', name: 'ホーリーレイ', level: 18, mp: 90, cd: 60, key: 'I', desc: '聖なる光線で前方を薙ぎ払う', color: '#FFFACD' },
            { id: 'earthquake', name: 'アースクエイク', level: 19, mp: 130, cd: 150, key: 'O', desc: '画面全体の敵にダメージと減速', color: '#8B4513' },
            { id: 'shadow_clone', name: '影分身', level: 20, mp: 200, cd: 200, key: 'Q', desc: '15秒間、攻撃を模倣する分身', color: '#483D8B' }
        ];

        const NPC_RECRUIT_COMMENTS = {
            warrior: "盾役なら任せてくれ。",
            monk: "手数で圧倒するよ。",
            mage: "火力が必要でしょ？",
            priest: "回復役は必須ですよ。",
            merchant: "資金繰り、手伝います。",
            thief: "レアアイテム、欲しい？",
            gadabout: "なんか楽しそう！"
        };

        const BOSS_QUOTES = {
            boss: ["我ガ領土ヲ荒ラス者ヨ...", "消エ去レ！", "貴様ノ命運モ尽キタ..."],
            boss_hydra: ["首ヲ切リ落トセルカ？", "毒ノ沼ニ沈メ！", "再生スル...何度デモ..."],
            boss_lich: ["死ハ救済ナリ...", "永遠ノ闇ヲ...", "魂ヲ捧ゲヨ..."],
            boss_behemoth: ["粉々ニシテヤル！", "グオオオオオ！", "踏ミ潰ス！"],
            boss_phoenix: ["我ハ何度デモ蘇ル！", "灰トナレ！", "燃エ尽キロ！"],
            boss_kraken: ["深海ノ恐怖ヲ味ワエ...", "逃ゲ場ハナイゾ...", "海ノ藻屑トナレ..."],
            large_boss: ["貴様ラニハ荷ガ重イ...", "力ノ差ヲ思イ知レ！", "ココデ朽チ果テヨ..."],
            final_boss: ["ヨクゾ来タ、人間ヨ。", "我ガ魔力ノ前ニ跪ケ！", "絶望ヲ贈ロウ...", "世界ハ我ガ手ニ..."],
            dark_lord: ["我ハ深淵ヨリ来タリシ者...", "全テヲ無ニ帰ス...", "絶望スラ生ヌルい..."]
        };

        const NPC_BOSS_REACTIONS = {
            warrior: "強敵だ...気を引き締めろ！",
            monk: "でかい気を感じる...来るぞ！",
            mage: "なんて魔力なの...！",
            priest: "邪悪な波動...皆さん、下がって！",
            merchant: "ひえぇ...商品が壊れちゃう！",
            thief: "あいつ、いいもん持ってそうだな。",
            gadabout: "わー、おっきいねー！",
            sage: "強大な闇...しかし、光は消えません。",
            summoned_golem: "脅威ヲ...検知..."
        };

        // 進化レシピ
        const EVOLUTIONS = [
            { weapon: 'dagger', passive: 'bullet_speed', result: 'thousand_edge', name: 'サウザンド・エッジ', desc: '遅延のない投擲' },
            { weapon: 'wand', passive: 'atk_speed', result: 'holy_wand', name: 'ホーリー・ワンド', desc: '遅延のない魔法' },
            { weapon: 'axe', passive: 'area', result: 'death_spiral', name: 'デス・スパイラル', desc: '巨大な鎌が貫通する' },
            { weapon: 'bible', passive: 'duration', result: 'unholy_vespers', name: '不浄の典礼', desc: '終わらない冒涜' },
            { weapon: 'fireball', passive: 'might', result: 'hellfire', name: 'ヘルファイア', desc: '全てを焼き尽くす' },
            { weapon: 'boomerang', passive: 'luck', result: 'heaven_sword', name: 'ヘヴン・ソード', desc: 'クリティカルヒット' }
        ];

