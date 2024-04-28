import WorldModel from "../models/WorldModel";
import UniverseModel from "../models/UniverseModel";
import Base from "./Base";
import World from "./World";
import Konva from "konva";
import { X_COUNT, Y_COUNT } from "../constants/Constants";
import ScreenCalculations from "../view/util/ScreenCalculations";
import GridCoordinate from "./util/GridCoordinate";
import ScreenCoordinate from "../view/util/ScreenCoordinate";
import BaseModel from "../models/BaseModel";
import CellModel from "../models/CellModel";
import MoleculeModel from "../models/MoleculeModel";
import { Cell } from "./Cell";
import Molecule from "./Molecule";

export default class Universe implements Base<UniverseModel> {
    model: UniverseModel
    activeWorld: World
    activeWorldName: string
    savedWorldModels: Map<string, WorldModel>
    stage: Konva.Stage
    container: HTMLElement
    private screenCalculations: ScreenCalculations | null = null;
    private modelToModelViewCache: Map<BaseModel, Base<any>> = new Map();

    constructor(container: HTMLElement, model: UniverseModel | null) {
        this.container = container;

        this.draw();

        if (model) {
            model._onChangeCallback = (m, b) => this.onModelChange(m, b);
            this.activeWorld = new World(this.stage, this, model?.worlds.get(model?.activeWorld)!);
            this.activeWorldName = model?.activeWorld;
            this.savedWorldModels = new Map(model?.worlds);
            this.savedWorldModels.delete(this.activeWorldName);
            this.model = model;
        } else {
            this.activeWorldName = "todo";
            let worldMap = new Map();
            this.model = UniverseModel.new(this.activeWorldName, worldMap);
            this.model._onChangeCallback = (m, b) => this.onModelChange(m, b);
            this.activeWorld = new World(this.stage, this, null);
            worldMap.set(this.activeWorldName, this.activeWorld.getModel());
        }

        this.registerModelView(this.activeWorld);
        this.activeWorld.initialize();
    }
    onChange(): void {
        throw new Error("Method not implemented.");
    }

    registerModelView(modelview: Base<any>) {
        this.modelToModelViewCache.set(modelview.getModel(), modelview);
    }

    onModelChange(model: BaseModel, isRemove: boolean) {
        if (this.modelToModelViewCache.has(model)) {
            if(isRemove) {
                let modelview = this.modelToModelViewCache.get(model)!;
                modelview.remove();
                this.modelToModelViewCache.delete(model);

                //TODO: Should there be a more generic method for removing MVs?
                if (model instanceof CellModel) {
                    let world = (modelview as Cell<any>).world;
                    world.removeCell(model.coordinate);
                } else if (model instanceof MoleculeModel) {
                    let world = (modelview as Molecule).world;
                    world.removeMolecule(modelview as Molecule);
                }
            } else {
                this.modelToModelViewCache.get(model)!.onChange()
            }
        } else {
            if (!isRemove) {
                if (model instanceof CellModel) {
                    let world = this.modelToModelViewCache.get(model._world)! as World;
                    world.initCell(model);
                } else if (model instanceof MoleculeModel) {
                    let world = this.modelToModelViewCache.get(model._world)! as World;
                    world.addMolecule(model);
                }
                //TODO: Any other models we need to consider
            }
            //TODO: Do we need to handle removing something we don't have in cache?
        }
    }


    getModel(): UniverseModel {
        return this.model;
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



    updateView(deltaT: number): void {
        this.activeWorld.updateView(deltaT);
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


}