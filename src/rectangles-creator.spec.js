import RectanglesCreator from './rectangles-creator';

const SPLIT_FIRST_RECTANGLE = jest.fn(() => 0);
const SPLIT_LAST_RECTANGLE = jest.fn(() => 0.9999);
const SPLIT_BY_X = jest.fn(() => 0);
const SPLIT_BY_Y = jest.fn(() => 0.99);
const SPLIT_EXACTLY_HALF = jest.fn(() => 0.5);

describe('Rectangles Creator', () => {
  it('inits', () => {
    const builder = new RectanglesCreator();
    expect(builder.width).toBe(100);
    expect(builder.height).toBe(100);
  });

  it('builds 1 rectangle', () => {
    const builder = new RectanglesCreator();

    const rectangles = builder.build(1);

    expect(rectangles.length).toBe(1);
    expect(rectangles[0].p0.x).toBe(0);
    expect(rectangles[0].p0.y).toBe(0);
    expect(rectangles[0].p1.x).toBe(100);
    expect(rectangles[0].p1.y).toBe(0);
    expect(rectangles[0].p2.x).toBe(0);
    expect(rectangles[0].p2.y).toBe(100);
    expect(rectangles[0].p3.x).toBe(100);
    expect(rectangles[0].p3.y).toBe(100);
  });

  it('builds 2 rectangles', () => {
    const builder = new RectanglesCreator();

    const rectangles = builder.build(2);

    expect(rectangles.length).toBe(2);
  });

  it('builds 3 rectangles', () => {
    const builder = new RectanglesCreator();

    const rectangles = builder.build(3);

    expect(rectangles.length).toBe(3);
  });

  it('builds 4 rectangles', () => {
    const builder = new RectanglesCreator();

    const rectangles = builder.build(4);

    expect(rectangles.length).toBe(4);
  });

  describe('splits randomly', () => {
    describe('horizontally', () => {
      it('case 1 - all first element', () => {
        const builder = new RectanglesCreator(SPLIT_FIRST_RECTANGLE, SPLIT_BY_X, SPLIT_EXACTLY_HALF);

        const rectangles = builder.build(4);

        expect(rectangles.length).toBe(4);
        expect(rectangles[0].p0.x).toBe(0);
        expect(rectangles[1].p0.x).toBe(12);
        expect(rectangles[2].p0.x).toBe(25);
        expect(rectangles[3].p0.x).toBe(50);
      });

      it('case 2 - all last element', () => {
        const builder = new RectanglesCreator(SPLIT_LAST_RECTANGLE, SPLIT_BY_X, SPLIT_EXACTLY_HALF);

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
        const builder = new RectanglesCreator(SPLIT_FIRST_RECTANGLE, SPLIT_BY_Y, SPLIT_EXACTLY_HALF);

        const rectangles = builder.build(4);

        expect(rectangles.length).toBe(4);
        expect(rectangles[0].p0.x).toBe(0);
        expect(rectangles[1].p0.x).toBe(0);
        expect(rectangles[2].p0.x).toBe(0);
        expect(rectangles[3].p0.x).toBe(0);
        expect(rectangles[0].p0.y).toBe(0);
        expect(rectangles[0].p2.y).toBe(11);
        expect(rectangles[1].p0.y).toBe(12);
        expect(rectangles[1].p2.y).toBe(24);
        expect(rectangles[2].p0.y).toBe(25);
        expect(rectangles[2].p2.y).toBe(49);
        expect(rectangles[3].p0.y).toBe(50);
      });
    });
    describe('limits exist when splitting', () => {
      it('only splits rectangles greater than a 12% size', () => {
        const builder = new RectanglesCreator(SPLIT_FIRST_RECTANGLE, SPLIT_BY_X, SPLIT_EXACTLY_HALF);

        const rectangles = builder.build(5);
        //if we dont do  anything, this would be:
        // expect(rectangles[0].p1.x).toBe(5);
        // expect(rectangles[1].p1.x).toBe(11);
        // expect(rectangles[2].p1.x).toBe(24);

        //after changing
        expect(rectangles[0].p1.x).toBe(11);
        expect(rectangles[1].p1.x).toBe(24);
        expect(rectangles[2].p1.x).toBe(36);

      });
    });

    describe('skews rectangles a bit', () => {
      it('does not split exactly by half, but with some pixels more or less', () => {
        const splitBy40 = jest.fn(() => 0.4);
        const builder = new RectanglesCreator(SPLIT_LAST_RECTANGLE, SPLIT_BY_X, splitBy40);

        const rectangles = builder.build(3);

        expect(rectangles[0].p0.x).toBe(0);
        expect(rectangles[1].p0.x).toBe(40);
        expect(rectangles[2].p0.x).toBe(64);
      });

      it('skews different in up and down', () => {
        const splitFirst40Then60 = jest.fn().mockReturnValueOnce(0.4).mockReturnValueOnce(0.6);
        const builder = new RectanglesCreator(SPLIT_LAST_RECTANGLE, SPLIT_BY_X, splitFirst40Then60);

        const rectangles = builder.build(2);

        expect(rectangles[0].p0.x).toBe(0);
        expect(rectangles[1].p0.x).toBe(40);
        expect(rectangles[0].p3.x).toBe(59);
        expect(rectangles[1].p2.x).toBe(60);
      });

      it('does not skew more than 40%', () => {
        const splitBy30 = jest.fn(() => 0.3);
        const builder = new RectanglesCreator(SPLIT_LAST_RECTANGLE, SPLIT_BY_X, splitBy30);

        const rectangles = builder.build(2);

        expect(rectangles[0].p0.x).toBe(0);
        expect(rectangles[1].p0.x).toBe(40);
      });

      it('does not skew more than 60%', () => {
        const splitBy70 = jest.fn(() => 0.7);
        const builder = new RectanglesCreator(SPLIT_LAST_RECTANGLE, SPLIT_BY_X, splitBy70);

        const rectangles = builder.build(2);

        expect(rectangles[0].p0.x).toBe(0);
        expect(rectangles[1].p0.x).toBe(60);
      });
    });



  });
});
