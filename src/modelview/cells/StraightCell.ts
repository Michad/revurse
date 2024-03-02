import straightImg from '../../images/straight.png';
import { DirectionCell } from "./DirectionCell";
import { Cell } from "../Cell";


export class StraightCell extends DirectionCell {
    getImageUrl(): string {
        return straightImg;
    }

    canAccept(fromCell: Cell | null): boolean {
        if (!super.canAccept(fromCell)) return false;
        return fromCell ? this.coordinate.findNeighbor(180 + this.model.rotation).equals(fromCell.coordinate) : true;
    }

}
