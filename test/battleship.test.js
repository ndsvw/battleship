const expect = require('chai').expect;
const Player = require('../src/player');
const Battleship = require('../src/battleship');

createExampleBattleship = () => {
	const s = new Battleship();

	s.addPlayer('playerID1');
	s.addPlayer('playerID2');

	let ships = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[41, 51, 61], ...[55, 65]];
	s.getPlayerById('playerID1').field.setShips(ships);

	ships = [...[67, 77], ...[31, 41, 51, 61, 71], ...[0, 1, 2], ...[16, 17, 18], ...[96, 97, 98, 99]];
	s.getPlayerById('playerID2').field.setShips(ships);

	return s;
};

describe('battleship...', () => {
	it('.getPlayerById() should work,', () => {
		const s = createExampleBattleship();
		s.getPlayerById('playerID1').id.should.be.equal('playerID1');
	});

	it('.getOpponent() should work', () => {
		const s = new Battleship();

		s.addPlayer('playerID1');
		s.addPlayer('playerID2');

		s.getOpponent(s.getPlayerById('playerID1')).id.should.be.equal(s.getPlayerById('playerID2').id);
	});

	it('should work (whole game)', () => {
		const s = createExampleBattleship();

		s.startTheGame();
		s.whoseTurn = 'playerID1';

		const shotArray = [0, 1, 2, 16, 17, 18, 31, 41, 51, 61, 71, 67, 77, 96, 97, 98];

		shotArray.map((pos) => {
			s.shoot('playerID1', pos);
		});

		const res = s.shoot('playerID1', 99);

		res.gameOver.should.be.equal(true);
	});

	it('should work (whole game) with other options', () => {
		const s = new Battleship({
			SAMEPLAYERSTURNAFTERHIT: false,
			REQUIREDSHIPS: [0, 3],
			FIELD_HEIGHT: 5,
			FIELD_WIDTH: 5
		});

		s.addPlayer('playerID1');
		s.addPlayer('playerID2');

		let ships = [...[0, 1], ...[8, 9], ...[23, 24]];
		s.getPlayerById('playerID1').field.setShips(ships);

		ships = [...[1, 2], ...[15, 16], ...[8, 9]];
		s.getPlayerById('playerID2').field.setShips(ships);

		s.startTheGame();
		s.whoseTurn = 'playerID1';

		s.shoot('playerID1', 0);
		s.shoot('playerID2', 0);
		s.shoot('playerID1', 1);
		s.shoot('playerID2', 1);
		s.shoot('playerID1', 2);
		s.shoot('playerID2', 8);
		s.shoot('playerID1', 3);
		s.shoot('playerID2', 9);
		s.shoot('playerID1', 4);
		s.shoot('playerID2', 23);
		s.shoot('playerID1', 5);
		const res = s.shoot('playerID2', 24);
		res.gameOver.should.be.equal(true);
	});

	it('should fill the arrays correctly during a match', () => {
		const s = createExampleBattleship();
		s.startTheGame();
		s.whoseTurn = 'playerID1';

		s.shoot('playerID1', 0); // hit
		s.shoot('playerID1', 1); // hit
		s.shoot('playerID1', 2); // hit
		s.shoot('playerID1', 3); // no hit
		s.shoot('playerID2', 19); // no hit
		s.shoot('playerID1', 64); // no hit

		const isHits = JSON.stringify(s.getPlayerById('playerID1').field.hits);
		const shouldHits = JSON.stringify([0, 1, 2]);
		const isMisses = JSON.stringify(s.getPlayerById('playerID1').field.misses);
		const shouldMisses = JSON.stringify([3, 64]);

		shouldHits.should.be.equal(isHits);
		shouldMisses.should.be.equal(isMisses);
	});
});

describe('battleship.startTheGame()', () => {
	it('should work with 2 player', () => {
		const s = new Battleship();

		s.addPlayer('playerID1');
		s.addPlayer('playerID2');

		let ships = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[41, 51, 61], ...[55, 65]];
		s.getPlayerById('playerID1').field.setShips(ships);

		ships = [...[67, 77], ...[31, 41, 51, 61, 71], ...[0, 1, 2], ...[16, 17, 18], ...[96, 97, 98, 99]];
		s.getPlayerById('playerID2').field.setShips(ships);

		s.startTheGame().status.should.be.equal('success');
	});

	it('should not work with less than 2 player', () => {
		const s = new Battleship();
		s.addPlayer('playerID1');
		s.startTheGame().status.should.not.be.equal('success');
	});

	it('should not work if a player did not place the ships', () => {
		const s = new Battleship();

		s.addPlayer('playerID1');
		s.addPlayer('playerID2');

		const ships = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[41, 51, 61], ...[55, 65]];
		s.getPlayerById('playerID1').field.setShips(ships);

		s.startTheGame().status.should.not.be.equal('success');
	});
});

describe('battleship.shoot()', () => {
	it('should interpret a hit as a hit', () => {
		const s = createExampleBattleship();

		s.startTheGame();
		s.whoseTurn = 'playerID1';

		s.shoot('playerID1', 1).status.should.be.equal('hit');
	});

	it('should interpret a missing as a missing', () => {
		const s = createExampleBattleship();

		s.startTheGame();
		s.whoseTurn = 'playerID1';

		s.shoot('playerID1', 10).status.should.not.be.equal('hit');
	});

	it('should reject a shot if the game has not started yet', () => {
		const s = createExampleBattleship();

		s.whoseTurn = 'playerID1';

		s.shoot('playerID1', 1).status.should.not.be.equal('hit');
	});

	it('should reject a shot if the game is over', () => {
		const s = createExampleBattleship();

		s.startTheGame();
		s.whoseTurn = 'playerID1';
		s.winner = 'playerID1';

		s.shoot('playerID1', 1).status.should.not.be.equal('hit');
	});

	it('should reject a n^th (n>1) shot on the same pos', () => {
		const s = createExampleBattleship();

		s.whoseTurn = 'playerID1';
		s.shoot('playerID1', 1);

		s.whoseTurn = 'playerID1';
		s.shoot('playerID1', 1).status.should.not.be.equal('hit');
	});

	it('should reject a shot if it is not the source`s turn', () => {
		const s = createExampleBattleship();

		s.whoseTurn = 'playerID1';

		s.shoot('playerID2', 6).status.should.not.be.equal('hit');
	});

	it('should return shipDestroyed: true/false correctly', () => {
		const s = createExampleBattleship();
		s.startTheGame();
		s.whoseTurn = 'playerID1';

		s.shoot('playerID1', 0).shipDestroyed.should.be.equal(false);
		s.shoot('playerID1', 1).shipDestroyed.should.be.equal(false);
		s.shoot('playerID1', 2).shipDestroyed.should.be.equal(true);

		s.shoot('playerID1', 18).shipDestroyed.should.be.equal(false);
		s.shoot('playerID1', 17).shipDestroyed.should.be.equal(false);
		s.shoot('playerID1', 16).shipDestroyed.should.be.equal(true);

		s.shoot('playerID1', 67).shipDestroyed.should.be.equal(false);
		s.shoot('playerID1', 77).shipDestroyed.should.be.equal(true);

		s.shoot('playerID1', 71).shipDestroyed.should.be.equal(false);
		s.shoot('playerID1', 61).shipDestroyed.should.be.equal(false);
		s.shoot('playerID1', 51).shipDestroyed.should.be.equal(false);
		s.shoot('playerID1', 41).shipDestroyed.should.be.equal(false);
		s.shoot('playerID1', 31).shipDestroyed.should.be.equal(true);

		s.shoot('playerID1', 96).shipDestroyed.should.be.equal(false);
		s.shoot('playerID1', 97).shipDestroyed.should.be.equal(false);
		s.shoot('playerID1', 98).shipDestroyed.should.be.equal(false);
		s.shoot('playerID1', 99).shipDestroyed.should.be.equal(true);
	});
});
