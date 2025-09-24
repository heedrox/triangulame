import p from '../point/point';

/**
 *  p0 ------- p1
 *  |          |
 *  |          |
 *  p2 ------- p3
 */
const smallerDifference = (p0, p1, p2, p3) => {
  const differences = [];
  differences.push(Math.abs(p0.x - p1.x));
  differences.push(Math.abs(p2.x - p3.x));
  differences.push(Math.abs(p0.y - p2.y));
  differences.push(Math.abs(p1.y - p3.y));
  const nonZeroDifferences = differences.filter((d) => d !== 0);
  return Math.min(...nonZeroDifferences);
};

const equalPoints = (p0, p1) => (p0.x === p1.x) && (p0.y === p1.y);

export default class Rectangle {
  constructor (p0, p1, p2, p3) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.id = undefined;
  }

  splitByOperation (operation) {
    switch (operation) {
    case 'SPLITX':
      return this.splitX();
    case 'SPLITDLTR':
      return this.splitDLTR();
    case 'SPLITDRTL':
      return this.splitDRTL();
    case 'SPLITY':
      return this.splitY();
    default:
      throw new Error(`Unknown operation: ${operation}`);
    }
  }

  splitX () {
    const intersectionX = Math.ceil((this.p0.x + this.p1.x) / 2);
    const intersectionY = Math.ceil((this.p0.y + this.p1.y) / 2);
    const intersection2X = Math.ceil((this.p2.x + this.p3.x) / 2);
    const intersection2Y = Math.ceil((this.p2.y + this.p3.y) / 2);
    return [
      new Rectangle(
        this.p0,
        p(intersectionX - 1, intersectionY),
        this.p2,
        p(intersection2X - 1, intersection2Y),
      ),
      new Rectangle(
        p(intersectionX, intersectionY),
        this.p1,
        p(intersection2X, intersection2Y),
        this.p3,
      ),
    ];
  }

  splitY () {
    const intersectionX = Math.ceil((this.p0.x + this.p2.x) / 2);
    const intersectionY = Math.ceil((this.p0.y + this.p2.y) / 2);
    const intersection2X = Math.ceil((this.p1.x + this.p3.x) / 2);
    const intersection2Y = Math.ceil((this.p3.y + this.p1.y) / 2);

    return [
      new Rectangle(
        this.p0,
        this.p1,
        p(intersectionX, intersectionY - 1),
        p(intersection2X, intersection2Y - 1),
      ),
      new Rectangle(
        p(intersectionX, intersectionY),
        p(intersection2X, intersection2Y),
        this.p2,
        this.p3,
      ),
    ];
  }

  splitDLTR () {
    return [
      new Rectangle(
        this.p0,
        p(this.p0.x, this.p0.y),
        this.p2,
        p(this.p3.x, this.p3.y),
      ),
      new Rectangle(
        this.p0,
        this.p1,
        this.p3,
        this.p3,
      ),
    ];
  }

  splitDRTL () {
    return [
      new Rectangle(
        this.p0,
        this.p1,
        this.p2,
        this.p2,
      ),
      new Rectangle(
        this.p1,
        this.p1,
        this.p2,
        this.p3,
      ),
    ];
  }

  canBeSplit (operation) {
    switch (operation) {
    case 'SPLITX':
      return this.canBeSplitX();
    case 'SPLITY':
      return this.canBeSplitY();
    case 'SPLITDLTR':
    case 'SPLITDRTL':
      return this.canBeSplitDiagonally();
    default:
      return false;
    }
  }

  canBeSplitX () {
    return (this.p1.x - this.p0.x > 12) && (this.p3.x - this.p2.x > 12);
  }

  canBeSplitY () {
    return (this.p2.y - this.p0.y > 12) && (this.p3.y - this.p1.y > 12);
  }

  canBeSplitDiagonally () {
    if (!this.isSquare()) {
      return false;
    }
    const smallerDiff = smallerDifference(this.p0, this.p1, this.p2, this.p3);
    if (smallerDiff >= 12 && smallerDiff <= 24) {
      return true;
    }
    return false;
  }

  isSquare () {
    return (this.p1.x - this.p0.x === this.p3.x - this.p2.x)
      && (this.p2.y - this.p0.y === this.p3.y - this.p1.y)
      && (this.p1.x - this.p0.x === this.p2.y - this.p0.y);
  }

  setId (id) {
    this.id = id;
  }

  getType () {
    if (equalPoints(this.p0, this.p1) && !equalPoints(this.p1, this.p2)
      && !equalPoints(this.p2, this.p3)
      && (this.p0.x === this.p2.x)) {
      return 'TRIANGLE-LTR-B';
    }
    if (equalPoints(this.p0, this.p1) && !equalPoints(this.p1, this.p2)
      && !equalPoints(this.p2, this.p3)
      && (this.p1.x === this.p3.x)) {
      return 'TRIANGLE-RTL-B';
    }
    if (!equalPoints(this.p0, this.p1) && !equalPoints(this.p1, this.p2)
      && !equalPoints(this.p0, this.p2) && equalPoints(this.p2, this.p3)
      && (this.p3.x === this.p1.x)) {
      return 'TRIANGLE-LTR-T';
    }
    if (!equalPoints(this.p0, this.p1) && !equalPoints(this.p1, this.p2)
      && !equalPoints(this.p0, this.p2) && equalPoints(this.p2, this.p3)
      && (this.p3.x === this.p0.x)) {
      return 'TRIANGLE-RTL-T';
    }
    if (this.isSquare()) return 'SQUARE';

    return 'RECTANGLE';
  }
}
