import RectanglesCreator from './rectangles-creator';

describe('Rectangles Creator', () => {
  it('inits', () => {
    const builder = new RectanglesCreator(100, 200);
    expect(builder.width).toBe(100);
    expect(builder.height).toBe(200);
  });

  it('builds 1 rectangle', () => {
    const builder = new RectanglesCreator(100, 200);

    const rectangles = builder.build(1);

    expect(rectangles.length).toBe(1);
    expect(rectangles[0].p0.x).toBe(0);
    expect(rectangles[0].p0.y).toBe(0);
    expect(rectangles[0].p1.x).toBe(100);
    expect(rectangles[0].p1.y).toBe(0);
    expect(rectangles[0].p2.x).toBe(0);
    expect(rectangles[0].p2.y).toBe(200);
    expect(rectangles[0].p3.x).toBe(100);
    expect(rectangles[0].p3.y).toBe(200);
  });

  it('builds 2 rectangles', () => {
    const builder = new RectanglesCreator(100, 200);

    const rectangles = builder.build(2);

    expect(rectangles.length).toBe(2);
  });

  it('builds 3 rectangles', () => {
    const builder = new RectanglesCreator(100, 200);

    const rectangles = builder.build(3);

    expect(rectangles.length).toBe(3);
  });

  it('builds 4 rectangles', () => {
    const builder = new RectanglesCreator(100, 200);

    const rectangles = builder.build(4);

    expect(rectangles.length).toBe(4);
  });

  describe('splits randomly', () => {
    describe('horizontally', () => {
      it('case 1 - all first element', () => {
        const mockIndexRandom = jest.fn(() => 0);
        const mockOperationRandom = jest.fn(() => 0);
        const builder = new RectanglesCreator(100, 200, mockIndexRandom, mockOperationRandom);

        const rectangles = builder.build(4);

        expect(rectangles.length).toBe(4);
        expect(rectangles[0].p0.x).toBe(0);
        expect(rectangles[1].p0.x).toBe(12);
        expect(rectangles[2].p0.x).toBe(25);
        expect(rectangles[3].p0.x).toBe(50);
      });

      it('case 2 - all last element', () => {
        const mockIndexRandom = jest.fn(() => 0.999);
        const mockOperationRandom = jest.fn(() => 0);
        const builder = new RectanglesCreator(100, 200, mockIndexRandom, mockOperationRandom);

        const rectangles = builder.build(4);

        expect(rectangles.length).toBe(4);
        expect(rectangles[0].p0.x).toBe(0);
        expect(rectangles[1].p0.x).toBe(50);
        expect(rectangles[2].p0.x).toBe(75);
        expect(rectangles[3].p0.x).toBe(88);
      });
    });
    describe('vertically', () => {
      it('case 1 - all first elements', () => {
        const mockIndexRandom = jest.fn(() => 0);
        const mockOperationRandom = jest.fn(() => 0.9);
        const builder = new RectanglesCreator(100, 200, mockIndexRandom, mockOperationRandom);

        const rectangles = builder.build(4);

        expect(rectangles.length).toBe(4);
        expect(rectangles[0].p0.x).toBe(0);
        expect(rectangles[1].p0.x).toBe(0);
        expect(rectangles[2].p0.x).toBe(0);
        expect(rectangles[3].p0.x).toBe(0);
        expect(rectangles[0].p0.y).toBe(0);
        expect(rectangles[1].p0.y).toBe(25);
        expect(rectangles[2].p0.y).toBe(50);
        expect(rectangles[3].p0.y).toBe(100);
      });
    });
  });
});
