import Konva from "konva";
import GridCoordinate from "../util/GridCoordinate";
import Molecule from "../Molecule";
import { Cell } from "../Cell";


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