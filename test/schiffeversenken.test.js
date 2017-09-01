var should = require('chai').should();
var expect = require('chai').expect;
var Player = require('../src/player');
var Schiffeversenken = require('../src/schiffeversenken');

createExampleSchiffeversenken = () => {
  let s = new Schiffeversenken();

  s.addPlayer("playerID1");
  s.addPlayer("playerID2");

  let ships = [];
  ships = ships.concat([0, 1, 2, 3, 4]);
  ships = ships.concat([7, 8, 9]);
  ships = ships.concat([20, 21, 22, 23]);
  ships = ships.concat([41, 51, 61]);
  ships = ships.concat([55, 65]);
  s.getPlayerById("playerID1").feld.setShips(ships);

  ships = [];
  ships = ships.concat([67, 77]);
  ships = ships.concat([31, 41, 51, 61, 71]);
  ships = ships.concat([0, 1, 2]);
  ships = ships.concat([16, 17, 18]);
  ships = ships.concat([96, 97, 98, 99]);
  s.getPlayerById("playerID2").feld.setShips(ships);

  return s;
}

describe('schiffeversenken...', () => {

  it('.getPlayerById() should work,', () => {
    let s = createExampleSchiffeversenken();
    s.getPlayerById("playerID1").id.should.be.equal("playerID1");
  });

  it('.getOpponent() should work', () => {
    let s = new Schiffeversenken();

    s.addPlayer("playerID1");
    s.addPlayer("playerID2");

    s.getOpponent(s.getPlayerById("playerID1")).id.should.be.equal(s.getPlayerById("playerID2").id);
  });

  it('should work (whole game)', () => {
    let s = createExampleSchiffeversenken();

    s.startTheGame();
    s.whoseTurn = "playerID1";

    s.shoot("playerID1", 0);
    s.shoot("playerID1", 1);
    s.shoot("playerID1", 2);
    s.shoot("playerID1", 16);
    s.shoot("playerID1", 17);
    s.shoot("playerID1", 18);
    s.shoot("playerID1", 31);
    s.shoot("playerID1", 41);
    s.shoot("playerID1", 51);
    s.shoot("playerID1", 61);
    s.shoot("playerID1", 71);
    s.shoot("playerID1", 67);
    s.shoot("playerID1", 77);
    s.shoot("playerID1", 96);
    s.shoot("playerID1", 97);
    s.shoot("playerID1", 98);
    let res = s.shoot("playerID1", 99);

    res.gameOver.should.be.equal(true);

  });

  it('should work (whole game) with other options', () => {
    let s = new Schiffeversenken({
      SAMEPLAYERSTURNAFTERHIT: false,
      REQUIREDSHIPS: [0, 0, 3],
      FIELD_HEIGHT: 5,
      FIELD_WIDTH: 5
    });

    s.addPlayer("playerID1");
    s.addPlayer("playerID2");

    let ships = [];
    ships = ships.concat([0, 1]);
    ships = ships.concat([8, 9]);
    ships = ships.concat([23, 24]);
    s.getPlayerById("playerID1").feld.setShips(ships);

    ships = [];
    ships = ships.concat([1, 2]);
    ships = ships.concat([15, 16]);
    ships = ships.concat([8, 9]);
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

});

describe('schiffeversenken.startTheGame()', () => {
  it('should work with 2 player', () => {
    let s = new Schiffeversenken();

    s.addPlayer("playerID1");
    s.addPlayer("playerID2");

    let ships = [];
    ships = ships.concat([0, 1, 2, 3, 4]);
    ships = ships.concat([7, 8, 9]);
    ships = ships.concat([20, 21, 22, 23]);
    ships = ships.concat([41, 51, 61]);
    ships = ships.concat([55, 65]);
    s.getPlayerById("playerID1").feld.setShips(ships);

    ships = [];
    ships = ships.concat([67, 77]);
    ships = ships.concat([31, 41, 51, 61, 71]);
    ships = ships.concat([0, 1, 2]);
    ships = ships.concat([16, 17, 18]);
    ships = ships.concat([96, 97, 98, 99]);
    s.getPlayerById("playerID2").feld.setShips(ships);

    s.startTheGame().status.should.be.equal("success");
  });

  it('should not work with less than 2 player', () => {
    let s = new Schiffeversenken();
    s.addPlayer("playerID1");
    s.startTheGame().status.should.not.be.equal("success");
  });

});

describe('schiffeversenken.shoot()', () => {

  it('should interpret a hit as a hit', () => {

    let s = createExampleSchiffeversenken();

    s.startTheGame();
    s.whoseTurn = "playerID1";

    s.shoot("playerID1", 1).status.should.be.equal("hit");
  });

  it('should interpret a missing as a missing', () => {
    let s = createExampleSchiffeversenken();

    s.startTheGame();
    s.whoseTurn = "playerID1";

    s.shoot("playerID1", 10).status.should.not.be.equal("hit");
  });

  it('should reject a shot if the game has not started yet', () => {
    let s = createExampleSchiffeversenken();

    s.whoseTurn = "playerID1";

    s.shoot("playerID1", 1).status.should.not.be.equal("hit");
  });

  it('should reject a shot if the game is over', () => {
    let s = createExampleSchiffeversenken();

    s.startTheGame();
    s.whoseTurn = "playerID1";
    s.winner = "playerID1";

    s.shoot("playerID1", 1).status.should.not.be.equal("hit");
  });

  it('should reject a n^th (n>1) shot on the same pos', () => {
    let s = createExampleSchiffeversenken();

    s.whoseTurn = "playerID1";
    s.shoot("playerID1", 1);

    s.whoseTurn = "playerID1";
    s.shoot("playerID1", 1).status.should.not.be.equal("hit");
  });

  it('should reject a shot if it is not the source`s turn', () => {
    let s = createExampleSchiffeversenken();

    s.whoseTurn = "playerID1";

    s.shoot("playerID2", 6).status.should.not.be.equal("hit");

  });

});