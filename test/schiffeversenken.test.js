var should = require("chai").should();
var expect = require("chai").expect;
var Player = require("../src/player");
var Schiffeversenken = require("../src/schiffeversenken");

createExampleSchiffeversenken = () => {
  let s = new Schiffeversenken();

  s.addPlayer("playerID1");
  s.addPlayer("playerID2");

  let ships = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[41, 51, 61], ...[55, 65]];
  s.getPlayerById("playerID1").feld.setShips(ships);

  ships = [...[67, 77], ...[31, 41, 51, 61, 71], ...[0, 1, 2], ...[16, 17, 18], ...[96, 97, 98, 99]];
  s.getPlayerById("playerID2").feld.setShips(ships);

  return s;
}

describe("schiffeversenken...", () => {

  it(".getPlayerById() should work,", () => {
    let s = createExampleSchiffeversenken();
    s.getPlayerById("playerID1").id.should.be.equal("playerID1");
  });

  it(".getOpponent() should work", () => {
    let s = new Schiffeversenken();

    s.addPlayer("playerID1");
    s.addPlayer("playerID2");

    s.getOpponent(s.getPlayerById("playerID1")).id.should.be.equal(s.getPlayerById("playerID2").id);
  });

  it("should work (whole game)", () => {
    let s = createExampleSchiffeversenken();

    s.startTheGame();
    s.whoseTurn = "playerID1";

    let shotArray = [0, 1, 2, 16, 17, 18, 31, 41, 51, 61, 71, 67, 77, 96, 97, 98];

    shotArray.map(pos => {
      s.shoot("playerID1", pos);
    });

    let res = s.shoot("playerID1", 99);

    res.gameOver.should.be.equal(true);

  });

  it("should work (whole game) with other options", () => {
    let s = new Schiffeversenken({
      SAMEPLAYERSTURNAFTERHIT: false,
      REQUIREDSHIPS: [0, 0, 3],
      FIELD_HEIGHT: 5,
      FIELD_WIDTH: 5
    });

    s.addPlayer("playerID1");
    s.addPlayer("playerID2");

    let ships = [...[0, 1], ...[8, 9], ...[23, 24]];
    s.getPlayerById("playerID1").feld.setShips(ships);

    ships = [...[1, 2], ...[15, 16], ...[8, 9]];
    s.getPlayerById("playerID2").feld.setShips(ships);

    s.startTheGame()
    s.whoseTurn = "playerID1";

    s.shoot("playerID1", 0);
    s.shoot("playerID2", 0);
    s.shoot("playerID1", 1);
    s.shoot("playerID2", 1);
    s.shoot("playerID1", 2);
    s.shoot("playerID2", 8);
    s.shoot("playerID1", 3);
    s.shoot("playerID2", 9);
    s.shoot("playerID1", 4);
    s.shoot("playerID2", 23);
    s.shoot("playerID1", 5);
    let res = s.shoot("playerID2", 24);
    res.gameOver.should.be.equal(true)
  });

  it("should fill the arrays correctly during a match", () => {
    let s = createExampleSchiffeversenken();
    s.startTheGame();
    s.whoseTurn = "playerID1";

    s.shoot("playerID1", 0); // hit
    s.shoot("playerID1", 1); // hit
    s.shoot("playerID1", 2); // hit
    s.shoot("playerID1", 3); // no hit
    s.shoot("playerID2", 19); // no hit
    s.shoot("playerID1", 64); // no hit

    let is_hits = JSON.stringify(s.getPlayerById("playerID1").feld.hits);
    let shouldHits = JSON.stringify([0, 1, 2]);
    let is_misses = JSON.stringify(s.getPlayerById("playerID1").feld.misses);
    let shouldMisses = JSON.stringify([3, 64]);

    shouldHits.should.be.equal(is_hits);
    shouldMisses.should.be.equal(is_misses);
  })

});

describe("schiffeversenken.startTheGame()", () => {
  it("should work with 2 player", () => {
    let s = new Schiffeversenken();

    s.addPlayer("playerID1");
    s.addPlayer("playerID2");

    let ships = [...[0, 1, 2, 3, 4], ...[7, 8, 9], ...[20, 21, 22, 23], ...[41, 51, 61], ...[55, 65]];
    s.getPlayerById("playerID1").feld.setShips(ships);

    ships = [...[67, 77], ...[31, 41, 51, 61, 71], ...[0, 1, 2], ...[16, 17, 18], ...[96, 97, 98, 99]];
    s.getPlayerById("playerID2").feld.setShips(ships);

    s.startTheGame().status.should.be.equal("success");
  });

  it("should not work with less than 2 player", () => {
    let s = new Schiffeversenken();
    s.addPlayer("playerID1");
    s.startTheGame().status.should.not.be.equal("success");
  });

});

describe("schiffeversenken.shoot()", () => {

  it("should interpret a hit as a hit", () => {

    let s = createExampleSchiffeversenken();

    s.startTheGame();
    s.whoseTurn = "playerID1";

    s.shoot("playerID1", 1).status.should.be.equal("hit");
  });

  it("should interpret a missing as a missing", () => {
    let s = createExampleSchiffeversenken();

    s.startTheGame();
    s.whoseTurn = "playerID1";

    s.shoot("playerID1", 10).status.should.not.be.equal("hit");
  });

  it("should reject a shot if the game has not started yet", () => {
    let s = createExampleSchiffeversenken();

    s.whoseTurn = "playerID1";

    s.shoot("playerID1", 1).status.should.not.be.equal("hit");
  });

  it("should reject a shot if the game is over", () => {
    let s = createExampleSchiffeversenken();

    s.startTheGame();
    s.whoseTurn = "playerID1";
    s.winner = "playerID1";

    s.shoot("playerID1", 1).status.should.not.be.equal("hit");
  });

  it("should reject a n^th (n>1) shot on the same pos", () => {
    let s = createExampleSchiffeversenken();

    s.whoseTurn = "playerID1";
    s.shoot("playerID1", 1);

    s.whoseTurn = "playerID1";
    s.shoot("playerID1", 1).status.should.not.be.equal("hit");
  });

  it("should reject a shot if it is not the source`s turn", () => {
    let s = createExampleSchiffeversenken();

    s.whoseTurn = "playerID1";

    s.shoot("playerID2", 6).status.should.not.be.equal("hit");

  });

});