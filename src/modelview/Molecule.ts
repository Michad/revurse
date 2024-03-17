import Konva from 'konva';
import MoleculeModel from '../models/MoleculeModel'
import ScreenCoordinate from '../view/util/ScreenCoordinate'
import { Cell } from './Cell';
import World from './World';
import GridCoordinate from './util/GridCoordinate';
import Base from './Base';
import FormulaModel from '../models/FormulaModel';
import { CellSlot } from '../constants/Enums';

class Molecule implements Base<MoleculeModel> {
	model: MoleculeModel
	world: World
	currentCell: Cell
	view: Konva.Node
	layer: Konva.Layer

	constructor(world: World, moleculeModel: MoleculeModel, layer: Konva.Layer, cell: Cell) {
		this.world = world;
		this.model = moleculeModel;
		this.layer = layer;
		this.view = this.draw();

		this.setCellWithEvents(cell, true);
	}

	getModel() {
		return this.model;
	}

	speed() {
		return 0.3;
	}

	setSlot(slot : CellSlot) {
		this.model.cellOffset = slot;
	}

	setFormula(newFormula: FormulaModel): void {
		this.model.formula = newFormula;
		this.view.remove();
		this.view = this.draw();
	}

	getFormula(): FormulaModel {
		return this.model.formula;
	}

	setCellWithEvents(newCell: Cell, force: boolean = false) {
		if (force) {
			this.model.cellOffset = newCell.onArrival(this, null, true)!;
			this.currentCell = newCell;
		} else {

			let lastCell = this.currentCell;
			let offset = newCell.onArrival(this, lastCell, false);

			if (offset !== null) {
				this.currentCell?.onDeparture(this.model.cellOffset);

				this.currentCell = newCell;
				this.model.transition = 0;
				this.model.cellIndex = this.currentCell.coordinate.toIndex();
				this.model.cellOffset = offset!;
			}
		}
		this.updateView();
	}

	findNextStep() : [Cell, CellSlot] | null {
		let candidate = this.currentCell.findDestination(this.model.cellOffset);

		if(candidate instanceof GridCoordinate) {
			let nextCell = candidate ? this.world.findCell(candidate) : null
			if (nextCell?.canAccept(this, this.currentCell)) return [nextCell, nextCell.findSlotForNeighbor(this.currentCell.coordinate)!];
		} else if(candidate != null) {
			return [this.currentCell, candidate];
		}

		return null;
	}

	update(deltaT) {
		let nextStep = this.findNextStep();
		if (nextStep) {
			this.model.transition += deltaT / this.speed();

			if (this.model.transition >= 1) {
				if(nextStep[0] && nextStep[0] != this.currentCell) {
					this.setCellWithEvents(nextStep[0]);
				} else {
					this.currentCell.onSlotTransfer(this.model.cellOffset, nextStep[1]);
					this.setSlot(nextStep[1]);
					this.model.transition = 0;
				}
			}

			this.updateView();
		} else {
			//this.model.transition = 0;
		}
	}

	draw() {
		let text = new Konva.Text({
			x: 0,
			y: 0,
			text: this.model.formula.toString(),
			fontSize: 30,
			fontFamily: 'Calibri',
			fill: 'red',
			stroke: 'white',
			strokeWidth: 0.5,
			align: 'center'
		});

		text.listening(false);
		text.offsetX(text.width() / 2);
		text.offsetY(text.height() / 2);

		this.layer.add(text);

		return text;
	}

	updateView() {
		let pos: ScreenCoordinate;
		let nextCell = this.findNextStep();
		pos = this.currentCell.calculateSlotScreenCoord(this.model.cellOffset);
		if (nextCell) {
			pos = pos.interpolate(nextCell[0].calculateSlotScreenCoord(nextCell[1]), this.model.transition);
		} 

		//console.log(JSON.stringify(pos));
		this.view.position(pos);
	}

	remove() {
		this.view?.remove();
		this.world.molecules.delete(this);
	}
}

export default Molecule;
