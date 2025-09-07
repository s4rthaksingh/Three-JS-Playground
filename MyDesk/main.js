import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, document.body);
renderer.domElement.addEventListener('click', () => {
  controls.lock();
});

const maxPitch = 0.35
const minPitch = THREE.MathUtils.degToRad(-60);
const fixedYaw = 0; 
const mouseSensitivity = 0.002;
const pitchObject = controls.getObject();
let pitch = 0;

document.addEventListener('mousemove', (event) => {
  if (controls.isLocked) {
    const movementY = event.movementY || 0;
    pitch -= movementY * mouseSensitivity;
    pitch = Math.max(minPitch, Math.min(maxPitch, pitch));
    pitchObject.rotation.set(pitch, fixedYaw, 0, 'YXZ');
  }
});

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load('/models/Desk.glb', (gltf) => {
  gltf.scene.position.set(6, 0, 8);
  gltf.scene.rotation.y = Math.PI / 2;

  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(gltf.scene);
}, undefined, (error) => {
  console.error('Error loading model:', error);
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

camera.position.set(6.3, 5.4, 0.25);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});