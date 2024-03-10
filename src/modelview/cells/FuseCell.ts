import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";
import { SourceDirection } from "./SplitCell";
import FormulaModel from "../../models/FormulaModel";
import FuseImage from "../../images/fuse.png";


export class FuseCell extends StaticImageCell {
    getImageUrl(): string {
        return FuseImage;
    }

    private findDirection(coord: GridCoordinate): SourceDirection | null {
        if (this.coordinate.findNeighbor(120 + this.model.rotation).equals(coord)) {
            return SourceDirection.Right;
        }
        if (this.coordinate.findNeighbor(240 + this.model.rotation).equals(coord)) {
            return SourceDirection.Left;
        }

        return null;
    }

    update(deltaT: number): void {
        if (this.molecules[SourceDirection.Left] && this.molecules[SourceDirection.Right] && !this.molecules[SourceDirection.Out]) {

            let moleculeLiving = this.molecules[SourceDirection.Left];
            let moleculeDying = this.molecules[SourceDirection.Right];
            let newFormula = FormulaModel.fuse(moleculeLiving.model.formula, moleculeDying.model.formula);

            if(newFormula) {
                moleculeLiving.setFormula(newFormula);

                moleculeLiving.model.cellOffset = SourceDirection.Out.valueOf();
                this.molecules[SourceDirection.Out] = moleculeLiving;
            } else {
                //This shouldn't happen. Just trash both to handle it
                this.world.removeMolecule(moleculeLiving);
            }

            this.world.removeMolecule(moleculeDying);
            delete this.molecules[SourceDirection.Left];
            delete this.molecules[SourceDirection.Right];
        }
    }

    findDestination(offset: number): GridCoordinate | null {
        if (offset === SourceDirection.Out) return this.coordinate.findNeighbor(this.model.rotation);

        return null;
    }

    canAccept(molecule: Molecule, fromCell: Cell | null): boolean {
        if (!fromCell) return false;
        if(!molecule.getFormula().isUnary()) return false;

        let dir = this.findDirection(fromCell.coordinate);

        return dir !== null && this.molecules[dir] == null;
    }

    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): GridOffset | null {
        if (force) {
            let offset = molecule.model.cellOffset;
            this.molecules[offset] = molecule;
            return offset;
        } else {
            if(!molecule.getFormula().isUnary()) return null;

            let dir = this.findDirection(fromCell!.coordinate);

            if (dir == null) return null;
            let offset: GridOffset = dir!.valueOf();

            this.molecules[offset] = molecule;

            return offset;
        }
    }
}
