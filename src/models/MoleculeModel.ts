class MoleculeModel {
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
