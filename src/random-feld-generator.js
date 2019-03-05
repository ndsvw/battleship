const PositionSet = require('./positionset');

module.exports = class RandomFieldGenerator {
	constructor(options) {
		options = options || {};
		this.SAMEPLAYERSTURNAFTERHIT = typeof options.SAMEPLAYERSTURNAFTERHIT === 'undefined' ? true : options.SAMEPLAYERSTURNAFTERHIT;
		this.REQUIREDSHIPS = options.REQUIREDSHIPS || [0, 1, 2, 1, 1]; // hier: 0x 1er, 1x 2er, 2x 3er, 1x 4er, 1x 5er
		this.FIELD_HEIGHT = options.FIELD_HEIGHT || 10;
		this.FIELD_WIDTH = options.FIELD_WIDTH || 10;
		this.COLLISION_RULES = options.COLLISION_RULES || {
			ALLOW_CORNER_COLLISIONS: true // in the default field: [0,1,2,3,4,15,16] for example
		};
	}

	generateField() {
		const Feld = require('./feld'); // workaround. Require it at the top does not work.
		const n = this.FIELD_HEIGHT * this.FIELD_WIDTH;
		let availablePos = new PositionSet(this.FIELD_HEIGHT, this.FIELD_WIDTH, Array.apply(null, {length: n}).map(Function.call, Number)); // generates an array from 0 to n-1
		let solution = new PositionSet(this.FIELD_HEIGHT, this.FIELD_WIDTH, []);

		for (let size = this.REQUIREDSHIPS.length; size > 0; size--) {
			for (let count = 0; count < this.REQUIREDSHIPS[size - 1]; count++) {
				let foundSolution = false;
				while (!foundSolution) {
					const rnd = parseInt(Math.random() * availablePos.get().length);
					const pos = availablePos.get().map(Number)[rnd];
					const dir = parseInt(Math.random() * 4);
					const newPos = new PositionSet(this.FIELD_HEIGHT, this.FIELD_WIDTH, []);

					// Zum Bestimmen der neuen Position wird je nach Richtung wird entweder
					// -i draufaddiert (links) ==> multiplier = -1
					// i draufaddiert (rechts) ==> multiplier = 1
					// i * -FIELD_WIDTH draufaddiert (oben) ==> multiplier = -this.FIELD_WIDTH
					// i * FIELD_WIDTH draufaddiert (unten) ==> multiplier = this.FIELD_WIDTH
					const multipliers = [-1, 1, -this.FIELD_WIDTH, this.FIELD_WIDTH];
					const multiplier = multipliers[dir];

					let pozentialHorizShipNotOver2Rows = true;
					if (dir <= 1) {
						for (let i = 0; i < size; i++) {
							if (Math.floor((pos + i * multiplier) / this.FIELD_WIDTH) !== Math.floor(pos / this.FIELD_WIDTH)) {
								pozentialHorizShipNotOver2Rows = false;
								break;
							}
							newPos.add(pos + (i * multiplier));
						}
					} else {
						for (let i = 0; i < size; i++) {
							newPos.add(pos + (i * multiplier));
						}
					}

					if (pozentialHorizShipNotOver2Rows && availablePos.intersect(newPos).size() === newPos.size() && newPos.size() === size) {
						foundSolution = true;

						const f = new Feld();
						let collisionPos;
						if (dir <= 1) {
							collisionPos = f.getCollisionPosOfHorizontalShip(newPos.get().map(Number));
						} else {
							collisionPos = f.getCollisionPosOfVerticalShip(newPos.get().map(Number));
						}

						availablePos = availablePos.difference(newPos);
						availablePos = availablePos.difference(collisionPos);

						solution = solution.union(newPos);
					}
				}
			}
		}
		return solution.get().map(Number);
	}
};
