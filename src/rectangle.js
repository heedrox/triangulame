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
            new Rectangle(this.p0, p(intersectionX - 1, intersectionY), this.p2, p(intersection2X - 1, intersection2Y )),
            new Rectangle(p(intersectionX, intersectionY), this.p1, p(intersection2X, intersection2Y), this.p3)
        ];
    }

    splitY() {

    }
}