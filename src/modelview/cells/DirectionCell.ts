import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";
import { CellSlot } from "../../constants/Enums";

export abstract class DirectionCell extends StaticImageCell {
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

    canAccept(molecule: Molecule, fromCell: Cell | null): boolean {
        if(fromCell) {
            let slot = this.findSlotForNeighbor(fromCell?.coordinate);
            return slot != null && !this.molecules[slot.valueOf()]
        }

        return false;
    }

    findDestination(offset: CellSlot): GridCoordinate | CellSlot | null {
        if(offset === CellSlot.FORWARD) return this.coordinate.findNeighbor(this.model.rotation);

        if(offset === CellSlot.CENTER) return this.molecules[CellSlot.FORWARD] ? null : CellSlot.FORWARD; 

        return this.molecules[CellSlot.CENTER] ? null : CellSlot.CENTER;
    }


}
