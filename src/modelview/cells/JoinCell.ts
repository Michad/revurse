import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import { mergeElements } from "../../util/ChemistryUtil";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";
import { SourceDirection } from "./SplitCell";


export class JoinCell extends StaticImageCell {
    getImageUrl(): string {
        return this.model.img!;
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

            moleculeLiving.setFormula(mergeElements(moleculeLiving.model.formula, moleculeDying.model.formula));
            this.world.removeMolecule(moleculeDying);
            delete this.molecules[SourceDirection.Left];
            delete this.molecules[SourceDirection.Right];

            moleculeLiving.model.cellOffset = SourceDirection.Out.valueOf();
            this.molecules[SourceDirection.Out] = moleculeLiving;
        }
    }

    findDestination(offset: number): GridCoordinate | null {
        if (offset === SourceDirection.Out) return this.coordinate.findNeighbor(this.model.rotation);

        return null;
    }

    canAccept(fromCell: Cell | null): boolean {
        if (!fromCell) return false;

        let dir = this.findDirection(fromCell.coordinate);

        return dir !== null && this.molecules[dir] == null;
    }

    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): GridOffset | null {
        if (force) {
            let offset = molecule.model.cellOffset;
            this.molecules[offset] = molecule;
            return offset;
        } else {
            let dir = this.findDirection(fromCell!.coordinate);

            if (dir == null) return null;
            let offset: GridOffset = dir!.valueOf();

            this.molecules[offset] = molecule;

            return offset;
        }
    }
}
