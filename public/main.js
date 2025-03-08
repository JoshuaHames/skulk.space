import * as THREE from "/three/build/three.module.js";

const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#vael-background'),
    antialias: true,
});

function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setY(60)

const geometry = new THREE.TorusGeometry(10, 3, 16, 100)
const material = new THREE.MeshStandardMaterial({color: 0xFF6347})
const torus = new THREE.Mesh(geometry, material)

scene.add(torus)

const pointLight = new THREE.PointLight(0xffffff, 150)

const ambiantLight = new THREE.AmbientLight(0xffffff, 0.05)
scene.add(pointLight, ambiantLight)

//Helpers
const gridHelper = new THREE.GridHelper(200,50)
const lightHelper = new THREE.PointLightHelper(pointLight)
scene.add(lightHelper)

//const controls = new OrbitControls(camera, renderer.domElement);

let starList = []
let pillarList = []
let pillarOutlineList = []

function addStar() {
    const geo = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({color: 0xFFFFFF, emissive: 0xFFFFFF});
    const star = new THREE.Mesh(geo, material);

    const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

    star.position.set(x, y, z)

    scene.add(star)
    starList.push(star)
}
function addPillar(x, y, z) {
    const geo = new THREE.BoxGeometry(3.5,3.5,3.5)
    const geoOutline = new THREE.BoxGeometry(3.65,3.65,3.65)
    const material = new THREE.MeshStandardMaterial({color: 0xFFFFFF, emissive: 0xFFFFFF});
    const materialOutline = new THREE.MeshStandardMaterial({color: 0xFFFF00, side: THREE.BackSide});
    const pillar = new THREE.Mesh(geo, material);
    const pillarOutline = new THREE.Mesh(geoOutline, materialOutline);

    pillar.position.set(x, y, z)
    pillarOutline.position.set(x, y, z)

    scene.add(pillar)
    scene.add(pillarOutline)
    pillarList.push({piller: pillar, shadow: pillarOutline})
}


//Array(200).fill().forEach(addStar)

let rangeX = 10
let rangeY = 10
for (let lx = (rangeX * -1); lx < rangeX; lx++){
    for (let ly = (rangeY * -1); ly < rangeY; ly++){
        addPillar(lx*3.6, 0, ly*3.6)
    }
}

function animate(){
    requestAnimationFrame(animate)
    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects( scene.children );
    let attractor = new THREE.Vector3()
    raycaster.ray.at(90, attractor)


    pillarList.forEach(element => {
        let dist = raycaster.ray.distanceToPoint(element.piller.position)
        let newScale = Math.max(0.5, Math.min(5, 10 / (dist)));
        element.piller.scale.y = newScale
        element.shadow.scale.y = newScale + 0.15
        
    });

	renderer.render( scene, camera );

    pillarList.forEach(element => {


    });

    torus.rotation.x += 0.01;
    torus.rotation.y += 0.01;
    torus.rotation.z += 0.01;

    starList.forEach(element => {
    });
    
    //controls.update();
    camera.rotation.x = -1.5
    renderer.render(scene,camera);
}

window.addEventListener( 'pointermove', onPointerMove );
animate()