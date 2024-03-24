import Konva from "konva";
import CellModel from "../models/CellModel";
import GridCoordinate from "./util/GridCoordinate";
import Molecule from "./Molecule";
import Base from "./Base";
import World from "./World";
import { CellSlot } from "../constants/Enums";
import ScreenCoordinate from "../view/util/ScreenCoordinate";

export abstract class Cell<T extends CellModel> implements Base<T> {
    model: T
    layer: Konva.Layer
    view: Konva.Node
    world: World
    molecules: Array<Molecule|null>

    constructor() {

    }

    onChange(): void {
        
    }

    getModel(): T {
        return this.model;
    }

    remove() {
        this.view?.remove();
    }

    updateView(deltaT: number) {
    }

    /**
     * Calculates the screen coordinate for the center of the grid this cell is located at
     */
    calculateScreenCoord() : ScreenCoordinate {
        let screenCalculations = this.world.universe.getScreenCalculations();

        return new ScreenCoordinate((this.model.coordinate.x) * screenCalculations.polyRowWidth + screenCalculations.xMin + screenCalculations.polyWidth / 2, (this.model.coordinate.y + (this.model.coordinate.x % 2) / 2) * screenCalculations.polyHeight + screenCalculations.yMin);
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



    abstract draw(): any;
}


