


class Tile {
	constructor (parent, x, y) {
		this.tileClass = "tile";
		this.openTileClass = "open";
		this.closedTileClass = "closed";
		this.mineColorClass = "mines";
		this.highlightClass = "highlighted";
		this.flagImg = "res/flag.svg";

		this.x = x;
		this.y = y;
		this.parent = parent;
		this.isOpen = false;
		this.isFlagged = false;

		this.createElem();
		this.parent.elem.appendChild (this.elem);
	}

	createElem () {
		this.elem = document.createElement ('div');
		this.elem.classList.add (this.tileClass, this.closedTileClass);
		this.elem.addEventListener ('mouseenter', (ev) => { this.mouseEnter (ev); });
		this.elem.addEventListener ('mouseleave', (ev) => { this.mouseLeave (ev); });
		this.elem.addEventListener ('click', (ev) => { this.click (ev); });
		this.elem.addEventListener ('contextmenu', (ev) => { this.flag (ev); ev.preventDefault(); });
		
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
		if (this.isOpen || this.isFlagged) return;
		this.isOpen = true;
		this.innerHTML = "";

		this.elem.classList.remove (this.closedTileClass);
		this.elem.classList.add (this.openTileClass);
		let rand = Math.floor (Math.random () * 1000000) % 9;
		if (rand != 0)
			this.elem.innerHTML = '' + rand;
			this.elem.classList.add (this.mineColorClass + rand);
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
	constructor () {
		this.elem = document.getElementById ("minefield");

		this.widthInput = new IntInput ("minefield_width");
		this.heightInput = new IntInput ("minefield_height");
		this.minesInput = new IntInput ("minefield_mines");


		this.showMinesSwitch = new Switch ("showMines", (state) => { this.displayMines (state); });
		this.generateButton = new Button ("generate", () => {this.generate(); });

		this.lines = [];

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
}


function setupMinefield () {
	var minefield = new Minefield ();

	var displayMinesSwitch = new Switch ("showMines");
}

window.addEventListener ('load', () => { setupMinefield (); });
