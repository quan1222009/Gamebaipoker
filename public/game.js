let playerHand = [];
let botHand = [];
let tableCards = [];
let selectedCards = [];
let status = document.getElementById('status');
let table = document.getElementById('table-area');
let handContainer = document.getElementById('player-hand');

function initGame(){
    playerHand = generateDeck(13);
    botHand = generateDeck(13);
    tableCards = [];
    selectedCards = [];
    renderHand(playerHand);
    renderTable();
    status.innerText = "Vòng đầu: lượt bạn chơi";
}

function generateDeck(num){
    const suits = ['♠','♣','♥','♦'];
    const values = [3,4,5,6,7,8,9,10,11,12,13,1,2];
    let deck=[];
    for(let i=0;i<num;i++){
        deck.push({value: values[i%values.length], suit:suits[i%suits.length]});
    }
    return deck.sort(()=>Math.random()-0.5);
}

function renderHand(cards){
    handContainer.innerHTML='';
    cards.forEach((c,i)=>{
        let card = document.createElement('div');
        card.classList.add('card');
        card.innerText = c.value+c.suit;
        card.onclick = ()=> toggleSelectCard(i);
        card.draggable = true;
        card.ondragstart = e=> e.dataTransfer.setData("text/plain", i);
        handContainer.appendChild(card);
    });
    updateSelectionUI();
}

function renderTable(){
    table.innerHTML = '';
    tableCards.forEach(c=>{
        let div = document.createElement('div');
        div.classList.add('card');
        div.style.position='absolute';
        div.style.left = Math.random()* (table.offsetWidth-80)+'px';
        div.style.top = Math.random()* (table.offsetHeight-120)+'px';
        div.innerText = c.value+c.suit;
        table.appendChild(div);
    });
}

function toggleSelectCard(index){
    if(selectedCards.includes(index)) selectedCards = selectedCards.filter(i=>i!==index);
    else selectedCards.push(index);
    updateSelectionUI();
}

function updateSelectionUI(){
    document.querySelectorAll('#player-hand .card').forEach((card,i)=>{
        card.classList.toggle('selected', selectedCards.includes(i));
    });
}

function sortHand(){
    playerHand.sort((a,b)=>{
        if(a.value!==b.value) return a.value-b.value;
        return a.suit.localeCompare(b.suit);
    });
    renderHand(playerHand);
}

function playSelected(){
    if(selectedCards.length===0){ alert("Chọn bài để đánh!"); return;}
    let cardsToPlay = selectedCards.map(i=>playerHand[i]);
    tableCards.push(...cardsToPlay);
    playerHand = playerHand.filter((c,i)=>!selectedCards.includes(i));
    selectedCards=[];
    renderHand(playerHand);
    renderTable();
    status.innerText="Bạn đã đánh xong, lượt bot";
    setTimeout(botPlay,1000);
}

function passTurn(){
    status.innerText="Bạn bỏ lượt, lượt bot";
    setTimeout(botPlay,1000);
}

function botPlay(){
    if(botHand.length===0){ alert("Bạn thắng!"); return;}
    let card = botHand.shift();
    tableCards.push(card);
    renderTable();
    status.innerText="Bot đã đánh, lượt bạn";
    renderHand(playerHand);
}

initGame();

// Drag & Drop
table.ondragover = e=> e.preventDefault();
table.ondrop = e=>{
    e.preventDefault();
    let index = e.dataTransfer.getData("text/plain");
    if(index!==null){ selectedCards=[parseInt(index)]; playSelected(); }
      }
