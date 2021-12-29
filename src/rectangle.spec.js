import Rectangle from './rectangle';

const p = (x, y) => ({
  x,
  y,
});

describe('Rectangle', () => {
  it('inits', () => {
    const rectangle = new Rectangle(
      p(0, 50),
      p(100, 50),
      p(0, 500),
      p(100, 500),
    );
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
      const rectangle = new Rectangle(
        p(0, 50),
        p(100, 50),
        p(0, 500),
        p(100, 500),
      );

      const rectangles = rectangle.splitX();

      expect(rectangles.length)
        .toBe(2);
    });

    it('returns a first rectangle', () => {
      const rectangle = new Rectangle(
        p(0, 50),
        p(100, 50),
        p(0, 500),
        p(100, 500),
      );

      const rectangles = rectangle.splitX();

      expect(rectangles[0].p0.x)
        .toBe(0);
      expect(rectangles[0].p0.y)
        .toBe(50);
      expect(rectangles[0].p1.x)
        .toBe(49);
      expect(rectangles[0].p1.y)
        .toBe(50);
      expect(rectangles[0].p2.x)
        .toBe(0);
      expect(rectangles[0].p2.y)
        .toBe(500);
      expect(rectangles[0].p3.x)
        .toBe(49);
      expect(rectangles[0].p3.y)
        .toBe(500);
    });

    it('returns a seconds rectangle', () => {
      const rectangle = new Rectangle(
        p(0, 50),
        p(100, 50),
        p(0, 500),
        p(100, 500),
      );

      const rectangles = rectangle.splitX();

      expect(rectangles[1].p0.x)
        .toBe(50);
      expect(rectangles[1].p0.y)
        .toBe(50);
      expect(rectangles[1].p1.x)
        .toBe(100);
      expect(rectangles[1].p1.y)
        .toBe(50);
      expect(rectangles[1].p2.x)
        .toBe(50);
      expect(rectangles[1].p2.y)
        .toBe(500);
      expect(rectangles[1].p3.x)
        .toBe(100);
      expect(rectangles[1].p3.y)
        .toBe(500);
    });
  });

  describe('When splitting by Y axis', () => {
    it('returns 2 rectangles', () => {
      const rectangle = new Rectangle(
        p(0, 50),
        p(100, 50),
        p(0, 500),
        p(100, 500),
      );

      const rectangles = rectangle.splitY();

      expect(rectangles.length)
        .toBe(2);
    });

    it('returns a first rectangle', () => {
      const rectangle = new Rectangle(
        p(0, 50),
        p(100, 50),
        p(0, 500),
        p(100, 500),
      );

      const rectangles = rectangle.splitY();

      expect(rectangles[0].p0.x)
        .toBe(0);
      expect(rectangles[0].p0.y)
        .toBe(50);
      expect(rectangles[0].p1.x)
        .toBe(100);
      expect(rectangles[0].p1.y)
        .toBe(50);
      expect(rectangles[0].p2.x)
        .toBe(0);
      expect(rectangles[0].p2.y)
        .toBe(274);
      expect(rectangles[0].p3.x)
        .toBe(100);
      expect(rectangles[0].p3.y)
        .toBe(274);
    });

    it('returns a second rectangle', () => {
      const rectangle = new Rectangle(
        p(0, 50),
        p(100, 50),
        p(0, 500),
        p(100, 500),
      );

      const rectangles = rectangle.splitY();

      expect(rectangles[1].p0.x)
        .toBe(0);
      expect(rectangles[1].p0.y)
        .toBe(275);
      expect(rectangles[1].p1.x)
        .toBe(100);
      expect(rectangles[1].p1.y)
        .toBe(275);
      expect(rectangles[1].p2.x)
        .toBe(0);
      expect(rectangles[1].p2.y)
        .toBe(500);
      expect(rectangles[1].p3.x)
        .toBe(100);
      expect(rectangles[1].p3.y)
        .toBe(500);
    });
  });

  describe('when splitting Diagonally Left To Right', () => {
    it('returns two rectangles splitted', () => {
      const rectangle = new Rectangle(
        p(0, 0),
        p(100, 0),
        p(0, 100),
        p(100, 100),
      );

      const rectangles = rectangle.splitDLTR(0);

      expect(rectangles[0].p0.x)
        .toBe(0);
      expect(rectangles[0].p0.y)
        .toBe(0);
      expect(rectangles[0].p1.x)
        .toBe(0);
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

      expect(rectangles[1].p0.x)
        .toBe(0);
      expect(rectangles[1].p0.y)
        .toBe(0);
      expect(rectangles[1].p1.x)
        .toBe(100);
      expect(rectangles[1].p1.y)
        .toBe(0);
      expect(rectangles[1].p2.x)
        .toBe(100);
      expect(rectangles[1].p2.y)
        .toBe(100);
      expect(rectangles[1].p3.x)
        .toBe(100);
      expect(rectangles[1].p3.y)
        .toBe(100);
    });
  });

  describe('there are limits when being splitted', () => {
    describe('when splitting by X', () => {
      it('can be split if size is greater than 12', () => {
        const rectangle = new Rectangle(
          p(0, 0),
          p(100, 0),
          p(0, 100),
          p(100, 100),
        );

        const canBeSplit = rectangle.canBeSplit('SPLITX');

        expect(canBeSplit)
          .toBe(true);
      });

      it('cannot be split if any size is lower than 12', () => {
        const rectangle = new Rectangle(
          p(0, 0),
          p(11, 0),
          p(0, 100),
          p(100, 100),
        );

        const canBeSplit = rectangle.canBeSplit('SPLITX');

        expect(canBeSplit)
          .toBe(false);
      });
    });
    describe('when splitting by Y', () => {
      it('can be split if size is greater than 12', () => {
        const rectangle = new Rectangle(
          p(0, 0),
          p(100, 0),
          p(0, 100),
          p(100, 100),
        );

        const canBeSplit = rectangle.canBeSplit('SPLITY');

        expect(canBeSplit)
          .toBe(true);
      });

      it('cannot be split if any size is lower than 12', () => {
        const rectangle = new Rectangle(
          p(0, 0),
          p(100, 0),
          p(0, 11),
          p(100, 11),
        );

        const canBeSplit = rectangle.canBeSplit('SPLITY');

        expect(canBeSplit)
          .toBe(false);
      });
    });
    describe('when splitting by diagonnaly', () => {
      it('can be split if size less than or equal to 24', () => {
        const rectangle = new Rectangle(
          p(0, 0),
          p(24, 0),
          p(0, 24),
          p(24, 24),
        );

        const canBeSplit = rectangle.canBeSplit('SPLITDLTR');

        expect(rectangle.isSquare()).toBe(true);
        expect(canBeSplit)
          .toBe(true);
      });
      it('cannot be split if it is a triangle in Left To Right', () => {
        const rectangle = new Rectangle(
          p(0, 0),
          p(0, 0),
          p(0, 100),
          p(100, 100),
        );

        const canBeSplit = rectangle.canBeSplit('SPLITDLTR');

        expect(canBeSplit)
          .toBe(false);
      });

      it('cannot be split if it is a triangle in Right to Left', () => {
        const rectangle = new Rectangle(
          p(0, 0),
          p(0, 0),
          p(0, 100),
          p(100, 100),
        );

        const canBeSplit = rectangle.canBeSplit('SPLITDRTL');

        expect(canBeSplit)
          .toBe(false);
      });
    });
  });

  it('ids can be set', () => {
    const rectangle = new Rectangle(null, null, null, null);

    rectangle.setId(100);

    expect(rectangle.id).toBe(100);
  });

  describe('getType', () => {
    it.each`
      p0                | p1                 | p2                 | p3                  | expected
      ${p(0, 0)}   | ${p(0, 0)}    | ${p(0, 100)}   | ${p(100, 0)}   | ${'TRIANGLE-LTR-B'}
      ${p(0, 0)}   | ${p(100, 0)}  | ${p(100, 100)} | ${p(100, 100)} | ${'TRIANGLE-LTR-T'}
      ${p(0, 0)}   | ${p(1000, 0)} | ${p(0, 100)}   | ${p(0, 100)}   | ${'TRIANGLE-RTL-T'}
      ${p(100, 0)} | ${p(100, 0)}  | ${p(0, 100)}   | ${p(100, 100)} | ${'TRIANGLE-RTL-B'}
      ${p(0, 0)}   | ${p(100, 0)}  | ${p(0, 100)}   | ${p(100, 100)} | ${'SQUARE'}
      ${p(0, 0)}   | ${p(50, 0)}   | ${p(0, 100)}   | ${p(100, 100)} | ${'RECTANGLE'}
    `('tells whether is $expected', ({
      p0, p1, p2, p3, expected,
    }) => {
      const rectangle = new Rectangle(p0, p1, p2, p3);

      const type = rectangle.getType();

      expect(type).toBe(expected);
    });
  });
});
