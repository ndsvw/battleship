const should = require('chai').should();
const expect = require('chai').expect;
const _ = require('../src/field');

describe('field.constructor()', () => {
	it('should be able to handle optional options', () => {
		const field1 = new _();
		const field2 = new _({
			REQUIREDSHIPS: [0, 0, 0, 2, 2]
		});
		const s1 = JSON.stringify(field1.REQUIREDSHIPS);
		const s2 = JSON.stringify(field2.REQUIREDSHIPS);
		s1.should.not.be.equal(s2);
	});
});


describe('field.checkShipArray()', () => {
	it('should accept a correct field of ships #1', () => {
		const test = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[41, 51, 61], ...[55, 65]];
		const field = new _();
		field.checkShipArray(test).status.should.be.equal('success');
	});

	it('should accept a correct field of ships #2', () => {
		const test = [...[67, 77], ...[31, 41, 51, 61, 71], ...[0, 1, 2], ...[16, 17, 18], ...[96, 97, 98, 99]];
		const field = new _();
		field.checkShipArray(test).status.should.be.equal('success');
	});

	it('should accept a correct field of ships #3 (with ships at the border of the field)', () => {
		const test = [...[10, 11, 12, 13, 14], ...[30, 40, 50], ...[9, 19], ...[49, 59, 69], ...[93, 94, 95, 96]];
		const field = new _();
		field.setShips(test).status.should.be.equal('success');
	});

	it('should accept a correct but unordered field of ships', () => {
		const test = [0, 18, 1, 31, 71, 97, 99, 98, 41, 67, 96, 51, 77, 17, 61, 16, 2];
		const field = new _();
		field.checkShipArray(test).status.should.be.equal('success');
	});

	it('should handle duplicate ship positions correctly', () => {
		const test = [...[10, 11, 12, 13, 14], ...[30, 40, 50], ...[9, 19], ...[49, 59, 69], ...[93, 94, 95, 96], 10];
		const field = new _();
		field.checkShipArray(test).status.should.be.equal('success');
	});

	it('should reject fields with less ships than required', () => {
		const test = [...[67, 77], ...[31, 41, 51, 61, 71], ...[0, 1, 2]];
		const field = new _();
		field.checkShipArray(test).status.should.not.be.equal('success');
	});

	it('should reject fields with more ships than required', () => {
		const test = [...[41, 51, 61, 71, 81], ...[43, 53, 63, 73], ...[0, 1, 2], ...[20, 21, 22], ...[96, 97, 98], ...[76, 77]];
		const field = new _();
		field.checkShipArray(test).status.should.not.be.equal('success');
	});

	it('should reject fields with \'ships out of area\' ', () => {
		const test = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[98, 99, 100], ...[55, 65]];
		const field = new _();
		field.checkShipArray(test).status.should.not.be.equal('success');
	});

	it('should reject fields if ships have the wrong size ', () => {
		const test = [...[67, 77], ...[31, 41, 51, 61, 71], ...[18, 28, 38, 48], ...[16, 17, 18, 19], ...[96, 97, 98, 99]];
		const field = new _();
		field.checkShipArray(test).status.should.not.be.equal('success');
	});

	it('should reject fields if horizontal ship are placed AROUND the field', () => {
		const test = [...[67, 77], ...[41, 51, 61, 71, 81], ...[0, 1, 2], ...[18, 19, 20, 21], ...[96, 97, 98]];
		const field = new _();
		field.checkShipArray(test).status.should.not.be.equal('success');
	});

	it('should reject fields if there are collisions', () => {
		const test = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[32, 33, 34], ...[55, 65]];
		const field = new _();
		field.checkShipArray(test).status.should.not.be.equal('success');
	});

	it('should work properly if a horizontal ship is at the end of a row and an other one is at the beginning of the overlying row', () => {
		// recognize [5, 6, 7, 8, 9, 10, 11, 12] as 2 ships
		const test = [...[5, 6, 7, 8, 9], ...[10, 11, 12], ...[85, 86, 87, 88], ...[32, 33, 34], ...[55, 65]];
		const field = new _();
		field.checkShipArray(test).status.should.be.equal('success');
	});

	it('should work properly with all ships placed at the border of the field', () => {
		const test = [...[5, 6, 7, 8, 9], ...[0, 10, 20], ...[59, 69, 79, 89], ...[70, 71, 72], ...[40, 50]];
		const field = new _();
		field.checkShipArray(test).status.should.be.equal('success');
	});
});


describe('field.setShips()', () => {
	it('should return \'success\' if it works', () => {
		const test = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[41, 51, 61], ...[55, 65]];
		const field = new _();
		field.setShips(test).status.should.be.equal('success');
	});

	it('should set a correct array of ships', () => {
		const test = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[41, 51, 61], ...[55, 65]];
		const field = new _();
		field.setShips(test);
		expect(field.ships).not.to.have.lengthOf(0);
	});

	it('should not return \'success\' if it does not work', () => {
		const test = [...[67, 77], ...[31, 41, 51, 61, 71], ...[18, 28, 38, 48], ...[16, 17, 18, 19], ...[96, 97, 98, 99]];
		const field = new _();
		field.setShips(test).status.should.not.be.equal('success');
	});

	it('should not set a wrong array of ships', () => {
		const test = [...[67, 77], ...[31, 41, 51, 61, 71], ...[0, 1, 2]];
		const field = new _();
		field.setShips(test);
		expect(field.ships).to.have.lengthOf(0);
	});

	it('should handle other options #1 (other field size and vertical ships)', () => {
		const test = [...[0, 5, 10], ...[2, 7], ...[22, 23, 24]];
		const field = new _({
			FIELD_HEIGHT: 5,
			FIELD_WIDTH: 5,
			REQUIREDSHIPS: [0, 1, 2]
		});
		field.setShips(test).status.should.be.equal('success');
	});

	it('should handle other options #2 (other collision rules)', () => {
		const test = [...[0, 1, 2, 3, 4], ...[15, 16, 17, 18], ...[40, 41, 42], ...[69, 79, 89], ...[91, 92]];
		const field = new _({
			COLLISION_RULES: {
				ALLOW_CORNER_COLLISIONS: false
			}
		});
		field.setShips(test).status.should.be.equal('fail');
	});
});

describe('field.setRandomShips()', () => {
	it('should always return \'success\'', () => {
		const field = new _();
		field.setRandomShips().status.should.be.equal('success');
	});
});
