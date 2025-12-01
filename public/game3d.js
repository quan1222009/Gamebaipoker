import * as THREE from 'three';
import { io } from "socket.io-client";

const socket = io();

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ánh sáng
scene.add(new THREE.AmbientLight(0xffffff,0.8));
let dirLight = new THREE.DirectionalLight(0xffffff,0.5);
dirLight.position.set(5,10,5);
scene.add(dirLight);

// Bàn 3D
let tableGeo = new THREE.BoxGeometry(10,0.5,6);
let tableMat = new THREE.MeshStandardMaterial({color:0x228B22});
let table = new THREE.Mesh(tableGeo, tableMat);
table.position.y=0;
scene.add(table);

// Card 3D
let cards = [];
let cardGeo = new THREE.BoxGeometry(1,0.1,1.5);
let cardMat = new THREE.MeshStandardMaterial({color:0xffffff});
for(let i=0;i<13;i++){
    let card = new THREE.Mesh(cardGeo, cardMat.clone());
    card.position.set(-5 + i*0.8, 0.2, 0);
    card.userData = {index:i};
    scene.add(card);
    cards.push(card);
}

// Token player
let tokens = [];
for(let i=0;i<4;i++){
    let tokenGeo = new THREE.CylinderGeometry(0.3,0.3,0.5,32);
    let tokenMat = new THREE.MeshStandardMaterial({color:i===0?0xff0000:0x0000ff});
    let token = new THREE.Mesh(tokenGeo, tokenMat);
    let angle = (i/4)*Math.PI*2;
    token.position.set(Math.cos(angle)*4,0.25,Math.sin(angle)*3);
    scene.add(token);
    tokens.push(token);
}

// Camera
camera.position.set(0,10,10);
camera.lookAt(0,0,0);

// Drag & Drop
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let selectedCard = null;

function onMouseDown(event){
    mouse.x = (event.clientX/window.innerWidth)*2-1;
    mouse.y = -(event.clientY/window.innerHeight)*2+1;
    raycaster.setFromCamera(mouse,camera);
    const intersects = raycaster.intersectObjects(cards);
    if(intersects.length>0){
        selectedCard = intersects[0].object;
    }
}
function onMouseMove(event){
    if(selectedCard){
        mouse.x = (event.clientX/window.innerWidth)*2-1;
        mouse.y = -(event.clientY/window.innerHeight)*2+1;
        raycaster.setFromCamera(mouse,camera);
        let planeZ = new THREE.Plane(new THREE.Vector3(0,1,0),-0.2);
        let pos = new THREE.Vector3();
        raycaster.ray.intersectPlane(planeZ,pos);
        selectedCard.position.x = pos.x;
        selectedCard.position.z = pos.z;
    }
}
function onMouseUp(event){
    if(selectedCard){
        socket.emit('sendMove',{room:'room1', move:selectedCard.userData.index});
        selectedCard.position.y = 0.2;
        selectedCard = null;
    }
}
window.addEventListener('mousedown',onMouseDown);
window.addEventListener('mousemove',onMouseMove);
window.addEventListener('mouseup',onMouseUp);

socket.on('opponentMove',move=>{
    console.log("Đối phương đánh:", move);
});

// Animate
function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
}
animate();
