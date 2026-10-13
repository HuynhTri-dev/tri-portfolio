"""
Name: test.py
Description: Generates the 3D Mindverse interactive intro prototype files and bundles them into a zip archive.
"""

from pathlib import Path
import shutil, zipfile

dir_path = Path(__file__).resolve().parent
base = dir_path / "mindverse_3d_intro"
assets = base / "assets"
assets.mkdir(parents=True, exist_ok=True)

src_img = dir_path / "tri-portrait.jpeg"
if src_img.exists():
    shutil.copy2(src_img, assets / "tri-portrait.jpeg")

html = r'''
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#071a16">
    <title>TRÍ HUỲNH — THE MINDVERSE</title>
    <style>
        :root {
            --forest: #0b3d2e;
            --blue: #3b82f6;
            --paper: #f2f7f4;
            --muted: #a9c0b8
        }

        * {
            box-sizing: border-box
        }

        html,
        body {
            margin: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #06110f;
            color: var(--paper);
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
        }

        body {
            background: radial-gradient(ellipse at 50% 44%, #12372d 0%, #071a16 48%, #030807 100%)
        }

        #scene {
            position: fixed;
            inset: 0;
            z-index: 0
        }

        canvas {
            display: block
        }

        .grain {
            position: fixed;
            inset: 0;
            z-index: 1;
            pointer-events: none;
            opacity: .12;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.25'/%3E%3C/svg%3E")
        }

        .hud {
            position: fixed;
            inset: 0;
            z-index: 2;
            pointer-events: none;
            padding: clamp(20px, 4vw, 56px);
            display: flex;
            flex-direction: column;
            justify-content: space-between
        }

        .top,
        .bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px
        }

        .eyebrow {
            font-size: 10px;
            letter-spacing: .28em;
            text-transform: uppercase;
            color: #b4c9c1
        }

        .mark {
            display: flex;
            align-items: center;
            gap: 10px
        }

        .mark-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--blue);
            box-shadow: 0 0 18px #3b82f6
        }

        .coordinate {
            text-align: right;
            line-height: 1.8
        }

        .hero {
            position: absolute;
            left: clamp(24px, 8vw, 120px);
            top: 48%;
            transform: translateY(-50%);
            max-width: min(49vw, 650px)
        }

        .kicker {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #9db9ae;
            font-size: 10px;
            letter-spacing: .26em;
            text-transform: uppercase;
            margin-bottom: 22px
        }

        .kicker:before {
            content: "";
            width: 28px;
            height: 1px;
            background: var(--blue)
        }

        h1 {
            font-size: clamp(54px, 9vw, 132px);
            line-height: .82;
            letter-spacing: -.085em;
            margin: 0;
            font-weight: 760;
            text-transform: uppercase;
            text-shadow: 0 8px 55px #0006
        }

        h1 span {
            display: block;
            color: transparent;
            -webkit-text-stroke: 1px #e8f4ee
        }

        .sub {
            margin-top: 28px;
            font-size: clamp(13px, 1.4vw, 18px);
            letter-spacing: .08em;
            color: #d2e1da
        }

        .sub strong {
            color: white;
            font-weight: 600
        }

        .desc {
            max-width: 370px;
            margin-top: 13px;
            color: #9bb5aa;
            font-size: 13px;
            line-height: 1.8
        }

        .actions {
            pointer-events: auto;
            display: flex;
            gap: 12px;
            margin-top: 28px;
            flex-wrap: wrap
        }

        button {
            font: inherit;
            cursor: pointer;
            border: 1px solid #8eb3a54d;
            background: #0b211bcc;
            color: var(--paper);
            padding: 12px 16px;
            border-radius: 2px;
            letter-spacing: .08em;
            text-transform: uppercase;
            font-size: 10px;
            transition: .25s
        }

        button.primary {
            background: var(--paper);
            color: #09231b;
            border-color: var(--paper)
        }

        button:hover {
            transform: translateY(-2px);
            border-color: #7eb6ff
        }

        .hint {
            position: absolute;
            left: 50%;
            bottom: clamp(80px, 12vh, 140px);
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 10px;
            color: #8da99e;
            font-size: 9px;
            letter-spacing: .2em;
            text-transform: uppercase;
            white-space: nowrap
        }

        .hint i {
            width: 28px;
            height: 1px;
            background: #3b82f6;
            display: block
        }

        .bottom {
            font-size: 9px;
            letter-spacing: .2em;
            text-transform: uppercase;
            color: #8ea99e
        }

        .bottom .right {
            display: flex;
            align-items: center;
            gap: 18px
        }

        .scroll {
            display: flex;
            align-items: center;
            gap: 8px
        }

        .scroll:before {
            content: "";
            display: block;
            width: 28px;
            height: 1px;
            background: var(--blue)
        }

        .status {
            color: #79a894
        }

        .crosshair {
            position: fixed;
            z-index: 2;
            left: 50%;
            top: 50%;
            width: 28px;
            height: 28px;
            transform: translate(-50%, -50%);
            pointer-events: none;
            opacity: .45
        }

        .crosshair:before,
        .crosshair:after {
            content: "";
            position: absolute;
            background: #d7e8e0
        }

        .crosshair:before {
            width: 28px;
            height: 1px;
            top: 14px
        }

        .crosshair:after {
            width: 1px;
            height: 28px;
            left: 14px
        }

        .intro-cover {
            position: fixed;
            inset: 0;
            z-index: 5;
            background: #06110f;
            display: grid;
            place-items: center;
            transition: opacity 1s ease, visibility 1s ease
        }

        .intro-cover.hide {
            opacity: 0;
            visibility: hidden
        }

        .cover-inner {
            text-align: center
        }

        .cover-small {
            font-size: 9px;
            letter-spacing: .36em;
            color: #89a99b;
            text-transform: uppercase
        }

        .cover-title {
            font-size: clamp(34px, 6vw, 72px);
            letter-spacing: -.07em;
            font-weight: 750;
            margin: 18px 0 24px
        }

        .cover-title span {
            color: #3b82f6
        }

        .load-line {
            width: 170px;
            height: 1px;
            background: #25483c;
            margin: auto;
            overflow: hidden
        }

        .load-line:after {
            content: "";
            display: block;
            height: 100%;
            background: #3b82f6;
            animation: load 1.5s ease forwards
        }

        @keyframes load {
            from {
                width: 0
            }

            to {
                width: 100%
            }
        }

        .mobile-note {
            display: none
        }

        @media(max-width:700px) {
            .hud {
                padding: 22px 20px
            }

            .coordinate {
                display: none
            }

            .hero {
                left: 22px;
                right: 22px;
                top: 43%;
                max-width: none
            }

            h1 {
                font-size: clamp(56px, 17vw, 100px)
            }

            .sub {
                max-width: 280px;
                font-size: 12px
            }

            .desc {
                max-width: 280px;
                font-size: 12px
            }

            .hint {
                bottom: 105px
            }

            .bottom {
                align-items: flex-end
            }

            .bottom .right {
                display: block;
                text-align: right;
                line-height: 2
            }

            .desktop-note {
                display: none
            }

            .mobile-note {
                display: block
            }
        }

        @media(prefers-reduced-motion:reduce) {

            *,
            *:before,
            *:after {
                animation-duration: .01ms !important;
                transition-duration: .01ms !important;
                scroll-behavior: auto !important
            }
        }
    </style>
</head>

<body>
    <div id="scene"></div>
    <div class="grain"></div>
    <div class="crosshair"></div>
    <div class="intro-cover" id="cover">
        <div class="cover-inner">
            <div class="cover-small">A personal universe by</div>
            <div class="cover-title">TRÍ <span>HUỲNH</span></div>
            <div class="load-line"></div>
        </div>
    </div>
    <div class="hud">
        <div class="top">
            <div class="mark"><span class="mark-dot"></span><span class="eyebrow">THE MINDVERSE / 001</span></div>
            <div class="coordinate eyebrow">10°46' N — 106°41' E<br>ENGINEERED CURIOSITY</div>
        </div>
        <section class="hero">
            <div class="kicker">Software engineer · Product builder</div>
            <h1>Think in<br><span>systems.</span></h1>
            <div class="sub"><strong>Build with purpose.</strong> / Think beyond the obvious.</div>
            <p class="desc">A mind between logic and imagination. Turning tangled ideas into systems, and systems into
                useful things.</p>
            <div class="actions">
                <button class="primary" id="enter">Enter the mindverse ↗</button>
                <button id="orbit">Reframe the world</button>
            </div>
        </section>
        <div class="hint"><i></i><span class="desktop-note">Drag to explore · Scroll to zoom</span><span
                class="mobile-note">Touch to explore</span><i></i></div>
        <div class="bottom">
            <div>CONTROLLED CHAOS<br><span class="status">● SYSTEM ONLINE</span></div>
            <div class="right"><span>CODE / PRODUCT / PEOPLE / IMPACT</span><span class="scroll">SCROLL TO
                    DESCEND</span></div>
        </div>
    </div>
    <script type="importmap">
        {
            "imports": {
                "three": "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js",
                "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/"
            }
        }
    </script>
    <script type="module">
        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        const mount = document.querySelector('#scene');
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x06110f, 0.035);
        const camera = new THREE.PerspectiveCamera(43, innerWidth / innerHeight, .1, 180);
        camera.position.set(0, 2.5, 13);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setSize(innerWidth, innerHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0x9bbcaf, 1.0));
        const key = new THREE.PointLight(0x3b82f6, 38, 28); key.position.set(4, 5, 4); scene.add(key);
        const greenLight = new THREE.PointLight(0x2fb88a, 26, 24); greenLight.position.set(-5, -1, 2); scene.add(greenLight);
        const rim = new THREE.DirectionalLight(0xd9f5e8, 2.4); rim.position.set(-2, 4, 6); scene.add(rim);

        const world = new THREE.Group(); scene.add(world);
        const core = new THREE.Group(); world.add(core);

        // Dark glass-like central monolith
        const coreGeo = new THREE.IcosahedronGeometry(1.55, 1);
        const coreMat = new THREE.MeshPhysicalMaterial({ color: 0x0b3d2e, metalness: .72, roughness: .22, transmission: .08, transparent: true, opacity: .92, clearcoat: 1, clearcoatRoughness: .15, flatShading: true });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat); core.add(coreMesh);
        const innerGeo = new THREE.IcosahedronGeometry(1.12, 2);
        const innerMat = new THREE.MeshStandardMaterial({ color: 0x103c31, emissive: 0x071c16, metalness: .55, roughness: .28, wireframe: true, transparent: true, opacity: .7 });
        const inner = new THREE.Mesh(innerGeo, innerMat); core.add(inner);

        // Orbital rings
        const ringMaterials = [
            new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: .8 }),
            new THREE.MeshBasicMaterial({ color: 0x8dc8b2, transparent: true, opacity: .5 }),
            new THREE.MeshBasicMaterial({ color: 0x2bbd8a, transparent: true, opacity: .62 })
        ];
        const rings = [];
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2 + i * .34, .008, 8, 220), ringMaterials[i]);
            ring.rotation.set(.5 + i * .56, .25 + i * .5, .2 + i * .8); world.add(ring); rings.push(ring);
        }

        // Thin architecture grid
        const grid = new THREE.GridHelper(42, 42, 0x275647, 0x153328);
        grid.position.y = -3.2; grid.material.transparent = true; grid.material.opacity = .45; world.add(grid);

        // Floating shards / ideas
        const shards = new THREE.Group(); world.add(shards);
        const shardMat = new THREE.MeshStandardMaterial({ color: 0x7fb5a1, metalness: .68, roughness: .25, emissive: 0x102c23 });
        const blueMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: .5, roughness: .2, emissive: 0x102b60 });
        const shardData = [];
        for (let i = 0; i < 42; i++) {
            const geo = i % 3 === 0 ? new THREE.OctahedronGeometry(.12 + Math.random() * .18, 0) : new THREE.BoxGeometry(.08 + Math.random() * .2, .08 + Math.random() * .26, .08 + Math.random() * .18);
            const mesh = new THREE.Mesh(geo, i % 5 === 0 ? blueMat : shardMat);
            const angle = Math.random() * Math.PI * 2, radius = 2.7 + Math.random() * 5.5;
            mesh.position.set(Math.cos(angle) * radius, (Math.random() - .5) * 7, Math.sin(angle) * radius - 1);
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            shards.add(mesh); shardData.push({ mesh, speed: .15 + Math.random() * .5, phase: Math.random() * 6.28, baseY: mesh.position.y });
        }

        // Distant particles
        const count = 1300, positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 8 + Math.random() * 36, a = Math.random() * Math.PI * 2;
            positions[i * 3] = Math.cos(a) * r;
            positions[i * 3 + 1] = (Math.random() - .5) * 25;
            positions[i * 3 + 2] = Math.sin(a) * r - 8;
            const blue = Math.random() > .83;
            colors[i * 3] = blue ? .23 : .42; colors[i * 3 + 1] = blue ? .51 : .68; colors[i * 3 + 2] = blue ? 1 : .58;
        }
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ size: .035, vertexColors: true, transparent: true, opacity: .7, sizeAttenuation: true }));
        scene.add(particles);

        // Portrait card on an orbiting panel
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('./assets/tri-portrait.jpeg', tex => {
            tex.colorSpace = THREE.SRGBColorSpace;
            const card = new THREE.Group();
            const image = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 1.82), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
            card.add(image);
            const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.38, 1.92, .035)), new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: .9 }));
            frame.position.z = -.025; card.add(frame);
            card.position.set(3.3, .55, .15); card.rotation.y = -.35; world.add(card);
            card.userData.orbit = true; world.userData.portrait = card;
        }, undefined, () => { });

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; controls.dampingFactor = .045; controls.minDistance = 6; controls.maxDistance = 24;
        controls.target.set(0, 0, -.5); controls.enablePan = false;
        controls.autoRotate = true; controls.autoRotateSpeed = .28;

        const pointer = new THREE.Vector2();
        addEventListener('pointermove', e => { pointer.x = (e.clientX / innerWidth - .5) * 2; pointer.y = (e.clientY / innerHeight - .5) * 2; });
        let entered = false, targetZoom = 13;
        document.querySelector('#enter').addEventListener('click', () => {
            entered = true; document.querySelector('#cover').classList.add('hide');
            document.querySelector('.hero').style.transition = 'opacity .8s, transform .8s';
            document.querySelector('.hero').style.opacity = '.18';
            document.querySelector('.hero').style.transform = 'translateY(-50%) translateX(-18px)';
            controls.autoRotateSpeed = .7;
            setTimeout(() => { document.querySelector('.hero').style.opacity = '1'; document.querySelector('.hero').style.transform = 'translateY(-50%)'; }, 900);
            camera.position.set(0, 1.1, 9.2);
        });
        document.querySelector('#orbit').addEventListener('click', () => {
            controls.autoRotate = !controls.autoRotate;
            controls.autoRotateSpeed = controls.autoRotate ? .65 : 0;
            world.rotation.y += .28;
        });
        addEventListener('wheel', e => { targetZoom = THREE.MathUtils.clamp(targetZoom + e.deltaY * .006, 7, 22); }, { passive: true });

        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            core.rotation.y = t * .12; core.rotation.x = Math.sin(t * .2) * .08;
            inner.rotation.y = -t * .19; inner.rotation.x = t * .08;
            rings.forEach((r, i) => { r.rotation.z += .0015 * (i % 2 ? 1 : -1); r.rotation.x += .0008; });
            shardData.forEach(({ mesh, speed, phase, baseY }, i) => {
                mesh.rotation.x += .002 * speed; mesh.rotation.y += .003 * speed;
                mesh.position.y = baseY + Math.sin(t * speed + phase) * .22;
            });
            particles.rotation.y = t * .006;
            key.position.x = 4 + Math.sin(t * .4) * 1.5;
            greenLight.position.y = -1 + Math.cos(t * .3) * 1.2;
            if (!entered) { camera.position.x += (pointer.x * .45 - camera.position.x * .015) * .02; camera.position.y += (2.5 - pointer.y * .3 - camera.position.y) * .012; }
            camera.position.z += (targetZoom - camera.position.z) * .025;
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
        addEventListener('resize', () => {
            camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight);
        });
        setTimeout(() => document.querySelector('#cover').classList.add('hide'), 1800);
    </script>
</body>

</html>'''
(base / "index.html").write_text(html, encoding="utf-8")
readme = """# THE MINDVERSE — 3D Interactive Intro

A browser-based Three.js intro for Trí Huỳnh's personal portfolio.

## Run locally
Because this uses ES modules and loads a local portrait texture, serve the folder over HTTP (do not open index.html
directly).

Python:
```bash
cd mindverse_3d_intro
python -m http.server 8080
```
Then open http://localhost:8080

Node alternative:
```bash
npx serve .
```

## Interactions
- Drag to orbit the scene
- Scroll to zoom
- “Enter the mindverse” triggers the intro transition
- “Reframe the world” toggles auto-rotation

## Customize
- Edit copy and colors in `index.html`
- Replace `assets/tri-portrait.jpeg` with another portrait (keep the same filename)
- Three.js and OrbitControls are loaded from jsDelivr, so internet access is required.

## Production notes
This is a prototype. For production, consider lazy-loading the 3D scene, serving optimized WebP/AVIF portrait assets,
providing a static fallback for reduced-motion/low-power devices, and integrating the intro into your existing app
routing.
"""
(base / "README.md").write_text(readme, encoding="utf-8")
zip_path = dir_path / "mindverse_3d_intro.zip"
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for p in base.rglob("*"):
        if p.is_file():
            z.write(p, p.relative_to(base.parent))
print(f"Created: {zip_path} ({zip_path.stat().st_size} bytes)")
print(f"Entry: {(base / 'index.html').exists()}, portrait: {(assets / 'tri-portrait.jpeg').exists()}")