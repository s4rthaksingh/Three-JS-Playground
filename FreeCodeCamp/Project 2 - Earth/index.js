import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

const w = window.innerWidth;
const h = window.innerHeight;

const camera = new THREE.PerspectiveCamera(75,w/h,0.1,1000);
camera.position.z = 5;
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(w,h);
document.body.appendChild(renderer.domElement);

const loader = new THREE.TextureLoader();
const controls = new OrbitControls(camera,renderer.domElement);

const geometry = new THREE.IcosahedronGeometry(1,12);
const material = new THREE.MeshStandardMaterial({map: loader.load("./assets/textures/earthmap1k.jpg")});
const earthMesh = new THREE.Mesh(geometry,material);
scene.add(earthMesh);

const hemiLight = new THREE.HemisphereLight(0xffffff,0x000000,5);
scene.add(hemiLight);

function animate(){
    controls.update();

    earthMesh.rotation.y += 0.01;

    requestAnimationFrame(animate);
    renderer.render(scene,camera);
}

animate();