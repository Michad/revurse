import { X_COUNT, Y_COUNT } from "../../constants/Constants";
import GridCoordinate from "./GridCoordinate";

describe("GridCoordinate", () => {
    test('to index and back returns same result', () => {

        for (var x = 0; x < X_COUNT; x++) {
            for (var y = 0; y < Y_COUNT; y++) {
                let c1 = new GridCoordinate(x, y);
                let c2 = new GridCoordinate(c1.toIndex());
                if (c1.x !== c2.x || c1.y !== c2.y) {
                    expect(c1).toEqual(c2);
                }
            }
        }
    }

    )
}
)