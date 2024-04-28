import CellModel from "./CellModel";
import MoleculeModel from "./MoleculeModel";
import BaseModel from "./BaseModel";
import UniverseModel from "./UniverseModel";
import GridCoordinate from "../modelview/util/GridCoordinate";

export default class WorldModel implements BaseModel {
    _universe: UniverseModel
    cells: Array<CellModel | null>
    molecules: Array<MoleculeModel>

    constructor() {
        this.cells = [];
        this.molecules = [];
    }
    
    update(deltaT: number): void {
        this.cells.forEach((c) => c && c.update(deltaT));
        this.molecules.forEach((m) => m && m.update(deltaT));
    }

    findCell(gridCoord: GridCoordinate) : CellModel | null {
        return this.cells[gridCoord.toIndex()];
    }

    addCell(cell: CellModel) {
        this.cells[cell.coordinate.toIndex()] = cell;
        this._universe.onModelChange(cell);
    }

    removeCell(cell: CellModel) {
        this.cells[cell.coordinate.toIndex()] = null;
    }
    
    addMolecule(moleculeModel: MoleculeModel, force: boolean = false) : MoleculeModel | null {
        let c = this.findCell(moleculeModel.coordinate);
        if( c) {
            if (force || c.canAccept(moleculeModel, null)) {
                this.molecules.push(moleculeModel);
                this._universe.onModelChange(moleculeModel);
                c.onArrival(moleculeModel, null, force);

                return moleculeModel;
            } 
        }
        return null;
    }

    removeMolecule(molecule : MoleculeModel) {
        this.molecules.splice(this.molecules.indexOf(molecule), 1);
        this._universe.onModelRemove(molecule);
    }
}
