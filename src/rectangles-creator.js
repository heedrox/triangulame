import Rectangle from './rectangle';
import defaultOperationProvider from './random-provider/default-operation-provider';

const p = (x, y) => ({
  x,
  y,
});
const buildRectangle = (x, y, width, height) => {
  const p0 = p(x, y);
  const p1 = p(width, y);
  const p2 = p(x, height);
  const p3 = p(width, height);
  return new Rectangle(p0, p1, p2, p3);
};
const anAction = (operation, index) => ({
  operation,
  index,
});

const splitByOperation = (operation, rectangle) => {
  switch (operation) {
    case 'SPLITX':
      return rectangle.splitX();
    case 'SPLITDLTR':
      return rectangle.splitDLTR();
    case 'SPLITDRTL':
      return rectangle.splitDRTL();
    case 'SPLITY':
      return rectangle.splitY();
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
};
export default class RectanglesCreator {
  constructor(
    randomIndexProvider = Math.random,
    randomOperationProvider = defaultOperationProvider,
    randomSkewProvider = Math.random,
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
      const {
        operation,
        index,
      } = this.findPossibleOperationAndIndex(rectangles);
      const newTwoRectangles = splitByOperation(operation, rectangles[index]);
      rectangles.splice(index, 1, newTwoRectangles[0], newTwoRectangles[1]);
    }
    return rectangles;
  }

  findPossibleOperationAndIndex(rectangles) {
    let k = 0;
    while (k < 100) {
      try {
        const operation = this.randomOperationProvider();
        const randomIndex = this.findIndexToSplit(rectangles, operation);
        return anAction(operation, randomIndex);
      } catch (error) {
        k += 1;
      }
    }
    throw new Error('Could not find a valid operation');
  }

  findIndexToSplit(rectangles, operation) {
    let index = Math.floor(this.randomIndexProvider() * rectangles.length);
    let k = 0;
    while (!rectangles[index].canBeSplit(operation)) {
      if (k >= 200) {
        throw new Error('too many times');
      }
      k += 1;
      index = (index + 1) % rectangles.length;
    }
    return index;
  }
}
