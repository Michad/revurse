import GridCoordinate from "../modelview/util/GridCoordinate";
import Molecule from "../modelview/Molecule";
import sourceImg from '../images/source.png';
import MoleculeModel from "../models/MoleculeModel";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../modelview/Cell";
import FormulaModel from "../models/FormulaModel";
import { CellSlot } from "../constants/Enums";
import CellModel from "../models/CellModel";
import { newMoleculeModel } from "../factory/ModelFactory";

export class SourceCellModel extends CellModel {

    canAccept(molecule: MoleculeModel, fromCell: CellModel | null): boolean {
        return fromCell === null;
    }
    findDestination(offset: CellSlot): GridCoordinate | CellSlot | null {
        if(offset === CellSlot.CENTER) return this._molecules[CellSlot.FORWARD] ? null : CellSlot.FORWARD;
        return this.coordinate.findNeighbor(this.rotation);
    }
    onDeparture(offset: CellSlot): void {
        this._molecules[CellSlot.FORWARD] = null;
    }
    onArrival(molecule: MoleculeModel, fromCell: CellModel | null, force: boolean): CellSlot | null {
        this._molecules[CellSlot.CENTER] = molecule;

        return CellSlot.CENTER;
    }
    update(deltaT: number): void {
        super.update(deltaT);

        if (!this._molecules[CellSlot.CENTER]) {
            this._world.addMolecule(newMoleculeModel(this._world, this.coordinate, 0, 0, FormulaModel.newUnary(1)));
        }
    }
}

export class SourceCell extends StaticImageCell<SourceCellModel> {
    protected getImageUrl(): string {
        return sourceImg;
    }
}
