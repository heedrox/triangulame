const COMBO_SECS = 1.5;
const COMBO_MIN_LIMIT = 3;

class Combo {
  constructor() {
    this.lastGoalTime = null;
    this.goalTimes = [];
    this.lastGoalTime = new Date().getTime() / 1000;
  }

  checkCombo() {
    const gotTime = new Date().getTime() / 1000;
    if (gotTime - this.lastGoalTime <= COMBO_SECS) {
      this.goalTimes.push(1);
      if (this.goalTimes.length >= COMBO_MIN_LIMIT) {
        return this.goalTimes.length;
      }
    } else {
      this.goalTimes = [1];
      this.lastGoalTime = gotTime;
    }
    return 0;
  }
}

export default Combo;
