import * as THREE from "/three/build/three.module.js";
import { OBJLoader } from '/three/examples/jsm/loaders/OBJLoader.js';
import { EffectComposer } from "/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "/three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "/three/examples/jsm/shaders/FXAAShader.js";

import { CustomOutlinePass } from "./scripts/CustomOutlinePass.js";
const noise = new Noise(Math.random())

const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const objLoader = new OBJLoader();
let crossModel = null

scene.fog = new THREE.Fog( 0x000000, 50, 450 );

let mouseDirection = 0

const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#vael-background'),
    antialias: true,
});


const loader =  new THREE.TextureLoader();
loader.load('./assets/Vael-Space.png', function(texture){
    scene.background = texture;
})

const depthTexture = new THREE.DepthTexture();
const renderTarget = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight,
  {
    depthTexture: depthTexture,
    depthBuffer: true,
  }
);

// Initial render pass.
const composer = new EffectComposer(renderer, renderTarget);
const pass = new RenderPass(scene, camera);
composer.addPass(pass);

// Outline pass.
const customOutline = new CustomOutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
);
composer.addPass(customOutline);

// Antialias pass.
const effectFXAA = new ShaderPass(FXAAShader);
effectFXAA.uniforms["resolution"].value.set(
  1 / window.innerWidth, 
  1 / window.innerHeight
);
composer.addPass(effectFXAA);


function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function getScaledNoise(x, y, scale = 10, minHeight = 1, maxHeight = 10) {
    let noiseValue = noise.perlin2(x / scale, y / scale); // Adjust frequency
    noiseValue = (noiseValue + 1) / 2; // Normalize to 0 - 1
    return minHeight + noiseValue * (maxHeight - minHeight); // Scale to height range
}


function rgbToHex(r, g, b) {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function hexToRgb(hex, power = 1) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return {
        r: ((num >> 16) & 255) / power,
        g: ((num >> 8) & 255) / power,
        b: (num & 255) / power
    };
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpColorEased(hex1, hex2, t) {
    // Apply easing function (ease in-out cubic)
    t = easeInOutCubic(Math.max(0, Math.min(1, t)));

    // Convert hex to RGB components
    const color1 = hexToRgb(hex1);
    const color2 = hexToRgb(hex2);

    // Interpolate each RGB component
    const r = Math.round(lerp(color1.r, color2.r, t));
    const g = Math.round(lerp(color1.g, color2.g, t));
    const b = Math.round(lerp(color1.b, color2.b, t));

    // Convert back to hex
    return rgbToHex(r, g, b);
}

function easeInOutCubic(t) {
    return t < 0.5 
    ? Math.pow(t, 4) * 8  // Slower acceleration at start
    : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function normalize(value, min, max) {
    if (min === max) return 0; // Avoid division by zero
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
composer.setSize(window.innerWidth, window.innerHeight);
customOutline.setSize(window.innerWidth, window.innerHeight);
camera.position.setY(90)
camera.position.setZ(110)


const pointLight = new THREE.PointLight(0xffffff)

const ambiantLight = new THREE.AmbientLight(0xffffff, 0.001)
scene.add(pointLight, ambiantLight)

//Helpers
const gridHelper = new THREE.GridHelper(200,50)
const lightHelper = new THREE.PointLightHelper(pointLight)
scene.add(lightHelper)

//const controls = new OrbitControls(camera, renderer.domElement);

let starList = []
let pillarList = []

function addStar() {
    const geo = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({color: 0xFFFF00});
    const star = new THREE.Mesh(geo, material);

    const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

    star.position.set(x, y, z)

    scene.add(star)
    starList.push(star)
}
function addPillar(geo, x, y, z) {
    //onst geo = new THREE.BoxGeometry(1.8,1.8,3.6)
    const material = new THREE.MeshStandardMaterial({color: 0xFFFF00});
    const pillar = new THREE.Mesh(geo, material);

    pillar.position.set(x, y, z)

    scene.add(pillar)
    pillarList.push({piller: pillar})
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
  }

//Array(200).fill().forEach(addStar)
let graveCrossGeo = null
let gravePlainGeo = null
let graveRIPGeo = null
let graveBrimGeo = null
let graveList = []
//Load Models
objLoader.load(
	// resource URL
	'3D/models/crossstone.obj',
	// called when resource is loaded
	function ( object ) {
        graveCrossGeo = object.children[0].geometry
        graveList.push(graveCrossGeo)
	},
);
objLoader.load(
	// resource URL
	'3D/models/GraveStonePlain.obj',
	// called when resource is loaded
	function ( object ) {
        gravePlainGeo = object.children[0].geometry
        graveList.push(gravePlainGeo)
        graveList.push(gravePlainGeo)
        graveList.push(gravePlainGeo)
        graveList.push(gravePlainGeo)
	},
);
objLoader.load(
	// resource URL
	'3D/models/GraveStoneRip.obj',
	// called when resource is loaded
	function ( object ) {
        graveRIPGeo = object.children[0].geometry
        graveList.push(graveRIPGeo)
        graveList.push(graveRIPGeo)
	},
);
objLoader.load(
	// resource URL
	'3D/models/GraveStoneBrimstone.obj',
	// called when resource is loaded
	function ( object ) {
        graveBrimGeo = object.children[0].geometry
        graveList.push(graveBrimGeo)
        graveList.push(graveBrimGeo)
        graveList.push(graveBrimGeo)
        finishedLoad()
	},
);

let rangeX = 6
let rangeY = 60


function finishedLoad(){
    for (let lx = (rangeX * -1); lx < rangeX; lx++){
        for (let ly = (rangeY * -1); ly < rangeY; ly++){
            addPillar(graveList[Math.floor(Math.random() * graveList.length)], 250 + lx*30*getScaledNoise(lx, ly, 35, 0.4, 1.7), 0, ly * 6)
        }
    }
    
    for (let lx = (rangeX * -1); lx < rangeX; lx++){
        for (let ly = (rangeY * -1); ly < rangeY; ly++){ 
            addPillar(graveList[Math.floor(Math.random() * graveList.length)], -250 + lx*30*getScaledNoise(lx, ly, 35, 0.4, 1.7), 0, ly * 6)
        }
    }
}

camera.rotation.x = -.5 
function animate(){

    requestAnimationFrame(animate)
    raycaster.setFromCamera( pointer, camera );

    let scrollAmount = 0

    if(mouseDirection == 0){
        scrollAmount = 0.2
    } else {
        scrollAmount = mouseDirection
    }

    let noisePan = 0
    let newColor = null
    let track = 0
    pillarList.forEach(element => {
        let dist = raycaster.ray.distanceToPoint(element.piller.position)
        let noise = getScaledNoise(element.piller.position.x, element.piller.position.z, 60, 0, 3) - (getScaledNoise(element.piller.position.z*1.2, 8, 160, -8, 7))
        noise = Math.min(Math.max(noise, 0.3), 2.5);
        let mouseThing = Math.max(0, Math.min(3, 50 / (dist))) + noise
        let newScale = noise + (Math.max(0, Math.min(2.5, 50 / (dist))) / 8)
        track += 15

        if(mouseThing > 3.0){
            newColor = lerpColorEased('0xff00d4', '0xd0f500', normalize(mouseThing, 3.0, 5))
        } else {
            newColor = lerpColorEased('0x000000', '0xff00d4', normalize(mouseThing/1.5, 0, 3.0))
        }

        element.piller.material.color = hexToRgb(newColor)
        element.piller.material.emissive = hexToRgb(newColor, (250 / normalize(newScale/1.5, -1, 3.5)))


        element.piller.scale.y = newScale
        element.piller.position.z += scrollAmount
        element.piller.position.y = mouseThing * 6

        if(element.piller.position.z > 360){
            element.piller.position.z = -360  //(getRandomInt(-1 * offset, offset ))
        } else if (element.piller.position.z < -360){
            element.piller.position.z = 350  //(getRandomInt(-1 * offset, offset ))
        }


    });
-

    pillarList.forEach(element => {


    });

    starList.forEach(element => {

    });
    
    //controls.update();
    composer.render();
}

addEventListener("wheel", (e) => {
    mouseDirection += e.wheelDeltaY / 10000
    if(mouseDirection > 0.6){
        mouseDirection = 0.6
    } else if (mouseDirection < -0.6){
        mouseDirection = -0.6
    }
});

window.addEventListener( 'pointermove', onPointerMove );


animate()
