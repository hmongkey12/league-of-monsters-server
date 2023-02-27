const heroEntity = function (heroName) {
    this.heroName = heroName;
    this.xPos = 0;
    this.yPos = 0;
    this.width = 0;
    this.height = 0;
    this.isAttacking = false;
    this.isMoving = false;
    this.maxJumpHeight = 100;
    this.abilities = [];
    this.jumpStart = 0;
    this.isFalling = false;
    this.jumpEnd = 0;
    this.isJumping = false;
    this.health = 0;
    this.movingStart = 0;
    this.movingEnd = 0;
    this.facingDirection = "none";
    this.beforeJump = 0;
}
const abilityEntity = function (abilityName) {
    this.abilityName = abilityName;
    this.abilityStart = 0;
    this.abilityEnd = 0;
    this.cooldownEnd = 0;
    this.cooldownStart = 0;
    this.damage = 0;
    this.xPos = 0;
    this.yPos = 0;
    this.width = 0;
    this.height = 0;
}

module.exports = {
    abilityEntity, heroEntity
}

