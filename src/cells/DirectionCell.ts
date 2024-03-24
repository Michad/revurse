import GridCoordinate from "../modelview/util/GridCoordinate";
import Molecule from "../modelview/Molecule";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../modelview/Cell";
import { CellSlot } from "../constants/Enums";
import CellModel from "../models/CellModel";
import MoleculeModel from "../models/MoleculeModel";

export abstract class DirectionCellModel extends CellModel {
    canAccept(molecule: MoleculeModel, fromCell: CellModel | null): boolean {
        if(fromCell) {
            let slot = this.findSlotForNeighbor(fromCell?.coordinate);
            return slot != null && !this._molecules[slot.valueOf()]
        }

        return false;
    }

    findDestination(offset: CellSlot): GridCoordinate | CellSlot | null {
        if(offset === CellSlot.FORWARD) return this.coordinate.findNeighbor(this.rotation);

        if(offset === CellSlot.CENTER) return this._molecules[CellSlot.FORWARD] ? null : CellSlot.FORWARD; 

        return this._molecules[CellSlot.CENTER] ? null : CellSlot.CENTER;
    }
}

export abstract class DirectionCell<T extends DirectionCellModel> extends StaticImageCell<T>  {
    constructor() {
        super();
    }

    getImageUrl(): string {
        return this.model.img!;
    }

    remove() {
        super.remove();
        this.molecules.forEach((m) => m?.remove());
    }


}
