const PositionSet = require('./positionset');
const RandomFieldGenerator = require('./random-field-generator');

module.exports = class Feld {
	constructor(options) {
		options = options || {};
		this.SAMEPLAYERSTURNAFTERHIT = typeof options.SAMEPLAYERSTURNAFTERHIT === 'undefined' ? true : options.SAMEPLAYERSTURNAFTERHIT;
		this.REQUIREDSHIPS = options.REQUIREDSHIPS || [0, 1, 2, 1, 1]; // default: 0x 1er, 1x 2er, 2x 3er, 1x 4er, 1x 5er
		this.FIELD_HEIGHT = options.FIELD_HEIGHT || 10;
		this.FIELD_WIDTH = options.FIELD_WIDTH || 10;
		this.COLLISION_RULES = options.COLLISION_RULES || {
			ALLOW_CORNER_COLLISIONS: true // in the default field: [0,1,2,3,4,15,16] for example
		};
		this.SHIPCOUNTER = 0;
		this.SHIPPOSCOUNTER = 0;
		for (let i = 0; i < this.REQUIREDSHIPS.length; i++) {
			if (this.REQUIREDSHIPS[i] > 0) {
				this.SHIPCOUNTER += this.REQUIREDSHIPS[i];
			}
			this.SHIPPOSCOUNTER += this.REQUIREDSHIPS[i] * (i + 1);
		}
		this.ships = [];
		this.hits = [];
		this.misses = [];

		if (this.REQUIREDSHIPS.length > this.FIELD_WIDTH && this.REQUIREDSHIPS.length > this.FIELD_WIDTH) {
			throw new Error('At least 1 ship seems to be larger than the field.');
		}
		if (this.SHIPPOSCOUNTER > this.FIELD_WIDTH * this.FIELD_HEIGHT) {
			throw new Error('The field is not large enough for all ships.');
		}
	}

	isShipAt(pos) {
		return this.ships.some((s) => s.includes(pos));
	}

	hasAlreadyBeenHit(pos) {
		return this.hits.includes(pos);
	}

	hasAlreadyBeenMissed(pos) {
		return this.misses.includes(pos);
	}

	isShipDestroyedAt(pos, opponentFeld) {
		const ship = this.ships.find((s) => s.includes(pos)) || null;
		return (ship !== null && ship.every((p) => opponentFeld.hasAlreadyBeenHit(p)));
	}

	setShips(arr) {
		const data = this.checkShipArray(arr);
		if (data.status === 'success') {
			this.ships = data.ships;
			return {
				status: 'success'
			};
		}
		return {
			status: data.status,
			reason: data.reason
		};
	}

	setRandomShips() {
		// only works for the default field so far
		const rfg = new RandomFieldGenerator();
		return this.setShips(rfg.generateField());
	}

	checkShipArray(arr) {
		// eliminate duplicates
		arr = Array.from(new Set(arr));

		// sort ascending
		arr.sort((a, b) => a - b);

		// check whether all ships are placed
		if (arr.length !== this.SHIPPOSCOUNTER) {
			return {
				status: 'fail',
				reason: 'A problem occured. The following ships need to be placed: ' + this.getRequiredShipsListAsText()
			};
		}

		// Check whether all ships are placed within the field
		if (arr.some((s) => s < 0 || s > this.FIELD_HEIGHT * this.FIELD_WIDTH - 1)) {
			return {
				status: 'fail',
				reason: 'A problem occured. Ships need to be placed within the field.'
			};
		}

		// getting an array with all ships
		const data = this.getShipsOfArray(arr);
		const ships = data.shipArray;
		const shipsH = data.shipArrayH;
		const shipsV = data.shipArrayV;

		// check whether the number of ships and their sized are correct
		if (ships.length === this.SHIPCOUNTER) {
			// deep copy the requirements; for each ship of length x: decrement the value of the index x.
			// after that: check if all values of the array are 0.
			const reqCheckArr = JSON.parse(JSON.stringify(this.REQUIREDSHIPS));
			for (const s of ships) {
				reqCheckArr[s.length - 1]--;
			}
			if (reqCheckArr.some((x) => x !== 0)) {
				return {
					status: 'fail',
					reason: 'A problem occured. The following ships need to be placed: ' + this.getRequiredShipsListAsText()
				};
			}
		} else {
			return {
				status: 'fail',
				reason: 'A problem occured. The following ships need to be placed: ' + this.getRequiredShipsListAsText()
			};
		}

		// Check whether all parts of the horizontal ships are in the same row (don't accept [8,9,10,11,12] in the default match)
		for (const s of shipsH) {
			const row = Math.floor(s[0] / this.FIELD_WIDTH);
			for (let i = 1; i < s.length; i++) {
				if (Math.floor(s[i] / this.FIELD_WIDTH) !== row) {
					return {
						status: 'fail',
						reason: 'A problem occured. The following ships need to be placed: ' + this.getRequiredShipsListAsText()
					};
				}
			}
		}


		// iterate over all ships and check whether they are at forbidden positions
		const forbiddenPositions = this.getCollisionPos(shipsH, shipsV);
		for (const s of ships) {
			if (s.some((pos) => forbiddenPositions.hasPos(pos))) {
				return {
					status: 'fail',
					reason: 'A problem occured. Ships must not collide!'
				};
			}
		}

		return {
			status: 'success',
			ships
		};
	}

	getShipsOfArray(arr) {
		const shipArray = [];
		const shipArrayH = [];
		const shipArrayV = [];
		const arrH = []; // Array, that contains all the position of the horizontal ships.

		// find vertical ships.
		for (const s of arr) {
			// if the position is already part of a ship, continue
			if (shipArray.some((sh) => sh.includes(s))) {
				continue;
			}

			let i = 0;
			while (arr.includes(s + (i + 1) * this.FIELD_WIDTH)) {
				i++;
			}
			if (i === 0) {
				arrH.push(s);
			} else {
				const newShip = [];
				for (let j = s; j < s + (i + 1) * this.FIELD_WIDTH; j += this.FIELD_WIDTH) {
					newShip.push(j);
				}
				shipArray.push(newShip);
				shipArrayV.push(newShip);
			}
		}

		// find horizontal ships.
		for (const s of arrH) {
			// if the position is already part of a ship, continue
			if (shipArray.some((sh) => sh.includes(s))) {
				continue;
			}

			let i = 0;
			const currentRow = Math.floor(s / this.FIELD_WIDTH);
			// as long as the current position is in arr && if we are still in the same row => increment i
			while (arr.includes(s + i + 1) && Math.floor((s + i + 1) / this.FIELD_WIDTH) === currentRow) {
				i++;
			}
			if (i !== 0) {
				const newShip = [];
				for (let j = s; j < s + i + 1; j++) {
					newShip.push(j);
				}
				shipArray.push(newShip);
				shipArrayH.push(newShip);
			}
		}

		return {
			shipArray,
			shipArrayH,
			shipArrayV
		};
	}

	getCollisionPos(shipsH, shipsV) {
		const collisionPos = new PositionSet(this.FIELD_HEIGHT, this.FIELD_WIDTH);
		for (const s of shipsH) {
			collisionPos.union(this.getCollisionPosOfHorizontalShip(s));
		}
		for (const s of shipsV) {
			collisionPos.union(this.getCollisionPosOfVerticalShip(s));
		}
		return collisionPos;
	}

	getCollisionPosOfHorizontalShip(s) {
		const collisionPos = new PositionSet(this.FIELD_HEIGHT, this.FIELD_WIDTH);

		// position in front of the ship and behind the ship are forbidden.
		if (s[0] % this.FIELD_WIDTH > 0) {
			collisionPos.add(s[0] - 1);
		}
		if ((s[s.length - 1] + 1) % this.FIELD_WIDTH > 0) {
			collisionPos.add(s[s.length - 1] + 1);
		}

		// rows next to the ship and in parallel to the ship are forbidden
		for (let i = 0; i < s.length; i++) {
			collisionPos.add(s[i] - this.FIELD_WIDTH);
			collisionPos.add(s[i] + this.FIELD_WIDTH);
		}

		// positions at the corners are (maybe) forbidden
		if (!this.COLLISION_RULES.ALLOW_CORNER_COLLISIONS) {
			if (s[0] % this.FIELD_WIDTH > 0) {
				collisionPos.add(s[0] - (this.FIELD_WIDTH + 1));
				collisionPos.add(s[0] + (this.FIELD_WIDTH - 1));
			}
			if ((s[0] + 1) % this.FIELD_WIDTH > 0) {
				collisionPos.add(s[s.length - 1] - (this.FIELD_WIDTH - 1));
				collisionPos.add(s[s.length - 1] + (this.FIELD_WIDTH + 1));
			}
		}
		return collisionPos;
	}

	getCollisionPosOfVerticalShip(s) {
		const collisionPos = new PositionSet(this.FIELD_HEIGHT, this.FIELD_WIDTH);

		// position in front of the ship and behind the ship are forbidden.
		collisionPos.add(s[0] - this.FIELD_WIDTH);
		collisionPos.add(s[s.length - 1] + this.FIELD_WIDTH);

		// rows next to the ship and in parallel to the ship are forbidden
		for (let i = 0; i < s.length; i++) {
			if (s[i] % this.FIELD_WIDTH > 0) {
				collisionPos.add(s[i] - 1);
			}
			if ((s[i] + 1) % this.FIELD_WIDTH > 0) {
				collisionPos.add(s[i] + 1);
			}
		}

		// positions at the corners are (maybe) forbidden
		if (!this.COLLISION_RULES.ALLOW_CORNER_COLLISIONS) {
			if (s[0] % this.FIELD_WIDTH > 0) {
				collisionPos.add(s[0] - (this.FIELD_WIDTH + 1));
				collisionPos.add(s[s.length - 1] + (this.FIELD_WIDTH - 1));
			}
			if ((s[0] + 1) % this.FIELD_WIDTH > 0) {
				collisionPos.add(s[0] - (this.FIELD_WIDTH - 1));
				collisionPos.add(s[s.length - 1] + (this.FIELD_WIDTH + 1));
			}
		}
		return collisionPos;
	}

	getRequiredShipsListAsText() {
		const reqShips = [];
		for (let i = 0; i < this.REQUIREDSHIPS.length; i++) {
			if (this.REQUIREDSHIPS[i] > 0) {
				reqShips.push(this.REQUIREDSHIPS[i] + 'x ' + (i + 1) + 'er');
			}
		}
		return reqShips.join(', ');
	}
};
