import GridCoordinate from "../modelview/util/GridCoordinate";
import Molecule from "../modelview/Molecule";
import sinkImg from '../images/collect.png';
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../modelview/Cell";
import CellModel from "../models/CellModel";
import MoleculeModel from "../models/MoleculeModel";

export class SinkCellModel extends CellModel {

    canAccept(molecule: MoleculeModel, fromCell: CellModel | null): boolean {
        return true;
    }
    findDestination(offset: number): GridCoordinate | null {
        return null;
    }
    onArrival(molecule: MoleculeModel, fromCell: CellModel | null, force: boolean): number | null {
        this._molecules.push(molecule);
        return this._molecules.length - 1;
    }
    update(deltaT: number): void {
        if (this._molecules.length > 0) {
            let oldMolecules = this._molecules;
            this._molecules = [];
            oldMolecules.forEach((m) => m && this._world.removeMolecule(m));
        }
    }
}

export class SinkCell extends StaticImageCell<SinkCellModel> {
    protected getImageUrl(): string {
        return sinkImg;
    }
}
