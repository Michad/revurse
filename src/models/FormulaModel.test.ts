import FormulaModel from "./FormulaModel"

describe("FormulaModel", () => {
    it("constructs correctly", () => {
        let model = new FormulaModel()
        expect(model.components.length).toBe(0)


        model = FormulaModel.newUnary(1)
        expect(model.components.length).toBe(1)
        expect(model.components[0].atomicNumber).toBe(1)
        expect(model.components[0].count).toBe(1)
    })

    it("copy constructs correctly", () => {
        let raw = {
            "components": [
                {
                    "atomicNumber": 1,
                    "count": 7
                }
            ]
        }

        let model = FormulaModel.copy(raw);
        expect(model.components.length).toBe(raw.components.length);
        expect(model.components[0].atomicNumber).toBe(raw.components[0].atomicNumber);
        expect(model.components[0].count).toBe(raw.components[0].count);
        expect(model.components[0].toString).toBeDefined();
    })

    it("fuses unary correctly", () => {
        let a = FormulaModel.newUnary(1);
        let b = FormulaModel.newUnary(10);

        let c = FormulaModel.fuse(a, b);

        expect(a.components.length).toBe(1)
        expect(b.components.length).toBe(1)
        expect(c?.components.length).toBe(1)
        expect(a.components[0].atomicNumber).toBe(1)
        expect(b.components[0].atomicNumber).toBe(10)
        expect(c?.components[0].atomicNumber).toBe(11)
        expect(a.components[0].count).toBe(1)
        expect(b.components[0].count).toBe(1)
        expect(c?.components[0].count).toBe(1)
    })

    it("merges unary correctly", () => {
        let a = FormulaModel.newUnary(1);
        let b = FormulaModel.newUnary(10);

        let c = FormulaModel.merge(a, b);

        expect(a.components.length).toBe(1)
        expect(b.components.length).toBe(1)
        expect(c?.components.length).toBe(2)
        expect(a.components[0].atomicNumber).toBe(1)
        expect(b.components[0].atomicNumber).toBe(10)
        expect(Math.min(c?.components[0].atomicNumber, c?.components[1].atomicNumber)).toBe(1)
        expect(Math.max(c?.components[0].atomicNumber, c?.components[1].atomicNumber)).toBe(10)
        expect(a.components[0].count).toBe(1)
        expect(b.components[0].count).toBe(1)
        expect(c?.components[0].count).toBe(1)
        expect(c?.components[1].count).toBe(1)
    })

    it("won't fuse non-unary", () => {
        let a = FormulaModel.newUnary(1);
        let b = FormulaModel.newUnary(10);
        let ab = FormulaModel.merge(a, b);

        let c = FormulaModel.fuse(ab, ab);
        expect(c).toBeNull();
        c = FormulaModel.fuse(a, ab);
        expect(c).toBeNull();
        c = FormulaModel.fuse(ab, b);
        expect(c).toBeNull();
    })

    it("generates expected unary symbols", () => {
        let model = FormulaModel.newUnary(1);
        expect(model.toString()).toBe("A");

        model = FormulaModel.newUnary(10);
        expect(model.toString()).toBe("J");
    })

    it("generates expected non-unary symbols", () => {
        let a = FormulaModel.newUnary(1);
        let b = FormulaModel.newUnary(10);
        let ab = FormulaModel.merge(a, b);
        expect(ab.toString()).toBe("AJ")
        let aab = FormulaModel.merge(a, ab);

        expect(ab.toString()).toBe("AJ")
        expect(aab.toString()).toBe("A₂J")

        a.components[0].count = 20;
        expect(a.toString()).toBe("A₂₀")
    })
})