// 偏微分と教育機能の計算
class DerivativeCalculator {
    constructor() {
        this.h = 0.001; // 数値微分のステップサイズ
    }

    // 偏微分 ∂f/∂x を数値計算
    partialX(func, x, y) {
        const fxh = func(x + this.h, y);
        const fx = func(x, y);

        if (isNaN(fxh) || isNaN(fx) || !isFinite(fxh) || !isFinite(fx)) {
            return 0;
        }

        return (fxh - fx) / this.h;
    }

    // 偏微分 ∂f/∂y を数値計算
    partialY(func, x, y) {
        const fyh = func(x, y + this.h);
        const fy = func(x, y);

        if (isNaN(fyh) || isNaN(fy) || !isFinite(fyh) || !isFinite(fy)) {
            return 0;
        }

        return (fyh - fy) / this.h;
    }

    // 勾配ベクトル ∇f = (∂f/∂x, ∂f/∂y) を計算
    gradient(func, x, y) {
        return {
            x: this.partialX(func, x, y),
            y: this.partialY(func, x, y)
        };
    }

    // 接平面の方程式を計算
    // z = f(x0, y0) + fx(x0, y0)(x - x0) + fy(x0, y0)(y - y0)
    tangentPlane(func, x0, y0) {
        const z0 = func(x0, y0);
        const fx = this.partialX(func, x0, y0);
        const fy = this.partialY(func, x0, y0);

        return (x, y) => {
            return z0 + fx * (x - x0) + fy * (y - y0);
        };
    }

    // 方向微分を計算
    directionalDerivative(func, x, y, dirX, dirY) {
        const grad = this.gradient(func, x, y);
        const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);

        if (magnitude === 0) return 0;

        // 方向ベクトルを正規化
        const normDirX = dirX / magnitude;
        const normDirY = dirY / magnitude;

        // 勾配との内積
        return grad.x * normDirX + grad.y * normDirY;
    }

    // 勾配の大きさ |∇f| を計算
    gradientMagnitude(func, x, y) {
        const grad = this.gradient(func, x, y);
        return Math.sqrt(grad.x * grad.x + grad.y * grad.y);
    }

    // ヘッセ行列を計算(二次偏微分)
    hessian(func, x, y) {
        const fxx = (func(x + this.h, y) - 2 * func(x, y) + func(x - this.h, y)) / (this.h * this.h);
        const fyy = (func(x, y + this.h) - 2 * func(x, y) + func(x, y - this.h)) / (this.h * this.h);
        const fxy = (func(x + this.h, y + this.h) - func(x + this.h, y - this.h) -
            func(x - this.h, y + this.h) + func(x - this.h, y - this.h)) / (4 * this.h * this.h);

        return {
            fxx: fxx,
            fyy: fyy,
            fxy: fxy
        };
    }

    // 臨界点の分類(鞍点、極大、極小)
    classifyCriticalPoint(func, x, y) {
        const hess = this.hessian(func, x, y);
        const det = hess.fxx * hess.fyy - hess.fxy * hess.fxy;

        if (det > 0) {
            if (hess.fxx > 0) {
                return '極小点';
            } else {
                return '極大点';
            }
        } else if (det < 0) {
            return '鞍点';
        } else {
            return '判定不能';
        }
    }
}

// グローバルインスタンス
const derivativeCalc = new DerivativeCalculator();
