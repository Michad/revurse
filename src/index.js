import Konva from 'konva';
import MoleculeModel from './models/MoleculeModel';
import CellModel from './models/CellModel';
import Molecule from './modelview/Molecule'
import { gridToScreen, rotateAroundCenter } from './util/ViewUtil'
import GridCoordinate from './util/GridCoordinate'
import ScreenCoordinate from './util/ScreenCoordinate'



const BORDER_BUFFER = 2.5;
const BORDER_BUFFER_X = 1;


const ELEMENT_NAME_PARTS = [
	{ name: 'alf', code: 'a' },
	{ name: 'bra', code: 'b' },
	{ name: 'cha', code: 'c' },
	{ name: 'del', code: 'd' },
	{ name: 'ech', code: 'e' },
	{ name: 'fox', code: 'f' },
	{ name: 'golf', code: 'g' },
	{ name: 'hot', code: 'h' },
	{ name: 'ind', code: 'i' },
	{ name: 'jul', code: 'j' },
	{ name: 'kil', code: 'k' },
	{ name: 'lim', code: 'l' },
	{ name: 'mik', code: 'm' },
	{ name: 'nov', code: 'n' },
	{ name: 'osc', code: 'o' },
	{ name: 'papa', code: 'p' },
	{ name: 'que', code: 'q' },
	{ name: 'rom', code: 'r' },
	{ name: 'sie', code: 's' },
	{ name: 'tan', code: 't' },
	{ name: 'uni', code: 'u' },
	{ name: 'vic', code: 'v' },
	{ name: 'whi', code: 'w' },
	{ name: 'xay', code: 'x' },
	{ name: 'yank', code: 'y' },
	{ name: 'zul', code: 'z' },
];


function calculateElementName(num, isSymbol) {
	num--;
	let nameArr = [];
	do {
		let i = num % (ELEMENT_NAME_PARTS.length);
		nameArr.push(isSymbol ? ELEMENT_NAME_PARTS[i].code : ELEMENT_NAME_PARTS[i].name);
		num /= ELEMENT_NAME_PARTS.length;
		num = parseInt(num);
	} while (num > 0);

	let name = nameArr.reverse().join("");

	if (!isSymbol) {
		name += "ium";
		name = name.replace("aa", "a");
		name = name.replace("ii", "i");
		name = name.replace("kk", "k");
	}

	return name.charAt(0).toUpperCase() + name.substring(1);
}

//for(let i = 1; i < 1000; i++) {
//    console.log(i + ": " + calculateElementName(i, true) + " - " + calculateElementName(i));
//}



class Cell {
	model = null;
	layer = null;
	view = null;
	coordinate = new GridCoordinate(0, 0);
	molecules = new Set();

	constructor(model, layer, overrideView) {
		this.model = model;
		this.coordinate = new GridCoordinate(model.index);
		this.layer = layer;
		if (overrideView) {
			this.view = overrideView;
		} else {
			this.draw();
		}
	}

	toJsonData() {
		return this.model;
	}

	remove() {
		this.view?.remove();
		this.molecules.forEach((m) => m.remove());
	}

	draw() {
		let self = this;
		var imageObj = new Image();
		let screnCoord = gridToScreen(self.coordinate);

		imageObj.onload = function () {
			let node = new Konva.Image({ image: imageObj });
			self.view = node;

			node.model = self;
			node.setAttrs({
				x: screnCoord.x - POLY_WIDTH / 2 - BORDER_BUFFER_X / 2,
				y: screnCoord.y - POLY_HEIGHT / 2 - POLY_HEIGHT / Y_COUNT / 2 - BORDER_BUFFER / 2,
				width: POLY_WIDTH + BORDER_BUFFER_X,
				height: POLY_HEIGHT + POLY_HEIGHT / Y_COUNT + BORDER_BUFFER,
				cornerRadius: 0,
				opacity: 0.75
			});

			if (self.model.rotation) {
				rotateAroundCenter(node, self.model.rotation);
			}

			node.listening(false);

			self.layer.add(node);

		};
		//imageObj.crossOrigin = 'Anonymous';
		imageObj.src = self.model.img;
	}

	update() {

	}

	canAccept(fromCell) {
		return true;
	}

	onDeparture(molecule) {
		this.molecules.delete(molecule);
	}

	onArrival(molecule) {
		this.molecules.add(molecule);
		//Todo: inheritance
		if (this.model.type === "straight") {
			return this.coordinate.findNeighbor(this.model.rotation);
		}
		if (this.model.type === "slight_turn") {
			let r = this.coordinate.findNeighbor(this.model.rotation);
			//console.log(JSON.stringify(this.coordinate) + " with rot of " + this.rotation + " goes to " + JSON.stringify(r));
			return r;
		}
	}
}



class World {
	gridLayer = null;
	cellLayer = null;
	moleculeLayer = null;
	cells = null;
	grids = null;
	molecules = new Set();

	constructor(gridLayer, cellLayer, moleculeLayer, rawWorld) {
		this.gridLayer = gridLayer;
		this.cellLayer = cellLayer;
		this.moleculeLayer = moleculeLayer;
		this.cells = Array.apply(null, Array(X_COUNT * Y_COUNT)).map(function () { });
		this.grids = Array.apply(null, Array(X_COUNT * Y_COUNT)).map(function () { });

		if (rawWorld) {
			rawWorld.cells.forEach((c) => {
				this.initCell(c);
			});

			rawWorld.molecules.forEach((m) => {
				this.addMolecule(m);
			});
		}
	}

	addMolecule(moleculeModel) {
		let m = new Molecule(this, moleculeModel, this.moleculeLayer);

		let c = this.findCell(new GridCoordinate(moleculeModel.cellIndex));

		if (c) {
			m.setCell(c, true);

			this.molecules.add(m);
		}
	}

	update(deltaT) {
		this.cells.forEach((c) => c && c.update(deltaT));
		this.molecules.forEach((m) => m && m.update(deltaT));
	}

	findCell(gridCoord) {
		return this.cells[gridCoord.toIndex()];
	}

	initGridCell(gridCoord, isEdge) {
		let screenCoord = gridToScreen(gridCoord);

		let hex = new Konva.RegularPolygon({
			x: screenCoord.x,
			y: screenCoord.y,
			sides: 6,
			radius: POLY_WIDTH / 2,
			fill: isEdge ? 'yellow' : 'green',
			stroke: 'black',
			strokeWidth: 4,
			/*	    shadowOffsetX : 20,
				shadowOffsetY : 25,
				shadowBlur : 40,
				opacity : 0.5,*/
			rotation: 30
		});

		let text = new Konva.Text({
			x: screenCoord.x - 30,
			y: screenCoord.y - 30,
			text: "{" + gridCoord.x + "," + gridCoord.y + "}",
			fontSize: 30,
			fontFamily: 'Calibri',
			fill: 'black',
			align: 'center'
		});


		if (!isEdge) {
			hex.on('click', (e) => {
				this.clickCell(gridCoord);
			});

			hex.on('rightclick', (e) => {
			});
		}

		let gridCell = new Cell(new CellModel(gridCoord.toIndex(), 'grid', 0, null), this.gridLayer, hex);
		this.gridLayer.add(hex);
		this.grids[gridCoord.toIndex()] = gridCell;

		return hex;
	}


	clickCell(gridCoord) {
		switch (window.currentSelection.tool) {
			case "place":
				this.initCell(new CellModel(gridCoord.toIndex(), window.currentSelection.cellType, window.currentSelection.rotation ?? 0, window.currentSelection.img()));
				break;
			case "molecule":
				this.addMolecule(new MoleculeModel(gridCoord.toIndex(), 0, calculateElementName(parseInt(Math.random() * 1000), true)));
				break;
			case "erase":
				this.removeCell(gridCoord);
				break;
		}
	}

	initCell(cellModel) {
		let gridCoord = new GridCoordinate(cellModel.index);

		let cell = new Cell(cellModel, this.cellLayer);

		this.removeCell(gridCoord);
		this.cells[gridCoord.toIndex()] = cell;
	}

	removeCell(gridCoord) {
		let curCell = this.cells[gridCoord.toIndex()];
		if (curCell) {
			curCell.remove();
		}

		this.cells[gridCoord.toIndex()] = null;
	}

	toJson() {
		let obj = {};
		obj.cells = this.cells.filter((m) => m).map((c, i) => c.toJsonData());
		obj.molecules = [...this.molecules.values()].map((m) => m.toJsonData());
		return JSON.stringify(obj);
	}

	initializeGrid() {
		this.grids = [];

		let i = 0;

		for (let x = 0; x < X_COUNT; x++) {
			for (let y = 0; y < Y_COUNT; y++) {
				let isInner = true;
				let isEdge = false;

				if (y == 0 || y == 7) {
					if (x == 3 || x == 5) {
						isEdge = true;
						isInner = false;
					} else if (y == 0) {
						isInner = false;
					} else if (y == 7) {
						if (x > 1 && x < 7) {
							isInner = true;
						} else {
							isInner = false;
						}
					}
				} else if (x == 0 || x == 8) {
					if (y == 4) {
						isInner = true;
					} else if (y == 3 || y == 5) {
						isEdge = true;
						isInner = false;
					} else {
						isInner = false;
					}
				} else if (x == 1 || x == 7) {
					if (y <= 1 || y >= 6) {
						isInner = false;
					} if (y == 1 || y == 6) {
						isEdge = true;
					}
				}

				if (!isInner && !isEdge) continue;

				this.initGridCell(new GridCoordinate(x, y), isEdge);
			}
		}

	}
}


function makeImage() {
	let revertPos = stage.position();
	let revertSize = stage.size();
	let revertScale = stage.scale();
	stage.position(new ScreenCoordinate(-X_MIN, -Y_MIN));
	stage.size({ width: X_MAX - X_MIN, height: Y_MAX - Y_MIN });
	stage.scale({ x: 1, y: 1 });
	//stage.size(X_MAX, Y_MAX);
	console.log(stage.position());
	console.log(stage.size());

	let dataURL = stage.toDataURL({ pixelRatio: 0.5 });
	//console.log(dataURL);

	stage.position(revertPos);
	stage.size(revertSize);
	stage.scale(revertScale);

	return dataURL;
}

function loadHoverCell(layer, initialPos) {
	if (window.currentSelection.cellType) {
		var imageObj = new Image();
		imageObj.onload = function () {
			let node = new Konva.Image({ image: imageObj });

			node.setAttrs({
				x: initialPos?.x ?? 0,
				y: initialPos?.y ?? 0,
				width: POLY_WIDTH + BORDER_BUFFER_X,
				height: POLY_HEIGHT + POLY_HEIGHT / Y_COUNT + BORDER_BUFFER,
				cornerRadius: 0,
				opacity: 0.5
			});

			node.listening(false);

			if (window.currentSelection.rotation) {
				rotateAroundCenter(node, window.currentSelection.rotation);
			}

			layer.add(node);
			window.hoverNode = node;
		};

		//imageObj.crossOrigin = 'Anonymous';
		imageObj.src = window.currentSelection.img();
	}
}


function init() {
	window.X_COUNT = 9;
	window.Y_COUNT = 8;

	window.stage = new Konva.Stage({
		container: 'container',
		/*    width: window.innerWidth,
			  height: window.innerHeight,*/
		width: document.getElementById("container").offsetWidth,
		height: document.getElementById("container").offsetHeight,
		draggable: true,
	});


	window.cursorLayer = new Konva.Layer();

	window.X_MIN = 0;
	window.X_MAX = Math.min(stage.width(), stage.height());
	window.Y_MIN = 0;
	window.Y_MAX = X_MAX;

	window.POLY_ROW_WIDTH = (X_MAX - X_MIN) / X_COUNT * 0.9;
	window.POLY_WIDTH = POLY_ROW_WIDTH * 4 / 3;
	window.POLY_HEIGHT = POLY_WIDTH * 0.8660254;
	X_MIN = (stage.width() - (X_COUNT) * POLY_ROW_WIDTH) / 2 - 0.5 * POLY_WIDTH - 2.5;
	Y_MIN = (stage.height() - (Y_COUNT) * POLY_HEIGHT) / 2 + 0.5 * POLY_HEIGHT - 2.5;
	X_MAX = (stage.width() + (X_COUNT) * POLY_ROW_WIDTH) / 2 - (POLY_WIDTH - POLY_ROW_WIDTH) + 2.5;//+0.5*POLY_WIDTH;
	Y_MAX = (stage.height() + (Y_COUNT) * POLY_HEIGHT) / 2 + 0.5 * POLY_HEIGHT + 2.5;


	window.baseLayer = new Konva.Layer();
	window.cellLayer = new Konva.Layer();
	window.moleculeLayer = new Konva.Layer();

	let rawWorld = null;
	if (localStorage.world) {
		console.log("Loading... " + localStorage.world);
		rawWorld = JSON.parse(localStorage.world);
	}
	window.world = new World(baseLayer, cellLayer, moleculeLayer, rawWorld);


	stage.on('wheel', (e) => {
		const SCALE_FACTOR = 1.10;

		e.evt.preventDefault();

		let curScale = stage.scaleX();
		let pointer = new ScreenCoordinate(stage.getPointerPosition());
		let stagePos = new ScreenCoordinate(stage.getPosition());
		let center = new ScreenCoordinate(stage.getWidth(), stage.getHeight()).scale(0.5);

		let newScale = curScale * (e.evt.deltaY < 0 ? SCALE_FACTOR : 1.0 / SCALE_FACTOR);
		stage.scale({ x: newScale, y: newScale });

		//TODO: decide which to go with
		//Center on cursor
		//let newPos = pointer.minus(pointer.minus(stagePos).scale(newScale / curScale));
		//Center on center
		let newPos = center.minus(center.minus(stagePos).scale(newScale / curScale));

		stage.position(newPos);
	});

	document.addEventListener('keydown', function (e) {
		if (e.code === 'Escape') {
			baseLayer.remove();
			cellLayer.remove();
			moleculeLayer.remove();
			window.baseLayer = new Konva.Layer();
			window.cellLayer = new Konva.Layer();
			window.moleculeLayer = new Konva.Layer();

			window.world = new World(baseLayer, cellLayer, moleculeLayer, null);
			world.initializeGrid();

			stage.add(baseLayer);
			stage.add(cellLayer);
			stage.add(moleculeLayer);

			baseLayer.zIndex(0);
			cellLayer.zIndex(1);
			moleculeLayer.zIndex(2);
			cursorLayer.zIndex(3);

			e.preventDefault();
			return false;
		} else if (e.code === 'KeyS') {
			localStorage.world = world.toJson();
			console.log(localStorage.world);
		} else if (e.code === 'Tab') {
			window.currentSelection.rotation += 60;

			if (window.hoverNode) {
				rotateAroundCenter(hoverNode, currentSelection.rotation);
			}

			e.preventDefault();
			return false;
		}

	});

	stage.on('mousemove', function (e) {
		if (window.hoverNode) {
			//if(!e.evt.movementX && !e.evt.movementY) {
			hoverNode.rotation(0);
			hoverNode.offset({ x: 0, y: 0 });
			hoverNode.position({ x: e.evt.x - hoverNode.width() / 5, y: e.evt.y + hoverNode.height() / 4 });
			rotateAroundCenter(hoverNode, currentSelection.rotation);
			//} else {
			//hoverNode.move({x: e.evt.movementX , y: e.evt.movementY});
			//}
		}
	});

	document.querySelectorAll('.button')
		.forEach((b, i) => b.addEventListener('click', function (e) {
			let tool = b.attributes['data-tool']?.value;
			let cellType = b.attributes['data-cell']?.value;
			let href = b.getElementsByTagName("img")[0]?.attributes["src"]?.value;

			document.querySelectorAll('.selected').forEach((s) => s.classList.remove('selected'));
			b.classList.add('selected');

			window.currentSelection = { tool: tool, cellType: cellType, img: () => href, rotation: 0 };

			if (window.hoverNode) {
				window.hoverNode.remove();
				delete window.hoverNode;
			}

			if (cellType) {
				loadHoverCell(cursorLayer, stage.getPointerPosition());
			}

			e.preventDefault();
			return false;
		}));

	stage.add(baseLayer);
	stage.add(cellLayer);
	stage.add(moleculeLayer);
	stage.add(cursorLayer);


	baseLayer.zIndex(0);
	cellLayer.zIndex(1);
	moleculeLayer.zIndex(2);
	cursorLayer.zIndex(3);


	/*layer.clipX(X_MIN);
	layer.clipWidth(X_MAX-X_MIN);
	layer.clipY(Y_MIN);
	layer.clipHeight(Y_MAX-Y_MIN);
	*/
	//setInterval(function() { console.log(stage.position());}, 1000);


	world.initializeGrid();


	window.currentSelection = { tool: "place", cellType: 'meta1', img: makeImage };

	stage.position({ x: 0, y: -POLY_HEIGHT / 2 });
	//stage.position({x:-X_MIN,y:-Y_MIN});
	//stage.size({width:X_MAX-X_MIN,height:Y_MAX-Y_MIN});

	window.lastUpdateTime = new Date().valueOf();
	setInterval(function () {
		let now = new Date().valueOf();

		world.update((now - lastUpdateTime) / 1000.0);
		lastUpdateTime = now;
	}, 100);

	//unit tests

	for (var x = 0; x < X_COUNT; x++) {
		for (var y = 0; y < Y_COUNT; y++) {
			let c1 = new GridCoordinate(x, y);
			let c2 = new GridCoordinate(c1.toIndex());
			if (c1.x !== c2.x || c1.y !== c2.y) {
				console.log("test fail: " + JSON.stringify(c1) + " != " + JSON.stringify(c2));
			}
		}
	}
};

if (document.readyState === "complete" || document.readyState === "interactive") {
	setTimeout(init, 1);
} else {
	document.addEventListener("DOMContentLoaded", init);
}
