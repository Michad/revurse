import CellModel from "./CellModel";
import MoleculeModel from "./MoleculeModel";
import BaseModel from "./BaseModel";

export default class WorldModel implements BaseModel {
    cells: Array<CellModel>
    molecules: Array<MoleculeModel>

    constructor() {
        this.cells = [];
        this.molecules = [];
    }

    static new(cells: Array<CellModel>, molecules: Array<MoleculeModel>) {
        let world = new WorldModel();

        world.cells = cells;
        world.molecules = molecules;

        return world;
    }

    static copy(obj : any) {
        let world = new WorldModel();
        Object.assign(world, obj);
        world.cells = (obj.cells as Array<any> ).map(c => CellModel.copy(c))
        world.molecules = (obj.molecules as Array<any> ).map(c => MoleculeModel.copy(c))

        return world;
    }
}
