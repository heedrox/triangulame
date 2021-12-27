import TrianglesCreator from "./triangles-creator";

test('inits', () => {
    const builder = new TrianglesCreator(100, 200);
    expect(builder.width).toBe(100);
    expect(builder.height).toBe(200);
});