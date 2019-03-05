const Player = require('./player');
const Field = require('./field');

module.exports = class Battleship {
	constructor(options) {
		this.options = options || {};
		this.players = [];
		this.winner = null;
		this.whoseTurn;
		this.started = false;
	}

	addPlayer(id) {
		if (Object.keys(this.players).length < 2) {
			this.players[id] = new Player(id);
			this.getPlayerById(id).field = new Field(this.options);
		}
	}

	getPlayerById(id) {
		return this.players[id];
	}

	getOpponent(p) {
		const id = String(p.id);
		const keys = Object.keys(this.players);
		for (const k of keys) {
			if (k !== id) {
				return this.getPlayerById(k);
			}
		}
		throw new Error('Opponent not found.');
	}

	startTheGame() {
		const keys = Object.keys(this.players);

		if (keys.length !== 2) {
			return {
				status: 'fail',
				reason: '2 players required.'
			};
		}

		for (const k of keys) {
			if (this.players[k].field.ships.length === 0) {
				return {
					status: 'fail',
					reason: 'Both players need to have placed their ships.'
				};
			}
		}

		this.whoseTurn = Number(keys[Math.floor(Math.random() * 2)]);
		this.started = true;

		return {
			status: 'success'
		};
	}

	shoot(sourceID, pos) {
		const source = this.getPlayerById(sourceID);
		const goal = this.getOpponent(this.getPlayerById(sourceID));
		if (this.winner !== null) {
			return {
				status: 'fail',
				reason: 'The match is already over.'
			};
		}

		if (!this.started) {
			return {
				status: 'fail',
				reason: 'The match has not started yet.'
			};
		}

		if (sourceID !== this.whoseTurn) {
			return {
				status: 'fail',
				reason: 'It\'s not your turn.'
			};
		}

		if (source.field.hasAlreadyBeenHit(pos)) {
			return {
				status: 'fail',
				reason: 'Already hit a ship at that position!'
			};
		}

		if (!goal.field.isShipAt(pos)) {
			if (!source.field.hasAlreadyBeenMissed(pos)) {
				source.field.misses.push(pos);
			}
			this.whoseTurn = this.getOpponent(source).id;
			return {
				status: 'fail',
				reason: 'Missed'
			};
		}

		source.field.hits.push(pos);

		const res = {
			status: 'hit',
			shipDestroyed: goal.field.isShipDestroyedAt(pos, source.field)
		};

		if (source.field.SHIPPOSCOUNTER === source.field.hits.length) {
			res.gameOver = true;
			this.winner = source.id;
		} else {
			if (!source.field.SAMEPLAYERSTURNAFTERHIT) {
				this.whoseTurn = this.getOpponent(source).id;
			}
		}
		return res;
	}
};
