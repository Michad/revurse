import { CellSlot, CellType, enumLookup } from "../constants/Enums";
import CellModel from "../models/CellModel";
import { GridCellModel } from "../cells/GridCell";
import { CombineCellModel } from "../cells/CombineCell";
import { MetaCellModel } from "../cells/MetaCell";
import { SinkCellModel } from "../cells/SinkCell";
import { SourceCellModel } from "../cells/SourceCell";
import { SplitCellModel } from "../cells/SplitCell";
import { StraightCellModel } from "../cells/StraightCell";
import { TurnLeftCellModel } from "../cells/TurnLeftCell";
import { TurnRightCellModel } from "../cells/TurnRightCell";
import { MergeCellModel } from "../cells/MergeCell";
import { FuseCellModel } from "../cells/FuseCell";
import GridCoordinate from "../modelview/util/GridCoordinate";
import WorldModel from "../models/WorldModel";
import MoleculeModel from "../models/MoleculeModel";
import FormulaModel from "../models/FormulaModel";
import UniverseModel from "../models/UniverseModel";

export function newCellModel(world: WorldModel, type: CellType, coord: GridCoordinate, rotation: number, img?: string) {
    let cell: CellModel;

    switch (type) {
        case CellType.STRAIGHT:
            cell = new StraightCellModel();
            break;
        case CellType.META:
            cell = new MetaCellModel();
            break;
        case CellType.SLIGHT_LEFT:
            cell = new TurnLeftCellModel();
            break;
        case CellType.SLIGHT_RIGHT:
            cell = new TurnRightCellModel();
            break;
        case CellType.GRID:
            cell = new GridCellModel();
            break;
        case CellType.SPLIT:
            cell = new SplitCellModel();
            break;
        case CellType.SOURCE:
            cell = new SourceCellModel();
            break;
        case CellType.SINK:
            cell = new SinkCellModel();
            break;
        case CellType.COMBINE:
            cell = new CombineCellModel();
            break;
        case CellType.FUSION:
            cell = new FuseCellModel();
            break;
        case CellType.MERGE:
            cell = new MergeCellModel();
            break;
    }

    cell._world = world;
    cell.coordinate = coord;
    cell.type = type as CellType;
    cell.rotation = rotation;
    cell.img = img ?? null;

    return cell;
}

export function copyGridCoordinate(obj: any): GridCoordinate | null {
    return obj ? new GridCoordinate(obj.x, obj.y) : null;
}

export function copyCellModel(obj: any, world: WorldModel): CellModel {
    let cell: CellModel;
    let typeStr = obj.type;
    let type: CellType = enumLookup(CellType, typeStr)!;

    switch (type) {
        case CellType.STRAIGHT:
            cell = new StraightCellModel();
            break;
        case CellType.META:
            cell = new MetaCellModel();
            break;
        case CellType.SLIGHT_LEFT:
            cell = new TurnLeftCellModel();
            break;
        case CellType.SLIGHT_RIGHT:
            cell = new TurnRightCellModel();
            break;
        case CellType.GRID:
            cell = new GridCellModel();
            break;
        case CellType.SPLIT:
            cell = new SplitCellModel();
            break;
        case CellType.SOURCE:
            cell = new SourceCellModel();
            break;
        case CellType.SINK:
            cell = new SinkCellModel();
            break;
        case CellType.COMBINE:
            cell = new CombineCellModel();
            break;
        case CellType.FUSION:
            cell = new FuseCellModel();
            break;
        case CellType.MERGE:
            cell = new MergeCellModel();
            break;
    }

    Object.assign(cell, obj);
    cell.type = type;

    cell._world = world;
    cell.coordinate = copyGridCoordinate(obj.coordinate)!;

    return cell;
}


export function newMoleculeModel(world: WorldModel, coordinate: GridCoordinate, cellSlot: CellSlot, transition: number, formula: FormulaModel): MoleculeModel {
    let ret = new MoleculeModel();
    ret._world = world;
    ret.cellSlot = cellSlot;
    ret.coordinate = coordinate;
    ret.transition = transition;
    ret.formula = formula;

    return ret;
}

export function copyMoleculeModel(obj: any, world: any): MoleculeModel {
    let molecule = new MoleculeModel();
    Object.assign(molecule, obj);
    molecule.formula = FormulaModel.copy(obj.formula);
    molecule._world = world;
    molecule.coordinate = copyGridCoordinate(obj.coordinate)!;

    return molecule;
}

export function newWorldModel(universe: UniverseModel, cells: Array<CellModel>, molecules: Array<MoleculeModel>): WorldModel {
    let world = new WorldModel();

    world._universe = universe;
    world.cells = cells;
    world.molecules = molecules;

    return world;
}

export function copyWorldModel(obj: any, universe: UniverseModel): WorldModel {
    let world = new WorldModel();
    Object.assign(world, obj);
    world.cells = (obj.cells as Array<any>).map(c => c && copyCellModel(c, world))
    world.molecules = (obj.molecules as Array<any>).map(c => copyMoleculeModel(c, world))
    world._universe = universe;

    return world;
}