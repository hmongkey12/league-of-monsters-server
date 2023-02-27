const handleInput = (gameState, playerId, args) => {
    const movementSpeed = 5;
    if (args.includes("left") && !gameState.connected.get(playerId).isAttacking) {
        gameState.connected.get(playerId).facingDirection = "left";
        if (gameState.connected.get(playerId).xPos > 0) {
            gameState.connected.get(playerId).xPos -= movementSpeed;
        } else {
            gameState.connected.get(playerId).xPos = 0;
        }
        gameState.connected.get(playerId).isMoving = true;
        gameState.connected.get(playerId).movingStart = Date.now();
    } else if (args.includes("right") && !gameState.connected.get(playerId).isAttacking) {
        gameState.connected.get(playerId).facingDirection = "right";
        if (gameState.connected.get(playerId).xPos < 3600) {
            gameState.connected.get(playerId).xPos += movementSpeed;
        } else {
            gameState.connected.get(playerId).xPos = 3600;
        }
        gameState.connected.get(playerId).isMoving = true;
        gameState.connected.get(playerId).movingStart = Date.now();
    } else if (args.includes("up") && !gameState.connected.get(playerId).isAttacking && !gameState.connected.get(playerId).isJumping && !gameState.connected.get(playerId).isFalling){
        gameState.connected.get(playerId).beforeJump = gameState.connected.get(playerId).yPos;
        gameState.connected.get(playerId).isJumping = true;
    } else if (args.includes("down") && !gameState.connected.get(playerId).isAttacking) {
        gameState.connected.get(playerId).isMoving = true;
        gameState.connected.get(playerId).movingStart = Date.now();
    } else if (args.includes("skill_1")) {
        gameState.connected.get(playerId).isAttacking = true;
        gameState.connected.get(playerId).isMoving = false;
        gameState.connected.get(playerId).abilities[0].yPos = gameState.connected.get(playerId).yPos;
        if (gameState.connected.get(playerId).facingDirection == "left") {
            gameState.connected.get(playerId).abilities[0].xPos = gameState.connected.get(playerId).xPos - 200;
        } else if (gameState.connected.get(playerId).facingDirection == "right") {
            gameState.connected.get(playerId).abilities[0].xPos = gameState.connected.get(playerId).xPos + 200;
        }
        gameState.connected.get(playerId).attackStart = Date.now();
    }
}

module.exports = {
    handleInput
}
