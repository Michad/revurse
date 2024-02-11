import WorldModel from "../models/WorldModel";
import UniverseModel from "../models/UniverseModel";
import Base from "./Base";
import World from "./World";
import Konva from "konva";
import { X_COUNT, Y_COUNT } from "../util/Constants";
import ScreenCalculations from "../util/ScreenCalculations";
import GridCoordinate from "../util/GridCoordinate";
import ScreenCoordinate from "../util/ScreenCoordinate";

export default class Universe implements Base<UniverseModel> {
    activeWorld: World
    activeWorldName: string
    savedWorldModels: Map<string, WorldModel>
    stage: Konva.Stage
    container: HTMLElement
    private screenCalculations: ScreenCalculations | null = null;

    constructor(container: HTMLElement, model: UniverseModel | null) {
        this.container = container;

        this.draw();

        if (model) {
            this.activeWorld = new World(this.stage, this, model?.worlds[model?.activeWorld]);
            this.activeWorldName = model?.activeWorld;
            this.savedWorldModels = model?.worlds;
            delete this.savedWorldModels[this.activeWorldName];
        } else {
            this.activeWorldName = "todo";
            this.activeWorld = new World(this.stage, this, null);
        }
    }


    toJsonData(): UniverseModel {
        return new UniverseModel(this.activeWorldName, { ...this.savedWorldModels, [this.activeWorldName]: this.activeWorld.toJsonData() });
    }

    remove(): void {
        this.stage.remove();
    }

    draw() {
        this.stage = new Konva.Stage({
            container: 'container',
            width: this.container.offsetWidth,
            height: this.container.offsetHeight,
            draggable: true,
        });


    }



    update(deltaT: number): void {
        this.activeWorld.update(deltaT);
    }

    getScreenCalculations(): ScreenCalculations {
        if (this.screenCalculations) return this.screenCalculations;

        let res = new ScreenCalculations();

        res.xMin = 0;
        res.xMax = Math.min(this.stage.width(), this.stage.height());
        res.yMin = 0;
        res.yMax = res.xMax;

        res.polyRowWidth = (res.xMax - res.xMin) / X_COUNT * 0.9;
        res.polyWidth = res.polyRowWidth * 4 / 3;
        res.polyHeight = res.polyWidth * 0.8660254;
        res.xMin = (this.stage.width() - (X_COUNT) * res.polyRowWidth) / 2 - 0.5 * res.polyWidth - 2.5;
        res.yMin = (this.stage.height() - (Y_COUNT) * res.polyHeight) / 2 + 0.5 * res.polyHeight - 2.5;
        res.xMax = (this.stage.width() + (X_COUNT) * res.polyRowWidth) / 2 - (res.polyWidth - res.polyRowWidth) + 2.5;
        res.yMax = (this.stage.height() + (Y_COUNT) * res.polyHeight) / 2 + 0.5 * res.polyHeight + 2.5;

        this.screenCalculations = res;

        return res;
    }

    gridToScreen(gridCoord: GridCoordinate) {
        let screenCalculations = this.getScreenCalculations();

        return new ScreenCoordinate((gridCoord.x) * screenCalculations.polyRowWidth + screenCalculations.xMin + screenCalculations.polyWidth / 2, (gridCoord.y + (gridCoord.x % 2) / 2) * screenCalculations.polyHeight + screenCalculations.yMin);
    }

}