


class Tile {
	constructor (parent, x, y) {
		this.tileClass = "tile";
		this.openTileClass = "open";
		this.closedTileClass = "closed";
		this.mineColorClass = "mines";
		this.highlightClass = "highlighted";
		this.flagImg = "res/flag.svg";
		this.mineImg = "res/mine.svg";

		this.x = x;
		this.y = y;
		this.parent = parent;

		this.isOpen = false;
		this.isFlagged = false;
		this.isMined = false;
		this.number = 0;

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
	}

	mouseLeave (ev) {
		this.elem.classList.remove (this.highlightClass);
		this.parent.mouseLeaveCallback (this.x);
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
			// mineOpenedCallback();
		} else {
			this.showNumber ();
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
		} else {
			this.isFlagged = true;
			this.genFlag();
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
			let tile = new Tile (this, i, y);
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
			let tile = new HeaderTile (this, this.getNameForColumn (i, width));
			this.headerTiles.push (tile);
		}

		this.parent.elem.appendChild (this.elem);
	}
	
	createEmptyTile () {
		let tile = document.createElement ("div");
		tile.classList.add (this.tileClass);
		return tile;
	}

	getNameForColumn (index, len) {
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

	highlight (x) {
		this.headerTiles [x].highlight();
	}
	
	dim (x) {
		this.headerTiles [x].dim();
	}
}


class Minefield {
	constructor (generator) {
		this.elem = document.getElementById ("minefield");
		this.elem.addEventListener ('contextmenu', (ev) => { ev.preventDefault(); });

		this.widthInput = new IntInput ("minefield_width");
		this.heightInput = new IntInput ("minefield_height");
		this.minesInput = new IntInput ("minefield_mines");


		this.editModeSwitch = new Switch ("editMode", (state) => { });
		this.generateButton = new Button ("generate", () => {this.generate(); });

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
			generated: false
		};
	}

	clear () {
		this.lines = [];
		this.elem.innerHTML = "";
	}
	
	open (x, y) {}
	markMine (x, y) {}

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
		}
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
			{x: X + 1, y: Y + 1},
			{x: X + 1, y: Y    },
			{x: X + 1, y: Y - 1},
			{x: X    , y: Y + 1},
			{x: X    , y: Y - 1},
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
}


function setupMinefield () {
	var minefield = new Minefield (BasicMinefieldGenerator);
}

window.addEventListener ('load', () => { setupMinefield (); });
