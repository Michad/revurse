import Konva from 'konva';
import MoleculeModel from '../models/MoleculeModel'
import { gridToScreen } from '../util/ViewUtil'
import ScreenCoordinate from '../util/ScreenCoordinate'

class Molecule {
	model: MoleculeModel
	world: any
	currentCell: any
	nextCoord: any
	view: any

	constructor(world, moleculeModel, layer) {
		this.world = world;
		this.model = moleculeModel;
		this.view = this.draw(layer);
	}

	toJsonData() {
		return this.model;
	}

	speed() {
		return 1.0;
	}

	setCell(currentCell, preserveTransition = null) {
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
		}
		if (this.model.transition >= 1) {
			this.setCell(nextCell);
		}
		this.updateView();
	}

	draw(layer) {
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

		layer.add(text);

		return text;
	}

	updateView() {
		let pos: ScreenCoordinate;
		let nextCell = this.findNextCell();
		if (nextCell) {
			pos = gridToScreen(this.currentCell.coordinate)
				.interpolate(gridToScreen(nextCell.coordinate), this.model.transition);
		} else {
			pos = gridToScreen(this.currentCell.coordinate);
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