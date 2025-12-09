// メインアプリケーションロジック
let renderer;
let currentExpression = 'x^2 + y^2';
let currentColor = 0x44ff44;
let currentOpacity = 0.7;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // 3Dレンダラーの初期化
    renderer = new Renderer3D('canvas3d');

    // 初期関数を描画
    plotCurrentFunction();

    // イベントリスナーの設定
    setupEventListeners();
});

// イベントリスナーの設定
function setupEventListeners() {
    // 描画ボタン
    document.getElementById('plotBtn').addEventListener('click', plotCurrentFunction);

    // Enterキーで描画
    document.getElementById('functionInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            plotCurrentFunction();
        }
    });

    // キーパッドボタン
    document.querySelectorAll('.key-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const value = e.target.getAttribute('data-value');
            if (value) {
                insertAtCursor(value);
            }
        });
    });

    // クリアボタン
    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('functionInput').value = '';
        document.getElementById('functionInput').focus();
    });

    // 削除ボタン
    document.getElementById('deleteBtn').addEventListener('click', () => {
        const input = document.getElementById('functionInput');
        input.value = input.value.slice(0, -1);
        input.focus();
    });

    // 色選択
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const color = e.target.getAttribute('data-color');
            if (color) {
                currentColor = parseInt(color.replace('#', '0x'));
                plotCurrentFunction();
            }
        });
    });

    // カスタム色
    document.getElementById('customColor').addEventListener('change', (e) => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        currentColor = parseInt(e.target.value.replace('#', '0x'));
        plotCurrentFunction();
    });

    // 透明度スライダー
    document.getElementById('opacitySlider').addEventListener('input', (e) => {
        currentOpacity = parseFloat(e.target.value);
        document.getElementById('opacityValue').textContent = currentOpacity.toFixed(1);
        plotCurrentFunction();
    });

    // ビューコントロール
    document.getElementById('viewXY').addEventListener('click', () => renderer.setView('xy'));
    document.getElementById('viewXZ').addEventListener('click', () => renderer.setView('xz'));
    document.getElementById('viewYZ').addEventListener('click', () => renderer.setView('yz'));
    document.getElementById('viewReset').addEventListener('click', () => renderer.setView('reset'));

    // 接平面チェックボックス
    document.getElementById('showTangentPlane').addEventListener('change', (e) => {
        const controls = document.getElementById('tangentControls');
        const derivativeDisplay = document.getElementById('derivativeDisplay');

        if (e.target.checked) {
            controls.style.display = 'block';
            derivativeDisplay.style.display = 'block';
            updateTangentPlane();
        } else {
            controls.style.display = 'none';
            derivativeDisplay.style.display = 'none';
            renderer.showTangentPlane(0, 0, false);
        }
    });

    // 接平面の座標入力
    document.getElementById('tangentX').addEventListener('input', updateTangentPlane);
    document.getElementById('tangentY').addEventListener('input', updateTangentPlane);

    // 勾配ベクトルチェックボックス
    document.getElementById('showGradient').addEventListener('change', (e) => {
        renderer.showGradientVectors(e.target.checked);
    });

    // 断面チェックボックス
    document.getElementById('showCrossSection').addEventListener('change', (e) => {
        const controls = document.getElementById('crossSectionControls');

        if (e.target.checked) {
            controls.style.display = 'block';
            updateCrossSection();
        } else {
            controls.style.display = 'none';
            renderer.showCrossSection('x', 0, false);
        }
    });

    // 断面の設定
    document.getElementById('crossSectionAxis').addEventListener('change', updateCrossSection);
    document.getElementById('crossSectionValue').addEventListener('input', updateCrossSection);

    // 軸ラベルの表示/非表示
    document.getElementById('showAxisLabels').addEventListener('change', (e) => {
        renderer.updateAxisLabels(e.target.checked);
    });

    // 座標値の表示/非表示
    document.getElementById('showCoordinates').addEventListener('change', (e) => {
        renderer.updateCoordinateLabels(e.target.checked);
    });

    // サンプル関数ボタン
    document.querySelectorAll('.sample-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const func = e.target.getAttribute('data-function');
            document.getElementById('functionInput').value = func;
            plotCurrentFunction();
        });
    });
}

// カーソル位置にテキストを挿入
function insertAtCursor(text) {
    const input = document.getElementById('functionInput');
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentValue = input.value;

    input.value = currentValue.substring(0, start) + text + currentValue.substring(end);
    input.selectionStart = input.selectionEnd = start + text.length;
    input.focus();
}

// 現在の関数を描画
function plotCurrentFunction() {
    const input = document.getElementById('functionInput');
    const expression = input.value.trim();
    const errorMsg = document.getElementById('errorMessage');

    if (!expression) {
        errorMsg.textContent = '数式を入力してください';
        return;
    }

    try {
        // 数式を解析
        const func = mathParser.parseExpression(expression);

        // 妥当性チェック
        if (!mathParser.validateExpression(expression)) {
            throw new Error('無効な数式です');
        }

        // 描画
        renderer.plotFunction(func, currentColor, currentOpacity);

        // 現在の式を保存
        currentExpression = expression;

        // 情報パネルを更新
        document.getElementById('currentFunction').textContent = `z = ${expression}`;

        // エラーメッセージをクリア
        errorMsg.textContent = '';

        // 教育機能を更新
        if (document.getElementById('showTangentPlane').checked) {
            updateTangentPlane();
        }
        if (document.getElementById('showGradient').checked) {
            renderer.showGradientVectors(true);
        }
        if (document.getElementById('showCrossSection').checked) {
            updateCrossSection();
        }

    } catch (error) {
        errorMsg.textContent = `エラー: ${error.message}`;
        console.error('Plot error:', error);
    }
}

// 接平面を更新
function updateTangentPlane() {
    if (!renderer.currentFunction) return;

    const x0 = parseFloat(document.getElementById('tangentX').value) || 0;
    const y0 = parseFloat(document.getElementById('tangentY').value) || 0;

    renderer.showTangentPlane(x0, y0, true);

    // 偏微分値を計算して表示
    const dfdx = derivativeCalc.partialX(renderer.currentFunction, x0, y0);
    const dfdy = derivativeCalc.partialY(renderer.currentFunction, x0, y0);

    document.getElementById('dfdx').textContent = dfdx.toFixed(3);
    document.getElementById('dfdy').textContent = dfdy.toFixed(3);
}

// 断面を更新
function updateCrossSection() {
    if (!renderer.currentFunction) return;

    const axis = document.getElementById('crossSectionAxis').value;
    const value = parseFloat(document.getElementById('crossSectionValue').value) || 0;

    renderer.showCrossSection(axis, value, true);
}
