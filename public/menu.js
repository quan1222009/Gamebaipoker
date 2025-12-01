let menu = document.getElementById('menu');
let gameContainer = document.getElementById('gameContainer');

function showLogin(){
    let modal = document.createElement('div');
    modal.className='modal';
    modal.style.display='flex';
    modal.innerHTML=`
        <h2>Đăng Nhập / Đăng Ký</h2>
        <input id="username" placeholder="Tên đăng nhập"/>
        <input id="password" placeholder="Mật khẩu" type="password"/>
        <button onclick="login()">Đăng Nhập</button>
        <button onclick="register()">Đăng Ký</button>
    `;
    document.body.appendChild(modal);
}

function login(){
    let username=document.getElementById('username').value;
    let password=document.getElementById('password').value;
    fetch('/login',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({username,password})
    }).then(r=>r.json()).then(data=>alert(data.message));
}

function register(){
    let username=document.getElementById('username').value;
    let password=document.getElementById('password').value;
    fetch('/register',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({username,password})
    }).then(r=>r.json()).then(data=>alert(data.message));
}

function showFriends(){ alert('Danh sách bạn bè'); }
function startOffline(){ menu.style.display='none'; gameContainer.style.display='block'; initGame(true); }
function startOnline(){ menu.style.display='none'; gameContainer.style.display='block'; initGame(false); }
