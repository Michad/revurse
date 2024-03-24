import GridCoordinate from "../modelview/util/GridCoordinate";
import Molecule from "../modelview/Molecule";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../modelview/Cell";
import FormulaModel from "../models/FormulaModel";
import FuseImage from "../images/fuse.png";
import { CellSlot } from "../constants/Enums";
import { CombineCell, CombineCellModel } from "./CombineCell";
import CellModel from "../models/CellModel";
import MoleculeModel from "../models/MoleculeModel";
import Base from "../modelview/Base";

export class FuseCellModel extends CombineCellModel {

    canAccept(molecule: MoleculeModel, fromCell: CellModel | null): boolean {
        if(!super.canAccept(molecule, fromCell)) return false;
        
        if(!molecule.formula.isUnary()) return false;

        return true;
    }

    onArrival(molecule: MoleculeModel, fromCell: CellModel | null, force: boolean): CellSlot | null {
        if(!force && !molecule.formula.isUnary()) return null;

        return super.onArrival(molecule, fromCell, force)
    }

    protected combineFormula(formulaA: FormulaModel, formulaB: FormulaModel) : FormulaModel {
        return FormulaModel.fuse(formulaA, formulaB)!;
    }
}

export class FuseCell extends CombineCell implements Base<FuseCellModel> {
    getImageUrl(): string {
        return FuseImage;
    }

    getModel(): FuseCellModel {
        return <FuseCellModel>this.model;
    }
}
