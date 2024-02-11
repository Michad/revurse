import Konva from 'konva';
import MoleculeModel from './models/MoleculeModel';
import CellModel from './models/CellModel';
import Molecule from './modelview/Molecule';
import Cell from './modelview/Cell';
import World from './modelview/World';
import { gridToScreen, rotateAroundCenter } from './util/ViewUtil';
import GridCoordinate from './util/GridCoordinate';
import ScreenCoordinate from './util/ScreenCoordinate';
import { X_COUNT, Y_COUNT } from './util/Constants';


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

};

if (document.readyState === "complete" || document.readyState === "interactive") {
	setTimeout(init, 1);
} else {
	document.addEventListener("DOMContentLoaded", init);
}
