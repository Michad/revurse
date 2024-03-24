import BaseModel from "../models/BaseModel";

/**
 * Simple common interface for all ModelViews. Ensures a few necessary common functions
 * and a mapping to a Model type
 */
export default interface Base<T extends BaseModel> {
    /**
     * Returns back the model of this modelview
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
    updateView(deltaT: number): void

    onChange(): void
}