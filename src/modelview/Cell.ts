import Konva from "konva";
import CellModel from "../models/CellModel";
import GridCoordinate from "../util/GridCoordinate";
import Molecule from "./Molecule";
import { gridToScreen, rotateAroundCenter } from "../util/ViewUtil";
import { BORDER_BUFFER, BORDER_BUFFER_X, Y_COUNT } from "../util/Constants";

class Cell {
    model: CellModel
    layer: Konva.Layer
    view: Konva.Node
    coordinate: GridCoordinate
    molecules: Set<Molecule>

    constructor(model: CellModel, layer: Konva.Layer, overrideView: Konva.Node | null = null) {
        this.model = model;
        this.coordinate = new GridCoordinate(model.index);
        this.layer = layer;
        this.molecules = new Set();
        if (overrideView) {
            this.view = overrideView;
        } else {
            this.draw();
        }
    }

    toJsonData(): CellModel {
        return this.model;
    }

    remove() {
        this.view?.remove();
        this.molecules.forEach((m) => m.remove());
    }

    draw() {
        let self = this;

        if (!self?.model?.img) return;

        var imageObj = new Image();
        let screnCoord = gridToScreen(self.coordinate);

        imageObj.onload = function () {
            let node = new Konva.Image({ image: imageObj });
            self.view = node;

            node.setAttrs({
                x: screnCoord.x - (<any>window).POLY_WIDTH / 2 - BORDER_BUFFER_X / 2,
                y: screnCoord.y - (<any>window).POLY_HEIGHT / 2 - (<any>window).POLY_HEIGHT / Y_COUNT / 2 - BORDER_BUFFER / 2,
                width: (<any>window).POLY_WIDTH + BORDER_BUFFER_X,
                height: (<any>window).POLY_HEIGHT + (<any>window).POLY_HEIGHT / Y_COUNT + BORDER_BUFFER,
                cornerRadius: 0,
                opacity: 0.75
            });

            if (self.model.rotation) {
                rotateAroundCenter(node, self.model.rotation);
            }

            node.listening(false);

            self.layer.add(node);

        };
        //imageObj.crossOrigin = 'Anonymous';
        imageObj.src = self.model.img!;
    }

    update(deltaT: number) {

    }

    canAccept(fromCell: Cell): boolean {
        return true;
    }

    onDeparture(molecule: Molecule) {
        this.molecules.delete(molecule);
    }

    onArrival(molecule: Molecule): GridCoordinate | null {
        this.molecules.add(molecule);
        //Todo: inheritance
        if (this.model.type === "straight") {
            return this.coordinate.findNeighbor(this.model.rotation);
        }
        if (this.model.type === "slight_turn") {
            let r = this.coordinate.findNeighbor(this.model.rotation);
            //console.log(JSON.stringify(this.coordinate) + " with rot of " + this.rotation + " goes to " + JSON.stringify(r));
            return r;
        }

        return null;
    }
}

export default Cell