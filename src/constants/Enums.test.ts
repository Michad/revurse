import { enumLookup, CellType, LayerType } from "./Enums"

describe("Enums", () => {
    test('function to enable reverse or forward lookup works with string enum', () => {
        expect(enumLookup(CellType, "grid")).toBe(CellType.GRID);
        expect(enumLookup(CellType, "GRID")).toBe(CellType.GRID);
    })

    //TODO
    // test('function to enable reverse or forward lookup works with number enum', () => {
    //     expect(enumLookup(LayerType, "GRID")).toBe(LayerType.GRID);
    //     expect(enumLookup(LayerType, 0)).toBe(LayerType.GRID);
    // })
})