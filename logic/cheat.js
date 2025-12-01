function validMove(playerHand, tableCards, move){
    return true;
}

function botMove(playerHand, tableCards){
    return [playerHand[0]];
}

module.exports = { validMove, botMove };
