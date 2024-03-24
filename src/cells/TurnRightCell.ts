import { DirectionCell, DirectionCellModel } from "./DirectionCell";
import CellModel from "../models/CellModel";
import MoleculeModel from "../models/MoleculeModel";
import rightImg from '../images/slight_right.png';

export class TurnRightCellModel extends DirectionCellModel {
    canAccept(molecule: MoleculeModel, fromCell: CellModel | null): boolean {
        if (!super.canAccept(molecule, fromCell)) return false;
        return fromCell ? this.coordinate.findNeighbor(120 + this.rotation).equals(fromCell.coordinate) : true;
    }

}

export class TurnRightCell extends DirectionCell<TurnRightCellModel> {
    getImageUrl(): string {
        return rightImg;
    }

}
