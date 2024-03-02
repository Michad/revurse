import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import { calculateElementName } from "../../util/ChemistryUtil";
import sourceImg from '../../images/source.png';
import MoleculeModel from "../../models/MoleculeModel";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";


export class SourceCell extends StaticImageCell {
    protected getImageUrl(): string {
        return sourceImg;
    }
    canAccept(fromCell: Cell | null): boolean {
        return fromCell === null;
    }
    findDestination(offset: number): GridCoordinate | null {
        return this.coordinate.findNeighbor(this.model.rotation);
    }
    onDeparture(offset: number): void {
        this.molecules.splice(offset, 1);
    }
    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): number | null {
        this.molecules.push(molecule);

        return this.molecules.length - 1;
    }
    update(deltaT: number): void {
        super.update(deltaT);

        if (this.molecules.length == 0) {
            this.world.addMolecule(MoleculeModel.new(this.coordinate.toIndex(), 0, 0, calculateElementName(1, true)));
        }
    }
}
