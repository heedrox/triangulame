/**
 *  p0 ------- p1
 *  |          |
 *  |          |
 *  p2 ------- p3
 */
const p = (x, y) => ({ x, y });

export default class Rectangle {
  constructor(p0, p1, p2, p3) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
  }

  splitX() {
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

  splitY() {
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

  isTooSmall(operation) {
    return operation === 'SPLITX' ? this.isTooSmallX() : this.isTooSmallY();
  }

  isTooSmallX() {
    return (this.p1.x - this.p0.x <= 12) || (this.p3.x - this.p2.x <= 12);
  }

  isTooSmallY() {
    return (this.p2.y - this.p0.y <= 12) || (this.p3.y - this.p1.y <= 12);
  }
}
