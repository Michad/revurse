import straightImg from '../../images/straight.png';
import { DirectionCell } from "./DirectionCell";
import { Cell } from "../Cell";
import Molecule from '../Molecule';


export class StraightCell extends DirectionCell {
    getImageUrl(): string {
        return straightImg;
    }

    canAccept(molecule: Molecule, fromCell: Cell | null): boolean {
        if (!super.canAccept(molecule, fromCell)) return false;
        return fromCell ? this.coordinate.findNeighbor(180 + this.model.rotation).equals(fromCell.coordinate) : true;
    }

}
