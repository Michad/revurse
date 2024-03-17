import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";
import FormulaModel from "../../models/FormulaModel";
import { CellSlot } from "../../constants/Enums";


export class CombineCell extends StaticImageCell {
    getImageUrl(): string {
        return this.model.img!;
    }

    protected combineFormula(formulaA: FormulaModel, formulaB: FormulaModel) : FormulaModel {
        return FormulaModel.merge(formulaA, formulaB);
    }

    update(deltaT: number): void {
        if (this.molecules[CellSlot.BACKWARD_LEFT] && this.molecules[CellSlot.BACKWARD_RIGHT] && !this.molecules[CellSlot.CENTER]) {

            let moleculeLiving = this.molecules[CellSlot.BACKWARD_LEFT];
            let moleculeDying = this.molecules[CellSlot.BACKWARD_RIGHT];

            moleculeLiving.setFormula(this.combineFormula(moleculeLiving.model.formula, moleculeDying.model.formula));
            this.world.removeMolecule(moleculeDying);
            this.molecules[CellSlot.BACKWARD_LEFT] = null;
            this.molecules[CellSlot.BACKWARD_RIGHT] = null;

            moleculeLiving.setSlot(CellSlot.CENTER);
            this.molecules[CellSlot.CENTER] = moleculeLiving;
        }
    }

    findDestination(offset: CellSlot): GridCoordinate | CellSlot | null {
        if (offset === CellSlot.FORWARD) return this.coordinate.findNeighbor(this.model.rotation);
        if (offset === CellSlot.CENTER) return CellSlot.FORWARD;

        return null;
    }

    canAccept(molecule: Molecule, fromCell: Cell | null): boolean {
        if (!fromCell) return false;

        let dir = this.findSlotForNeighbor(fromCell.coordinate);

        if(dir !== CellSlot.BACKWARD_RIGHT && dir !== CellSlot.BACKWARD_LEFT) return false;

        return dir !== null && this.molecules[dir] == null;
    }

}
