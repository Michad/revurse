import Konva from 'konva';
import MoleculeModel from '../models/MoleculeModel'
import ScreenCoordinate from '../view/util/ScreenCoordinate'
import { Cell } from './Cell';
import World from './World';
import GridCoordinate from './util/GridCoordinate';
import Base from './Base';

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

		this.setCell(cell, true);
	}

	toJsonData() {
		return this.model;
	}

	speed() {
		return 1.0;
	}

	setFormula(newFormula: string): void {
		this.model.formula = newFormula;
		this.view.remove();
		this.view = this.draw();
	}

	setCell(newCell: Cell, force: boolean = false) {
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

	findNextCell() {
		let candidate = this.currentCell.findDestination(this.model.cellOffset) 
		
		let nextCell = candidate ? this.world.findCell(candidate) : null
		if (nextCell?.canAccept(this.currentCell)) return nextCell;

		return null;
	}

	update(deltaT) {
		let nextCell = this.findNextCell();
		if (nextCell) {
			this.model.transition += deltaT / this.speed();

			if (this.model.transition >= 1) {
				this.setCell(nextCell!);
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
			text: this.model.formula,
			fontSize: 30,
			fontFamily: 'Calibri',
			fill: 'orange',
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
		let nextCell = this.findNextCell();
		if (nextCell) {
			pos = this.world.universe.gridToScreen(this.currentCell.coordinate)
				.interpolate(this.world.universe.gridToScreen(nextCell.coordinate), this.model.transition);
		} else {
			pos = this.world.universe.gridToScreen(this.currentCell.coordinate);
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
