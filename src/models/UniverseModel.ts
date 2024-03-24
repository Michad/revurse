import { copyWorldModel } from "../factory/ModelFactory";
import BaseModel from "./BaseModel";
import WorldModel from "./WorldModel";

export default class UniverseModel implements BaseModel {
    _onChangeCallback: Function
    activeWorld: string
    worlds: Map<string, WorldModel>

    constructor() {
        this.worlds = new Map();
    }

    update(deltaT: number): void {
        this.worlds.forEach((v) => v.update(deltaT));
    }

    onModelChange(model: BaseModel) {
        this._onChangeCallback(model, false);
    }

    onModelRemove(model: BaseModel) {
        this._onChangeCallback(model, true);
    }

    static new(activeWorld: string, worlds: Map<string, WorldModel>) {
        let universe = new UniverseModel();

        universe.activeWorld = activeWorld;
        universe.worlds = worlds;

        return universe;
    }


    static copy(obj : any) {
        let universe = new UniverseModel();
        Object.assign(universe, obj);
        universe.worlds = new Map();
        obj.worlds.forEach( (world, name) => universe.worlds.set(name, copyWorldModel(world, universe)));

        return universe;
    }
}