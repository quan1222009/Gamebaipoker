import * as THREE from 'three';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ánh sáng
scene.add(new THREE.AmbientLight(0xffffff,0.8));

// Bàn 3D
let tableGeo = new THREE.BoxGeometry(10,0.5,6);
let tableMat = new THREE.MeshStandardMaterial({color:0x228B22});
let table = new THREE.Mesh(tableGeo, tableMat);
table.position.y=0;
scene.add(table);

// Card 3D
let cardGeo = new THREE.BoxGeometry(1,0.1,1.5);
let cardMat = new THREE.MeshStandardMaterial({color:0xffffff});
let card = new THREE.Mesh(cardGeo, cardMat);
card.position.set(0,0.2,0);
scene.add(card);

// Camera
camera.position.set(0,10,10);
camera.lookAt(0,0,0);

function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
}
animate();

// TODO: thêm drag/drop card, highlight, token player, socket.io online move
