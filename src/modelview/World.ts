import Konva from "konva";
import GridCoordinate from "./util/GridCoordinate";
import { Cell } from "./Cell";
import Molecule from "./Molecule";
import CellModel from "../models/CellModel";
import MoleculeModel from "../models/MoleculeModel";
import WorldModel from "../models/WorldModel";
import { X_COUNT, Y_COUNT } from "../constants/Constants";
import { CellType, LayerType } from "../constants/Enums";
import Base from "./Base";
import Universe from "./Universe";
import {newCell} from '../factory/ModelViewFactory';
import FormulaModel from "../models/FormulaModel";

class World implements Base<WorldModel> {
    stage: Konva.Stage;
    layers : Map<LayerType, Konva.Layer>;
    cells: Array<Cell | null>;
    grids: Array<Cell | null>;
    molecules: Set<Molecule> = new Set();
    universe: Universe;

    constructor(stage: Konva.Stage, universe: Universe, rawWorld: WorldModel | null) {
        this.universe = universe;
        this.stage = stage;
        this.cells = Array.apply(null, Array(X_COUNT * Y_COUNT)).map(function () { });
        this.grids = Array.apply(null, Array(X_COUNT * Y_COUNT)).map(function () { });
        this.layers = new Map();

        this.draw();

        if (rawWorld) {
            rawWorld.cells.forEach((c) => {
                this.initCell(c);
            });

            rawWorld.molecules.forEach((m) => {
                this.addMolecule(m, true);
            });
        } else {
            this.initCell(CellModel.new(new GridCoordinate(0, 5).toIndex(), CellType.SOURCE.valueOf(), 60 ));
            this.initCell(CellModel.new(new GridCoordinate(8, 3).toIndex(), CellType.SINK.valueOf(), 0 ));

        }

    }

    addMolecule(moleculeModel: MoleculeModel, force: boolean = false) {
        let c = this.findCell(new GridCoordinate(moleculeModel.cellIndex));

        if (c && (force || c.canAccept(null))) {
            let m = new Molecule(this, moleculeModel, this.layers[LayerType.MOLECULE], c);
            
            this.molecules.add(m);
        }
    }

    update(deltaT: number) {
        this.cells.forEach((c) => c && c.update(deltaT));
        this.molecules.forEach((m) => m && m.update(deltaT));
    }

    findCell(gridCoord: GridCoordinate) {
        return this.cells[gridCoord.toIndex()];
    }

    initGridCell(gridCoord: GridCoordinate) {
        let gridCell = newCell(this, CellModel.new(gridCoord.toIndex(), CellType.GRID, 0), this.layers[LayerType.GRID]);
        
        this.grids[gridCoord.toIndex()] = gridCell;
    }


    clickCell(gridCoord: GridCoordinate) {
        switch ((<any>window).currentSelection.tool) {
            case "place":
                this.removeCell(gridCoord);
                this.initCell(CellModel.new(gridCoord.toIndex(), (<any>window).currentSelection.cellType, (<any>window).currentSelection.rotation ?? 0, (<any>window).currentSelection.img()));
                break;
            case "molecule":
                this.addMolecule(MoleculeModel.new(gridCoord.toIndex(), 0, 0, FormulaModel.newUnary(Math.floor(Math.random() * 1000))));
                break;
            case "erase":
                this.removeCell(gridCoord);
                break;
        }
    }

    initCell(cellModel: CellModel) {
        let gridCoord = new GridCoordinate(cellModel.index);

        let cell = newCell(this, cellModel, this.layers[LayerType.CELL]);

        this.cells[gridCoord.toIndex()] = cell;
    }

    getLayer(layerId : LayerType) : Konva.Layer {
        return this.layers[layerId];
    }

    draw() {
        this.layers[LayerType.GRID] = new Konva.Layer();
        this.layers[LayerType.CELL] = new Konva.Layer();
        this.layers[LayerType.MOLECULE] = new Konva.Layer();

        this.stage.add(this.layers[LayerType.GRID]);
        this.stage.add(this.layers[LayerType.CELL]);
        this.stage.add(this.layers[LayerType.MOLECULE]);

        this.layers.forEach((v, k) => v.zIndex(k));
    }

    remove() {
        this.layers[LayerType.GRID].remove();
        this.layers[LayerType.CELL].remove();
        this.layers[LayerType.MOLECULE].remove();
    }

    removeMolecule(molecule) {
        this.molecules.delete(molecule);
        molecule.remove();
    }

    removeCell(gridCoord) {
        let curCell = this.cells[gridCoord.toIndex()];
        if (curCell) {
            curCell.remove();
        }
        this.molecules.forEach(m => m.currentCell == curCell && this.removeMolecule(m));

        this.cells[gridCoord.toIndex()] = null;
    }

    getModel(): WorldModel {
        return WorldModel.new(
            this.cells.filter((m) => m).map((c, i) => c!.getModel()),
            [...this.molecules.values()].map((m) => m.getModel())
        );
    }

    initializeGrid() {
        this.grids = [];

        let i = 0;

        for (let x = 0; x < X_COUNT; x++) {
            for (let y = 0; y < Y_COUNT; y++) {
                let c = new GridCoordinate(x, y);

                if(c.isInner() || c.isEdge()) this.initGridCell(c);
            }
        }

    }
}

export default World