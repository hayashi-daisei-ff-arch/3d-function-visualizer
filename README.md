# 3D関数ビジュアライザー

偏微分を視覚的に理解するための教育用インタラクティブツール

![3D Function Visualizer](https://img.shields.io/badge/3D-Function%20Visualizer-44ff44?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

## 🌟 特徴

### 基本機能
- **3D関数の可視化**: z = f(x, y) の形式で関数を入力し、3D空間に描画
- **インタラクティブな操作**: マウスで3Dグラフを自由に回転・ズーム
- **仮想キーパッド**: 数学関数を簡単に入力できる専用キーパッド
- **カスタマイズ可能な表示**: 曲面の色と透明度を自由に調整
- **ビュープリセット**: XY、XZ、YZ平面からの視点に素早く切り替え

### 教育機能(偏微分学習)
- **接平面の可視化**: 任意の点での接平面を表示し、線形近似を理解
- **勾配ベクトル表示**: 曲面上の勾配ベクトルを矢印で表示
- **断面スライス**: x=定数またはy=定数での2D断面を表示
- **偏微分値の計算**: 選択した点での∂f/∂xと∂f/∂yを数値表示

## 🚀 使い方

### オンラインで使用
GitHub Pagesでホストされています:
```
https://[あなたのユーザー名].github.io/3d-function-visualizer/
```

### ローカルで実行
1. リポジトリをクローン:
```bash
git clone https://github.com/[あなたのユーザー名]/3d-function-visualizer.git
cd 3d-function-visualizer
```

2. ブラウザで `index.html` を開く

### 関数の入力方法

#### サポートされている演算子と関数
- **基本演算**: `+`, `-`, `*`, `/`, `^` (累乗)
- **三角関数**: `sin(x)`, `cos(x)`, `tan(x)`
- **指数・対数**: `exp(x)`, `log(x)`, `sqrt(x)`
- **絶対値**: `abs(x)`

#### 入力例
```
x^2 + y^2          // 放物面
x^2 - y^2          // 鞍点(双曲放物面)
sin(x) * cos(y)    // 波動関数
sqrt(x^2 + y^2)    // 円錐
exp(-(x^2 + y^2))  // ガウス関数
```

## 📚 教育的な使い方

### 1. 偏微分の理解
1. 関数を入力(例: `x^2 + y^2`)
2. 「接平面を表示」をチェック
3. 点の座標を変更して、異なる点での接平面を観察
4. 表示される∂f/∂xと∂f/∂yの値を確認

### 2. 勾配ベクトルの可視化
1. 「勾配ベクトルを表示」をチェック
2. 矢印の方向が最大増加方向を示すことを確認
3. 矢印の長さが勾配の大きさを表すことを理解

### 3. 断面による理解
1. 「断面を表示」をチェック
2. x=定数またはy=定数を選択
3. 値を変更して、異なる断面を観察
4. 断面の傾きが偏微分に対応することを確認

## 🛠️ 技術スタック

- **Three.js**: 3Dグラフィックスレンダリング
- **Math.js**: 数式の解析と評価
- **Vanilla JavaScript**: フレームワークなしの純粋なJS
- **CSS3**: モダンなグラスモーフィズムデザイン

## 📦 ファイル構成

```
3d-function-visualizer/
├── index.html          # メインHTMLファイル
├── styles.css          # スタイルシート
├── app.js              # メインアプリケーションロジック
├── renderer.js         # 3Dレンダリングエンジン
├── math-parser.js      # 数式パーサー
├── derivatives.js      # 偏微分計算
└── README.md           # このファイル
```

## 🌐 GitHub Pagesへのデプロイ

1. GitHubリポジトリを作成
2. ファイルをプッシュ:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[ユーザー名]/3d-function-visualizer.git
git push -u origin main
```

3. リポジトリの設定でGitHub Pagesを有効化:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

4. 数分後、`https://[ユーザー名].github.io/3d-function-visualizer/` でアクセス可能

## 🎨 カスタマイズ

### 軸の範囲を変更
`renderer.js`の`axisRange`プロパティを変更:
```javascript
this.axisRange = 10; // -10から10の範囲
```

### グリッドの解像度を変更
`renderer.js`の`gridSize`プロパティを変更:
```javascript
this.gridSize = 50; // グリッドの細かさ
```

## 📝 ライセンス

MIT License - 自由に使用、改変、配布できます

## 🤝 貢献

プルリクエストを歓迎します!バグ報告や機能提案はIssuesでお願いします。

## 📧 お問い合わせ

質問や提案がある場合は、GitHubのIssuesでお知らせください。

---

**教育を楽しく、数学を視覚的に!** 🎓✨
