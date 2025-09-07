import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';

const sizes = {
    width:window.innerWidth,
    height:window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height ,0.1, 1000);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({antialias:true});

renderer.setSize(sizes.width,sizes.height);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

camera.position.set(-5,34,-68 )
camera.rotation.set(-2.6,-0.2,-3.0)

const controls = new OrbitControls(camera,renderer.domElement);
controls.update();

const loader = new GLTFLoader();
loader.load(
	// resource URL
	'./MyPortfolio.glb',
	// called when the resource is loaded
	function ( glb ) {
        glb.scene.traverse(child=>{
            if(child.isMesh){
                child.castShadow = true;
                child.recieveShadow = true;
            }
        })
		scene.add( glb.scene );

		// glb.animations; // Array<THREE.AnimationClip>
		// glb.scene; // THREE.Group
		// glb.scenes; // Array<THREE.Group>
		// glb.cameras; // Array<THREE.Camera>
		// glb.asset; // Object

	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);

const sun = new THREE.DirectionalLight( 0xffffff , 3    );
sun.castShadow = true;
sun.position.set(75,50,0)
scene.add( sun );
const shadowhelper = new THREE.CameraHelper(sun.shadow.camera);
scene.add(shadowhelper)
const helper = new THREE.DirectionalLightHelper(sun,5);
scene.add(helper)
const light = new THREE.AmbientLight( 0x404040 , 3); // soft white light
scene.add( light );


window.addEventListener('click',()=>{
	console.log(camera.position,camera.rotation)
})


function handleResize(){
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width/sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width,sizes.height);
    console.log("Resizing");
};

window.addEventListener("resize",handleResize);

function animate(){
    // console.log(camera.position);
    renderer.render(scene,camera);
}
renderer.setAnimationLoop(animate);