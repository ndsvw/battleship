let Player = require("./player");
let Feld = require("./feld");

module.exports = class Schiffeversenken {
  constructor(options) {
    this.options = options || {};
    this.players = [];
    this.winner;
    this.whoseTurn;
    this.started = false;
  }

  addPlayer(id) {
    if (Object.keys(this.players).length < 2) {
      this.players[id] = new Player(id);
      this.getPlayerById(id).feld = new Feld(this.options);
    }
  }

  getPlayerById(id) {
    return this.players[id];
  }

  getOpponent(p) {
    let id = p.id;
    let keys = Object.keys(this.players);
    for (let k of keys) {
      if (k !== id) {
        return this.getPlayerById(k);
      }
    }
    return "Fehler";
  }

  startTheGame() {
    let keys = Object.keys(this.players);

    if (keys.length !== 2) {
      return {
        status: "fail",
        reason: "Es müssen genau 2 Spieler im Spiel sein."
      }
    }

    for (let k of keys) {
      if (this.players[k].feld.ships.length === 0) {
        return {
          status: "fail",
          reason: "Beide Spieler müssen ihre Schiffe platziert haben."
        }
      }
    }

    this.whoseTurn = keys[Math.floor(Math.random() * 2)];
    this.started = true;

    return {
      status: "success"
    }
  }

  shoot(sourceID, pos) {
    let source = this.getPlayerById(sourceID);
    let goal = this.getOpponent(this.getPlayerById(sourceID));
    if (this.winner !== undefined) {
      return {
        status: "fail",
        reason: "Das Spiel ist bereits vorrüber."
      }
    }

    if (!this.started) {
      return {
        status: "fail",
        reason: "Das Spiel hat noch nicht begonnen."
      }
    }

    if (sourceID !== this.whoseTurn) {
      return {
        status: "fail",
        reason: "Du bist nicht an der Reihe!"
      }
    }

    if (source.feld.hasAlreadyBeenHit(pos)) {
      return {
        status: "fail",
        reason: "Du hast an dieser Stelle bereits ein Schiff getroffen!"
      }
    }

    if (!goal.feld.isShipAt(pos)) {
      if (!source.feld.hasAlreadyBeenMissed(pos)) {
        source.feld.misses.push(pos);
      }
      this.whoseTurn = this.getOpponent(source).id;
      return {
        status: "fail",
        reason: "Nicht getroffen"
      }
    }

    source.feld.hits.push(pos);

    let res = {
      status: "hit"
    };
    if (source.feld.SHIPPOSCOUNTER === source.feld.hits.length) {
      res.gameOver = true;
      this.winner = source.id;
    } else {
      if (!source.feld.SAMEPLAYERSTURNAFTERHIT) {
        this.whoseTurn = this.getOpponent(source).id;
      }
    }
    return res;

  }

};