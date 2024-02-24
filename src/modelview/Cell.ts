import Konva from "konva";
import CellModel from "../models/CellModel";
import GridCoordinate from "./util/GridCoordinate";
import Molecule from "./Molecule";
import Base from "./Base";
import { rotateAroundCenter } from "../view/util/ViewManipulation";
import { BORDER_BUFFER, BORDER_BUFFER_X, Y_COUNT } from "../constants/Constants";
import World from "./World";
import { CellType } from "../constants/Enums";
import { mergeElements } from "../util/ChemistryUtil";
import straightImg from '../images/straight.png';

export abstract class Cell implements Base<CellModel> {
    model: CellModel
    layer: Konva.Layer
    view: Konva.Node
    coordinate: GridCoordinate
    world: World
    molecules: Molecule[]

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
            case CellType.SLIGHT_LEFT:
                cell = new TurnLeftCell();
                break;
            case CellType.SLIGHT_RIGHT:
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
        cell.molecules = [];
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

    abstract canAccept(fromCell: Cell | null): boolean;

    abstract findDestination(offset: GridOffset): GridCoordinate | null;

    onDeparture(offset: number): void {
        delete this.molecules[offset];
    }

    abstract onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): GridOffset | null;

    abstract draw(): any;
}

abstract class StaticImageCell extends Cell {
    protected abstract getImageUrl(): string;

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
    constructor() {
        super();
    }

    getImageUrl(): string {
        return this.model.img!;
    }

    remove() {
        super.remove();
        this.molecules.forEach((m) => m.remove());
    }

    findDestination(offset: number): GridCoordinate | null {
        let minOffset = Number.MAX_VALUE;
        
        for(let i in this.molecules) {
            let i2 = parseInt(i);
            if(i2 < minOffset) minOffset = i2;
        }

        return minOffset === offset ? this.coordinate.findNeighbor(this.model.rotation) : null;
    }

    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): GridOffset | null {
        this.molecules.push(molecule);

        return this.molecules.length - 1;
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

    findDestination(offset: number): GridCoordinate | null {
        return null;
    }

    canAccept(fromCell: Cell | null): boolean {
        throw new Error("Grid Cells can't accept molecules");
    }
    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): GridOffset | null {
        throw new Error("Grid Cells can't accept molecules");
    }

}

export class StraightCell extends DirectionCell {
    getImageUrl(): string {
        return straightImg;
    }

    canAccept(fromCell: Cell | null): boolean {
        return fromCell ? this.coordinate.findNeighbor(180 + this.model.rotation).equals(fromCell.coordinate) : true;
    }

}

export class TurnRightCell extends DirectionCell {
    canAccept(fromCell: Cell | null): boolean {
        return fromCell ? this.coordinate.findNeighbor(120 + this.model.rotation).equals(fromCell.coordinate) : true;
    }

}
export class TurnLeftCell extends DirectionCell {
    canAccept(fromCell: Cell | null): boolean {
        return fromCell ? this.coordinate.findNeighbor(240 + this.model.rotation).equals(fromCell.coordinate) : true;
    }

}

export class MetaCell extends StaticImageCell {
    getImageUrl(): string {
        return this.model.img!;
    }

    findDestination(offset: number): GridCoordinate | null {
        return null;
    }

    canAccept(fromCell: Cell | null): boolean {
        return true;
    }

    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): GridOffset | null {
        return null;
    }
}

enum SourceDirection {
    Left = 0,
    Right = 1,
    Out = 2,
}

export class JoinCell extends StaticImageCell {
    getImageUrl(): string {
        return this.model.img!;
    }

    private findDirection(coord: GridCoordinate): SourceDirection | null {
        if (this.coordinate.findNeighbor(120 + this.model.rotation).equals(coord)) {
            return SourceDirection.Right;
        }
        if (this.coordinate.findNeighbor(240 + this.model.rotation).equals(coord)) {
            return SourceDirection.Left;
        }

        return null;
    }

    update(deltaT: number): void {
        if (this.molecules[SourceDirection.Left] && this.molecules[SourceDirection.Right] && !this.molecules[SourceDirection.Out]) {

            let moleculeLiving = this.molecules[SourceDirection.Left];
            let moleculeDying = this.molecules[SourceDirection.Right];

            moleculeLiving.setFormula(mergeElements(moleculeLiving.model.formula, moleculeDying.model.formula));
            this.world.removeMolecule(moleculeDying);
            delete this.molecules[SourceDirection.Left];
            delete this.molecules[SourceDirection.Right];

            moleculeLiving.model.cellOffset = SourceDirection.Out.valueOf();
            this.molecules[SourceDirection.Out] = moleculeLiving;
        }
    }

    findDestination(offset: number): GridCoordinate | null {
        if (offset === SourceDirection.Out) return this.coordinate.findNeighbor(this.model.rotation);

        return null;
    }

    canAccept(fromCell: Cell | null): boolean {
        if (!fromCell) return false;

        let dir = this.findDirection(fromCell.coordinate);

        return dir !== null && this.molecules[dir] == null;
    }

    onArrival(molecule: Molecule, fromCell: Cell | null, force: boolean): GridOffset | null {
        if (force) {
            let offset = molecule.model.cellOffset;
            this.molecules[offset] = molecule;
            return offset;
        } else {
            let dir = this.findDirection(fromCell!.coordinate);

            if (dir == null) return null;
            let offset: GridOffset = dir!.valueOf();

            this.molecules[offset] = molecule;

            return offset;
        }
    }
}