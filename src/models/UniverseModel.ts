import BaseModel from "./BaseModel";
import WorldModel from "./WorldModel";

export default class UniverseModel implements BaseModel {
    activeWorld: string
    worlds: Map<string, WorldModel>

    constructor(activeWorld: string, worlds: Map<string, WorldModel>) {
        this.activeWorld = activeWorld;
        this.worlds = worlds;
    }
}