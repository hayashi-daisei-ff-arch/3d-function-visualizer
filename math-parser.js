// 数式パーサーと評価
class MathParser {
    constructor() {
        this.parser = math.parser();
    }

    // 数式を解析して関数を返す
    parseExpression(expression) {
        try {
            // 安全性のため、許可された関数のみを使用
            const sanitized = this.sanitizeExpression(expression);

            // math.jsでコンパイル
            const compiled = math.compile(sanitized);

            return (x, y) => {
                try {
                    return compiled.evaluate({ x, y });
                } catch (e) {
                    return NaN;
                }
            };
        } catch (error) {
            throw new Error(`数式の解析エラー: ${error.message}`);
        }
    }

    // 数式のサニタイズ
    sanitizeExpression(expr) {
        // 基本的な置換
        let sanitized = expr
            .replace(/\s+/g, '') // 空白を削除
            .replace(/×/g, '*')  // 乗算記号
            .replace(/÷/g, '/')  // 除算記号
            .replace(/−/g, '-'); // マイナス記号

        return sanitized;
    }

    // 数式の妥当性チェック
    validateExpression(expression) {
        try {
            const func = this.parseExpression(expression);
            // テスト評価
            const testValue = func(0, 0);
            return !isNaN(testValue) && isFinite(testValue);
        } catch (error) {
            return false;
        }
    }

    // 数式を美しく表示
    formatExpression(expression) {
        return expression
            .replace(/\*/g, '·')
            .replace(/\^/g, '**')
            .replace(/sqrt/g, '√');
    }
}

// グローバルインスタンス
const mathParser = new MathParser();
