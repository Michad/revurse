import Konva from "konva";
import CellModel from "../models/CellModel";
import GridCoordinate from "./util/GridCoordinate";
import Molecule from "./Molecule";
import Base from "./Base";
import World from "./World";

export abstract class Cell implements Base<CellModel> {
    model: CellModel
    layer: Konva.Layer
    view: Konva.Node
    coordinate: GridCoordinate
    world: World
    molecules: Molecule[]

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
     * @param fromCell The cell the molecule is coming from
     */
    abstract canAccept(fromCell: Cell | null): boolean;

    /**
     * Gets the place a molecule should be moving towards next, or null if it can't move on for whatever reason 
     * 
     * @param offset The index of the molecule in the cell as returned by onArrival
     */
    abstract findDestination(offset: GridOffset): GridCoordinate | null;

    /**
     * Called when a molecule is leaving the cell. Mainly just deletes the molecule from in-memory tracking of molecules.
     * The default implementation does a "sparse" delete to avoid messing up the GridOffsets removed previously. Which
     * means the indices (GridOffset) will keep growing and growing forever TODO: solve that if it's a problem
     * @param offset The index of the molecule in the cell as returned by onArrival
     */
    onDeparture(offset: number): void {
        delete this.molecules[offset];
    }

    /**
     * Called when a molecule is going from another cell into this one OR during initialization. If force is false this is only called after canAccept returns true 
     * @param molecule The molecule that's arriving in this cell from fromCell
     * @param fromCell The cell the molecule is coming from (same as in canAccept) or null if none (mainly when force is true)
     * @param force If true, this is being triggered "externally" (like via initial load) so skip normal game logic
     * @returns The offset of the molecule in the cell - an index usable by the molecule in the future to indicate its position in the cell. 
     *          Or null if it can't be placed in the cell (todo: this returning null vs canAccept returning false is redundant)
     */
    abstract onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): GridOffset | null;

    abstract draw(): any;
}


