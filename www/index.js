import { Universe, Cell, UniverseType } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/pairing_with_ian_conway_bg.wasm";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
let id = null;
const canvas = document.getElementById("game-of-life-canvas");
const getIndex = (row, column) => {
  return row * width + column;
};

let camera, scene, renderer, mesh, material, controls;

function init() {
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    2000
  );
  camera.position.z = 500;

  scene = new THREE.Scene();

  material = new THREE.MeshBasicMaterial();

  mesh = new THREE.Mesh(new THREE.BoxGeometry(150, 150, 150), material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  // controls = new OrbitControls(camera, renderer.domElement);
  document.body.appendChild(renderer.domElement);
  // material.map = new THREE.CanvasTexture(canvas);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  // controls.update();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  mesh.rotation.x += 0.001;
  mesh.rotation.y += 0.001;
  window.addEventListener("resize", onWindowResize);
  material.map = new THREE.CanvasTexture(canvas);

  renderer.render(scene, camera);
}

init();
const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;

      // bottle neck
      // TODO: create draw method for forest
      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }
  ctx.stroke();
};

const universe = Universe.new(0);
const width = universe.width();
const height = universe.height();

const CELL_SIZE = 5;
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;
const buttonPlayPause = document.getElementById("play-pause");

const ctx = canvas.getContext("2d");
const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

const renderLoop = () => {
  universe.tick();
  drawGrid();
  drawCells();
  id = requestAnimationFrame(renderLoop);
};

const isPaused = () => {
  return id === null;
};

const play = () => {
  buttonPlayPause.textContent = "Pause";
  renderLoop();
};

const pause = () => {
  cancelAnimationFrame(id);
  buttonPlayPause.textContent = "Play";
  id = null;
};

canvas.addEventListener("click", (event) => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  universe.toggle_cell(row, col);

  drawGrid();
  drawCells();
});

buttonPlayPause.addEventListener("click", () => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});
