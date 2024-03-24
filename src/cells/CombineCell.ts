import GridCoordinate from "../modelview/util/GridCoordinate";
import Molecule from "../modelview/Molecule";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../modelview/Cell";
import FormulaModel from "../models/FormulaModel";
import { CellSlot } from "../constants/Enums";
import CellModel from "../models/CellModel";
import Base from "../modelview/Base";
import MoleculeModel from "../models/MoleculeModel";

export class CombineCellModel extends CellModel {
    protected combineFormula(formulaA: FormulaModel, formulaB: FormulaModel) : FormulaModel {
        return FormulaModel.merge(formulaA, formulaB);
    }

    update(deltaT: number): void {
        if (this._molecules[CellSlot.BACKWARD_LEFT] && this._molecules[CellSlot.BACKWARD_RIGHT] && !this._molecules[CellSlot.CENTER]) {

            let moleculeLiving = this._molecules[CellSlot.BACKWARD_LEFT];
            let moleculeDying = this._molecules[CellSlot.BACKWARD_RIGHT];

            moleculeLiving.setFormula(this.combineFormula(moleculeLiving.formula, moleculeDying.formula));
            this._world.removeMolecule(moleculeDying);
            this._molecules[CellSlot.BACKWARD_LEFT] = null;
            this._molecules[CellSlot.BACKWARD_RIGHT] = null;

            moleculeLiving.setSlot(CellSlot.CENTER);
            this._molecules[CellSlot.CENTER] = moleculeLiving;
        }
    }

    findDestination(offset: CellSlot): GridCoordinate | CellSlot | null {
        if (offset === CellSlot.FORWARD) return this.coordinate.findNeighbor(this.rotation);
        if (offset === CellSlot.CENTER) return CellSlot.FORWARD;

        return null;
    }

    canAccept(molecule: MoleculeModel, fromCell: CellModel | null): boolean {
        if (!fromCell) return false;

        let dir = this.findSlotForNeighbor(fromCell.coordinate);

        if(dir !== CellSlot.BACKWARD_RIGHT && dir !== CellSlot.BACKWARD_LEFT) return false;

        return dir !== null && this._molecules[dir] == null;
    }
}

export class CombineCell extends StaticImageCell<CombineCellModel> {
    getImageUrl(): string {
        return this.model.img!;
    }

    getModel(): CombineCellModel {
        return <CombineCellModel>this.model;
    }
}
