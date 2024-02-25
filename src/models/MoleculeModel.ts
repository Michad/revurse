import BaseModel from "./BaseModel";

class MoleculeModel implements BaseModel {
    cellIndex: GridIndex
    cellOffset: GridOffset
    transition: number
    formula: string

    constructor() {

    }

    static new(cellIndex: GridIndex, cellOffset: GridOffset, transition: number, formula: string) {
        let ret = new MoleculeModel();
        ret.cellOffset = cellOffset;
        ret.cellIndex = cellIndex;
        ret.transition = transition;
        ret.formula = formula;

        return ret;
    }
}

export default MoleculeModel;
