// --- 超軽量テストフレームワーク（外部依存なし。npm/ビルド不要というプロジェクト方針に合わせている） ---
const TEST_RESULTS = { passed: 0, failed: 0, failures: [] };
let currentSuite = '';

function describe(name, fn) {
    const prevSuite = currentSuite;
    currentSuite = prevSuite ? `${prevSuite} > ${name}` : name;
    fn();
    currentSuite = prevSuite;
}

function test(name, fn) {
    const fullName = currentSuite ? `${currentSuite} > ${name}` : name;
    try {
        fn();
        TEST_RESULTS.passed++;
        renderResult(fullName, true);
    } catch (err) {
        TEST_RESULTS.failed++;
        TEST_RESULTS.failures.push({ name: fullName, message: err.message });
        renderResult(fullName, false, err.message);
    }
}

function assert(cond, message) {
    if (!cond) throw new Error(message || 'assertion failed');
}
function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message || 'not equal'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}
function assertClose(actual, expected, epsilon, message) {
    epsilon = epsilon === undefined ? 0.0001 : epsilon;
    if (Math.abs(actual - expected) > epsilon) {
        throw new Error(`${message || 'not close enough'}: expected ~${expected}, got ${actual}`);
    }
}
function assertTrue(cond, message) { assert(cond === true, message || `expected true, got ${JSON.stringify(cond)}`); }
function assertFalse(cond, message) { assert(cond === false, message || `expected false, got ${JSON.stringify(cond)}`); }
function assertThrows(fn, message) {
    let threw = false;
    try { fn(); } catch (e) { threw = true; }
    assert(threw, message || 'expected function to throw');
}

function renderResult(name, passed, errMsg) {
    const list = document.getElementById('test-results');
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'test-row ' + (passed ? 'pass' : 'fail');
    row.innerText = (passed ? '✓ ' : '✗ ') + name + (errMsg ? ' — ' + errMsg : '');
    list.appendChild(row);
}

// 全テスト定義の実行後に呼ぶ。サマリー表示・タイトル更新・console出力を行う
function finishTests() {
    const summary = document.getElementById('test-summary');
    const total = TEST_RESULTS.passed + TEST_RESULTS.failed;
    const text = `${TEST_RESULTS.passed} / ${total} passed`;
    if (summary) {
        summary.innerText = text;
        summary.className = TEST_RESULTS.failed === 0 ? 'pass' : 'fail';
    }
    document.title = (TEST_RESULTS.failed === 0 ? '✓ ' : '✗ ') + text + ' - Tests';
    if (TEST_RESULTS.failed === 0) {
        console.log(`TESTS PASSED: ${text}`);
    } else {
        console.error(`TESTS FAILED: ${text} (${TEST_RESULTS.failed} failing)`);
        TEST_RESULTS.failures.forEach(f => console.error('  FAIL:', f.name, '-', f.message));
    }
    window.TEST_RESULTS = TEST_RESULTS;
}
