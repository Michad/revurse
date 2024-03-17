import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import sourceImg from '../../images/source.png';
import MoleculeModel from "../../models/MoleculeModel";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";
import FormulaModel from "../../models/FormulaModel";
import { CellSlot } from "../../constants/Enums";


export class SourceCell extends StaticImageCell {
    protected getImageUrl(): string {
        return sourceImg;
    }
    canAccept(molecule: Molecule, fromCell: Cell | null): boolean {
        return fromCell === null;
    }
    findDestination(offset: CellSlot): GridCoordinate | CellSlot | null {
        if(offset === CellSlot.CENTER) return this.molecules[CellSlot.FORWARD] ? null : CellSlot.FORWARD;
        return this.coordinate.findNeighbor(this.model.rotation);
    }
    onDeparture(offset: CellSlot): void {
        this.molecules[CellSlot.FORWARD] = null;
    }
    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): CellSlot | null {
        this.molecules[CellSlot.CENTER] = molecule;

        return CellSlot.CENTER;
    }
    update(deltaT: number): void {
        super.update(deltaT);

        if (!this.molecules[CellSlot.CENTER]) {
            this.world.addMolecule(MoleculeModel.new(this.coordinate.toIndex(), 0, 0, FormulaModel.newUnary(1)));
        }
    }
}
