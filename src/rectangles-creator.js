import Rectangle from './rectangle';

const OPERATIONS = ['SPLITX', 'SPLITY'];

const p = (x, y) => ({x, y});
const buildRectangle = (x, y, width, height) => {
    const p0 = p(x, y);
    const p1 = p(width, y);
    const p2 = p(x, height);
    const p3 = p(width, height);
    return new Rectangle(p0, p1, p2, p3);
};
const anAction = (operation, index) => ({operation, index});

export default class RectanglesCreator {
    constructor(
        randomIndexProvider = Math.random,
        randomOperationProvider = Math.random,
        randomSkewProvider = Math.random
    ) {
        this.width = 100;
        this.height = 100;
        this.randomIndexProvider = randomIndexProvider;
        this.randomOperationProvider = randomOperationProvider;
        this.randomSkewProvider = randomSkewProvider;
    }

    build(numberElements) {
        const rectangles = [buildRectangle(0, 0, this.width, this.height)];
        for (let i = 1; i < numberElements; i += 1) {
            const {operation, index} = this.findPossibleOperationAndIndex(rectangles);
            const skewOneSide = this.getSkew();
            const skewOtherSide = this.getSkew();
            const newTwoRectangles = operation === 'SPLITX' ? rectangles[index].splitX(skewOneSide, skewOtherSide) : rectangles[index].splitY(skewOneSide, skewOtherSide);
            rectangles.splice(index, 1, newTwoRectangles[0], newTwoRectangles[1]);
        }
        return rectangles;
    }

    findPossibleOperationAndIndex(rectangles) {
        const operation = OPERATIONS[Math.floor(this.randomOperationProvider() * 2)];
        try {
            const randomIndex = this.findIndexToSplit(rectangles, operation);
            return anAction(operation, randomIndex);
        } catch (error) {
            const newOperation = (operation === 'SPLITX') ? 'SPLITY' : 'SPLITX';
            const newIndex = this.findIndexToSplit(rectangles, newOperation);
            return anAction(newOperation, newIndex);
        }
    }

    findIndexToSplit(rectangles, operation) {
        let index = Math.floor(this.randomIndexProvider() * rectangles.length);
        let k = 0;
        while (rectangles[index].isTooSmall(operation)) {
            if (k++ >= 200) {
                throw new Error('too many times');
            }
            index = (index + 1) % rectangles.length;
        }
        return index;
    }

    getSkew() {
        const skew = this.randomSkewProvider();
        return skew <= 0.4 ? 0.4 :
               skew >= 0.6 ? 0.6 :
               skew;
    }
}
