import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";


export class MetaCell extends StaticImageCell {
    getImageUrl(): string {
        return this.model.img!;
    }

    findDestination(offset: number): GridCoordinate | null {
        return null;
    }

    canAccept(fromCell: Cell | null): boolean {
        return true;
    }

    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): GridOffset | null {
        return null;
    }
}
