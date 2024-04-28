import { CellSlot } from "../constants/Enums";
import GridCoordinate from "../modelview/util/GridCoordinate";
import BaseModel from "./BaseModel";
import CellModel from "./CellModel";
import FormulaModel from "./FormulaModel";
import WorldModel from "./WorldModel";

let SPEED = 3;

class MoleculeModel implements BaseModel {
    _world: WorldModel
    coordinate: GridCoordinate
    cellSlot: CellSlot
    transition: number
    formula: FormulaModel

    constructor() {

    }


	setCellWithEvents(newCell: CellModel, force: boolean = false) {
		if (force) {
			this.cellSlot = newCell.onArrival(this, null, true)!;
			this.coordinate = newCell.coordinate;
		} else {
			let lastCell = this._world.findCell(this.coordinate)!;
			let offset = newCell.onArrival(this, lastCell, false);

			if (offset !== null) {
				lastCell.onDeparture(this.cellSlot);

				this.coordinate = newCell.coordinate;
				this.transition = 0;
				this.cellSlot = offset!;
			}
		}
	}

	findNextStep() : [CellModel, CellSlot] | null {
        let currentCell = this._world.findCell(this.coordinate)!;
		let candidate = currentCell.findDestination(this.cellSlot);

		if(candidate instanceof GridCoordinate) {
			let nextCell = candidate ? this._world.findCell(candidate) : null
			if (nextCell?.canAccept(this, currentCell)) return [nextCell, nextCell.findSlotForNeighbor(currentCell.coordinate)!];
		} else if(candidate != null) {
			return [currentCell, candidate];
		}

		return null;
	}

	update(deltaT : number) {
        let currentCell = this._world.findCell(this.coordinate)!;
		let nextStep = this.findNextStep();
		if (nextStep) {
			this.transition += deltaT * SPEED;

			if (this.transition >= 1) {
				if(nextStep[0] && nextStep[0] != currentCell) {
					this.setCellWithEvents(nextStep[0]);
				} else {
					currentCell.onSlotTransfer(this.cellSlot, nextStep[1]);
					this.cellSlot = nextStep[1];
					this.transition = 0;
				}
			}
            
            this._world._universe.onModelChange(this);
		} else {
			//this.model.transition = 0;
		}
	}


	setSlot(slot : CellSlot) {
		this.cellSlot = slot;
	}

	setFormula(newFormula: FormulaModel): void {
		this.formula = newFormula;
        //TODO: View hook
	}
}

export default MoleculeModel;
