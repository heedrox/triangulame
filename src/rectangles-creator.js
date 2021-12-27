import Rectangle from "./rectangle";

const p = (x,y) => ({x,y});

export default class RectanglesCreator {
    constructor(width, height, randomIndexProvider = Math.random, randomOperationProvider = Math.random) {
        this.width = width;
        this.height = height;
        this.randomIndexProvider = randomIndexProvider;
        this.randomOperationProvider = randomOperationProvider;
    }

    build(numberElements) {
        const p0 = p(0, 0);
        const p1 = p(this.width, 0);
        const p2 = p(0, this.height);
        const p3 = p(this.width, this.height);
        const rectangle = new Rectangle(p0, p1, p2, p3);
        let rectangles = [ rectangle ];
        for (let i = 1; i < numberElements; i++) {
            const randomIndex = Math.floor(this.randomIndexProvider() * rectangles.length);
            const rectangle = rectangles[randomIndex];
            const newTwoRectangles = this.randomSplit(rectangle);
            rectangles.splice(randomIndex, 1, newTwoRectangles[0], newTwoRectangles[1]);
        }
        return rectangles;
    }

    randomSplit(rectangle) {
        const operation =Math.floor(this.randomOperationProvider() * 2);
        if (operation === 0) {
            return rectangle.splitX();
        } else {
            return rectangle.splitY();
        }
    }
};
