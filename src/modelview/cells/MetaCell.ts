import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import { StaticImageCell } from "./StaticImageCell";
import { Cell } from "../Cell";
import { CellSlot } from "../../constants/Enums";


export class MetaCell extends StaticImageCell {
    getImageUrl(): string {
        return this.model.img!;
    }

    findDestination(offset: number): GridCoordinate | null {
        return null;
    }

    canAccept(molecule: Molecule, fromCell: Cell | null): boolean {
        return true;
    }

    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): CellSlot | null {
        return null;
    }
}
