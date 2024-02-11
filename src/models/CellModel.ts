class CellModel {
    index: number
    type: string
    rotation: number
    img: string | null

    constructor(index: number, type: string, rotation: number, img: string | null) {
        this.index = index;
        this.type = type;
        this.rotation = rotation;
        this.img = img;
    }
}

export default CellModel;