const COMBO_SECS = 1.5;
const COMBO_MIN_LIMIT = 3;

class Combo {
  constructor() {
    this.goalTimes = [];
    const date = new Date();
    this.lastGoalTime = date.getTime() / 1000;
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
