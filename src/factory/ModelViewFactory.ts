import Konva from "konva";
import { CellType } from "../constants/Enums";
import CellModel from "../models/CellModel";
import { Cell } from "../modelview/Cell";
import World from "../modelview/World";
import { GridCell } from "../cells/GridCell";
import { CombineCell } from "../cells/CombineCell";
import { MetaCell } from "../cells/MetaCell";
import { SinkCell } from "../cells/SinkCell";
import { SourceCell } from "../cells/SourceCell";
import { SplitCell } from "../cells/SplitCell";
import { StraightCell } from "../cells/StraightCell";
import { TurnLeftCell } from "../cells/TurnLeftCell";
import { TurnRightCell } from "../cells/TurnRightCell";
import { MergeCell } from "../cells/MergeCell";
import { FuseCell } from "../cells/FuseCell";
import GridCoordinate from "../modelview/util/GridCoordinate";


export function newCell(world: World, model: CellModel, layer: Konva.Layer, overrideView: Konva.Node | null = null) {
    let cell: Cell<any>;
    switch (model.type) {
        case CellType.STRAIGHT:
            cell = new StraightCell();
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
        case CellType.SPLIT:
            cell = new SplitCell();
            break;
        case CellType.SOURCE:
            cell = new SourceCell();
            break;
        case CellType.SINK:
            cell = new SinkCell();
            break;
        case CellType.COMBINE:
            cell = new CombineCell();
            break;
        case CellType.FUSION:
            cell = new FuseCell();
            break;
        case CellType.MERGE:
            cell = new MergeCell();
            break;
    }

    cell.world = world;
    cell.model = model;
    cell.layer = layer;
    cell.molecules = [];
    if (overrideView) {
        cell.view = overrideView;
    } else {
        cell.draw();
    }

    return cell;
}