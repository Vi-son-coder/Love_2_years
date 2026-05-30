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

// 2. Sự kiện click
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
// Tối ưu 1: Yêu cầu trình duyệt dồn sức mạnh GPU để chạy mượt
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
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

// Tối ưu 2: Giảm kích thước canvas ẩn để tiết kiệm RAM
function createTextTexture(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.font = "bold 50px Arial";
  ctx.fillStyle = "#ff69b4";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 64);
  return new THREE.CanvasTexture(canvas);
}

// Tối ưu 3: TẠO SẴN MATERIAL VÀ GEOMETRY Ở NGOÀI VÒNG LẶP (Chìa khóa chống lag)
const textMaterials = myTexts.map(
  (text) =>
    new THREE.MeshBasicMaterial({
      map: createTextTexture(text),
      transparent: true,
      opacity: 0.8,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    }),
);

const emojiMaterials = emojis.map(
  (emoji) =>
    new THREE.MeshBasicMaterial({
      map: createTextTexture(emoji),
      transparent: true,
      opacity: 0.8,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    }),
);

const imgMaterials = textures.map(
  (tex) =>
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.8,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    }),
);

const textGeo = new THREE.PlaneGeometry(4, 2);
const imgGeo = new THREE.PlaneGeometry(1.2, 1.2);
const emojiGeo = new THREE.PlaneGeometry(3.5, 1.5);

for (let i = 0; i < count; i++) {
  let material, geometry;

  // Chỉ lấy Material đã tạo sẵn ra dùng, không tạo mới
  if (i < 10) {
    material = textMaterials[i % textMaterials.length];
    geometry = textGeo;
  } else if (i < 300) {
    material = imgMaterials[i % imgMaterials.length];
    geometry = imgGeo;
  } else {
    material = emojiMaterials[i % emojiMaterials.length];
    geometry = emojiGeo;
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
          // Tối ưu 4: Đổi 0.05 thành 0.08 để hạt bung ra dứt khoát hơn
          p.position.lerp(p.userData.target, 0.08);
          p.lookAt(camera.position);
        });
        if (camera.position.z > 22) camera.position.z -= 0.4;
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
