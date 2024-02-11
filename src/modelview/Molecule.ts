import Konva from 'konva';
import MoleculeModel from '../models/MoleculeModel'
import ScreenCoordinate from '../util/ScreenCoordinate'
import Cell from './Cell';
import World from './World';
import GridCoordinate from 'util/GridCoordinate';
import Base from './Base';

class Molecule implements Base<MoleculeModel> {
	model: MoleculeModel
	world: World
	currentCell: Cell
	nextCoord: GridCoordinate | null
	view: Konva.Node
	layer: Konva.Layer

	constructor(world : World, moleculeModel : MoleculeModel, layer : Konva.Layer, cell : Cell) {
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

	setCell(currentCell : Cell, preserveTransition : boolean = false) {
		if (!preserveTransition) this.model.transition = 0;

		this.currentCell?.onDeparture(this);
		this.currentCell = currentCell;
		this.model.cellIndex = this.currentCell.coordinate.toIndex();
		this.nextCoord = this.currentCell.onArrival(this);
	}

	findNextCell() {
		return this.nextCoord ? this.world.findCell(this.nextCoord) : null
	}

	update(deltaT) {
		let nextCell = this.findNextCell();
		if (nextCell) {
			this.model.transition += deltaT / this.speed();

			if (this.model.transition >= 1) {
				this.setCell(nextCell!);
			}
		}
		this.updateView();
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
