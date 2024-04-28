import { enumLookup, CellType, CellSlot } from "../constants/Enums";
import GridCoordinate from "../modelview/util/GridCoordinate";
import BaseModel from "./BaseModel";
import MoleculeModel from "./MoleculeModel";
import WorldModel from "./WorldModel";

abstract class CellModel implements BaseModel {
    _world: WorldModel
    _molecules: Array<MoleculeModel | null> = []
    coordinate: GridCoordinate
    type: CellType
    rotation: number
    img: string | null

    constructor(){

    }

    /**
     * Utility function that returns the slot to use for a molecule coming from a given neighbor cell
     * @param coord The coordinate of the cell that molecule is coming from. 
     * @returns The slot to use. Null if the coord provided isn't a valid neighbor
     */
    public findSlotForNeighbor(coord: GridCoordinate): CellSlot | null {
        if (this.coordinate.findNeighbor(this.rotation).equals(coord)) {
            return CellSlot.FORWARD;
        }
        if (this.coordinate.findNeighbor(60 + this.rotation).equals(coord)) {
            return CellSlot.FORWARD_RIGHT;
        }
        if (this.coordinate.findNeighbor(120 + this.rotation).equals(coord)) {
            return CellSlot.BACKWARD_RIGHT;
        }
        if (this.coordinate.findNeighbor(180 + this.rotation).equals(coord)) {
            return CellSlot.BACKWARD;
        }
        if (this.coordinate.findNeighbor(240 + this.rotation).equals(coord)) {
            return CellSlot.BACKWARD_LEFT;
        }
        if (this.coordinate.findNeighbor(300 + this.rotation).equals(coord)) {
            return CellSlot.FORWARD_LEFT;
        }

        return null;
    }

    update(deltaT: number): void {
        //No-op by default
    }


    /**
     * Whether this cell can accept a molecule from another cell. 
     * TODO: merge with onArrival? Or maybe replace with reservation system
     * @param molecule The molecule that's arriving in this cell from fromCell
     * @param fromCell The cell the molecule is coming from
     */
    abstract canAccept(molecule: MoleculeModel, fromCell: CellModel | null): boolean;

    /**
     * Gets the place a molecule should be moving towards next, or null if it can't move on for whatever reason 
     * 
     * @param offset The index of the molecule in the cell as returned by onArrival
     */
    abstract findDestination(offset: CellSlot): GridCoordinate | CellSlot | null;

    /**
     * Called when a molecule is leaving the cell. Mainly just deletes the molecule from in-memory tracking of molecules.
     * The default implementation does a "sparse" delete to avoid messing up the GridOffsets removed previously. Which
     * means the indices (GridOffset) will keep growing and growing forever TODO: solve that if it's a problem
     * @param offset The index of the molecule in the cell as returned by onArrival
     */
    onDeparture(offset: CellSlot): void {
        this._molecules[offset] = null;
    }

    /**
     * Called when a molecule is going from another cell into this one OR during initialization. If force is false this is only called after canAccept returns true 
     * @param molecule The molecule that's arriving in this cell from fromCell
     * @param fromCell The cell the molecule is coming from (same as in canAccept) or null if none (mainly when force is true)
     * @param force If true, this is being triggered "externally" (like via initial load) so skip normal game logic
     * @returns The offset of the molecule in the cell - an index usable by the molecule in the future to indicate its position in the cell. 
     *          Or null if it can't be placed in the cell (todo: this returning null vs canAccept returning false is redundant)
     */
    onArrival(molecule: MoleculeModel, fromCell: CellModel | null, force: boolean): CellSlot | null {
        if (force) {
            let slot = molecule.cellSlot;
            this._molecules[slot] = molecule;
            return slot;
        } else {
            let dir = this.findSlotForNeighbor(fromCell!.coordinate);

            if (dir == null) return null;
            let offset: CellSlot = dir!.valueOf();

            this._molecules[offset] = molecule;

            return offset;
        }
    }

    onSlotTransfer(fromSlot : CellSlot, toSlot: CellSlot) {
        this._molecules[toSlot] = this._molecules[fromSlot];
        this._molecules[fromSlot] = null;
    }
}

export default CellModel;