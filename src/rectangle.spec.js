import Rectangle from './rectangle';

const p = (x, y) => ({ x, y });

describe('Rectangle', () => {
  it('inits', () => {
    const rectangle = new Rectangle(p(0, 50), p(100, 50), p(0, 500), p(100, 500));
    rectangle.p0.x = 0;
    rectangle.p0.y = 50;
    rectangle.p1.x = 100;
    rectangle.p1.x = 100;
    rectangle.p2.x = 0;
    rectangle.p2.y = 500;
    rectangle.p3.x = 100;
    rectangle.p3.y = 500;
  });

  describe('When splitting by X axis', () => {
    it('returns 2 rectangles', () => {
      const rectangle = new Rectangle(p(0, 50), p(100, 50), p(0, 500), p(100, 500));

      const rectangles = rectangle.splitX(0.5, 0.5);

      expect(rectangles.length).toBe(2);
    });

    it('returns a first rectangle', () => {
      const rectangle = new Rectangle(p(0, 50), p(100, 50), p(0, 500), p(100, 500));

      const rectangles = rectangle.splitX(0.5, 0.5);

      expect(rectangles[0].p0.x).toBe(0);
      expect(rectangles[0].p0.y).toBe(50);
      expect(rectangles[0].p1.x).toBe(49);
      expect(rectangles[0].p1.y).toBe(50);
      expect(rectangles[0].p2.x).toBe(0);
      expect(rectangles[0].p2.y).toBe(500);
      expect(rectangles[0].p3.x).toBe(49);
      expect(rectangles[0].p3.y).toBe(500);
    });

    it('returns a seconds rectangle', () => {
      const rectangle = new Rectangle(p(0, 50), p(100, 50), p(0, 500), p(100, 500));

      const rectangles = rectangle.splitX(0.5, 0.5);

      expect(rectangles[1].p0.x).toBe(50);
      expect(rectangles[1].p0.y).toBe(50);
      expect(rectangles[1].p1.x).toBe(100);
      expect(rectangles[1].p1.y).toBe(50);
      expect(rectangles[1].p2.x).toBe(50);
      expect(rectangles[1].p2.y).toBe(500);
      expect(rectangles[1].p3.x).toBe(100);
      expect(rectangles[1].p3.y).toBe(500);
    });
  });

  describe('When splitting by Y axis', () => {
    it('returns 2 rectangles', () => {
      const rectangle = new Rectangle(p(0, 50), p(100, 50), p(0, 500), p(100, 500));

      const rectangles = rectangle.splitY(0.5, 0.5);

      expect(rectangles.length).toBe(2);
    });

    it('returns a first rectangle', () => {
      const rectangle = new Rectangle(p(0, 50), p(100, 50), p(0, 500), p(100, 500));

      const rectangles = rectangle.splitY(0.5, 0.5);

      expect(rectangles[0].p0.x).toBe(0);
      expect(rectangles[0].p0.y).toBe(50);
      expect(rectangles[0].p1.x).toBe(100);
      expect(rectangles[0].p1.y).toBe(50);
      expect(rectangles[0].p2.x).toBe(0);
      expect(rectangles[0].p2.y).toBe(274);
      expect(rectangles[0].p3.x).toBe(100);
      expect(rectangles[0].p3.y).toBe(274);
    });

    it('returns a second rectangle', () => {
      const rectangle = new Rectangle(p(0, 50), p(100, 50), p(0, 500), p(100, 500));

      const rectangles = rectangle.splitY(0.5, 0.5);

      expect(rectangles[1].p0.x).toBe(0);
      expect(rectangles[1].p0.y).toBe(275);
      expect(rectangles[1].p1.x).toBe(100);
      expect(rectangles[1].p1.y).toBe(275);
      expect(rectangles[1].p2.x).toBe(0);
      expect(rectangles[1].p2.y).toBe(500);
      expect(rectangles[1].p3.x).toBe(100);
      expect(rectangles[1].p3.y).toBe(500);
    });
  });
});
