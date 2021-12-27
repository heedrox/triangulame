import RectanglesCreator from "./rectangles-creator";

describe('Rectangles Creator', () => {
    it('should exist', () => {
       new RectanglesCreator(100, 200);
       expect(RectanglesCreator).toBeDefined();
    });
});
