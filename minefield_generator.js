
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


class MinefieldGenerationData {
	constructor () {
		this.width = 10;
		this.height = 10;
		this.mines = 10;
		this.clickX = 0;
		this.clickY = 0;
	}
}

class TooMuchMinesException {
	constructor () {}
};

class AbstractGeneratedMinefieldMap {
	constructor (minefieldGenData) {} // Initializes object, generates map
	isMineAt (x, y) {} // True if mine is present at (x, y); false otherwise
}


class BasicMinefieldGenerator {
	constructor (minefieldGenData) {
		this.width = minefieldGenData.width;
		this.height = minefieldGenData.height;
		this.mines = minefieldGenData.mines;
		this.click = {x: minefieldGenData.clickX, y: minefieldGenData.clickY};
		this.mineCoords = null;
		this.generate ();
	}

	generate () {
		let codes = this.codeList();
		codes.splice (codes.indexOf (this.codeFor (this.click.x, this.click.y)), 1);
		if (codes.length < this.mines) throw new TooMuchMinesException();

		this.mineCoords = new Set();

		for (let i = 0; i < this.mines; i++) {
			let index = getRandomInt (0, codes.length - 1);
			let code = codes [index];
			codes.splice (index, 1);
			this.mineCoords.add (code);
		}
	}

	codeFor (x, y) {
		return x + this.width * y;
	}

	codeList () {
		let codes = [];
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				codes.push (this.codeFor (i, j));
			}
		}
		return codes;
	}

	isMineAt (X, Y) {
		return this.mineCoords.has (this.codeFor (X, Y));
	}
}
