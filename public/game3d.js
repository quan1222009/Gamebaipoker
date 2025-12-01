const socket = io();
let scene, camera, renderer;
let cards = [], tokens = [], selectedCard = null;
let isOffline = true;
let gameContainer = document.getElementById('gameContainer');
let playerHand = [], botHands = [[],[],[]];
let currentPlayer = 0; // 0 = người chơi
let cardSize = {x:1, y:0.1, z:1.5};

// --- Init game ---
function initGame(offline){
    isOffline = offline;

    scene = new THREE.Scene();

    // Camera FPS góc nhìn thứ nhất
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 10); // cao ngang vai
    camera.lookAt(0,0,0);

    // Renderer
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    gameContainer.appendChild(renderer.domElement);

    // Light
    scene.add(new THREE.AmbientLight(0xffffff,0.7));
    let dirLight = new THREE.DirectionalLight(0xffffff,0.5);
    dirLight.position.set(10,15,10);
    scene.add(dirLight);

    // Bàn 3D block
    let tableGeo = new THREE.BoxGeometry(14,0.5,8);
    let tableMat = new THREE.MeshStandardMaterial({color:0x228B22});
    let table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y=0;
    scene.add(table);

    // Token player / bot
    createTokens();

    // Chia bài
    if(isOffline){
        dealOffline();
    }else{
        // online: sẽ join room
    }

    // Drag & drop
    setupDragDrop();

    // Animate
    animate();

    // Resize
    window.addEventListener('resize',()=>{
        camera.aspect=window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- Tạo token player/bot ---
function createTokens(){
    let colors = [0xff0000,0x0000ff,0x00ff00,0xffff00];
    for(let i=0;i<4;i++){
        let geo = new THREE.CylinderGeometry(0.3,0.3,0.5,16);
        let mat = new THREE.MeshStandardMaterial({color:colors[i]});
        let t = new THREE.Mesh(geo,mat);
        let angle = (i/4)*Math.PI*2;
        t.position.set(Math.cos(angle)*5,0.25,Math.sin(angle)*3);
        scene.add(t);
        tokens.push(t);
    }
}

// --- Offline: chia bài ---
function dealOffline(){
    let deck = [];
    for(let i=0;i<52;i++) deck.push(i);
    deck.sort(()=>Math.random()-0.5);

    playerHand = deck.slice(0,13);
    botHands[0] = deck.slice(13,26);
    botHands[1] = deck.slice(26,39);
    botHands[2] = deck.slice(39,52);

    // Hiển thị bài player
    for(let i=0;i<playerHand.length;i++){
        let geo = new THREE.BoxGeometry(cardSize.x,cardSize.y,cardSize.z);
        let mat = new THREE.MeshStandardMaterial({color:0xffffff});
        let card = new THREE.Mesh(geo,mat);
        card.position.set(-6 + i*1.2,0.2,3.5);
        card.userData = {index:playerHand[i]};
        scene.add(card);
        cards.push(card);
    }
}

// --- Drag & drop ---
function setupDragDrop(){
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();

    function onMouseDown(event){
        mouse.x = (event.clientX/window.innerWidth)*2-1;
        mouse.y = -(event.clientY/window.innerHeight)*2+1;
        raycaster.setFromCamera(mouse,camera);
        const intersects = raycaster.intersectObjects(cards);
        if(intersects.length>0) selectedCard = intersects[0].object;
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
            playCard(selectedCard);
            selectedCard.position.y = 0.2;
            selectedCard = null;
        }
    }

    window.addEventListener('mousedown',onMouseDown);
    window.addEventListener('mousemove',onMouseMove);
    window.addEventListener('mouseup',onMouseUp);
}

// --- Đánh bài player ---
function playCard(card){
    console.log("Player đánh:", card.userData.index);
    // remove khỏi scene
    scene.remove(card);
    cards = cards.filter(c=>c!==card);

    // Offline: bot đánh lượt
    if(isOffline){
        botTurn();
    }
}

// --- Bot đánh offline ---
function botTurn(){
    for(let b=0;b<botHands.length;b++){
        if(botHands[b].length>0){
            let card = botHands[b].shift();
            console.log(`Bot ${b+1} đánh:`,card);
            // hiển thị card trên bàn
            let geo = new THREE.BoxGeometry(cardSize.x,cardSize.y,cardSize.z);
            let mat = new THREE.MeshStandardMaterial({color:0xffcc00});
            let c3d = new THREE.Mesh(geo,mat);
            let angle = ((b+1)/4)*Math.PI*2;
            c3d.position.set(Math.cos(angle)*4,0.2,Math.sin(angle)*3);
            scene.add(c3d);
        }
    }
}

// --- Animate ---
function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
}
