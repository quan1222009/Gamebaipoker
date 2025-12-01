// Logic game Sâm + bot thông minh
function validMove(playerHand, tableCards, move){
    // Kiểm tra combo hợp lệ: sảnh, đôi, ba, tứ quý, chặt heo
    // Ví dụ prototype: luôn true
    return true;
}

function botMove(playerHand, tableCards){
    // Bot đánh bài thông minh: chọn lá nhỏ nhất hoặc combo mạnh
    return [playerHand[0]]; // prototype đánh lá đầu
}

module.exports = { validMove, botMove };
