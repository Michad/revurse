import Konva from "konva";
import CellModel from "../models/CellModel";
import GridCoordinate from "../util/GridCoordinate";
import Molecule from "./Molecule";
import Base from "./Base";
import { rotateAroundCenter } from "../util/ViewUtil";
import { BORDER_BUFFER, BORDER_BUFFER_X, Y_COUNT } from "../util/Constants";
import Universe from "./Universe";
import World from "./World";
import { CellType } from "../constants/Enums";
import { mergeElements } from "../util/ChemistryUtil";

export abstract class Cell implements Base<CellModel> {
    model: CellModel
    layer: Konva.Layer
    view: Konva.Node
    coordinate: GridCoordinate
    world: World

    constructor() {
        
    }

    static new(world: World, model: CellModel, layer: Konva.Layer, overrideView: Konva.Node | null = null) {
        let cell: Cell;
        switch (model.type) {
            case CellType.STRAIGHT:
                cell = new StraightCell();
                break;
            case CellType.JOIN:
                cell = new JoinCell();
                break;
            case CellType.META:
                cell = new MetaCell();
                break;
            case CellType.SLIGHT_TURN:
                cell = new TurnRightCell();
                break;
            case CellType.GRID:
                cell = new GridCell();
                break;
        }

        cell.world = world;
        cell.model = model;
        cell.coordinate = new GridCoordinate(model.index);
        cell.layer = layer;
        if (overrideView) {
            cell.view = overrideView;
        } else {
            cell.draw();
        }

        return cell;
    }

    toJsonData(): CellModel {
        return this.model;
    }

    remove() {
        this.view?.remove();
    }

    update(deltaT: number) {

    }

    abstract canAccept(fromCell: Cell): boolean;

    abstract onDeparture(molecule: Molecule): void;

    abstract onArrival(molecule: Molecule, fromCell: Cell): GridCoordinate | null;

    abstract draw(): any;
}

abstract class StaticImageCell extends Cell {
    protected abstract getImageUrl() : string;

    draw() {
        let self = this;

        if (!self?.model?.img) return;

        var imageObj = new Image();
        let screnCoord = this.world.universe.gridToScreen(self.coordinate);
        let screenCalc = this.world.universe.getScreenCalculations();

        imageObj.onload = function () {
            let node = new Konva.Image({ image: imageObj });
            self.view = node;

            node.setAttrs({
                x: screnCoord.x - screenCalc.polyWidth / 2 - BORDER_BUFFER_X / 2,
                y: screnCoord.y - screenCalc.polyHeight / 2 - screenCalc.polyHeight / Y_COUNT / 2 - BORDER_BUFFER / 2,
                width: screenCalc.polyWidth + BORDER_BUFFER_X,
                height: screenCalc.polyHeight + screenCalc.polyHeight / Y_COUNT + BORDER_BUFFER,
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
        imageObj.src = this.getImageUrl();
    }

}

abstract class DirectionCell extends StaticImageCell {
    molecules: Set<Molecule>

    constructor() {
        super();

        this.molecules = new Set();
    }

    getImageUrl() : string {
        return this.model.img!;
    }

    remove() {
        super.remove();
        this.molecules.forEach((m) => m.remove());
    }

    onArrival(molecule: Molecule, fromCell: Cell): GridCoordinate | null {
        this.molecules.add(molecule);

        return this.coordinate.findNeighbor(this.model.rotation);
    }

    onDeparture(molecule: Molecule) {
        this.molecules.delete(molecule);
    }
}

export class GridCell extends Cell {
    draw() {
        let screenCoord = this.world.universe.gridToScreen(this.coordinate);
        let screenCalc = this.world.universe.getScreenCalculations();
        let isEdge = this.coordinate.isEdge();

        let hex = new Konva.RegularPolygon({
            x: screenCoord.x,
            y: screenCoord.y,
            sides: 6,
            radius: screenCalc.polyWidth / 2,
            fill: isEdge ? 'yellow' : 'green',
            stroke: 'black',
            strokeWidth: 4,
            /*	    shadowOffsetX : 20,
                shadowOffsetY : 25,
                shadowBlur : 40,
                opacity : 0.5,*/
            rotation: 30
        });

        // let text = new Konva.Text({
        //     x: screenCoord.x - 30,
        //     y: screenCoord.y - 30,
        //     text: "{" + this.coordinate.x + "," + this.coordinate.y + "}",
        //     fontSize: 30,
        //     fontFamily: 'Calibri',
        //     fill: 'black',
        //     align: 'center'
        // });


        if (!isEdge) {
            hex.on('click', (e) => {
                this.world.clickCell(this.coordinate);
            });

            hex.on('rightclick', (e) => {
            });
        }

        this.view = hex;
        this.layer.add(hex);
    }
    
    canAccept(fromCell: Cell): boolean {
        throw new Error("Grid Cells can't accept molecules");
    }
    onDeparture(molecule: Molecule): void {
        throw new Error("Grid Cells can't accept molecules");
    }
    onArrival(molecule: Molecule, fromCell: Cell): GridCoordinate | null {
        throw new Error("Grid Cells can't accept molecules");
    }

}

export class StraightCell extends DirectionCell {
    canAccept(fromCell: Cell): boolean {
        return this.coordinate.findNeighbor(180 + this.model.rotation).equals(fromCell.coordinate);
    }

}

export class TurnRightCell extends DirectionCell {
    canAccept(fromCell: Cell): boolean {
        return this.coordinate.findNeighbor(120 + this.model.rotation).equals(fromCell.coordinate);
    }

}

export class MetaCell extends StaticImageCell {
    getImageUrl() : string {
        return this.model.img!;
    }

    onDeparture(molecule: Molecule) {
        throw new Error("Method not implemented.");
    }
    canAccept(fromCell: Cell): boolean {
        return true;
    }

    onArrival(molecule: Molecule, fromCell: Cell): GridCoordinate | null {

        return null;
    }
}

export class JoinCell extends StaticImageCell {
    moleculeFromLeft : Molecule | null = null;
    moleculeFromRight : Molecule | null = null;

    getImageUrl() : string {
        return this.model.img!;
    }

    onDeparture(molecule: Molecule) {
        if(this.moleculeFromLeft === molecule) this.moleculeFromLeft = null;
        if(this.moleculeFromRight === molecule) this.moleculeFromRight = null;
    }

    canAccept(fromCell: Cell): boolean {
        if(this.coordinate.findNeighbor(120 + this.model.rotation).equals(fromCell.coordinate)) {
            if(this.moleculeFromRight == null) return true;
        }
        if(this.coordinate.findNeighbor(240 + this.model.rotation).equals(fromCell.coordinate)) {
            if(this.moleculeFromLeft == null) return true;
        }

        return false;
    }

    onArrival(molecule: Molecule, fromCell: Cell): GridCoordinate | null {
        if(this.coordinate.findNeighbor(120 + this.model.rotation).equals(fromCell.coordinate)) {
            this.moleculeFromRight = molecule;
        }
        if(this.coordinate.findNeighbor(240 + this.model.rotation).equals(fromCell.coordinate)) {
            this.moleculeFromLeft = molecule;
        }

        if(this.moleculeFromLeft && this.moleculeFromRight) {
            molecule.setFormula(mergeElements(this.moleculeFromLeft.model.formula, this.moleculeFromRight.model.formula));
            this.world.removeMolecule(this.moleculeFromRight == molecule ? this.moleculeFromLeft : this.moleculeFromRight);
            this.moleculeFromLeft = null;
            this.moleculeFromRight = null;
            return this.coordinate.findNeighbor(this.model.rotation);
        }

        return null;
    }
}