const { abilityEntity } = require("./entities")
const loadPumpkinAbilities = function () {
   const abilityList = [];
   const ability1 = new abilityEntity("pumpkin_1");
   const ability2 = new abilityEntity("pumpkin_2");
   ability1.cooldownEnd = 4;
   ability1.damage = 10;
   ability1.width = 10;
   ability1.height = 20;
   abilityList.push(ability1);
   ability2.cooldownEnd = 10;
   ability2.damage = 50;
   ability2.width = 30;
   ability2.height = 10;
   abilityList.push(ability2);
   return abilityList;
}

const loadReaperAbilities = function () {
    const abilityList = [];
    const ability1 = new abilityEntity("reaper_1");
    const ability2 = new abilityEntity("reaper_2");
    ability1.cooldownEnd = 4;
    ability1.damage = 10;
    ability1.width = 10;
    ability1.height = 20;
    abilityList.push(ability1);
    ability2.cooldownEnd = 10;
    ability2.damage = 50;
    ability2.width = 30;
    ability2.height = 10;
    abilityList.push(ability2);
    return abilityList;
}

module.exports = {
    loadPumpkinAbilities, loadReaperAbilities
}