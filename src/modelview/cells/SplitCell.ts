import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import splitImg from '../../images/split.png';
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";


export class SplitCell extends StaticImageCell {
    moleculeCount = 0;

    protected getImageUrl(): string {
        return splitImg;
    }
    onDeparture(offset: number): void {
        super.onDeparture(offset);
        this.moleculeCount--;
    }
    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): number | null {
        this.molecules.push(molecule);
        this.moleculeCount++;

        return this.molecules.length - 1;
    }
    findDestination(offset: number): GridCoordinate | null {
        let minOffset = this.calcMinOffset();

        return minOffset === offset ? this.coordinate.findNeighbor(this.model.rotation + 60 * (minOffset % 2 === 1 ? 1 : -1)) : null;
    }

    canAccept(fromCell: Cell | null): boolean {
        if (this.moleculeCount > 0) return false;
        return fromCell ? this.coordinate.findNeighbor(180 + this.model.rotation).equals(fromCell.coordinate) : true;
    }
}
export enum SourceDirection {
    Left = 0,
    Right = 1,
    Out = 2
}

