import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";
import FormulaModel from "../../models/FormulaModel";
import FuseImage from "../../images/fuse.png";
import { CellSlot } from "../../constants/Enums";
import { CombineCell } from "./CombineCell";


export class FuseCell extends CombineCell {
    getImageUrl(): string {
        return FuseImage;
    }

    protected combineFormula(formulaA: FormulaModel, formulaB: FormulaModel) : FormulaModel {
        return FormulaModel.fuse(formulaA, formulaB)!;
    }

    canAccept(molecule: Molecule, fromCell: Cell | null): boolean {
        if(!super.canAccept(molecule, fromCell)) return false;
        
        if(!molecule.getFormula().isUnary()) return false;

        return true;
    }

    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): CellSlot | null {
        if(!force && !molecule.getFormula().isUnary()) return null;

        return super.onArrival(molecule, fromCell, force)
    }
}
