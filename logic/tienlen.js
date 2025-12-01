// Logic game Tiến Lên + bot
function validMove(playerHand, tableCards, move){
    // Kiểm tra sảnh, đôi, chặt heo, triple...
    return true;
}

function botMove(playerHand, tableCards){
    return [playerHand[0]]; // đánh lá đầu prototype
}

module.exports = { validMove, botMove };
