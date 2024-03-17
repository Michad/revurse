import { CellSlot } from "../constants/Enums";
import BaseModel from "./BaseModel";
import FormulaModel from "./FormulaModel";

class MoleculeModel implements BaseModel {
    cellIndex: GridIndex
    cellOffset: CellSlot
    transition: number
    formula: FormulaModel

    constructor() {

    }

    static new(cellIndex: GridIndex, cellOffset: CellSlot, transition: number, formula: FormulaModel) {
        let ret = new MoleculeModel();
        ret.cellOffset = cellOffset;
        ret.cellIndex = cellIndex;
        ret.transition = transition;
        ret.formula = formula;

        return ret;
    }

    static copy(obj : any) {
        let molecule = new MoleculeModel();
        Object.assign(molecule, obj);
        molecule.formula = FormulaModel.copy(obj.formula);

        return molecule;
    }
}

export default MoleculeModel;
