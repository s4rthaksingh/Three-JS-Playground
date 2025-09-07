import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;
camera.position.y = 1;

scene.background = new THREE.Color(0x0000ff);
    
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const controls = new OrbitControls( camera, renderer.domElement );

const geometry = new THREE.PlaneGeometry(20,20);
const material = new THREE.MeshBasicMaterial( { color: 0x808080 } );
const plane = new THREE.Mesh( geometry, material );
plane.rotation.x = -Math.PI / 2;    
scene.add( plane );

const ropeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 10, 32);
const ropeMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
const rope = new THREE.Mesh( ropeGeometry, ropeMaterial );
rope.rotation.x = Math.PI / 2;
rope.rotation.z = Math.PI / 2;
rope.position.y = 1;
scene.add( rope );

const player1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
player1.position.x = rope.position.x - 5;
player1.position.y = 1;
scene.add(player1);

const player2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
player2.position.x = rope.position.x + 5;
player2.position.y = 1;
scene.add(player2);

function handleResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

window.addEventListener('resize', handleResize);


function animate() {
    controls.update();

    renderer.render( scene, camera );
  }
  renderer.setAnimationLoop( animate );