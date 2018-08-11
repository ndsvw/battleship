const PositionSet = require("./positionset");

module.exports = class RandomFieldGenerator {
  constructor(options) {
    options = options || {};
    this.SAMEPLAYERSTURNAFTERHIT = typeof options.SAMEPLAYERSTURNAFTERHIT === "undefined" ? true : options.SAMEPLAYERSTURNAFTERHIT;
    this.REQUIREDSHIPS = options.REQUIREDSHIPS || [0, 1, 2, 1, 1]; // hier: 0x 1er, 1x 2er, 2x 3er, 1x 4er, 1x 5er
    this.FIELD_HEIGHT = options.FIELD_HEIGHT || 10;
    this.FIELD_WIDTH = options.FIELD_WIDTH || 10;
    this.COLLISION_RULES = options.COLLISION_RULES || {
      ALLOW_CORNER_COLLISIONS: true // in the default field: [0,1,2,3,4,15,16] for example
    };
  }

  generateField() {
    const Feld = require("./feld"); //workaround. Require it at the top does not work.
    //console.log('Feld', Feld);
    // statistics of 1.000.000 tries:
    // >= 60 iterations: 0.0025%
    // >= 50 iterations: 0.194%
    // >= 40 iterations: 0.2772%
    // >= 30 iterations: 3.1173%
    // >= 20 iterations: 24.9807%
    // >= 15 iterations: 54.5571%
    // >= 10 iterations: 88.3623%
    let n = this.FIELD_HEIGHT * this.FIELD_WIDTH;
    let availablePos = new PositionSet(this.FIELD_HEIGHT, this.FIELD_WIDTH, Array.apply(null, { length: n }).map(Function.call, Number)); // generates an array from 0 to n-1
    let solution = new PositionSet(this.FIELD_HEIGHT, this.FIELD_WIDTH, []);

    for (let size = this.REQUIREDSHIPS.length; size > 0; size--) {
      for (let count = 0; count < this.REQUIREDSHIPS[size - 1]; count++) {

        let foundSolution = false;
        while (!foundSolution) {
          let rnd = parseInt(Math.random() * availablePos.get().length);
          let pos = availablePos.get().map(Number)[rnd];
          let dir = parseInt(Math.random() * 4);
          let newPos = new PositionSet(this.FIELD_HEIGHT, this.FIELD_WIDTH, []);

          // Zum Bestimmen der neuen Position wird je nach Richtung wird entweder
          // -i draufaddiert (links)
          // i draufaddiert (rechts)
          // i * -FIELD_WIDTH draufaddiert (oben)
          // i * FIELD_WIDTH draufaddiert (unten)
          let multiplier;
          switch (dir) {
            case 0:
              multiplier = -1;
              break;
            case 1:
              multiplier = 1;
              break;
            case 2:
              multiplier = -this.FIELD_WIDTH;
              break;
            case 3:
              multiplier = this.FIELD_WIDTH;
              break;
          }

          let row = pos;
          for (let i = 0; i < size; i++) {
            if (dir <= 1) {
              if (((pos + (i * multiplier)) % this.FIELD_WIDTH) !== row) {
                continue;
              }
            }
            newPos.add(pos + (i * multiplier));
          }

          if (availablePos.intersect(newPos).size() === newPos.size() && newPos.size() === size) {
            foundSolution = true;

            let f = new Feld();
            let collisionPos;
            if (dir <= 1) {
              collisionPos = f.getCollisionPosOfHorizontalShip(newPos.get().map(Number));
            } else {
              collisionPos = f.getCollisionPosOfVerticalShip(newPos.get().map(Number));
            }

            availablePos = availablePos.difference(newPos);
            availablePos = availablePos.difference(collisionPos);

            solution = solution.union(newPos);
          }

        }
      }
    }
    return solution.get().map(Number);
  }
};