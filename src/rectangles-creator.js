import Rectangle from './rectangle';

const p = (x, y) => ({ x, y });

export default class RectanglesCreator {
  constructor(
    randomIndexProvider = Math.random,
    randomOperationProvider = Math.random,
  ) {
    this.width = 100;
    this.height = 100;
    this.randomIndexProvider = randomIndexProvider;
    this.randomOperationProvider = randomOperationProvider;
  }

  build(numberElements) {
    const p0 = p(0, 0);
    const p1 = p(this.width, 0);
    const p2 = p(0, this.height);
    const p3 = p(this.width, this.height);
    const rectangles = [new Rectangle(p0, p1, p2, p3)];
    for (let i = 1; i < numberElements; i += 1) {
      const randomIndex = Math.floor(this.randomIndexProvider() * rectangles.length);
      const selectedRectangle = rectangles[randomIndex];
      const newTwoRectangles = this.randomSplit(selectedRectangle);
      rectangles.splice(randomIndex, 1, newTwoRectangles[0], newTwoRectangles[1]);
    }
    return rectangles;
  }

  randomSplit(rectangle) {
    const operation = Math.floor(this.randomOperationProvider() * 2);
    if (operation === 0) {
      return rectangle.splitX();
    }
    return rectangle.splitY();
  }
}
