import Konva from "konva";
import GridCoordinate from "../modelview/util/GridCoordinate";
import Molecule from "../modelview/Molecule";
import { Cell } from "../modelview/Cell";
import { CellSlot } from "../constants/Enums";
import CellModel from "../models/CellModel";
import MoleculeModel from "../models/MoleculeModel";

export class GridCellModel extends CellModel {


    findDestination(offset: number): GridCoordinate | null {
        return null;
    }

    canAccept(molecule: MoleculeModel, fromCell: CellModel | null): boolean {
        throw new Error("Grid Cells can't accept molecules");
    }
    onArrival(molecule: MoleculeModel, fromCell: CellModel | null, force: boolean): CellSlot | null {
        throw new Error("Grid Cells can't accept molecules");
    }
}

export class GridCell extends Cell<GridCellModel> {
    draw() {
        let screenCoord = this.calculateScreenCoord();
        let screenCalc = this.world.universe.getScreenCalculations();
        let isEdge = this.model.coordinate.isEdge();

        let hex = new Konva.RegularPolygon({
            x: screenCoord.x,
            y: screenCoord.y,
            sides: 6,
            radius: screenCalc.polyWidth / 2,
            fill: isEdge ? 'yellow' : 'lightgrey',
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
                this.world.clickCell(this.model.coordinate);
            });

            hex.on('rightclick', (e) => {
            });
        }

        this.view = hex;
        this.layer.add(hex);
    }

}
