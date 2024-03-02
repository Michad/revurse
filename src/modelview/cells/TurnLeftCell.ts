import { DirectionCell } from "./DirectionCell";
import { Cell } from "../Cell";


export class TurnLeftCell extends DirectionCell {
    canAccept(fromCell: Cell | null): boolean {
        if (!super.canAccept(fromCell)) return false;
        return fromCell ? this.coordinate.findNeighbor(240 + this.model.rotation).equals(fromCell.coordinate) : true;
    }

}
