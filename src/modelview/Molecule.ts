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
	currentCell: Cell<any>
	view: Konva.Text
	layer: Konva.Layer

	constructor(world: World, moleculeModel: MoleculeModel, layer: Konva.Layer, cell: Cell<any>) {
		this.world = world;
		this.model = moleculeModel;
		this.layer = layer;
		this.view = this.draw();

		this.currentCell = cell;
		this.model.setCellWithEvents(cell.model, true);
	}

	onChange(): void {
		if(this.view.text() !== this.model.formula.toString()) {
			this.view?.remove();
			this.view = this.draw();
		} 
		if(this.currentCell.getModel().coordinate !== this.model.coordinate) {
			this.currentCell = this.world.findCell(this.model.coordinate)!;
		}
	}

	getModel() {
		return this.model;
	}

	speed() {
		return 0.3;
	}

	getFormula(): FormulaModel {
		return this.model.formula;
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

	updateView(deltaT: number) {
		let pos: ScreenCoordinate;
		let nextCellModel = this.model.findNextStep();
		pos = this.currentCell.calculateSlotScreenCoord(this.model.cellSlot);
		if (nextCellModel) {
			let nextCell = this.world.findCell(nextCellModel[0].coordinate);
			pos = pos.interpolate(nextCell!.calculateSlotScreenCoord(nextCellModel[1]), this.model.transition);
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
