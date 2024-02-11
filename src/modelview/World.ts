import Konva from "konva";
import GridCoordinate from "../util/GridCoordinate";
import Cell from "./Cell";
import Molecule from "./Molecule";
import CellModel from "../models/CellModel";
import MoleculeModel from "../models/MoleculeModel";
import WorldModel from "../models/WorldModel";
import { calculateElementName } from "../util/ChemistryUtil";
import { X_COUNT, Y_COUNT } from "../util/Constants";
import Base from "./Base";
import Universe from "./Universe";

class World implements Base<WorldModel> {
    stage: Konva.Stage;
    gridLayer: Konva.Layer;
    cellLayer: Konva.Layer;
    moleculeLayer: Konva.Layer;
    cells: Array<Cell | null>;
    grids: Array<Cell | null>;
    molecules: Set<Molecule> = new Set();
    universe: Universe;

    constructor(stage: Konva.Stage, universe: Universe, rawWorld: WorldModel | null) {
        this.universe = universe;
        this.stage = stage;
        this.cells = Array.apply(null, Array(X_COUNT * Y_COUNT)).map(function () { });
        this.grids = Array.apply(null, Array(X_COUNT * Y_COUNT)).map(function () { });

        this.draw();

        if (rawWorld) {
            rawWorld.cells.forEach((c) => {
                this.initCell(c);
            });

            rawWorld.molecules.forEach((m) => {
                this.addMolecule(m);
            });
        }

    }

    addMolecule(moleculeModel: MoleculeModel) {
        let c = this.findCell(new GridCoordinate(moleculeModel.cellIndex));

        if (c) {
            let m = new Molecule(this, moleculeModel, this.moleculeLayer, c);

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

    initGridCell(gridCoord: GridCoordinate, isEdge: boolean) {
        let screenCoord = this.universe.gridToScreen(gridCoord);
        let screenCalc = this.universe.getScreenCalculations();

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

        let text = new Konva.Text({
            x: screenCoord.x - 30,
            y: screenCoord.y - 30,
            text: "{" + gridCoord.x + "," + gridCoord.y + "}",
            fontSize: 30,
            fontFamily: 'Calibri',
            fill: 'black',
            align: 'center'
        });


        if (!isEdge) {
            hex.on('click', (e) => {
                this.clickCell(gridCoord);
            });

            hex.on('rightclick', (e) => {
            });
        }

        let gridCell = new Cell(this.universe, new CellModel(gridCoord.toIndex(), 'grid', 0, null), this.gridLayer, hex);
        this.gridLayer.add(hex);
        this.grids[gridCoord.toIndex()] = gridCell;

        return hex;
    }


    clickCell(gridCoord: GridCoordinate) {
        switch ((<any>window).currentSelection.tool) {
            case "place":
                this.initCell(new CellModel(gridCoord.toIndex(), (<any>window).currentSelection.cellType, (<any>window).currentSelection.rotation ?? 0, (<any>window).currentSelection.img()));
                break;
            case "molecule":
                this.addMolecule(new MoleculeModel(gridCoord.toIndex(), 0, calculateElementName(Math.floor(Math.random() * 1000), true)));
                break;
            case "erase":
                this.removeCell(gridCoord);
                break;
        }
    }

    initCell(cellModel: CellModel) {
        let gridCoord = new GridCoordinate(cellModel.index);

        let cell = new Cell(this.universe, cellModel, this.cellLayer);

        this.removeCell(gridCoord);
        this.cells[gridCoord.toIndex()] = cell;
    }

    draw() {
        this.gridLayer = new Konva.Layer();
        this.cellLayer = new Konva.Layer();
        this.moleculeLayer = new Konva.Layer();

        this.stage.add(this.gridLayer);
        this.stage.add(this.cellLayer);
        this.stage.add(this.moleculeLayer);

        this.gridLayer.zIndex(0);
        this.cellLayer.zIndex(1);
        this.moleculeLayer.zIndex(2);
    }

    remove() {
        this.gridLayer.remove();
        this.cellLayer.remove();
        this.moleculeLayer.remove();
    }

    removeCell(gridCoord) {
        let curCell = this.cells[gridCoord.toIndex()];
        if (curCell) {
            curCell.remove();
        }

        this.cells[gridCoord.toIndex()] = null;
    }

    toJsonData(): WorldModel {
        return new WorldModel(
            this.cells.filter((m) => m).map((c, i) => c!.toJsonData()),
            [...this.molecules.values()].map((m) => m.toJsonData())
        );
    }

    initializeGrid() {
        this.grids = [];

        let i = 0;

        for (let x = 0; x < X_COUNT; x++) {
            for (let y = 0; y < Y_COUNT; y++) {
                let isInner = true;
                let isEdge = false;

                if (y == 0 || y == 7) {
                    if (x == 3 || x == 5) {
                        isEdge = true;
                        isInner = false;
                    } else if (y == 0) {
                        isInner = false;
                    } else if (y == 7) {
                        if (x > 1 && x < 7) {
                            isInner = true;
                        } else {
                            isInner = false;
                        }
                    }
                } else if (x == 0 || x == 8) {
                    if (y == 4) {
                        isInner = true;
                    } else if (y == 3 || y == 5) {
                        isEdge = true;
                        isInner = false;
                    } else {
                        isInner = false;
                    }
                } else if (x == 1 || x == 7) {
                    if (y <= 1 || y >= 6) {
                        isInner = false;
                    } if (y == 1 || y == 6) {
                        isEdge = true;
                    }
                }

                if (!isInner && !isEdge) continue;

                this.initGridCell(new GridCoordinate(x, y), isEdge);
            }
        }

    }
}

export default World