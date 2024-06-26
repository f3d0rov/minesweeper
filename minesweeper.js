

function getNameForColumn (index, len) {
	// Essentialy convert index to a base-26 number with A corresponding to 0
	let charLen = Math.ceil (Math.log (len) / Math.log (26));
	let res = "";
	let c = index;
	let top = Math.ceil (Math.log (c) / Math.log (26));
	for (let i = top; i >= 0; i--) {
		let code = Math.floor (c / Math.pow (26, i));
		c = c % Math.pow (26, i);
		if (i == top && code == 0) continue;
		res += String.fromCharCode ('A'.charCodeAt(0) + code);
	}
	return res.padStart (charLen, 'A');
}


class Tile {
	constructor (parent, x, y, w) {
		this.tileClass = "tile";
		this.openTileClass = "open";
		this.closedTileClass = "closed";
		this.mineColorClass = "mines";
		this.highlightClass = "highlighted";
		this.flagImg = "res/flag.svg";
		this.mineImg = "res/mine.svg";

		this.x = x;
		this.y = y;
		this.myName = getNameForColumn (x, w) + y;
		this.parent = parent;

		this.isOpen = false;
		this.isFlagged = false;
		this.isMined = false;
		this.number = 0;

		this.variables = [];
		this.equation = null;

		this.createElem();
		this.parent.elem.appendChild (this.elem);
	}

	createElem () {
		this.elem = document.createElement ('div');
		this.elem.classList.add (this.tileClass, this.closedTileClass);
		this.elem.addEventListener ('mouseenter', (ev) => { this.mouseEnter (ev); });
		this.elem.addEventListener ('mouseleave', (ev) => { this.mouseLeave (ev); });
		this.elem.addEventListener ('mouseup', (ev) => { this.mouseup (ev); });
		this.elem.addEventListener ('contextmenu', (ev) => { ev.preventDefault(); });
	}

	mouseup (ev) {
		if (ev.button == 0) {
			this.click (ev);
		} else if (ev.button == 2) {
			this.flag (ev);
		}
		ev.preventDefault();
	}

	mouseEnter (ev) {
		this.elem.classList.add (this.highlightClass);
		this.parent.mouseEnterCallback (this.x);
		for (let i of this.variables) {
			i.highlight();
		}

		if (this.equation) {
			this.equation.highlight();
			this.equation.scrollTo();
		}
	}

	mouseLeave (ev) {
		this.elem.classList.remove (this.highlightClass);
		this.parent.mouseLeaveCallback (this.x);
		
		for (let i of this.variables) {
			i.dim();
		}

		if (this.equation) {
			this.equation.dim();
		}
	}

	click (ev) {
		if (this.isOpen == false)
			this.open();
		else if (this.isMined == false)
			this.parent.tileSurroundRevealCallback (this);
	}

	open () {
		if (this.isOpen || this.isFlagged) return;
		this.isOpen = true;

		this.innerHTML = "";
		this.elem.classList.remove (this.closedTileClass);
		this.elem.classList.add (this.openTileClass);

		this.parent.tileOpenedCallback (this);

		if (this.isMined) {
			this.genMine();
		} else {
			this.showNumber();
			for (let i of this.variables) {
				i.remove();
			}
			this.variables = [];
			this.mouseLeave();
		
		}
	}

	showNumber () {
		if (this.number == 0) return;
		this.elem.innerHTML = '' + this.number;
		this.elem.classList.add (this.mineColorClass + this.number);
	}

	flag (ev) {
		if (this.isOpen) return;
		if (this.isFlagged) {
			this.isFlagged = false;
			this.elem.innerHTML = "";
			this.parent.unflagCallback();
		} else {
			this.isFlagged = true;
			this.genFlag();
			this.parent.flagCallback();
		}
	}

	genFlag () {
		let flag = document.createElement ('img');
		flag.setAttribute ('src', this.flagImg);
		this.elem.appendChild (flag);
	}

	genMine () {
		let mine = document.createElement ('img');
		mine.setAttribute ('src', this.mineImg);
		this.elem.appendChild (mine);
	}

	setMine () {
		this.isMined = true;
	}

	inc () {
		this.number += 1;
	}

	name () {
		return this.myName;
	}

	addVariable (v) {
		this.variables.push (v);
	}

	setEquation (eq) {
		this.equation = eq;
	}
}


class HeaderTile {
	constructor (parent, name) {
		this.headerTileClass = "header_tile";
		this.highlightClass = "highlighted";

		this.name = name;
		this.parent = parent;

		this.elem = document.createElement ("div");
		this.elem.classList.add (this.headerTileClass);
		this.elem.innerHTML = name;

		this.parent.elem.appendChild (this.elem);
	}

	highlight () {
		this.elem.classList.add (this.highlightClass);
	}

	dim () {
		this.elem.classList.remove (this.highlightClass);
	}
}


class Line {
	constructor (parent, width, y) {
		this.tileLineClass = "tile_line";

		this.y = y;
		this.width = width;
		this.parent = parent;
		
		this.elem = document.createElement ('div');
		this.elem.classList.add (this.tileLineClass);

		this.headerTile = new HeaderTile (this, '' + y);
		this.tiles = [];

		for (let i = 0; i < width; i++) {
			let tile = new Tile (this, i, y, width);
			this.tiles.push (tile);
		}

		this.parent.elem.appendChild (this.elem);
	}

	mouseEnterCallback (x) {
		this.headerTile.highlight();
		this.parent.mouseEnterCallback (x, this.y);
	}

	mouseLeaveCallback (x) {
		this.headerTile.dim();
		this.parent.mouseLeaveCallback (x, this.y);
	}

	setMine (x) {
		this.tiles [x].setMine();
	}

	isFlagged (x) {
		return this.tiles [x].isFlagged;
	}

	tileOpenedCallback (tile) {
		this.parent.tileOpenedCallback (tile);
	}

	tileSurroundRevealCallback (tile) {
		this.parent.tileSurroundRevealCallback (tile);
	}

	inc (x) {
		this.tiles [x].inc();
	}

	open (x) {
		this.tiles [x].open();
	}

	flagCallback () {
		this.parent.flagCallback();
	}

	unflagCallback () {
		this.parent.unflagCallback();
	}

	at (x) {
		return this.tiles [x];
	}
}

class HeaderLine {
	constructor (parent, width) {
		this.tileClass = "tile";
		this.tileLineClass = "tile_line";

		this.width = width;
		this.parent = parent;

		this.elem = document.createElement ('div');
		this.elem.classList.add (this.tileLineClass);
		this.elem.appendChild (this.createEmptyTile());

		this.headerTiles = [];

		for (let i = 0; i < width; i++) {
			let tile = new HeaderTile (this, getNameForColumn (i, width));
			this.headerTiles.push (tile);
		}

		this.parent.elem.appendChild (this.elem);
	}
	
	createEmptyTile () {
		let tile = document.createElement ("div");
		tile.classList.add (this.tileClass);
		return tile;
	}

	highlight (x) {
		this.headerTiles [x].highlight();
	}
	
	dim (x) {
		this.headerTiles [x].dim();
	}
}


class Emoticon {
	constructor () {
		this.id = "emoticon";
		this.aliveImg = "res/alive.svg";
		this.deadImg = "res/dead.svg";
		this.elem = document.getElementById (this.id);
	}

	resetGame () {
		this.elem.setAttribute ("src", this.aliveImg);
	}

	fail () {
		this.elem.setAttribute ("src", this.deadImg);
	}
}


class Variable {
	constructor (parent, tile, mfield) {
		this.parent = parent;
		this.tile = tile;
		this.minefield = mfield;
		this.elem = document.createElement ('span');
		this.className = 'variable';
		this.highlightClass = 'highlight';

		this.elem.classList.add (this.className);
		this.elem.innerHTML = tile.name();
		this.parent.elem.appendChild (this.elem);
		
		this.tile.addVariable (this);

		this.relatedBox = null;		
		this.setupEvents();
	}

	setupEvents () {
		this.elem.addEventListener ('mouseenter', (ev) => { this.mouseEnter (ev); });
		this.elem.addEventListener ('mouseleave', (ev) => { this.mouseLeave (ev); });
		this.elem.addEventListener ('mouseup', (ev) => { this.mouseup (ev); });
		this.elem.addEventListener ('contextmenu', (ev) => { ev.preventDefault(); });
	}

	mouseEnter (ev) {
		this.tile.mouseEnter ();
		let x = Math.max (this.elem.parentElement.getBoundingClientRect().left + 300, this.elem.parentElement.getBoundingClientRect().right + 10);
		let y = this.elem.parentElement.getBoundingClientRect().top;
		console.log (y);
		this.relatedBox = new RelatedEquationsBox (this.parent.elem.parentElement.parentElement, this.minefield, this.tile, x, y);
	}

	mouseLeave (ev) {
		this.tile.mouseLeave ();
		this.destroyBox();
	}

	destroyBox () {
		if (this.relatedBox) {
			this.relatedBox.destroy();
			this.relatedBox = null;
		}
	}

	mouseup (ev) {
		this.tile.mouseup (ev);
	}

	highlight () {
		this.elem.classList.add (this.highlightClass);
	}

	dim () {
		this.elem.classList.remove (this.highlightClass);
	}

	remove () {
		this.elem.parentElement.removeChild (this.elem);
		this.parent.removeVariable (this);
		this.destroyBox();
	}
}

class Equation {
	constructor (parent, tile, surround, mfield) {
		this.parent = parent;
		this.minefield = mfield;
		this.className = "equation";
		this.minesClass = "mines";
		this.operatorClass = "operator";
		this.highlightClass = "highlight";
		this.elem = document.createElement ('div');
		this.elem.classList.add (this.className);
		this.parent.container.appendChild (this.elem);

		this.variables = [];

		let isNotFirst = false;
		for (let i of surround) {
			if (i.isOpen && !i.isMined) continue;
			if (isNotFirst) this.addOperator ("+");
			this.variables.push (new Variable (this, i, this.minefield));
			isNotFirst = true;
		}
		this.addOperator ("=");
		this.addResult (tile.number);

		this.tile = tile;
		this.tile.setEquation (this);

		this.setupEvents ();
	}

	setupEvents () {
		this.elem.addEventListener ('mouseenter', (ev) => { this.mouseEnter (ev); });
		this.elem.addEventListener ('mouseleave', (ev) => { this.mouseLeave (ev); });
	}

	mouseEnter () {
		this.tile.mouseEnter();
	}

	mouseLeave () {
		this.tile.mouseLeave();
	}

	highlight () {
		this.elem.classList.add (this.highlightClass);
	}

	dim () {
		this.elem.classList.remove (this.highlightClass);
	}

	scrollTo () {
		this.elem.scrollIntoView ({block: "nearest"});
	}

	addResult (total) {
		let result = document.createElement ("span");
		result.classList.add (this.minesClass + total);
		result.innerHTML = '' + total;
		this.elem.appendChild (result);
	}

	addOperator (op) {
		let operElem = document.createElement ('span');
		operElem.innerHTML = op;
		operElem.classList.add (this.operatorClass);
		this.elem.appendChild (operElem);
	}

	removeVariable (v) {
		this.variables.splice (this.variables.indexOf (v), 1);
		let isPrevOp = true;
		let prev = null;
		for (let i of this.elem.children) {
			if (i.classList.contains (this.operatorClass)) {
				if (isPrevOp) {
					if (i.innerHTML == '=') {
						if (prev) this.elem.removeChild (prev);
					} else {
						this.elem.removeChild (i);
					}
					break;
				}
				isPrevOp = true;
				prev = i;
			} else {
				isPrevOp = false;
			}
		}
	}

	clone () {
		return this.elem.cloneNode (true);
	}
}


class RelatedEquationsBox {
	constructor (parent, mfield, tile, x, y) {
		this.className = 'related_equations';
		this.eqClassName = 'eq_system_equations';
		this.transparentClass = 'transparent';
		this.minefield = mfield;
		this.tile = tile;
		this.equations = [];
		this.parent = parent;
		this.pullRelatedEquations();
		this.x = x;
		this.y = y;
		if (this.equations.length > 0 && parent)
			this.createElem();
	}

	pullRelatedEquations () {
		for (let i of this.minefield.surround (this.tile.x, this.tile.y)) {
			if (this.minefield.isValid (i.x, i.y)) {
				let someTile = this.minefield.getTile (i);
				if (someTile.equation != null) {
					this.equations.push (someTile.equation);
				}
			}
		}
	}

	createElem () {
		this.elem = document.createElement ('div');
		this.elem.classList.add (this.className, this.eqClassName, this.transparentClass);
		for (let i of this.equations) {
			this.elem.appendChild (i.clone());
		}
		this.elem.style.left = this.x + "px";
		this.parent.appendChild (this.elem);
		let contBox = document.getElementById ('disassembly_body').getBoundingClientRect();
		let height = this.elem.getBoundingClientRect().height;
		let minTop = contBox.top + 10;
		let maxTop = contBox.bottom - height - 10;
		this.elem.style.top = Math.max (Math.min (this.y - height * 0.5 + 12, maxTop), minTop) + "px";
		this.elem.classList.remove (this.transparentClass);
	}

	destroy () {
		if (this.elem)
			this.elem.parentElement.removeChild (this.elem);
	}
};

class Disassembly {
	constructor (mfield) {
		this.id = "disassembly_equations";
		this.container = document.getElementById (this.id);
		this.tiles = [];
		this.equations = [];
		this.minefield = mfield;
	}

	clear () {
		this.container.innerHTML = "";
	}

	addOpenTile (tile, surround) {
		this.equations.push (new Equation (this, tile, surround, this.minefield));
	}
}


class Minefield {
	constructor (generator) {
		this.elem = document.getElementById ("minefield");
		this.elem.addEventListener ('contextmenu', (ev) => { ev.preventDefault(); });
		this.elem.addEventListener ('mouseenter', () => { this.mouseEnter(); });
		this.elem.addEventListener ('mouseleave', () => { this.mouseLeave(); });

		this.widthInput = new IntInput ("minefield_width");
		this.heightInput = new IntInput ("minefield_height");
		this.minesInput = new IntInput ("minefield_mines");

		this.hiddenClass = "hidden";
		this.transparentClass = "transparent";
		this.transparencyTime = 200; // ms

		this.editModeSwitch = new Switch ("editMode", (state) => { });
		this.generateButton = new Button ("generate", () => {this.generate(); });

		this.configLayer = document.getElementById ("minefield_config");
		this.gameLayer = document.getElementById ("minefield_stats");
		this.minesLeft = document.getElementById ("mines_left");

		this.emoticon = new Emoticon();
		this.disassembly = new Disassembly (this);

		this.lines = [];

		this.minefieldGen = generator;

		this.currentGame = {
			width: 0,
			height: 0,
			mines: 0,
			generated: false
		};

		this.generate ();
	}

	mouseEnter () {
		this.showGameStats();
	}

	mouseLeave () {
		this.showGameConfig();
	}

	showGameStats () {
		let unique = Math.random();
		this.statsSwitchControl = unique;

		this.configLayer.classList.add (this.transparentClass);
		setTimeout (() => {
			if (this.statsSwitchControl != unique) return;

			this.configLayer.classList.add (this.hiddenClass);
			this.gameLayer.classList.remove (this.hiddenClass);

			setTimeout (() => {
				if (this.statsSwitchControl != unique) return;

				this.gameLayer.classList.remove (this.transparentClass);
			}, this.transparencyTime / 2);
		}, this.transparencyTime);	
	}

	showGameConfig () {
		let unique = Math.random();
		this.statsSwitchControl = unique;

		this.gameLayer.classList.add (this.transparentClass);
		setTimeout (() => {
			if (this.statsSwitchControl != unique) return;

			this.gameLayer.classList.add (this.hiddenClass);
			this.configLayer.classList.remove (this.hiddenClass);
			setTimeout (() => {
				if (this.statsSwitchControl != unique) return;

				this.configLayer.classList.remove (this.transparentClass);
			}, this.transparencyTime / 2);
		}, this.transparencyTime);	
	}

	highlight (x, y, style) {}
	clearHighlights () {}
	
	generate () {
		if ((this.widthInput.isValid() && this.heightInput.isValid() && this.minesInput.isValid()) == false) return;
		let width = this.widthInput.get();
		let height = this.heightInput.get();
		let mines = this.minesInput.get();
		this.generateFor (width, height, mines);
	}

	generateFor (width, height, mines) {
		this.clear();
		this.headerLine = new HeaderLine (this, width);

		for (let i = 0; i < height; i++) {
			let line = new Line (this, width, i);
			this.lines.push (line);
		}

		this.currentGame = {
			width: width,
			height: height,
			mines: mines,
			minesLeft: mines,
			generated: false
		};
		this.updateMinesLeft();
		this.emoticon.resetGame();
		this.disassembly.clear();
	}

	clear () {
		this.lines = [];
		this.elem.innerHTML = "";
	}

	displayMines (doShow) {}

	mouseEnterCallback (x, y) {
		this.headerLine.highlight (x);
	}

	mouseLeaveCallback (x, y) {
		this.headerLine.dim (x);
	}

	tileOpenedCallback (tile) {
		if (this.currentGame.generated == false) {
			this.firstOpen (tile.x, tile.y);
			this.currentGame.generated = true;
		}

		if (tile.number == 0 && tile.isMined == false) {
			for (let i of this.surround (tile.x, tile.y)) {
				this.open (i.x, i.y);
			}
		} else if (tile.number != 0 && tile.isMined == false) {
			let surround = [];
			for (let i of this.surround (tile.x, tile.y)) {
				if (this.isValid (i.x, i.y)) surround.push (this.getTile (i));
			}
			this.disassembly.addOpenTile (tile, surround);
		}

		if (tile.isMined) {
			this.emoticon.fail();
			this.currentGame.minesLeft--;
			this.updateMinesLeft();
		}
	}

	getTile (xy) {
		return this.lines [xy.y].at (xy.x);
	}

	firstOpen (x, y) {
		let minesData = this.generateMineData (x, y);
		this.placeMines (minesData);
	}

	generateMineData (x, y) {
		let minefieldGenData = new MinefieldGenerationData();
		minefieldGenData.width = this.currentGame.width;
		minefieldGenData.height = this.currentGame.height;
		minefieldGenData.mines = this.currentGame.mines;
		minefieldGenData.clickX = x;
		minefieldGenData.clickY = y;

		return new this.minefieldGen (minefieldGenData);
	}

	placeMines (minesData) {
		let count = 0;
		for (let j = 0; j < this.currentGame.height; j++) {
			for (let i = 0; i < this.currentGame.width; i++) {
				if (minesData.isMineAt (i, j)) {
					this.setMine (i, j);
					count += 1;
				}
			}
		}
		console.log ("Total mines placed: " + count);
	}
	
	setMine (x, y) {
		this.lines [y].setMine (x);
		for (let i of this.surround (x, y)) {
			this.inc (i.x, i.y);
		}
	}

	inc (x, y) {
		if (this.isValid (x, y))
			this.lines [y].inc (x);
	}

	open (x, y) {
		if (this.isValid (x, y))
			this.lines [y].open (x);
	}

	isValid (x, y) {
		return !(x < 0 || x >= this.currentGame.width || y < 0 || y >= this.currentGame.height);
	}

	surround (X, Y) {
		return [
			{x: X    , y: Y - 1},
			{x: X + 1, y: Y - 1},
			{x: X + 1, y: Y    },
			{x: X + 1, y: Y + 1},
			{x: X    , y: Y + 1},
			{x: X - 1, y: Y + 1},
			{x: X - 1, y: Y    },
			{x: X - 1, y: Y - 1}
		];
	}

	tileSurroundRevealCallback (tile) {
		if (this.flagsAround (tile) == tile.number) {
			for (let i of this.surround (tile.x, tile.y)) {
				this.open (i.x, i.y);
			}
		}
	}

	flagsAround (tile) {
		let totalFlags = 0;
		for (let i of this.surround (tile.x, tile.y)) {
			totalFlags += this.flagsAt (i.x, i.y);
		}
		return totalFlags;
	}

	flagsAt (x, y) {
		if (this.isValid (x, y))
			return this.lines [y].isFlagged (x) ? 1 : 0;
		else
			return 0;
	}

	updateMinesLeft () {
		this.minesLeft.innerHTML = this.currentGame.minesLeft;
	}
	
	flagCallback () {
		this.currentGame.minesLeft--;
		this.updateMinesLeft();
	}

	unflagCallback () {
		this.currentGame.minesLeft++;
		this.updateMinesLeft();
	}
}


function setupMinefield () {
	var minefield = new Minefield (BasicMinefieldGenerator);
}

window.addEventListener ('load', () => { setupMinefield (); });
