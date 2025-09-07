// main.js
import * as THREE from 'three';

const socket = io('http://localhost:3000');

let isPlayer1 = false;
let myId = null;
let opponentId = null;
let canRoll = false;
let myRoll = null;
let oppRoll = null;

// Dice rendering logic (shared)
function createDiceScene(containerId) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(200, 200);
  document.getElementById(containerId).appendChild(renderer.domElement);

  // Dice face helper
  function createDiceFace(pipCount) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000';
    const pip = (x, y) => {
      ctx.beginPath();
      ctx.arc(x, y, size / 16, 0, 2 * Math.PI);
      ctx.fill();
    };
    const positions = [
      [size / 2, size / 2],
      [size / 4, size / 4], [3 * size / 4, 3 * size / 4],
      [size / 4, size / 4], [size / 2, size / 2], [3 * size / 4, 3 * size / 4],
      [size / 4, size / 4], [3 * size / 4, size / 4], [size / 4, 3 * size / 4], [3 * size / 4, 3 * size / 4],
      [size / 4, size / 4], [3 * size / 4, size / 4], [size / 2, size / 2], [size / 4, 3 * size / 4], [3 * size / 4, 3 * size / 4],
      [size / 4, size / 4], [3 * size / 4, size / 4], [size / 4, size / 2], [3 * size / 4, size / 2], [size / 4, 3 * size / 4], [3 * size / 4, 3 * size / 4],
    ];
    const pipMap = {
      1: [0],
      2: [1, 2],
      3: [3, 4, 5],
      4: [6, 7, 8, 9],
      5: [10, 11, 12, 13, 14],
      6: [15, 16, 17, 18, 19, 20],
    };
    pipMap[pipCount].forEach(i => {
      const [x, y] = positions[i];
      pip(x, y);
    });
    return new THREE.CanvasTexture(canvas);
  }
  const diceTextures = [
    createDiceFace(3),
    createDiceFace(4),
    createDiceFace(5),
    createDiceFace(2),
    createDiceFace(1),
    createDiceFace(6),
  ];
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const materials = diceTextures.map(tex => new THREE.MeshBasicMaterial({ map: tex }));
  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);
  camera.position.z = 2.5;

  // Face up mapping
  const faceUpRotations = [
    null,
    { x: 0, y: 0, z: 0 },
    { x: -Math.PI / 2, y: 0, z: 0 },
    { x: 0, y: Math.PI / 2, z: 0 },
    { x: 0, y: -Math.PI / 2, z: 0 },
    { x: Math.PI / 2, y: 0, z: 0 },
    { x: Math.PI, y: 0, z: 0 },
  ];

  let rotationstate = false;
  let targetRotation = null;
  let rolling = false;
  let rolledNumber = 1;

  function rollToFace(num, cb) {
    if (rolling) return;
    rolling = true;
    rotationstate = true;
    rolledNumber = num;
    const extraX = Math.PI * 2 * (2 + Math.random() * 2);
    const extraY = Math.PI * 2 * (2 + Math.random() * 2);
    const extraZ = Math.PI * 2 * (2 + Math.random() * 2);
    const target = faceUpRotations[num];
    targetRotation = {
      x: target.x + extraX,
      y: target.y + extraY,
      z: target.z + extraZ,
    };
    setTimeout(() => {
      rotationstate = false;
      rolling = false;
      cube.rotation.x = target.x;
      cube.rotation.y = target.y;
      cube.rotation.z = target.z;
      if (cb) cb();
    }, 1200);
  }

  function animate() {
    if (rotationstate && targetRotation) {
      cube.rotation.x += (targetRotation.x - cube.rotation.x) * 0.2;
      cube.rotation.y += (targetRotation.y - cube.rotation.y) * 0.2;
      cube.rotation.z += (targetRotation.z - cube.rotation.z) * 0.2;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  return { rollToFace };
}

const dice1 = createDiceScene('player1-canvas');
const dice2 = createDiceScene('player2-canvas');

const rollBtn1 = document.getElementById('roll-btn-1');
const rollBtn2 = document.getElementById('roll-btn-2');
const result1 = document.getElementById('result-1');
const result2 = document.getElementById('result-2');
const winnerDisplay = document.getElementById('winner-display');
const lobbyStatus = document.getElementById('lobby-status');

function setTurn(turn) {
  canRoll = turn;
  rollBtn1.disabled = !turn;
  rollBtn1.textContent = turn ? 'Roll' : 'Waiting...';
  rollBtn2.disabled = true;
  rollBtn2.textContent = "Opponent's Turn";
}

socket.on('connect', () => {
  myId = socket.id;
});

socket.on('lobby_update', ({ players, you }) => {
  myId = you;
  if (players.length === 1) {
    lobbyStatus.textContent = 'Waiting for opponent...';
    setTurn(false);
    isPlayer1 = true;
    opponentId = null;
  } else {
    lobbyStatus.textContent = 'Opponent joined!';
    isPlayer1 = players[0] === myId;
    opponentId = players.find(id => id !== myId);
    setTurn(isPlayer1);
  }
  result1.textContent = '';
  result2.textContent = '';
  winnerDisplay.textContent = '';
  myRoll = null;
  oppRoll = null;
});

rollBtn1.onclick = () => {
  if (!canRoll) return;
  const roll = Math.floor(Math.random() * 6) + 1;
  myRoll = roll;
  dice1.rollToFace(roll);
  result1.textContent = `You rolled: ${roll}`;
  setTurn(false);
  socket.emit('roll', roll);
};

socket.on('roll_update', ({ player, roll }) => {
  if (player === myId) return;
  oppRoll = roll;
  dice2.rollToFace(roll);
  result2.textContent = `Opponent rolled: ${roll}`;
});

socket.on('result', ({ rolls, winner }) => {
  setTimeout(() => {
    if (!rolls) return;
    const my = rolls[myId];
    const opp = rolls[opponentId];
    if (my !== undefined) result1.textContent = `You rolled: ${my}`;
    if (opp !== undefined) result2.textContent = `Opponent rolled: ${opp}`;
    if (winner === myId) winnerDisplay.textContent = 'You win!';
    else if (winner === opponentId) winnerDisplay.textContent = 'Opponent wins!';
    else winnerDisplay.textContent = "It's a tie!";
    setTurn(isPlayer1);
  }, 1300);
});