import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";

export abstract class DirectionCell extends StaticImageCell {
    constructor() {
        super();
    }

    getImageUrl(): string {
        return this.model.img!;
    }

    remove() {
        super.remove();
        this.molecules.forEach((m) => m.remove());
    }

    canAccept(fromCell: Cell | null): boolean {
        return this.molecules.length == 0;
    }

    onDeparture(offset: number): void {
        this.molecules.splice(offset, 1);
    }


    findDestination(offset: number): GridCoordinate | null {
        let minOffset = this.calcMinOffset();

        return minOffset === offset ? this.coordinate.findNeighbor(this.model.rotation) : null;
    }

    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): GridOffset | null {
        this.molecules.push(molecule);

        return this.molecules.length - 1;
    }

}
