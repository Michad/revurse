const BORDER_BUFFER=2.5;
const BORDER_BUFFER_X=1;

const ELEMENT_NAME_PARTS = [
    {name: 'alf',  code: 'a'},
    {name: 'bra', code: 'b'},
    {name: 'cha', code: 'c'},
    {name: 'del', code: 'd'},
    {name: 'ech',  code: 'e'},
    {name: 'fox',  code: 'f'},
    {name: 'golf', code: 'g'},
    {name: 'hot',  code: 'h'},
    {name: 'ind',  code: 'i'},
    {name: 'jul',  code: 'j'},
    {name: 'kil',  code: 'k'},
    {name: 'lim',  code: 'l'},
    {name: 'mik',  code: 'm'},
    {name: 'nov',  code: 'n'},
    {name: 'osc',  code: 'o'},
    {name: 'papa', code: 'p'},
    {name: 'que',  code: 'q'},
    {name: 'rom',  code: 'r'},
    {name: 'sie',  code: 's'},
    {name: 'tan',  code: 't'},
    {name: 'uni',  code: 'u'},
    {name: 'vic',  code: 'v'},
    {name: 'whi', code: 'w'},
    {name: 'xay',  code: 'x'},
    {name: 'yank', code: 'y'},
    {name: 'zul',  code: 'z'},
];



function calculateElementName(num, isSymbol) {
    num--;
    let nameArr = [];
    do {
	let i = num % (ELEMENT_NAME_PARTS.length);
	nameArr.push(isSymbol ? ELEMENT_NAME_PARTS[i].code : ELEMENT_NAME_PARTS[i].name);
	num /= ELEMENT_NAME_PARTS.length ;
	num = parseInt(num);
    } while(num > 0);

    let name = nameArr.reverse().join("");

    if(!isSymbol) {
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

class ScreenCoordinate {
    x = 0;
    y = 0;

    constructor(x, y) {
	this.x = x;
	this.y = y;
    }
}

class GridCoordinate {
    x = 0;
    y = 0;

    constructor(x, y) {
	if(y === undefined) {
	    this.y = x % Y_COUNT;
	    this.x = (x-this.y) / Y_COUNT;
	} else {
	    this.x = x;
	    this.y = y;
	}
    }

    toIndex() {
	return this.x * Y_COUNT + this.y;
    }
}


class Cell {
    type = null;
    view = null;
    coordinate = new GridCoordinate(0,0);

    constructor(type, coordinate, view) {
	this.type = type;
	this.coordinate = coordinate;
	this.view = view;
	this.view.model = this;
    }

    remove() {
	this.view.remove();
    }
}

class World {
    gridLayer = null;
    cellLayer = null;
    cells = null;
    grids = null;

    constructor(gridLayer, cellLayer, cells, grids) {
	this.gridLayer = gridLayer;
	this.cellLayer = cellLayer;
	this.cells = cells || Array.apply(null, Array(X_COUNT*Y_COUNT)).map(function () {});
	this.grids = grids || Array.apply(null, Array(X_COUNT*Y_COUNT)).map(function () {});
    }

    loadGrid(gridCoord, isEdge) {
	let screenCoord = gridToScreen(gridCoord);
	
	let hex = new Konva.RegularPolygon({
	    x: screenCoord.x,
	    y: screenCoord.y,
	    sides: 6,
	    radius: POLY_WIDTH / 2,
	    fill: isEdge ? 'yellow' : 'green' ,
	    stroke: 'black',
	    strokeWidth: 4,
	    /*	    shadowOffsetX : 20,
		    shadowOffsetY : 25,
		    shadowBlur : 40,
		    opacity : 0.5,*/
	    rotation: 30
	});
	
	if(!isEdge) {
	    hex.on('click', (e) => {
		this.clickCell(gridCoord);
	    });
	    
	    /*hex.clicked = false;
	      
	      hex.on('click', (e) => {
	      hex.clicked = !hex.clicked;
	      if(hex.clicked) hex.fill('green');
	      else hex.fill('red');
	      });*/
	}

	let gridCell = new Cell('grid', gridCoord, hex);
	//hex.model = gridCe
	this.gridLayer.add(hex);
	this.grids[gridCoord.toIndex()] = gridCell;
	
	return hex;
    }


    clickCell(gridCoord) {
	//TODO: add tools besides placing cell
	if(window.currentSelection.type) {
	    this.loadCell(gridCoord);
	}
    }
    
    loadCell(gridCoord) {
	let self = this;
	let c = gridToScreen(gridCoord);

	var imageObj = new Image();
	imageObj.onload = function() {
	    let node = new Konva.Image({image: imageObj});
	//Konva.Image.fromURL(window.currentSelection.img(), function (node) {
	    let cell = new Cell(window.currentSelection.type, gridCoord, node);

	    node.model = cell;
            node.setAttrs({
		x: c.x - POLY_WIDTH/2 - BORDER_BUFFER_X / 2,
		y: c.y - POLY_HEIGHT/2 - POLY_HEIGHT/Y_COUNT/2-BORDER_BUFFER/2,
		width: POLY_WIDTH + BORDER_BUFFER_X,
		height: POLY_HEIGHT + POLY_HEIGHT/Y_COUNT+BORDER_BUFFER,
		cornerRadius: 0,
		opacity:0.75
            });

	    if(window.currentSelection.rotation) {
		rotateAroundCenter(node, window.currentSelection.rotation);
	    }
	    
	    node.on('click', (e) => {
		let clickCoord = self.gridLayer.getIntersection(stage.getPointerPosition()).model.coordinate;
		self.clickCell(clickCoord);
	    });
	    
            self.cellLayer.add(node);
	    self.cells[gridCoord.toIndex()] = cell;
	    
	//});
	};
	imageObj.src = window.currentSelection.img();

	let curCell = self.cells[gridCoord.toIndex()];
	if(curCell) {
	    curCell.remove();
	}

    }

    initializeGrid() {
	this.grids = [];
	
	let i = 0;
	
	for(let x = 0; x < X_COUNT; x++) {
	    for(let y = 0; y < Y_COUNT; y++) {
		let isInner = true;
		let isEdge = false;
		
		if(y == 0 || y == 7) {
		    if(x == 3 || x == 5) {
			isEdge = true;
			isInner = false;
		    } else if(y == 0) {
			isInner = false;
		    } else if (y == 7) {
			if( x > 1 && x < 7) {
			    isInner = true;
			} else {
			    isInner = false;
			}
		    }
		} else if(x == 0 || x == 8) {
		    if(y== 4) {
			isInner = true;
		    } else if(y==3 || y == 5) {
			isEdge = true;
			isInner = false;
		    } else {
			isInner = false;
		    }
		} else if(x == 1 || x == 7) {
		    if(y <= 1 || y >= 6) {
			isInner = false;
		    } if(y == 1 || y == 6) {
			isEdge = true;
		    }
		} 
		
		if(!isInner && !isEdge) continue;
		
		this.loadGrid(new GridCoordinate(x, y), isEdge);
	    }
	}
	
    }
}

function gridToScreen(gridCoord) {
    return new ScreenCoordinate( (gridCoord.x) * POLY_ROW_WIDTH + X_MIN +POLY_WIDTH/2,  (gridCoord.y+ (gridCoord.x%2)/2) * POLY_HEIGHT + Y_MIN);
}

//From https://konvajs.org/docs/posts/Position_vs_Offset.html
const rotatePoint = ({ x, y }, rad) => {
  const rcos = Math.cos(rad);
  const rsin = Math.sin(rad);
  return { x: x * rcos - y * rsin, y: y * rcos + x * rsin };
};
function rotateAroundCenter(node, rotation) {
  const topLeft = { x: -node.width() / 2, y: -node.height() / 2 };
  const current = rotatePoint(topLeft, Konva.getAngle(node.rotation()));
  const rotated = rotatePoint(topLeft, Konva.getAngle(rotation));
  const dx = rotated.x - current.x,
    dy = rotated.y - current.y;

  node.rotation(rotation);
  node.x(node.x() + dx);
  node.y(node.y() + dy);
}

function makeImage() {
    let revertPos = stage.position();
    let revertSize = stage.size();
    let revertScale = stage.scale();
    stage.position(new ScreenCoordinate(-X_MIN, -Y_MIN));
    stage.size({width:X_MAX-X_MIN, height:Y_MAX-Y_MIN});
    stage.scale({x: 1, y: 1});
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
	if(window.currentSelection.type) {
	    var imageObj = new Image();
	    imageObj.onload = function() {
		let node = new Konva.Image({image: imageObj});

		node.setAttrs({
		    x: initialPos?.x ?? 0,
		    y: initialPos?.y ?? 0,
		    width: POLY_WIDTH + BORDER_BUFFER_X,
		    height: POLY_HEIGHT + POLY_HEIGHT/Y_COUNT+BORDER_BUFFER,
		    cornerRadius: 0,
		    opacity:0.5
		});

		node.listening(false);
		
		if(window.currentSelection.rotation) {
		    rotateAroundCenter(node, window.currentSelection.rotation);
		}

		layer.add(node);
		window.hoverNode = node;
	    };
	    imageObj.src = window.currentSelection.img();
	}
    }


function init() {
    window.X_COUNT=9;
    window.Y_COUNT=8;

    window.stage = new Konva.Stage({
	container: 'container',
	/*    width: window.innerWidth,
	      height: window.innerHeight,*/
	width: document.getElementById("container").offsetWidth,
	height: document.getElementById("container").offsetHeight,
	draggable: true,
    });

    let newWorld = false;
    if(localStorage.world) {
	console.log("Loading... " + localStorage.world);
	let rawWorld = JSON.parse(localStorage.world);

	window.baseLayer = Konva.Node.create(rawWorld.gridLayer);
	window.cellLayer = Konva.Node.create(rawWorld.cellLayer);
	window.world = new World(baseLayer, cellLayer, rawWorld.cells, rawWorld.grids);
    } else {
	
	window.baseLayer = new Konva.Layer();
	window.cellLayer = new Konva.Layer();

	window.world = new World(baseLayer, cellLayer, null);
	newWorld = true;
    }

    window.cursorLayer = new Konva.Layer();


    window.X_MIN=0;
    window.X_MAX=Math.min(stage.width(), stage.height());
    window.Y_MIN=0;
    window.Y_MAX=X_MAX;
    
    window.POLY_ROW_WIDTH= (X_MAX-X_MIN) / X_COUNT * 0.9;
    window.POLY_WIDTH = POLY_ROW_WIDTH * 4/3;
    window.POLY_HEIGHT = POLY_WIDTH * 0.8660254;
    X_MIN=(stage.width()-(X_COUNT)*POLY_ROW_WIDTH)/2-0.5*POLY_WIDTH-2.5;
    Y_MIN=(stage.height()-(Y_COUNT)*POLY_HEIGHT)/2+0.5*POLY_HEIGHT-2.5;
    X_MAX=(stage.width()+(X_COUNT)*POLY_ROW_WIDTH)/2-(POLY_WIDTH-POLY_ROW_WIDTH)+2.5;//+0.5*POLY_WIDTH;
    Y_MAX=(stage.height()+(Y_COUNT)*POLY_HEIGHT)/2+0.5*POLY_HEIGHT+2.5;
    
    window.scaleBy = 1.05;

    
    stage.on('wheel', (e) => {
	// stop default scrolling
	e.evt.preventDefault();
	
	var oldScale = stage.scaleX();
	var pointer = stage.getPointerPosition();
	
	var mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
	};
	
	// how to scale? Zoom in? Or zoom out?
	let direction = e.evt.deltaY < 0 ? 1 : -1;
	
	// when we zoom on trackpad, e.evt.ctrlKey is true
	// in that case lets revert direction
	if (e.evt.ctrlKey) {
            direction = -direction;
	}
	
	var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
	
	stage.scale({ x: newScale, y: newScale });
	
	var newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
	};
	stage.position(newPos);
    });

    document.addEventListener('keydown', function(e) {
	if(e.code === 'Escape') {
	    baseLayer.remove();
	    cellLayer.remove();
	    window.baseLayer = new Konva.Layer();
	    window.cellLayer = new Konva.Layer();

	    window.world = new World(baseLayer, cellLayer, null);

	    stage.add(baseLayer);
	    stage.add(cellLayer);
	    
	    e.preventDefault();
	    return false;
	} else if(e.code === 'KeyS') {
//	    localStorage.world = JSON.stringify(world);
	} else if(e.code === 'Tab') {
	    window.currentSelection.rotation += 60;

	    if(window.hoverNode) {
		rotateAroundCenter(hoverNode, currentSelection.rotation);
	    }
	    
	    e.preventDefault();
	    return false;
	}

    });

    stage.on('mousemove', function(e) {
	if(window.hoverNode) {
	    if(!e.evt.movementX && !e.evt.movementY) {
		hoverNode.rotation(0);
		hoverNode.offset({x:0,y:0});
		hoverNode.position({x: e.evt.x+1, y:e.evt.y});
		rotateAroundCenter(hoverNode, currentSelection.rotation);
	    } else {
		hoverNode.move({x: e.evt.movementX , y: e.evt.movementY});
	    }
	}
    });

    document.querySelectorAll('.button')
	.forEach((b, i) => b.addEventListener('click', function(e) {
	    let type = b.attributes['data-type'].value;
	    let href = b.getElementsByTagName("img")[0]?.attributes["src"].value;
	    
	    document.querySelectorAll('.selected').forEach((s) => s.classList.remove('selected'));
	    b.classList.add('selected'); 

	    window.currentSelection = {type: type, img: () => href, rotation: 0};

	    if(window.hoverNode) {
		window.hoverNode.remove();
		delete window.hoverNode;
	    }

	    if(type) {
		loadHoverCell(cursorLayer, stage.getPointerPosition());
	    }
	    
	    e.preventDefault();
	    return false;
	}));
    
    stage.add(baseLayer);
    stage.add(cellLayer);
    stage.add(cursorLayer);
    
    /*layer.clipX(X_MIN);
    layer.clipWidth(X_MAX-X_MIN);
    layer.clipY(Y_MIN);
    layer.clipHeight(Y_MAX-Y_MIN);
    */
    //setInterval(function() { console.log(stage.position());}, 1000);


    if(newWorld) world.initializeGrid();


    window.currentSelection = {type: 'meta1', img: makeImage};

    stage.position({x:0,y:-POLY_HEIGHT/2});
    //stage.position({x:-X_MIN,y:-Y_MIN});
    //stage.size({width:X_MAX-X_MIN,height:Y_MAX-Y_MIN});    

    //unit tests

    for(var x = 0; x < X_COUNT; x++) {
	for(var y = 0; y < Y_COUNT; y++) {
	    let c1 = new GridCoordinate(x, y);
	    let c2 = new GridCoordinate(c1.toIndex());
	    if(c1.x !== c2.x || c1.y !== c2.y) {
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
