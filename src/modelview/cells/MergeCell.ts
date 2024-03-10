import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";
import { SourceDirection } from "./SplitCell";
import FormulaModel from "../../models/FormulaModel";
import MergeImage from "../../images/merge.png";
import { DirectionCell } from "./DirectionCell";


export class MergeCell extends DirectionCell {
    getImageUrl(): string {
        return MergeImage;
    }

    canAccept(molecule: Molecule, fromCell: Cell | null): boolean {
        if (!super.canAccept(molecule, fromCell)) return false;
        return !fromCell ? true :
            this.coordinate.findNeighbor(120 + this.model.rotation).equals(fromCell.coordinate) ||
            this.coordinate.findNeighbor(240 + this.model.rotation).equals(fromCell.coordinate);
    }
}
