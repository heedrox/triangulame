import Rectangle from '../rectangle/rectangle';
import defaultOperationProvider from '../../lib/random-provider/default-operation-provider';
import shuffleArray from '../../lib/shuffle-array';
import p from '../point/point';

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

const buildRandomArray = (n) => shuffleArray(Array(n).fill(null).map((a, b) => b + 1));

const assignRandomIds = (rectangles) => {
  const array = buildRandomArray(rectangles.length);
  rectangles.forEach((r, index) => r.setId(array[index]));
  return rectangles;
};

export default class RectanglesCreator {
  constructor (
    randomIndexProvider = Math.random,
    randomOperationProvider = defaultOperationProvider,
  ) {
    this.width = 100;
    this.height = 100;
    this.randomIndexProvider = randomIndexProvider;
    this.randomOperationProvider = randomOperationProvider;
  }

  build (numberElements) {
    const rectangles = [buildRectangle(0, 0, this.width, this.height)];
    for (let i = 1; i < numberElements; i += 1) {
      const { operation, index } = this.findPossibleOperationAndIndex(rectangles);
      const newTwoRectangles = rectangles[index].splitByOperation(operation);
      rectangles.splice(index, 1, newTwoRectangles[0], newTwoRectangles[1]);
    }
    return assignRandomIds(rectangles);
  }

  findPossibleOperationAndIndex (rectangles) {
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

  findIndexToSplit (rectangles, operation) {
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
