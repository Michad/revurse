import BaseModel from "./BaseModel";

class MoleculeModel implements BaseModel {
    cellIndex: GridIndex
    cellOffset: GridOffset
    transition: number
    formula: string

    constructor(cellIndex: GridIndex, cellOffset: GridOffset, transition: number, formula: string) {
        this.cellOffset = cellOffset;
        this.cellIndex = cellIndex;
        this.transition = transition;
        this.formula = formula;
    }
}

export default MoleculeModel;
