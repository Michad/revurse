import BaseModel from "./BaseModel";

class MoleculeModel implements BaseModel {
    cellIndex: number
    transition: number
    formula: string

    constructor(cellIndex: number, transition: number, formula: string) {
        this.cellIndex = cellIndex;
        this.transition = transition;
        this.formula = formula;
    }
}

export default MoleculeModel;
