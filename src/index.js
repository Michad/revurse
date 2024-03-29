import Konva from 'konva';
import World from './modelview/World';
import { rotateAroundCenter } from './view/util/ViewManipulation';
import ScreenCoordinate from './view/util/ScreenCoordinate';
import { BORDER_BUFFER, BORDER_BUFFER_X, X_COUNT, Y_COUNT } from './constants/Constants';
import Universe from './modelview/Universe';
import UniverseModel from './models/UniverseModel';
import { LayerType } from './constants/Enums';


function makeImage() {
	let stage = window.universe.stage;

	let revertPos = stage.position();
	let revertSize = stage.size();
	let revertScale = stage.scale();
	let screenCalcs = window.universe.getScreenCalculations();
	window.universe.activeWorld.layers[LayerType.MOLECULE].opacity(0);

	stage.position(new ScreenCoordinate(-screenCalcs.xMin, -screenCalcs.yMin));
	stage.size({ width: screenCalcs.xMax - screenCalcs.xMin, height: screenCalcs.yMax - screenCalcs.yMin });
	stage.scale({ x: 1, y: 1 });
	//stage.size(X_MAX, Y_MAX);
	console.log(stage.position());
	console.log(stage.size());

	let dataURL = stage.toDataURL({ pixelRatio: 0.5 });
	//console.log(dataURL);

	stage.position(revertPos);
	stage.size(revertSize);
	stage.scale(revertScale);
	window.universe.activeWorld.layers[LayerType.MOLECULE].opacity(1);

	return dataURL;
}

function loadHoverCell(layer, initialPos) {
	if (window.currentSelection.cellType) {
		var imageObj = new Image();
		imageObj.onload = function () {
			let node = new Konva.Image({ image: imageObj });
			let screenCalcs = window.universe.getScreenCalculations();

			node.setAttrs({
				x: initialPos?.x ?? 0,
				y: initialPos?.y ?? 0,
				width: screenCalcs.polyWidth + BORDER_BUFFER_X,
				height: screenCalcs.polyHeight + screenCalcs.polyHeight / Y_COUNT + BORDER_BUFFER,
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

		imageObj.src = window.currentSelection.img();
	}
}

function onButtonClick(buttonElement) {
	let tool = buttonElement.attributes['data-tool']?.value;
	let cellType = buttonElement.attributes['data-cell']?.value;
	let href = buttonElement.getElementsByTagName("img")[0]?.attributes["src"]?.value;

	document.querySelectorAll('.selected').forEach((s) => s.classList.remove('selected'));
	buttonElement.classList.add('selected');

	window.currentSelection = { tool: tool, cellType: cellType, img: () => href, rotation: 0 };

	if (window.hoverNode) {
		window.hoverNode.remove();
		delete window.hoverNode;
	}

	if (cellType) {
		loadHoverCell(cursorLayer, window.universe.stage.getPointerPosition());
	}
}


function jsonReplacer(key, value) {
	if(key.startsWith("_")) return undefined;
				
	if (value instanceof Map) {
		return {
			dataType: 'Map',
			value: Array.from(value.entries()), // or with spread: value: [...value]
		};
	} else {
		return value;
	}
}
function jsonReviver(key, value) {
	if (typeof value === 'object' && value !== null) {
		if (value.dataType === 'Map') {
			return new Map(value.value);
		}
	}
	return value;
}

function init() {

	window.cursorLayer = new Konva.Layer();


	let universeModel = null;
	if (localStorage.universe) {
		console.log("Loading... " + localStorage.universe);
		universeModel = UniverseModel.copy(JSON.parse(localStorage.universe, jsonReviver));
		if (!universeModel.activeWorld) universeModel = null;
	}

	window.universe = new Universe(document.getElementById("container"), universeModel);
	let stage = window.universe.stage;
	let screenCalcs = window.universe.getScreenCalculations();


	stage.on('wheel', (e) => {
		const SCALE_FACTOR = 1.10;

		e.evt.preventDefault();

		if (window.hoverNode) {
			window.currentSelection.rotation += 60 * (e.evt.deltaY < 0 ? -1 : 1);

			if (window.hoverNode) {
				rotateAroundCenter(hoverNode, currentSelection.rotation);
			}
		} else {
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
		}
	});

	document.addEventListener('keydown', function (e) {
		if (e.code === 'Escape' && e.shiftKey) {
			if (confirm("Destory universe?")) {
				console.log("Deleting: " + localStorage.universe);
				delete localStorage.universe;

				window.location = window.location;
			}

			e.preventDefault();
			return false;
		} else if (e.code === 'KeyS') {

			localStorage.universe = JSON.stringify(window.universe.getModel(), jsonReplacer);
			console.log(localStorage.universe);
		} else if (e.code === 'Tab') {
			if (e.shiftKey) {
				window.currentSelection.rotation -= 60;
			} else {
				window.currentSelection.rotation += 60;
			}

			if (window.hoverNode) {
				rotateAroundCenter(hoverNode, currentSelection.rotation);
			}

			e.preventDefault();
			return false;
		} else {
			let buttonElement = document.querySelector('.button[data-shortcut="' + e.code + '"]');
			if (buttonElement) onButtonClick(buttonElement);
		}

	});

	stage.on('mousemove', function (e) {
		if (window.hoverNode) {
			hoverNode.rotation(0);
			hoverNode.offset({ x: 0, y: 0 });
			hoverNode.position({ x: e.evt.x - hoverNode.width() / 5, y: e.evt.y + hoverNode.height() / 4 });
			rotateAroundCenter(hoverNode, currentSelection.rotation);
		}
	});

	document.querySelectorAll('.button')
		.forEach((b, i) => b.addEventListener('click', function (e) {
			onButtonClick(b);

			e.preventDefault();
			return false;
		}));

	stage.add(cursorLayer);

	window.universe.activeWorld.initializeGrid();


	window.currentSelection = { tool: "place", cellType: 'meta', img: makeImage };

	stage.position({ x: 0, y: - screenCalcs.polyHeight / 2 });

	window.lastUpdateTime = new Date().valueOf();
	setInterval(function () {
		let now = new Date().valueOf();

		window.universe.model.update((now - lastUpdateTime) / 1000.0);
		lastUpdateTime = now;
	}, 100);
	window.lastUpdateViewTime = new Date().valueOf();
	setInterval(function () {
		let now = new Date().valueOf();

		window.universe.updateView((now - lastUpdateViewTime) / 1000.0);
		lastUpdateViewTime = now;
	}, 100);
};

if (document.readyState === "complete" || document.readyState === "interactive") {
	setTimeout(init, 1);
} else {
	document.addEventListener("DOMContentLoaded", init);
}
