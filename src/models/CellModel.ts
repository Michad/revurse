import { enumLookup, CellType } from "../constants/Enums";
import BaseModel from "./BaseModel";

class CellModel implements BaseModel {
    index: number
    type: CellType
    rotation: number
    img: string | null

    constructor(){

    }

    static new(index: number, typeStr: string, rotation: number, img?: string) {
        let type : CellType | null = enumLookup(CellType, typeStr);
        if(type === null) throw "Invalid type " + typeStr;

        let model = new CellModel();
        model.index = index;
        model.type = type as CellType;
        model.rotation = rotation;
        model.img = img ?? null;

        return model;
    }

    static copy(obj : any) {
        let cell = new CellModel();
        Object.assign(cell, obj);
        cell.type = CellType[obj.type];

        return cell;
    }
}

export default CellModel;