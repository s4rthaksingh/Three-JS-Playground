import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0); // Light gray background
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Crosshair element
const crosshair = document.createElement('div');
crosshair.style.position = 'absolute';
crosshair.style.top = '50%';
crosshair.style.left = '50%';
crosshair.style.transform = 'translate(-50%, -50%)';
crosshair.style.width = '20px';
crosshair.style.height = '20px';
crosshair.style.pointerEvents = 'none';
crosshair.style.userSelect = 'none';
crosshair.innerHTML = '+';
crosshair.style.color = 'black';
crosshair.style.fontSize = '24px';
crosshair.style.fontWeight = 'bold';
document.body.appendChild(crosshair);

const controls = new PointerLockControls(camera, document.body);
renderer.domElement.addEventListener('click', () => {
  controls.lock();
});

// Raycaster for object interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let interactiveObjects = [];

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load('/models/Desk.glb', (gltf) => {
  gltf.scene.position.set(6, 0, 8);
  gltf.scene.rotation.y = Math.PI / 2;

  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      console.log('Mesh found:', child.name);
      child.castShadow = true;
      child.receiveShadow = true;
      
      // Add interactive properties to laptop and book
      if (child.name === 'Laptop') {
        child.userData = { 
          type: 'laptop',
          url: 'https://github.com',
          originalColor: child.material.color.clone()
        };
        interactiveObjects.push(child);
        console.log('Added interactive Laptop');
      }
      if (child.name === 'Book') {
        child.userData = { 
          type: 'book',
          url: 'https://youtube.com',
          originalColor: child.material.color.clone()
        };
        interactiveObjects.push(child);
        console.log('Added interactive Book');
      }
    }
  });

  scene.add(gltf.scene);
}, undefined, (error) => {
  console.error('Error loading model:', error);
});

// Improved lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);

// Add fill light
const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
fillLight.position.set(-10, 5, -10);
scene.add(fillLight);

camera.position.set(6.3, 5.4, 0.25);

let outlinedObject = null;
let outlineMesh = null;

function createOutlineMesh(mesh) {
  const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide });
  const outline = new THREE.Mesh(mesh.geometry.clone(), outlineMaterial);
  outline.applyMatrix4(mesh.matrixWorld);
  outline.scale.multiplyScalar(1.08);
  outline.renderOrder = 999;
  return outline;
}

function animate() {
  requestAnimationFrame(animate);
  
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObjects(interactiveObjects, true);
  if (intersects.length > 0) {
    console.log('Raycaster hit:', intersects[0].object.name);
  }

  // Remove previous outline
  if (outlineMesh && outlinedObject) {
    scene.remove(outlineMesh);
    outlineMesh = null;
    outlinedObject = null;
  }

  if (intersects.length > 0) {
    const hoveredObject = intersects[0].object;
    outlineMesh = createOutlineMesh(hoveredObject);
    scene.add(outlineMesh);
    outlinedObject = hoveredObject;
  }

  renderer.render(scene, camera);
}

// Handle clicks on interactive objects
document.addEventListener('click', (event) => {
  if (!controls.isLocked) return;
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObjects(interactiveObjects, true);
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    console.log('Clicked on:', clickedObject.name, clickedObject.userData);
    if (clickedObject.userData.url) {
      window.open(clickedObject.userData.url, '_blank');
    }
  } else {
    console.log('Clicked, but no interactive object hit.');
  }
});

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});