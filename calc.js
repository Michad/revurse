
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
	this.x = x;
	this.y = y;
    }
}

class Cell {
    view = null;
    coordinate = new GridCoordinate(0,0);

    constructor(type) {

    }
    
    updateView(zoom, center) {
	
    }
    
}

function gridToScreen(gridCoord) {
    return new ScreenCoordinate( (gridCoord.x) * POLY_ROW_WIDTH + X_MIN,  (gridCoord.y+ (gridCoord.x%2)/2) * POLY_HEIGHT + Y_MIN);
}

function loadCell(layer, gridCoord, isEdge) {
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
	    loadReCell(cellLayer, gridCoord, img);
	});
    
	/*hex.clicked = false;
	
	hex.on('click', (e) => {
	    hex.clicked = !hex.clicked;
	    if(hex.clicked) hex.fill('green');
	    else hex.fill('red');
	});*/
    }
    
    layer.add(hex);
    grids.push(hex);

    return hex;
}

function loadReCell(layer, gridCoord, img) {
    let c = gridToScreen(gridCoord);
    
    Konva.Image.fromURL(img, function (node) {
        node.setAttrs({
            x: c.x - POLY_WIDTH/2 -0,
            y: c.y - POLY_HEIGHT * (1+1.0/Y_COUNT/1.1)/2 -1,
	    width: POLY_WIDTH + 1,
	    height: POLY_HEIGHT * (1+Y_COUNT)/Y_COUNT + 5,
            cornerRadius: 20,
	    opacity:0.5,
        });
        layer.add(node);
	cells.push(node);
    });
}


function makeImage(stage) {
    let revertPos = stage.position();
    let revertSize = stage.size();
    stage.position(new ScreenCoordinate(-X_MIN+POLY_WIDTH/2, -Y_MIN));
    stage.size({width:X_MAX-X_MIN+POLY_WIDTH+10, height:Y_MAX-Y_MIN});
    //stage.size(X_MAX, Y_MAX);
    
    let dataURL = stage.toDataURL({ pixelRatio: 1 });
    console.log(dataURL);

    stage.position(revertPos);
	stage.size(revertSize);

	return dataURL;
    }

function init() {

    let stage = new Konva.Stage({
	container: 'container',
	/*    width: window.innerWidth,
	      height: window.innerHeight,*/
	width: document.getElementById("container").offsetWidth,
	height: document.getElementById("container").offsetHeight,
	draggable: true,
    });
    
    window.baseLayer = new Konva.Layer();
    window.cellLayer = new Konva.Layer();
    window.cursorLayer = new Konva.Layer();
    window.X_COUNT=9;
    window.Y_COUNT=8;
    window.X_MIN=0;
    window.X_MAX=Math.min(stage.width(), stage.height());
    window.Y_MIN=0;
    window.Y_MAX=X_MAX;
    
    window.POLY_ROW_WIDTH= (X_MAX-X_MIN) / X_COUNT * 0.9;
    window.POLY_WIDTH = POLY_ROW_WIDTH * 4/3;
    window.POLY_HEIGHT = POLY_WIDTH * 0.8660254;
    X_MIN=(stage.width()-(X_COUNT)*POLY_ROW_WIDTH)/2+0.5*POLY_ROW_WIDTH;
    Y_MIN=(stage.height()-(Y_COUNT)*POLY_HEIGHT)/2+0.1*POLY_HEIGHT;
    
    window.scaleBy = 1.05;

    window.grids = [];
    window.cells = [];
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

	    loadCell(baseLayer, new GridCoordinate(x, y), isEdge);
	}
    }

    
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
    
    stage.add(baseLayer);
    stage.add(cellLayer);
    stage.add(cursorLayer);
    
    /*layer.clipX(X_MIN);
    layer.clipWidth(X_MAX-X_MIN);
    layer.clipY(Y_MIN);
    layer.clipHeight(Y_MAX-Y_MIN);
    */
    //setInterval(function() { console.log(stage.position());}, 1000);


    window.img = makeImage(stage);

    

   
    
};

if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(init, 1);
} else {
    document.addEventListener("DOMContentLoaded", init);
}
