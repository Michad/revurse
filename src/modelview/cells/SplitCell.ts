import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import splitImg from '../../images/split.png';
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";
import { CellSlot } from "../../constants/Enums";


export class SplitCell extends StaticImageCell {
    nextIsLeft = true

    protected getImageUrl(): string {
        return splitImg;
    }

    findDestination(offset: CellSlot): GridCoordinate | CellSlot | null {
        if (offset === CellSlot.FORWARD_LEFT) return this.coordinate.findNeighbor(this.model.rotation - 60);
        if (offset === CellSlot.FORWARD_RIGHT) return this.coordinate.findNeighbor(this.model.rotation + 60);

        if (offset === CellSlot.CENTER) {
            let primary: CellSlot, fallback: CellSlot;
            if (this.nextIsLeft) {
                primary = CellSlot.FORWARD_LEFT;
                fallback = CellSlot.FORWARD_RIGHT;
            } else {
                primary = CellSlot.FORWARD_RIGHT;
                fallback = CellSlot.FORWARD_LEFT;
            }

            return this.molecules[primary] ? (this.molecules[fallback] ? null : fallback) : primary;
        }

        return this.molecules[CellSlot.CENTER] ? null : CellSlot.CENTER;
    }

    onSlotTransfer(fromSlot: CellSlot, toSlot: CellSlot): void {
        super.onSlotTransfer(fromSlot, toSlot);
        if (fromSlot === CellSlot.CENTER) this.nextIsLeft = !this.nextIsLeft;
    }

    canAccept(molecule: Molecule, fromCell: Cell | null): boolean {
        if (fromCell) {
            let slot = this.findSlotForNeighbor(fromCell?.coordinate);
            if (slot != null && this.molecules[slot.valueOf()]) return false;
            return fromCell ? this.coordinate.findNeighbor(180 + this.model.rotation).equals(fromCell.coordinate) : true;
        }
        return false;
    }
}

