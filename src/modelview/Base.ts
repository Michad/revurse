import BaseModel from "../models/BaseModel";

/**
 * Simple common interface for all ModelViews. Ensures a few necessary common functions
 * and a mapping to a Model type
 */
export default interface Base<T extends BaseModel> {
    /**
     * Returns back the data model for the current state of this MV.  Might not be the same Model as passed in at construction.
     * Used primarily for serialization. This isn't usually a simple getter, it requires reconstructing models, so don't call
     * for simple state querying
     */
    getModel(): T

    /**
     * Called when an object is being dropped.  Removes the View from the canvas
     */
    remove(): void

    /**
     * Initializes the view. Since render loop is controlled by browser and offloaded to Konva lib, doesn't live render.
     */
    draw(): any

    /**
     * Main game-loop state in-place state update for the entity
     */
    update(deltaT: number): void
}