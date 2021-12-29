import RectanglesCreator from './rectangles-creator';

const SPLIT_FIRST_RECTANGLE = jest.fn(() => 0);
const SPLIT_LAST_RECTANGLE = jest.fn(() => 0.9999);
const SPLIT_BY_X = jest.fn(() => 'SPLITX');
const SPLIT_BY_Y = jest.fn(() => 'SPLITY');

describe('Rectangles Creator', () => {
  it('inits', () => {
    const builder = new RectanglesCreator();
    expect(builder.width)
      .toBe(100);
    expect(builder.height)
      .toBe(100);
  });

  it('builds 1 rectangle', () => {
    const builder = new RectanglesCreator();

    const rectangles = builder.build(1);

    expect(rectangles.length)
      .toBe(1);
    expect(rectangles[0].p0.x)
      .toBe(0);
    expect(rectangles[0].p0.y)
      .toBe(0);
    expect(rectangles[0].p1.x)
      .toBe(100);
    expect(rectangles[0].p1.y)
      .toBe(0);
    expect(rectangles[0].p2.x)
      .toBe(0);
    expect(rectangles[0].p2.y)
      .toBe(100);
    expect(rectangles[0].p3.x)
      .toBe(100);
    expect(rectangles[0].p3.y)
      .toBe(100);
  });

  it('builds 2 rectangles', () => {
    const builder = new RectanglesCreator();

    const rectangles = builder.build(2);

    expect(rectangles.length)
      .toBe(2);
  });

  it('builds 3 rectangles', () => {
    const builder = new RectanglesCreator();

    const rectangles = builder.build(3);

    expect(rectangles.length)
      .toBe(3);
  });

  it('builds 4 rectangles', () => {
    const builder = new RectanglesCreator();

    const rectangles = builder.build(4);

    expect(rectangles.length)
      .toBe(4);
  });

  describe('splits randomly', () => {
    describe('horizontally', () => {
      it('case 1 - all first element', () => {
        const builder = new RectanglesCreator(
          SPLIT_FIRST_RECTANGLE,
          SPLIT_BY_X,
        );

        const rectangles = builder.build(4);

        expect(rectangles.length)
          .toBe(4);
        expect(rectangles[0].p0.x)
          .toBe(0);
        expect(rectangles[1].p0.x)
          .toBe(12);
        expect(rectangles[2].p0.x)
          .toBe(25);
        expect(rectangles[3].p0.x)
          .toBe(50);
      });

      it('case 2 - all last element', () => {
        const builder = new RectanglesCreator(SPLIT_LAST_RECTANGLE, SPLIT_BY_X);

        const rectangles = builder.build(4);

        expect(rectangles.length)
          .toBe(4);
        expect(rectangles[0].p0.x)
          .toBe(0);
        expect(rectangles[1].p0.x)
          .toBe(50);
        expect(rectangles[2].p0.x)
          .toBe(75);
        expect(rectangles[3].p0.x)
          .toBe(88);
      });
    });
    describe('vertically', () => {
      it('case 1 - all first elements', () => {
        const builder = new RectanglesCreator(
          SPLIT_FIRST_RECTANGLE,
          SPLIT_BY_Y,
        );

        const rectangles = builder.build(4);

        expect(rectangles.length)
          .toBe(4);
        expect(rectangles[0].p0.x)
          .toBe(0);
        expect(rectangles[1].p0.x)
          .toBe(0);
        expect(rectangles[2].p0.x)
          .toBe(0);
        expect(rectangles[3].p0.x)
          .toBe(0);
        expect(rectangles[0].p0.y)
          .toBe(0);
        expect(rectangles[0].p2.y)
          .toBe(11);
        expect(rectangles[1].p0.y)
          .toBe(12);
        expect(rectangles[1].p2.y)
          .toBe(24);
        expect(rectangles[2].p0.y)
          .toBe(25);
        expect(rectangles[2].p2.y)
          .toBe(49);
        expect(rectangles[3].p0.y)
          .toBe(50);
      });
    });

    describe('limits exist when splitting', () => {
      it('only splits rectangles greater than a 12% size', () => {
        const builder = new RectanglesCreator(
          SPLIT_FIRST_RECTANGLE,
          SPLIT_BY_X,
        );

        const rectangles = builder.build(5);
        // if we dont do  anything, this would be:
        // expect(rectangles[0].p1.x).toBe(5);
        // expect(rectangles[1].p1.x).toBe(11);
        // expect(rectangles[2].p1.x).toBe(24);

        // after changing
        expect(rectangles[0].p1.x).toBe(11);
        expect(rectangles[1].p1.x).toBe(24);
        expect(rectangles[2].p1.x).toBe(36);
      });
    });
  });
});
