import { DirectionCell } from "./DirectionCell";
import { Cell } from "../Cell";
import Molecule from "../Molecule";


export class TurnLeftCell extends DirectionCell {
    canAccept(molecule: Molecule, fromCell: Cell | null): boolean {
        if (!super.canAccept(molecule, fromCell)) return false;
        return fromCell ? this.coordinate.findNeighbor(240 + this.model.rotation).equals(fromCell.coordinate) : true;
    }

}
