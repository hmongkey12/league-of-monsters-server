const JUMP_CONSTANT = 10;
const MAX_JUMP_HEIGHT = 100;
const GROUND_Y_POSITION = 0;
const JUMPS_PER_SECOND = 2;
const doEntitiesCollide = (firstEntity, secondEntity) => {
    const firstEntityXposEnd = firstEntity.xPos + firstEntity.width;
    const secondEntityXposEnd = secondEntity.xPos + secondEntity.width;
    const firstEntityYposEnd = firstEntity.yPos + firstEntity.height;
    const secondEntityYposEnd = secondEntity.yPos + secondEntity.height;
    if (secondEntity.xPos > firstEntityXposEnd) {
        return false;
    } else if (secondEntityXposEnd < firstEntity.xPos) {
        return false;
    } else if (firstEntityYposEnd < secondEntity.yPos){
       return false;
    } else if (firstEntity.yPos > secondEntityYposEnd) {
        return false;
    } else {
        return true;
    }
}

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

const handleUpdates = (gameState, playerId) => {
    let attackStart = gameState.connected.get(playerId).attackStart;
    let jumpStart = gameState.connected.get(playerId).jumpStart;
    let jumpEnd = Date.now();
    let attackEnd = Date.now();
    let movingEnd = attackEnd;
    let movingStart = gameState.connected.get(playerId).movingStart;
    let elapsedAttackTime = Math.floor((attackEnd - attackStart) / 1000);
    let elapsedMovingTime = Math.floor((movingEnd - movingStart) / 1000);
    let elapsedJumpingTime = Math.floor((jumpEnd - jumpStart) / 1000);
    if (gameState.connected.get(playerId).isAttacking && elapsedAttackTime >= .5) {
        gameState.connected.get(playerId).isAttacking = false;
        gameState.connected.get(playerId).attackStart = 0;
        gameState.connected.get(playerId).attackEnd = 0;
    } else if (gameState.connected.get(playerId).isAttacking) {
        gameState.connected.forEach((heroEntity) => {
            if (heroEntity.id != playerId) {
                gameState.connected.get(playerId).abilities.forEach((ability) => {
                    if (doEntitiesCollide(heroEntity, ability)) {
                        heroEntity.health -= 1;
                    }
                })
            }
        })
    }
    if (gameState.connected.get(playerId).isMoving && elapsedMovingTime >= .5) {
        gameState.connected.get(playerId).isMoving = false;
        gameState.connected.get(playerId).movingStart = 0;
        gameState.connected.get(playerId).movingEnd = 0;
    }

    if (elapsedJumpingTime >= JUMPS_PER_SECOND) {
        if (gameState.connected.get(playerId).isJumping) {
            if (gameState.connected.get(playerId).yPos < MAX_JUMP_HEIGHT) {
                gameState.connected.get(playerId).yPos += JUMP_CONSTANT;
            } else {
                gameState.connected.get(playerId).isJumping = false;
                gameState.connected.get(playerId).isFalling = true;
            }
        } else if (gameState.connected.get(playerId).isFalling) {
            if (gameState.connected.get(playerId).yPos > GROUND_Y_POSITION) {
                gameState.connected.get(playerId).yPos -= JUMP_CONSTANT;
            } else {
                gameState.connected.get(playerId).yPos = GROUND_Y_POSITION;
                gameState.connected.get(playerId).isFalling = false;
            }
        }
    }
}



module.exports = {
    handleInput, handleUpdates
}
