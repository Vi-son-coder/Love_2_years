import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Import ảnh
import img1 from "./assets/IMG_9625.WebP";
import img2 from "./assets/IMG_0983.WebP";
import img3 from "./assets/IMG_1198.WebP";
import img4 from "./assets/IMG_1199.WebP";
import img5 from "./assets/IMG_1319.WebP";
import img6 from "./assets/IMG_1323.WebP";
import img7 from "./assets/IMG_1325.WebP";
import img8 from "./assets/IMG_1335.WebP";
import img9 from "./assets/RYLE4532.WebP";

export const myImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9];

// 1. Setup ban đầu
const music = document.getElementById("bg-music");
const overlay = document.getElementById("overlay");
let isStarted = false;

// 2. Sự kiện click (Dùng addEventListener thay vì onclick HTML)
overlay.addEventListener("click", () => {
  if (isStarted) return;
  isStarted = true;

  music.volume = 1;
  music
    .play()
    .catch((e) => console.log("Cần tương tác người dùng để phát nhạc"));

  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "none";
  setTimeout(() => (overlay.style.display = "none"), 800);
});

// 3. Khởi tạo Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 40;

// Các thành phần phụ trợ
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const starVertices = [];
for (let i = 0; i < 2000; i++) {
  starVertices.push(
    THREE.MathUtils.randFloatSpread(200),
    THREE.MathUtils.randFloatSpread(200),
    THREE.MathUtils.randFloatSpread(200),
  );
}
starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3),
);
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

const group = new THREE.Group();
scene.add(group);

// Load ảnh
const manager = new THREE.LoadingManager();
let isLoaded = false;
manager.onLoad = () => {
  isLoaded = true;
};
const loader = new THREE.TextureLoader(manager);
const textures = myImages.map((url) => loader.load(url));

// Tạo các hạt
const particles = [];
const count = 400;
const maxRadius = 20;
const myTexts = [
  "Anh yêu em",
  "Em là cả thế giới",
  "Yêu em nhất",
  "Mãi bên nhau",
];
const emojis = ["❤️", "🌸", "🌹", "💖"];

function createTextTexture(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.font = "bold 100px Arial";
  ctx.fillStyle = "#ff69b4";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 512, 128);
  return new THREE.CanvasTexture(canvas);
}

for (let i = 0; i < count; i++) {
  let material, geometry;
  if (i < 10) {
    material = new THREE.MeshBasicMaterial({
      map: createTextTexture(myTexts[i % myTexts.length]),
      transparent: true,
      opacity: 0.8,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    });
    geometry = new THREE.PlaneGeometry(4, 2);
  } else if (i < 300) {
    material = new THREE.MeshBasicMaterial({
      map: textures[i % textures.length],
      transparent: true,
      opacity: 0.8,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    });
    geometry = new THREE.PlaneGeometry(1.2, 1.2);
  } else {
    material = new THREE.MeshBasicMaterial({
      map: createTextTexture(emojis[i % emojis.length]),
      transparent: true,
      opacity: 0.8,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    });
    geometry = new THREE.PlaneGeometry(3.5, 1.5);
  }
  const mesh = new THREE.Mesh(geometry, material);
  const r = maxRadius * Math.pow(Math.random(), 1 / 3);
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  mesh.userData.target = new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  );
  mesh.position.set(0, 0, 0);
  group.add(mesh);
  particles.push(mesh);
}

// 4. Vòng lặp
const startTime = Date.now();
function animate() {
  requestAnimationFrame(animate);
  if (isStarted) {
    group.rotation.y += 0.0008;
    stars.rotation.y -= 0.0005;
    if (isLoaded) {
      if (Date.now() - startTime > 300) {
        particles.forEach((p) => {
          p.position.lerp(p.userData.target, 0.05);
          p.lookAt(camera.position);
        });
        if (camera.position.z > 25) camera.position.z -= 0.4;
      }
    }
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
