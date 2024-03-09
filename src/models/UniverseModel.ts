import BaseModel from "./BaseModel";
import WorldModel from "./WorldModel";

export default class UniverseModel implements BaseModel {
    activeWorld: string
    worlds: Map<string, WorldModel>

    constructor() {
        this.worlds = new Map();
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
        universe.worlds = new Map(Object.keys(obj.worlds).map( k => [k, WorldModel.copy(obj.worlds[k])] ))

        return universe;
    }
}