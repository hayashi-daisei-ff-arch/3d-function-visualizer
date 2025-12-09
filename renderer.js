// Three.js 3Dレンダリングエンジン
class Renderer3D {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.surfaceMesh = null;
        this.tangentPlaneMesh = null;
        this.gradientArrows = [];
        this.crossSectionMesh = null;
        this.axisHelpers = null;
        this.axisLabels = [];
        this.coordinateLabels = [];
        this.axisArrows = [];

        this.currentFunction = null;
        this.surfaceColor = 0x44ff44;
        this.surfaceOpacity = 0.7;

        this.gridSize = 50; // グリッドの解像度
        this.axisRange = 10; // 軸の範囲 (-10 to 10)

        this.init();
    }

    init() {
        // シーンの作成
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e27);

        // カメラの作成
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(15, 15, 15);
        this.camera.lookAt(0, 0, 0);

        // レンダラーの作成
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // OrbitControlsの追加
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;

        // ライティング
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(10, 10, 10);
        this.scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0x4444ff, 0.4);
        directionalLight2.position.set(-10, -10, -10);
        this.scene.add(directionalLight2);

        // 軸ヘルパーとグリッド
        this.createAxes();

        // ウィンドウリサイズ対応
        window.addEventListener('resize', () => this.onWindowResize());

        // アニメーションループ
        this.animate();
    }

    createAxes() {
        // 軸ヘルパー
        const axesHelper = new THREE.AxesHelper(this.axisRange);
        this.scene.add(axesHelper);

        // グリッド
        const gridHelper = new THREE.GridHelper(this.axisRange * 2, 20, 0x444444, 0x222222);
        this.scene.add(gridHelper);

        // 軸ラベル用のグループ
        this.axisHelpers = new THREE.Group();
        this.scene.add(this.axisHelpers);

        // 軸ラベルと座標値を初期表示
        this.updateAxisLabels(true);
        this.updateCoordinateLabels(true);
    }

    // 軸ラベル(x, y, z)と矢印を表示/非表示
    updateAxisLabels(show = true) {
        // 既存のラベルと矢印を削除
        this.axisLabels.forEach(label => {
            this.scene.remove(label);
            if (label.geometry) label.geometry.dispose();
            if (label.material) label.material.dispose();
        });
        this.axisLabels = [];

        this.axisArrows.forEach(arrow => {
            this.scene.remove(arrow);
        });
        this.axisArrows = [];

        if (!show) return;

        // テキストスプライトを作成する関数
        const createTextSprite = (text, color = '#ffffff') => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 128;

            context.fillStyle = color;
            context.font = 'Bold 80px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, 64, 64);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(2, 2, 1);

            return sprite;
        };

        // X軸ラベル(赤)
        const xLabel = createTextSprite('X', '#ff4444');
        xLabel.position.set(this.axisRange + 2, 0, 0);
        this.scene.add(xLabel);
        this.axisLabels.push(xLabel);

        // Y軸ラベル(緑) - Three.jsではYが上方向
        const yLabel = createTextSprite('Z', '#44ff44');
        yLabel.position.set(0, this.axisRange + 2, 0);
        this.scene.add(yLabel);
        this.axisLabels.push(yLabel);

        // Z軸ラベル(青) - Three.jsではZが前後方向
        const zLabel = createTextSprite('Y', '#4444ff');
        zLabel.position.set(0, 0, this.axisRange + 2);
        this.scene.add(zLabel);
        this.axisLabels.push(zLabel);

        // 軸の矢印を追加(各軸の正負がわかるように)
        // X軸の矢印(正方向)
        const xArrowPos = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(this.axisRange - 1, 0, 0),
            1.5,
            0xff4444,
            0.5,
            0.3
        );
        this.scene.add(xArrowPos);
        this.axisArrows.push(xArrowPos);

        // X軸の矢印(負方向)
        const xArrowNeg = new THREE.ArrowHelper(
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(-this.axisRange + 1, 0, 0),
            1.5,
            0x884444,
            0.5,
            0.3
        );
        this.scene.add(xArrowNeg);
        this.axisArrows.push(xArrowNeg);

        // Y軸の矢印(正方向) - Three.jsのY = 数学のZ
        const yArrowPos = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, this.axisRange - 1, 0),
            1.5,
            0x44ff44,
            0.5,
            0.3
        );
        this.scene.add(yArrowPos);
        this.axisArrows.push(yArrowPos);

        // Y軸の矢印(負方向)
        const yArrowNeg = new THREE.ArrowHelper(
            new THREE.Vector3(0, -1, 0),
            new THREE.Vector3(0, -this.axisRange + 1, 0),
            1.5,
            0x448844,
            0.5,
            0.3
        );
        this.scene.add(yArrowNeg);
        this.axisArrows.push(yArrowNeg);

        // Z軸の矢印(正方向) - Three.jsのZ = 数学のY
        const zArrowPos = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0, this.axisRange - 1),
            1.5,
            0x4444ff,
            0.5,
            0.3
        );
        this.scene.add(zArrowPos);
        this.axisArrows.push(zArrowPos);

        // Z軸の矢印(負方向)
        const zArrowNeg = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(0, 0, -this.axisRange + 1),
            1.5,
            0x444488,
            0.5,
            0.3
        );
        this.scene.add(zArrowNeg);
        this.axisArrows.push(zArrowNeg);
    }

    // 座標値(0, 5, 10)を表示/非表示
    updateCoordinateLabels(show = true) {
        // 既存のラベルを削除
        this.coordinateLabels.forEach(label => {
            this.scene.remove(label);
            if (label.geometry) label.geometry.dispose();
            if (label.material) label.material.dispose();
        });
        this.coordinateLabels = [];

        if (!show) return;

        // テキストスプライトを作成する関数
        const createTextSprite = (text, color = '#aaaaaa') => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 128;

            context.fillStyle = color;
            context.font = 'Bold 60px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, 64, 64);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(1.5, 1.5, 1);

            return sprite;
        };

        // 座標値を表示する位置
        const coords = [0, 5, 10, -5, -10];

        coords.forEach(coord => {
            if (coord === 0) return; // 原点は表示しない

            // X軸上の座標
            const xCoord = createTextSprite(coord.toString(), '#ff8888');
            xCoord.position.set(coord, -0.5, 0);
            this.scene.add(xCoord);
            this.coordinateLabels.push(xCoord);

            // Y軸上の座標(Three.jsのY = 数学のZ)
            const yCoord = createTextSprite(coord.toString(), '#88ff88');
            yCoord.position.set(-0.5, coord, 0);
            this.scene.add(yCoord);
            this.coordinateLabels.push(yCoord);

            // Z軸上の座標(Three.jsのZ = 数学のY)
            const zCoord = createTextSprite(coord.toString(), '#8888ff');
            zCoord.position.set(0, -0.5, coord);
            this.scene.add(zCoord);
            this.coordinateLabels.push(zCoord);
        });
    }

    // 関数の曲面を描画
    plotFunction(func, color = this.surfaceColor, opacity = this.surfaceOpacity) {
        // 既存の曲面を削除
        if (this.surfaceMesh) {
            this.scene.remove(this.surfaceMesh);
            this.surfaceMesh.geometry.dispose();
            this.surfaceMesh.material.dispose();
        }

        this.currentFunction = func;
        this.surfaceColor = color;
        this.surfaceOpacity = opacity;

        // ジオメトリの作成
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const colors = [];

        const step = (this.axisRange * 2) / this.gridSize;

        // 頂点の生成
        for (let i = 0; i <= this.gridSize; i++) {
            for (let j = 0; j <= this.gridSize; j++) {
                const x = -this.axisRange + i * step;
                const y = -this.axisRange + j * step;
                const z = func(x, y);

                // NaNや無限大をチェック
                const zValue = (isNaN(z) || !isFinite(z)) ? 0 : z;

                vertices.push(x, zValue, y); // Three.jsではyが上方向

                // 高さに基づく色のグラデーション
                const colorObj = new THREE.Color(color);
                const heightFactor = (zValue + this.axisRange) / (this.axisRange * 2);
                colorObj.multiplyScalar(0.5 + heightFactor * 0.5);
                colors.push(colorObj.r, colorObj.g, colorObj.b);
            }
        }

        // インデックスの生成
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const a = i * (this.gridSize + 1) + j;
                const b = a + this.gridSize + 1;
                const c = a + 1;
                const d = b + 1;

                indices.push(a, b, c);
                indices.push(b, d, c);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        // マテリアルの作成
        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide,
            shininess: 30
        });

        // メッシュの作成
        this.surfaceMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.surfaceMesh);
    }

    // 接平面を表示
    showTangentPlane(x0, y0, show = true) {
        // 既存の接平面を削除
        if (this.tangentPlaneMesh) {
            this.scene.remove(this.tangentPlaneMesh);
            this.tangentPlaneMesh.geometry.dispose();
            this.tangentPlaneMesh.material.dispose();
            this.tangentPlaneMesh = null;
        }

        if (!show || !this.currentFunction) return;

        // 接平面の関数を計算
        const tangentFunc = derivativeCalc.tangentPlane(this.currentFunction, x0, y0);

        // 接平面のジオメトリ(小さめのサイズ)
        const size = 4;
        const geometry = new THREE.PlaneGeometry(size, size, 10, 10);

        // 頂点を接平面に合わせて変形
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i] + x0;
            const z = positions[i + 1] + y0;
            const y = tangentFunc(x, z);
            positions[i] = x;
            positions[i + 1] = y;
            positions[i + 2] = z;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        const material = new THREE.MeshPhongMaterial({
            color: 0xffaa44,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });

        this.tangentPlaneMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.tangentPlaneMesh);
    }

    // 勾配ベクトルを表示
    showGradientVectors(show = true) {
        // 既存の矢印を削除
        this.gradientArrows.forEach(arrow => {
            this.scene.remove(arrow);
        });
        this.gradientArrows = [];

        if (!show || !this.currentFunction) return;

        // グリッド上の点で勾配ベクトルを表示
        const step = 4;
        for (let x = -this.axisRange; x <= this.axisRange; x += step) {
            for (let y = -this.axisRange; y <= this.axisRange; y += step) {
                const z = this.currentFunction(x, y);
                if (isNaN(z) || !isFinite(z)) continue;

                const grad = derivativeCalc.gradient(this.currentFunction, x, y);

                // 勾配ベクトルの方向と大きさ
                const direction = new THREE.Vector3(grad.x, 0, grad.y).normalize();
                const length = Math.min(Math.sqrt(grad.x * grad.x + grad.y * grad.y), 3);

                if (length > 0.1) {
                    const origin = new THREE.Vector3(x, z, y);
                    const arrowHelper = new THREE.ArrowHelper(
                        direction,
                        origin,
                        length,
                        0xff44ff,
                        0.5,
                        0.3
                    );
                    this.scene.add(arrowHelper);
                    this.gradientArrows.push(arrowHelper);
                }
            }
        }
    }

    // 断面を表示
    showCrossSection(axis, value, show = true) {
        // 既存の断面を削除
        if (this.crossSectionMesh) {
            this.scene.remove(this.crossSectionMesh);
            this.crossSectionMesh.geometry.dispose();
            this.crossSectionMesh.material.dispose();
            this.crossSectionMesh = null;
        }

        if (!show || !this.currentFunction) return;

        const points = [];
        const step = 0.2;

        if (axis === 'x') {
            // x = 定数の断面
            for (let y = -this.axisRange; y <= this.axisRange; y += step) {
                const z = this.currentFunction(value, y);
                if (!isNaN(z) && isFinite(z)) {
                    points.push(new THREE.Vector3(value, z, y));
                }
            }
        } else {
            // y = 定数の断面
            for (let x = -this.axisRange; x <= this.axisRange; x += step) {
                const z = this.currentFunction(x, value);
                if (!isNaN(z) && isFinite(z)) {
                    points.push(new THREE.Vector3(x, z, value));
                }
            }
        }

        if (points.length > 1) {
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0xffff44,
                linewidth: 3
            });
            this.crossSectionMesh = new THREE.Line(geometry, material);
            this.scene.add(this.crossSectionMesh);
        }
    }

    // カメラビューのプリセット
    setView(viewType) {
        const distance = 20;

        switch (viewType) {
            case 'xy': // XY平面から(上から)
                this.camera.position.set(0, distance, 0);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'xz': // XZ平面から(前から)
                this.camera.position.set(0, 0, distance);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'yz': // YZ平面から(横から)
                this.camera.position.set(distance, 0, 0);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'reset': // デフォルトビュー
                this.camera.position.set(15, 15, 15);
                this.camera.lookAt(0, 0, 0);
                break;
        }

        this.controls.update();
    }

    // ウィンドウリサイズ処理
    onWindowResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // アニメーションループ
    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// OrbitControlsの追加(Three.jsに含まれていない場合)
THREE.OrbitControls = function (camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.enabled = true;
    this.target = new THREE.Vector3();

    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;

    this.enableDamping = false;
    this.dampingFactor = 0.05;
    this.enableZoom = true;
    this.zoomSpeed = 1.0;
    this.enableRotate = true;
    this.rotateSpeed = 1.0;
    this.enablePan = true;
    this.panSpeed = 1.0;
    this.screenSpacePanning = true;

    const scope = this;
    const STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_PAN: 4, TOUCH_DOLLY_PAN: 5, TOUCH_DOLLY_ROTATE: 6 };
    let state = STATE.NONE;

    const spherical = new THREE.Spherical();
    const sphericalDelta = new THREE.Spherical();
    let scale = 1;
    const panOffset = new THREE.Vector3();

    const rotateStart = new THREE.Vector2();
    const rotateEnd = new THREE.Vector2();
    const rotateDelta = new THREE.Vector2();

    const panStart = new THREE.Vector2();
    const panEnd = new THREE.Vector2();
    const panDelta = new THREE.Vector2();

    const dollyStart = new THREE.Vector2();
    const dollyEnd = new THREE.Vector2();
    const dollyDelta = new THREE.Vector2();

    this.update = function () {
        const offset = new THREE.Vector3();
        const quat = new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0, 1, 0));
        const quatInverse = quat.clone().invert();

        const lastPosition = new THREE.Vector3();
        const lastQuaternion = new THREE.Quaternion();

        return function update() {
            const position = scope.camera.position;
            offset.copy(position).sub(scope.target);
            offset.applyQuaternion(quat);

            spherical.setFromVector3(offset);

            if (scope.enableDamping) {
                spherical.theta += sphericalDelta.theta * scope.dampingFactor;
                spherical.phi += sphericalDelta.phi * scope.dampingFactor;
            } else {
                spherical.theta += sphericalDelta.theta;
                spherical.phi += sphericalDelta.phi;
            }

            spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));
            spherical.makeSafe();
            spherical.radius *= scale;
            spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

            scope.target.add(panOffset);
            offset.setFromSpherical(spherical);
            offset.applyQuaternion(quatInverse);
            position.copy(scope.target).add(offset);
            scope.camera.lookAt(scope.target);

            if (scope.enableDamping === true) {
                sphericalDelta.theta *= (1 - scope.dampingFactor);
                sphericalDelta.phi *= (1 - scope.dampingFactor);
                panOffset.multiplyScalar(1 - scope.dampingFactor);
            } else {
                sphericalDelta.set(0, 0, 0);
                panOffset.set(0, 0, 0);
            }

            scale = 1;

            if (lastPosition.distanceToSquared(scope.camera.position) > 0.000001 ||
                8 * (1 - lastQuaternion.dot(scope.camera.quaternion)) > 0.000001) {
                lastPosition.copy(scope.camera.position);
                lastQuaternion.copy(scope.camera.quaternion);
                return true;
            }
            return false;
        };
    }();

    function onMouseDown(event) {
        if (scope.enabled === false) return;
        event.preventDefault();

        switch (event.button) {
            case 0:
                if (scope.enableRotate === false) return;
                rotateStart.set(event.clientX, event.clientY);
                state = STATE.ROTATE;
                break;
            case 1:
                if (scope.enablePan === false) return;
                panStart.set(event.clientX, event.clientY);
                state = STATE.PAN;
                break;
            case 2:
                if (scope.enableZoom === false) return;
                dollyStart.set(event.clientX, event.clientY);
                state = STATE.DOLLY;
                break;
        }

        if (state !== STATE.NONE) {
            document.addEventListener('mousemove', onMouseMove, false);
            document.addEventListener('mouseup', onMouseUp, false);
        }
    }

    function onMouseMove(event) {
        if (scope.enabled === false) return;
        event.preventDefault();

        if (state === STATE.ROTATE) {
            rotateEnd.set(event.clientX, event.clientY);
            rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
            sphericalDelta.theta -= 2 * Math.PI * rotateDelta.x / scope.domElement.clientHeight;
            sphericalDelta.phi -= 2 * Math.PI * rotateDelta.y / scope.domElement.clientHeight;
            rotateStart.copy(rotateEnd);
            scope.update();
        } else if (state === STATE.DOLLY) {
            dollyEnd.set(event.clientX, event.clientY);
            dollyDelta.subVectors(dollyEnd, dollyStart);
            if (dollyDelta.y > 0) {
                scale /= Math.pow(0.95, scope.zoomSpeed);
            } else if (dollyDelta.y < 0) {
                scale *= Math.pow(0.95, scope.zoomSpeed);
            }
            dollyStart.copy(dollyEnd);
            scope.update();
        } else if (state === STATE.PAN) {
            panEnd.set(event.clientX, event.clientY);
            panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
            const offset = new THREE.Vector3();
            offset.copy(scope.camera.position).sub(scope.target);
            let targetDistance = offset.length();
            targetDistance *= Math.tan((scope.camera.fov / 2) * Math.PI / 180.0);
            const panLeft = new THREE.Vector3();
            panLeft.setFromMatrixColumn(scope.camera.matrix, 0);
            panLeft.multiplyScalar(-2 * panDelta.x * targetDistance / scope.domElement.clientHeight);
            const panUp = new THREE.Vector3();
            panUp.setFromMatrixColumn(scope.camera.matrix, 1);
            panUp.multiplyScalar(2 * panDelta.y * targetDistance / scope.domElement.clientHeight);
            panOffset.add(panLeft).add(panUp);
            panStart.copy(panEnd);
            scope.update();
        }
    }

    function onMouseUp() {
        if (scope.enabled === false) return;
        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mouseup', onMouseUp, false);
        state = STATE.NONE;
    }

    function onMouseWheel(event) {
        if (scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE) return;
        event.preventDefault();
        event.stopPropagation();

        if (event.deltaY < 0) {
            scale /= Math.pow(0.95, scope.zoomSpeed);
        } else if (event.deltaY > 0) {
            scale *= Math.pow(0.95, scope.zoomSpeed);
        }
        scope.update();
    }

    this.domElement.addEventListener('mousedown', onMouseDown, false);
    this.domElement.addEventListener('wheel', onMouseWheel, false);
    this.domElement.addEventListener('contextmenu', (event) => event.preventDefault(), false);

    this.update();
};
