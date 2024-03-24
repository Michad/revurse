import GridCoordinate from "../modelview/util/GridCoordinate";
import Molecule from "../modelview/Molecule";
import splitImg from '../images/split.png';
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../modelview/Cell";
import { CellSlot } from "../constants/Enums";
import CellModel from "../models/CellModel";
import MoleculeModel from "../models/MoleculeModel";

export class SplitCellModel extends CellModel {
    nextIsLeft = true

    findDestination(offset: CellSlot): GridCoordinate | CellSlot | null {
        if (offset === CellSlot.FORWARD_LEFT) return this.coordinate.findNeighbor(this.rotation - 60);
        if (offset === CellSlot.FORWARD_RIGHT) return this.coordinate.findNeighbor(this.rotation + 60);

        if (offset === CellSlot.CENTER) {
            let primary: CellSlot, fallback: CellSlot;
            if (this.nextIsLeft) {
                primary = CellSlot.FORWARD_LEFT;
                fallback = CellSlot.FORWARD_RIGHT;
            } else {
                primary = CellSlot.FORWARD_RIGHT;
                fallback = CellSlot.FORWARD_LEFT;
            }

            return this._molecules[primary] ? (this._molecules[fallback] ? null : fallback) : primary;
        }

        return this._molecules[CellSlot.CENTER] ? null : CellSlot.CENTER;
    }

    onSlotTransfer(fromSlot: CellSlot, toSlot: CellSlot): void {
        super.onSlotTransfer(fromSlot, toSlot);
        if (fromSlot === CellSlot.CENTER) this.nextIsLeft = !this.nextIsLeft;
    }

    canAccept(molecule: MoleculeModel, fromCell: CellModel | null): boolean {
        if (fromCell) {
            let slot = this.findSlotForNeighbor(fromCell?.coordinate);
            if (slot != null && this._molecules[slot.valueOf()]) return false;
            return fromCell ? this.coordinate.findNeighbor(180 + this.rotation).equals(fromCell.coordinate) : true;
        }
        return false;
    }
}

export class SplitCell extends StaticImageCell<SplitCellModel> {

    protected getImageUrl(): string {
        return splitImg;
    }

}

