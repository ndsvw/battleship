var should = require('chai').should();
var expect = require('chai').expect;
var _ = require('../src/feld');

describe('feld.constructor()', () => {

  it('should be able to handle optional options', () => {
    let field1 = new _();
    let field2 = new _({
      REQUIREDSHIPS: [0, 0, 0, 2, 2]
    });
    let s1 = JSON.stringify(field1.REQUIREDSHIPS);
    let s2 = JSON.stringify(field2.REQUIREDSHIPS);
    s1.should.not.be.equal(s2);
  })

});


describe('feld.checkShipArray()', () => {

  it('should accept a correct field of ships #1', () => {
    let test = [];
    test = test.concat([0, 1, 2, 3, 4]);
    test = test.concat([7, 8, 9]);
    test = test.concat([20, 21, 22, 23]);
    test = test.concat([41, 51, 61]);
    test = test.concat([55, 65]);
    let field = new _();
    field.checkShipArray(test).status.should.be.equal("success");
  });

  it('should accept a correct field of ships #2', () => {
    let test = [];
    test = test.concat([67, 77]);
    test = test.concat([31, 41, 51, 61, 71]);
    test = test.concat([0, 1, 2]);
    test = test.concat([16, 17, 18]);
    test = test.concat([96, 97, 98, 99]);
    let field = new _();
    field.checkShipArray(test).status.should.be.equal("success");
  });

  it('should reject fields with less ships than required', function () {
    let test = [];
    test = test.concat([67, 77]);
    test = test.concat([31, 41, 51, 61, 71]);
    test = test.concat([0, 1, 2]);
    let field = new _();
    field.checkShipArray(test).status.should.not.be.equal("success");
  });

  it('should reject fields with more ships than required', () => {
    let test = [];
    test = test.concat([41, 51, 61, 71, 81]);
    test = test.concat([43, 53, 63, 73]);
    test = test.concat([0, 1, 2]);
    test = test.concat([20, 21, 22]);
    test = test.concat([96, 97, 98]);
    test = test.concat([76, 77]);
    let field = new _();
    field.checkShipArray(test).status.should.not.be.equal("success");
  });

  it('should reject fields with "ships out of area" ', () => {
    let test = [];
    test = test.concat([0, 1, 2, 3, 4]);
    test = test.concat([7, 8, 9]);
    test = test.concat([20, 21, 22, 23]);
    test = test.concat([98, 99, 100]);
    test = test.concat([55, 65]);
    let field = new _();
    field.checkShipArray(test).status.should.not.be.equal("success");
  });

  it('should reject fields if ships have the wrong size ', () => {
    let test = [];
    test = test.concat([67, 77]);
    test = test.concat([31, 41, 51, 61, 71]);
    test = test.concat([18, 28, 38, 48]);
    test = test.concat([16, 17, 18, 19]);
    test = test.concat([96, 97, 98, 99]);
    let field = new _();
    field.checkShipArray(test).status.should.not.be.equal("success");
  });

  it('should reject fields if horizontal ship are placed AROUND the field', () => {
    let test = [];
    test = test.concat([67, 77]);
    test = test.concat([41, 51, 61, 71, 81]);
    test = test.concat([0, 1, 2]);
    test = test.concat([18, 19, 20, 21]);
    test = test.concat([96, 97, 98]);
    let field = new _();
    field.checkShipArray(test).status.should.not.be.equal("success");
  });

  it('should reject fields if there are collisions', () => {
    let test = [];
    test = test.concat([0, 1, 2, 3, 4]);
    test = test.concat([7, 8, 9]);
    test = test.concat([20, 21, 22, 23]);
    test = test.concat([32, 33, 34]);
    test = test.concat([55, 65]);
    let field = new _();
    field.checkShipArray(test).status.should.not.be.equal("success");
  });
});

describe('feld.setShips()', () => {
  it('should return "success" if it works', () => {
    let test = [];
    test = test.concat([0, 1, 2, 3, 4]);
    test = test.concat([7, 8, 9]);
    test = test.concat([20, 21, 22, 23]);
    test = test.concat([41, 51, 61]);
    test = test.concat([55, 65]);
    let field = new _();
    field.setShips(test).status.should.be.equal("success");
  });

  it('should set a correct array of ships', () => {
    let test = [];
    test = test.concat([0, 1, 2, 3, 4]);
    test = test.concat([7, 8, 9]);
    test = test.concat([20, 21, 22, 23]);
    test = test.concat([41, 51, 61]);
    test = test.concat([55, 65]);
    let field = new _();
    field.setShips(test);
    expect(field.ships).not.to.have.lengthOf(0);
  });

  it('should not return "success" if it does not work', () => {
    let test = [];
    test = test.concat([67, 77]);
    test = test.concat([31, 41, 51, 61, 71]);
    test = test.concat([18, 28, 38, 48]);
    test = test.concat([16, 17, 18, 19]);
    test = test.concat([96, 97, 98, 99]);
    let field = new _();
    field.setShips(test).status.should.not.be.equal("success");
  });

  it('should not set a wrong array of ships', () => {
    let test = [];
    test = test.concat([67, 77]);
    test = test.concat([31, 41, 51, 61, 71]);
    test = test.concat([0, 1, 2]);
    let field = new _();
    field.setShips(test);
    expect(field.ships).to.have.lengthOf(0);
  });
});