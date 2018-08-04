var should = require("chai").should();
var expect = require("chai").expect;
var _ = require("../src/feld");

describe("feld.constructor()", () => {

  it("should be able to handle optional options", () => {
    let field1 = new _();
    let field2 = new _({
      REQUIREDSHIPS: [0, 0, 0, 2, 2]
    });
    let s1 = JSON.stringify(field1.REQUIREDSHIPS);
    let s2 = JSON.stringify(field2.REQUIREDSHIPS);
    s1.should.not.be.equal(s2);
  });

});


describe("feld.checkShipArray()", () => {

  it("should accept a correct field of ships #1", () => {
    let test = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[41, 51, 61], ...[55, 65]];
    let field = new _();
    field.checkShipArray(test).status.should.be.equal("success");
  });

  it("should accept a correct field of ships #2", () => {
    let test = [...[67, 77], ...[31, 41, 51, 61, 71], ...[0, 1, 2], ...[16, 17, 18], ...[96, 97, 98, 99]];
    let field = new _();
    field.checkShipArray(test).status.should.be.equal("success");
  });

  it("should accept a correct field of ships #3 (with ships at the border of the field)", () => {
    let test = [...[10, 11, 12, 13, 14], ...[30, 40, 50], ...[9, 19], ...[49, 59, 69], ...[93, 94, 95, 96]];
    let field = new _();
    field.setShips(test).status.should.be.equal("success");
  });

  it("should accept a correct but unordered field of ships", () => {
    let test = [0, 18, 1, 31, 71, 97, 99, 98, 41, 67, 96, 51, 77, 17, 61, 16, 2];
    let field = new _();
    field.checkShipArray(test).status.should.be.equal("success");
  });

  it("should handle duplicate ship positions correctly", () => {
    let test = [...[10, 11, 12, 13, 14], ...[30, 40, 50], ...[9, 19], ...[49, 59, 69], ...[93, 94, 95, 96], 10];
    let field = new _();
    field.checkShipArray(test).status.should.be.equal("success");
  });

  it("should reject fields with less ships than required", function () {
    let test = [...[67, 77], ...[31, 41, 51, 61, 71], ...[0, 1, 2]];
    let field = new _();
    field.checkShipArray(test).status.should.not.be.equal("success");
  });

  it("should reject fields with more ships than required", () => {
    let test = [...[41, 51, 61, 71, 81], ...[43, 53, 63, 73], ...[0, 1, 2], ...[20, 21, 22], ...[96, 97, 98], ...[76, 77]];
    let field = new _();
    field.checkShipArray(test).status.should.not.be.equal("success");
  });

  it("should reject fields with 'ships out of area' ", () => {
    let test = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[98, 99, 100], ...[55, 65]];
    let field = new _();
    field.checkShipArray(test).status.should.not.be.equal("success");
  });

  it("should reject fields if ships have the wrong size ", () => {
    let test = [...[67, 77], ...[31, 41, 51, 61, 71], ...[18, 28, 38, 48], ...[16, 17, 18, 19], ...[96, 97, 98, 99]];
    let field = new _();
    field.checkShipArray(test).status.should.not.be.equal("success");
  });

  it("should reject fields if horizontal ship are placed AROUND the field", () => {
    let test = [...[67, 77], ...[41, 51, 61, 71, 81], ...[0, 1, 2], ...[18, 19, 20, 21], ...[96, 97, 98]];
    let field = new _();
    field.checkShipArray(test).status.should.not.be.equal("success");
  });

  it("should reject fields if there are collisions", () => {
    let test = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[32, 33, 34], ...[55, 65]];
    let field = new _();
    field.checkShipArray(test).status.should.not.be.equal("success");
  });
});


describe("feld.setShips()", () => {
  it("should return 'success' if it works", () => {
    let test = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[41, 51, 61], ...[55, 65]];
    let field = new _();
    field.setShips(test).status.should.be.equal("success");
  });

  it("should set a correct array of ships", () => {
    let test = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[41, 51, 61], ...[55, 65]];
    let field = new _();
    field.setShips(test);
    expect(field.ships).not.to.have.lengthOf(0);
  });

  it("should not return 'success' if it does not work", () => {
    let test = [...[67, 77], ...[31, 41, 51, 61, 71], ...[18, 28, 38, 48], ...[16, 17, 18, 19], ...[96, 97, 98, 99]];
    let field = new _();
    field.setShips(test).status.should.not.be.equal("success");
  });

  it("should not set a wrong array of ships", () => {
    let test = [...[67, 77], ...[31, 41, 51, 61, 71], ...[0, 1, 2]];
    let field = new _();
    field.setShips(test);
    expect(field.ships).to.have.lengthOf(0);
  });

  it("should handle other options #1 (other field size and vertical ships)", () => {
    let test = [...[0, 5, 10], ...[2, 7], ...[22, 23, 24]];
    let field = new _({
      FIELD_HEIGHT: 5,
      FIELD_WIDTH: 5,
      REQUIREDSHIPS: [0, 0, 1, 2]
    });
    field.setShips(test).status.should.be.equal("success");
  });

  it("should handle other options #2 (other collision rules)", () => {
    let test = [...[0, 1, 2, 3, 4], ...[15, 16, 17, 18], ...[40, 41, 42], ...[69, 79, 89], ...[91, 92]];
    let field = new _({
      COLLISION_RULES: {
        ALLOW_CORNER_COLLISIONS: false
      }
    });
    field.setShips(test).status.should.be.equal("fail");
  });

});