import Konva from "konva";
import { CellType } from "../constants/Enums";
import CellModel from "../models/CellModel";
import { Cell } from "../modelview/Cell";
import World from "../modelview/World";
import { GridCell } from "../modelview/cells/GridCell";
import { CombineCell } from "../modelview/cells/CombineCell";
import { MetaCell } from "../modelview/cells/MetaCell";
import { SinkCell } from "../modelview/cells/SinkCell";
import { SourceCell } from "../modelview/cells/SourceCell";
import { SplitCell } from "../modelview/cells/SplitCell";
import { StraightCell } from "../modelview/cells/StraightCell";
import { TurnLeftCell } from "../modelview/cells/TurnLeftCell";
import { TurnRightCell } from "../modelview/cells/TurnRightCell";
import { MergeCell } from "../modelview/cells/MergeCell";
import { FuseCell } from "../modelview/cells/FuseCell";
import GridCoordinate from "../modelview/util/GridCoordinate";


export function newCell(world: World, model: CellModel, layer: Konva.Layer, overrideView: Konva.Node | null = null) {
    let cell: Cell;
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