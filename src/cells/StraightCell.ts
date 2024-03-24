import straightImg from '../images/straight.png';
import { DirectionCell, DirectionCellModel } from "./DirectionCell";
import { Cell } from "../modelview/Cell";
import Molecule from '../modelview/Molecule';
import CellModel from '../models/CellModel';
import MoleculeModel from '../models/MoleculeModel';

export class StraightCellModel extends DirectionCellModel {
    canAccept(molecule: MoleculeModel, fromCell: CellModel | null): boolean {
        if (!super.canAccept(molecule, fromCell)) return false;
        return fromCell ? this.coordinate.findNeighbor(180 + this.rotation).equals(fromCell.coordinate) : true;
    }
}

export class StraightCell extends DirectionCell<StraightCellModel> {
    getImageUrl(): string {
        return straightImg;
    }
}
