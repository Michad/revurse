import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import sinkImg from '../../images/collect.png';
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";


export class SinkCell extends StaticImageCell {
    protected getImageUrl(): string {
        return sinkImg;
    }
    canAccept(molecule: Molecule, fromCell: Cell | null): boolean {
        return true;
    }
    findDestination(offset: number): GridCoordinate | null {
        return null;
    }
    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): number | null {
        this.molecules.push(molecule);
        return this.molecules.length - 1;
    }
    update(deltaT: number): void {
        if (this.molecules.length > 0) {
            let oldMolecules = this.molecules;
            this.molecules = [];
            oldMolecules.forEach((m) => this.world.removeMolecule(m));
        }
    }
}
