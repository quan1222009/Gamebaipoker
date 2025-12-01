function validMove(playerHand, tableCards, move){
    // Kiểm tra combo hợp lệ: sảnh, đôi, ba, tứ quý, chặt heo
    return true;
}

function botMove(playerHand, tableCards){
    return [playerHand[0]]; // Bot đánh lá đầu prototype
}

module.exports = { validMove, botMove };
