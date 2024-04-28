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
import { newCellModel, newMoleculeModel, newWorldModel } from '../factory/ModelFactory';
import { newCell } from '../factory/ModelViewFactory';
import FormulaModel from "../models/FormulaModel";

class World implements Base<WorldModel> {
    world: WorldModel;
    stage: Konva.Stage;
    layers: Map<LayerType, Konva.Layer>;
    cells: Array<Cell<any> | null>;
    grids: Array<Cell<any> | null>;
    molecules: Set<Molecule> = new Set();
    universe: Universe;

    constructor(stage: Konva.Stage, universe: Universe, rawWorld: WorldModel | null) {
        this.universe = universe;
        this.stage = stage;
        this.cells = Array.apply(null, Array(X_COUNT * Y_COUNT)).map(function () { });
        this.grids = Array.apply(null, Array(X_COUNT * Y_COUNT)).map(function () { });
        this.layers = new Map();

        this.world = rawWorld || newWorldModel(this.universe.model, [], []);
    }

    initialize() {
        this.draw();

        if (this.world.cells.length > 0) {
            this.world.cells.forEach((c) => {
                if(c) this.initCell(c);
            });

            this.world.molecules.forEach((m) => {
                this.world.addMolecule(m, true);
            });
        } else {
            this.initCellWithPropagation(newCellModel(this.world, CellType.SOURCE, new GridCoordinate(0, 5), 60));
            this.initCellWithPropagation(newCellModel(this.world, CellType.SINK, new GridCoordinate(8, 3), 0));
        }
    }
    onChange(): void {
        throw new Error("Method not implemented.");
    }

    addMolecule(moleculeModel: MoleculeModel, force: boolean = false) {
        let c = this.findCell(moleculeModel.coordinate)!;
        let m = new Molecule(this, moleculeModel, this.layers[LayerType.MOLECULE], c);

        this.molecules.add(m);
        this.universe.registerModelView(m);
        m.onChange();
    }

    updateView(deltaT: number) {
        this.cells.forEach((c) => c && c.updateView(deltaT));
        this.molecules.forEach((m) => m && m.updateView(deltaT));
    }

    findCell(gridCoord: GridCoordinate) {
        return this.cells[gridCoord.toIndex()];
    }

    initGridCell(gridCoord: GridCoordinate) {
        let gridCell = newCell(this, newCellModel(this.world, CellType.GRID, gridCoord, 0), this.layers[LayerType.GRID]);

        this.grids[gridCoord.toIndex()] = gridCell;
    }


    clickCell(gridCoord: GridCoordinate) {
        switch ((<any>window).currentSelection.tool) {
            case "place":
                this.removeCell(gridCoord);
                this.initCellWithPropagation(newCellModel(this.world, (<any>window).currentSelection.cellType, gridCoord, (<any>window).currentSelection.rotation ?? 0, (<any>window).currentSelection.img()));
                break;
            case "molecule":
                this.addMolecule(newMoleculeModel(this.world, gridCoord, 0, 0, FormulaModel.newUnary(Math.floor(Math.random() * 1000))));
                break;
            case "erase":
                this.removeCell(gridCoord);
                break;
        }
    }

    initCell(cellModel: CellModel) {
        let gridCoord = cellModel.coordinate;

        let cell = newCell(this, cellModel, this.layers[LayerType.CELL]);

        this.cells[gridCoord.toIndex()] = cell;

        this.universe.registerModelView(cell);
        cell.onChange();
    }

    initCellWithPropagation(cellModel: CellModel) {
        this.world.addCell(cellModel);
    }

    getLayer(layerId: LayerType): Konva.Layer {
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

    removeMolecule(molecule : Molecule) {
        this.molecules.delete(molecule);
        this.world.removeMolecule(molecule.model);
        molecule.remove();
    }

    removeCell(gridCoord) {
        let curCell = this.cells[gridCoord.toIndex()];
        if (curCell) {
            curCell.remove();
            this.world.removeCell(curCell.model);
            this.molecules.forEach(m => m.currentCell == curCell && this.removeMolecule(m));
        }

        this.cells[gridCoord.toIndex()] = null;
    }

    getModel(): WorldModel {
        return this.world;
    }

    initializeGrid() {
        this.grids = [];

        let i = 0;

        for (let x = 0; x < X_COUNT; x++) {
            for (let y = 0; y < Y_COUNT; y++) {
                let c = new GridCoordinate(x, y);

                if (c.isInner() || c.isEdge()) this.initGridCell(c);
            }
        }

    }
}

export default World