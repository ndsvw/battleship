let Feld = require("./feld");

module.exports = class Player {
  constructor(id) {
    this.id = id;
    this.feld = new Feld();
  }
};