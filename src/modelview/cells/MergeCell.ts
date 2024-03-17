import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";
import FormulaModel from "../../models/FormulaModel";
import MergeImage from "../../images/merge.png";
import { DirectionCell } from "./DirectionCell";
import { CellSlot } from "../../constants/Enums";


export class MergeCell extends DirectionCell {
    reservations: Array<CellSlot | null> = [];

    getImageUrl(): string {
        return MergeImage;
    }

    canAccept(molecule: Molecule, fromCell: Cell | null): boolean {
        if (!super.canAccept(molecule, fromCell)) return false;
        if(!fromCell) return true;
        let slot = this.findSlotForNeighbor(fromCell.coordinate)

        return slot === CellSlot.BACKWARD_LEFT || slot === CellSlot.BACKWARD_RIGHT;
    }

    onSlotTransfer(fromSlot: CellSlot, toSlot: CellSlot): void {
        super.onSlotTransfer(fromSlot, toSlot);

        if(toSlot === CellSlot.CENTER) {
            if(fromSlot === CellSlot.BACKWARD_LEFT && this.molecules[CellSlot.BACKWARD_RIGHT]) {
                this.reservations[toSlot] = CellSlot.BACKWARD_RIGHT
            } else if(fromSlot === CellSlot.BACKWARD_RIGHT && this.molecules[CellSlot.BACKWARD_LEFT]) {
                this.reservations[toSlot] = CellSlot.BACKWARD_LEFT
            } else {
                this.reservations[toSlot] = null;
            }
        } else {
            this.reservations[toSlot] = null;
        }
    }

    findDestination(offset: CellSlot): CellSlot | GridCoordinate | null {
        let rawResult = super.findDestination(offset);

        if(rawResult !== null && !(rawResult instanceof GridCoordinate)) {
            if(this.reservations[rawResult] == null) {
                this.reservations[rawResult] = offset;
                return rawResult;
            }
            if(this.reservations[rawResult] === offset) {
                return rawResult;
            }
            return null;
        }

        return rawResult;
    }
}
