const socket = io();
let scene, camera, renderer, cards=[], tokens=[], selectedCard=null;
let isOffline = true; // tắt mạng vẫn chơi offline
let gameContainer = document.getElementById('gameContainer');
let menu = document.getElementById('menu');

function initGame() {
    gameContainer.style.display='block';
    menu.style.display='none';

    // Scene & camera
    scene = new THREE.Scene();
    const aspect = window.innerWidth/window.innerHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(0,12,15); // landscape view
    camera.lookAt(0,0,0);

    // Renderer
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    gameContainer.appendChild(renderer.domElement);

    // Light
    scene.add(new THREE.AmbientLight(0xffffff,0.8));
    let dirLight = new THREE.DirectionalLight(0xffffff,0.5);
    dirLight.position.set(5,10,5);
    scene.add(dirLight);

    // Bàn 3D
    let tableGeo = new THREE.BoxGeometry(14,0.5,8);
    let tableMat = new THREE.MeshStandardMaterial({color:0x228B22});
    let table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y=0;
    scene.add(table);

    // Tạo cards (offline prototype)
    let cardGeo = new THREE.BoxGeometry(1,0.1,1.5);
    let cardMat = new THREE.MeshStandardMaterial({color:0xffffff});
    for(let i=0;i<13;i++){
        let card = new THREE.Mesh(cardGeo, cardMat.clone());
        card.position.set(-6 + i,0.2,0);
        card.userData={index:i};
        scene.add(card);
        cards.push(card);
    }

    // Tokens player
    for(let i=0;i<4;i++){
        let tokenGeo = new THREE.CylinderGeometry(0.3,0.3,0.5,32);
        let tokenMat = new THREE.MeshStandardMaterial({color:i===0?0xff0000:0x0000ff});
        let token = new THREE.Mesh(tokenGeo, tokenMat);
        let angle = (i/4)*Math.PI*2;
        token.position.set(Math.cos(angle)*5,0.25,Math.sin(angle)*3);
        scene.add(token);
        tokens.push(token);
    }

    // Drag & drop
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();

    function onMouseDown(event){
        mouse.x = (event.clientX/window.innerWidth)*2-1;
        mouse.y = -(event.clientY/window.innerHeight)*2+1;
        raycaster.setFromCamera(mouse,camera);
        const intersects = raycaster.intersectObjects(cards);
        if(intersects.length>0) selectedCard=intersects[0].object;
    }
    function onMouseMove(event){
        if(selectedCard){
            mouse.x=(event.clientX/window.innerWidth)*2-1;
            mouse.y=-(event.clientY/window.innerHeight)*2+1;
            raycaster.setFromCamera(mouse,camera);
            let planeZ=new THREE.Plane(new THREE.Vector3(0,1,0),-0.2);
            let pos=new THREE.Vector3();
            raycaster.ray.intersectPlane(planeZ,pos);
            selectedCard.position.x = pos.x;
            selectedCard.position.z = pos.z;
        }
    }
    function onMouseUp(event){
        if(selectedCard){
            if(!isOffline) socket.emit('sendMove',{room:'room1',move:selectedCard.userData.index});
            selectedCard.position.y=0.2;
            selectedCard=null;
        }
    }
    window.addEventListener('mousedown',onMouseDown);
    window.addEventListener('mousemove',onMouseMove);
    window.addEventListener('mouseup',onMouseUp);

    if(!isOffline){
        socket.on('opponentMove',move=>{
            console.log("Đối phương đánh:",move);
        });
    }

    // Animate
    function animate(){
        requestAnimationFrame(animate);
        renderer.render(scene,camera);
    }
    animate();

    window.addEventListener('resize',()=>{
        camera.aspect=window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Menu functions
function showLogin(){ alert('Form đăng nhập/đăng ký'); }
function showFriends(){ alert('Danh sách bạn bè'); }
function startOffline(){ isOffline=true; initGame(); }
function startOnline(){ isOffline=false; initGame(); }
