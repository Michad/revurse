import GridCoordinate from "../modelview/util/GridCoordinate";
import Molecule from "../modelview/Molecule";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../modelview/Cell";
import { CellSlot } from "../constants/Enums";
import CellModel from "../models/CellModel";
import MoleculeModel from "../models/MoleculeModel";

export class MetaCellModel extends CellModel {

    findDestination(offset: number): GridCoordinate | null {
        return null;
    }

    canAccept(molecule: MoleculeModel, fromCell: CellModel | null): boolean {
        return true;
    }

    onArrival(molecule: MoleculeModel, fromCell: CellModel | null, force: boolean): CellSlot | null {
        return null;
    }
}

export class MetaCell extends StaticImageCell<MetaCellModel> {
    getImageUrl(): string {
        return this.model.img!;
    }

}
