import { DirectionCell } from "./DirectionCell";
import { Cell } from "../Cell";


export class TurnRightCell extends DirectionCell {
    canAccept(fromCell: Cell | null): boolean {
        if (!super.canAccept(fromCell)) return false;
        return fromCell ? this.coordinate.findNeighbor(120 + this.model.rotation).equals(fromCell.coordinate) : true;
    }

}
