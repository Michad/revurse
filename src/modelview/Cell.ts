import Konva from "konva";
import CellModel from "../models/CellModel";
import GridCoordinate from "./util/GridCoordinate";
import Molecule from "./Molecule";
import Base from "./Base";
import World from "./World";
import { CellSlot } from "../constants/Enums";
import ScreenCoordinate from "../view/util/ScreenCoordinate";

export abstract class Cell implements Base<CellModel> {
    model: CellModel
    layer: Konva.Layer
    view: Konva.Node
    coordinate: GridCoordinate
    world: World
    molecules: Array<Molecule|null>

    constructor() {

    }

    getModel(): CellModel {
        return this.model;
    }

    remove() {
        this.view?.remove();
    }

    update(deltaT: number) {

    }

    /**
     * Calculates the screen coordinate for the center of the grid this cell is located at
     */
    calculateScreenCoord() : ScreenCoordinate {
        let screenCalculations = this.world.universe.getScreenCalculations();

        return new ScreenCoordinate((this.coordinate.x) * screenCalculations.polyRowWidth + screenCalculations.xMin + screenCalculations.polyWidth / 2, (this.coordinate.y + (this.coordinate.x % 2) / 2) * screenCalculations.polyHeight + screenCalculations.yMin);
    }

    /**
     * Calculates the screen coordiante for the center of a specific slot in this cell
     */
    calculateSlotScreenCoord(slot : CellSlot) : ScreenCoordinate {
        let baseCoord = this.calculateScreenCoord();

        if(slot === CellSlot.CENTER) return baseCoord;

        let screenCalculations = this.world.universe.getScreenCalculations();

        let rot = 180 - (((slot.valueOf() - 1) * 60 + this.model.rotation));
        rot = rot * Math.PI / 180; 
        
        baseCoord.x += Math.sin(rot) * screenCalculations.polyWidth / 3;
        baseCoord.y += Math.cos(rot) * screenCalculations.polyHeight / 3;

        return baseCoord;
    }

    /**
     * Utility function that returns the slot to use for a molecule coming from a given neighbor cell
     * @param coord The coordinate of the cell that molecule is coming from. 
     * @returns The slot to use. Null if the coord provided isn't a valid neighbor
     */
    public findSlotForNeighbor(coord: GridCoordinate): CellSlot | null {
        if (this.coordinate.findNeighbor(this.model.rotation).equals(coord)) {
            return CellSlot.FORWARD;
        }
        if (this.coordinate.findNeighbor(60 + this.model.rotation).equals(coord)) {
            return CellSlot.FORWARD_RIGHT;
        }
        if (this.coordinate.findNeighbor(120 + this.model.rotation).equals(coord)) {
            return CellSlot.BACKWARD_RIGHT;
        }
        if (this.coordinate.findNeighbor(180 + this.model.rotation).equals(coord)) {
            return CellSlot.BACKWARD;
        }
        if (this.coordinate.findNeighbor(240 + this.model.rotation).equals(coord)) {
            return CellSlot.BACKWARD_LEFT;
        }
        if (this.coordinate.findNeighbor(300 + this.model.rotation).equals(coord)) {
            return CellSlot.FORWARD_LEFT;
        }

        return null;
    }

    /**
     * Utility function to handle the fact that molecules array is sparse by default
     * @returns The lowest currently active GridOffset (first item in the molecules array)
     */
    protected calcMinOffset() {
        let minOffset = Number.MAX_VALUE;

        for (let i in this.molecules) {
            let i2 = parseInt(i);
            if (i2 < minOffset) minOffset = i2;
        }

        return minOffset;
    }

    /**
     * Whether this cell can accept a molecule from another cell. 
     * TODO: merge with onArrival? Or maybe replace with reservation system
     * @param molecule The molecule that's arriving in this cell from fromCell
     * @param fromCell The cell the molecule is coming from
     */
    abstract canAccept(molecule: Molecule, fromCell: Cell | null): boolean;

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
        this.molecules[offset] = null;
    }

    /**
     * Called when a molecule is going from another cell into this one OR during initialization. If force is false this is only called after canAccept returns true 
     * @param molecule The molecule that's arriving in this cell from fromCell
     * @param fromCell The cell the molecule is coming from (same as in canAccept) or null if none (mainly when force is true)
     * @param force If true, this is being triggered "externally" (like via initial load) so skip normal game logic
     * @returns The offset of the molecule in the cell - an index usable by the molecule in the future to indicate its position in the cell. 
     *          Or null if it can't be placed in the cell (todo: this returning null vs canAccept returning false is redundant)
     */
    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): CellSlot | null {
        if (force) {
            let offset = molecule.model.cellOffset;
            this.molecules[offset] = molecule;
            return offset;
        } else {
            let dir = this.findSlotForNeighbor(fromCell!.coordinate);

            if (dir == null) return null;
            let offset: CellSlot = dir!.valueOf();

            this.molecules[offset] = molecule;

            return offset;
        }
    }

    onSlotTransfer(fromSlot : CellSlot, toSlot: CellSlot) {
        this.molecules[toSlot] = this.molecules[fromSlot];
        this.molecules[fromSlot] = null;
    }

    abstract draw(): any;
}


