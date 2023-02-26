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
        console.log("He is moving right dawg");
        gameState.connected.get(playerId).facingDirection = "right";
        if (gameState.connected.get(playerId).xPos < 3600) {
            gameState.connected.get(playerId).xPos += movementSpeed;
        } else {
            gameState.connected.get(playerId).xPos = 3600;
        }
        gameState.connected.get(playerId).isMoving = true;
        gameState.connected.get(playerId).movingStart = Date.now();
    } else if (args.includes("up") && !gameState.connected.get(playerId).isAttacking && !gameState.connected.get(playerId).isJumping){
        gameState.connected.get(playerId).beforeJump = gameState.connected.get(playerId).yPos;
        gameState.connected.get(playerId).isJumping = true;
        gameState.connected.get(playerId).jumpStart = Date.now();
    } else if (args.includes("down") && !gameState.connected.get(playerId).isAttacking) {
        gameState.connected.get(playerId).isMoving = true;
        gameState.connected.get(playerId).movingStart = Date.now();
    } else if (args.includes("skill_1")) {
        gameState.connected.get(playerId).isAttacking = true;
        gameState.connected.get(playerId).isMoving = false;
        gameState.connected.get(playerId).attackStart = Date.now();
    }
}

module.exports = {
    handleInput
}