import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer({ antialias: true});



const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 10, 10, 10 );
controls.update();

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );



for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    for (let k = 0; k < 3; k++) {
      const geometry = new THREE.BoxGeometry( 1, 1, 1 );
      const materials = [
        new THREE.MeshStandardMaterial({ color: 'red' }),    
        new THREE.MeshStandardMaterial({ color: 'orange' }),   
        new THREE.MeshStandardMaterial({ color: 'white' }),  
        new THREE.MeshStandardMaterial({ color: 'yellow' }), 
        new THREE.MeshStandardMaterial({ color: 'green' }), 
        new THREE.MeshStandardMaterial({ color: 'blue' })  
      ];
      const cube = new THREE.Mesh( geometry, materials );
      const edgeGeometry = new THREE.EdgesGeometry(geometry);
      const edgeMaterial = new THREE.LineStandardMaterial({color:0x000000});
      const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      edges.scale.setScalar(1.001);
      scene.add( cube );
      cube.add( edges );
      cube.position.set(i,j,k)
    }
  }
}




function animate() {

  
	controls.update();
  renderer.render( scene, camera );

}