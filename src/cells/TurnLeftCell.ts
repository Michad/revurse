import { DirectionCell, DirectionCellModel } from "./DirectionCell";
import { Cell } from "../modelview/Cell";
import Molecule from "../modelview/Molecule";
import CellModel from "../models/CellModel";
import MoleculeModel from "../models/MoleculeModel";
import leftImg from '../images/slight_left.png';

export class TurnLeftCellModel extends DirectionCellModel {
    canAccept(molecule: MoleculeModel, fromCell: CellModel | null): boolean {
        if (!super.canAccept(molecule, fromCell)) return false;
        return fromCell ? this.coordinate.findNeighbor(240 + this.rotation).equals(fromCell.coordinate) : true;
    }

}

export class TurnLeftCell extends DirectionCell<TurnLeftCellModel> {
    getImageUrl(): string {
        return leftImg;
    }
}
