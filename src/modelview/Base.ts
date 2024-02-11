import BaseModel from "../models/BaseModel";

export default interface Base<T extends BaseModel> {
    toJsonData(): T
    remove(): void
    draw(): any
    update(deltaT: number): void
}