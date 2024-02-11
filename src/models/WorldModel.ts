import CellModel from "./CellModel";
import MoleculeModel from "./MoleculeModel";
import BaseModel from "./BaseModel";

export default class WorldModel implements BaseModel {
    cells: Array<CellModel>
    molecules: Array<MoleculeModel>

    constructor(cells: Array<CellModel>, molecules: Array<MoleculeModel>) {
        this.cells = cells;
        this.molecules = molecules;
    }
}
