module.exports = class Feld {
  constructor(options) {
    options = options || {};
    this.SAMEPLAYERSTURNAFTERHIT = typeof options.SAMEPLAYERSTURNAFTERHIT === "undefined" ? true : options.SAMEPLAYERSTURNAFTERHIT;
    this.REQUIREDSHIPS = options.REQUIREDSHIPS || [0, 0, 1, 2, 1, 1]; // hier: 0x 0er, 0x 1er, 1x 2er, 2x 3er, 1x 4er, 1x 5er
    this.FIELD_HEIGHT = options.FIELD_HEIGHT || 10;
    this.FIELD_WIDTH = options.FIELD_WIDTH || 10;
    this.COLLISION_RULES = options.COLLISION_RULES || {
      ALLOW_CORNER_COLLISIONS: true // in the default field: [0,1,2,3,4,15,16] for example
    };
    this.SHIPCOUNTER = 0;
    this.SHIPPOSCOUNTER = 0;
    for (let i = 0; i < this.REQUIREDSHIPS.length; i++) {
      if (this.REQUIREDSHIPS[i] > 0) {
        this.SHIPCOUNTER += this.REQUIREDSHIPS[i];
      }
      this.SHIPPOSCOUNTER += this.REQUIREDSHIPS[i] * i;
    }
    this.ships = [];
    this.hits = [];
    this.misses = [];
  }

  isShipAt(pos) {
    let hit = false;
    for (let s of this.ships) {

      if (s.indexOf(pos) !== -1) {
        hit = true;
        break;
      }
    }
    return hit;
  }

  hasAlreadyBeenHit(pos) {
    return this.hits.indexOf(pos) !== -1;
  }

  hasAlreadyBeenMissed(pos) {
    return this.misses.indexOf(pos) !== -1;
  }

  setShips(arr) {
    let data = this.checkShipArray(arr);
    if (data.status === "success") {
      this.ships = data.ships;
      return {
        status: "success"
      }
    }
    return {
      status: data.status,
      reason: data.reason
    }
  }

  checkShipArray(arr) {

    // Duplikate eliminieren
    arr = Array.from(new Set(arr));

    // sort ascending
    arr.sort((a, b) => a - b);

    // Prüfen, ob alle Schiffe platziert wurden
    if (arr.length !== this.SHIPPOSCOUNTER) {
      return {
        status: "fail",
        reason: "Es ist ein Fehler aufgetreten. Es müssen folgende Schiffe platziert werden: " + this.getRequiredShipsListAsText()
      }
    }

    // Prüfen, ob alle Schiffe innerhalb des Spielfelds platziert wurden
    for (let s of arr) {
      if (s < 0 || s > this.FIELD_HEIGHT * this.FIELD_WIDTH - 1) {
        return {
          status: "fail",
          reason: "Es ist ein Fehler aufgetreten. Schiffe müssen innerhalb des Spielfelds platziert werden."
        }
      }
    }

    // Ein Array mit allen Schiffen bekommen (vorher: Array mit allen Positionen)
    let data = this.getShipsOfArray(arr);
    let ships = data.shipArray;
    let shipsH = data.shipArrayH;
    let shipsV = data.shipArrayV;

    // Prüfen, ob die Schiffe in Anzahl und Länge den Vorgaben entsprechen
    if (ships.length === this.SHIPCOUNTER) {
      // deep copy von den requirement erstellen und bei jedem Boot der Länge x den den Wert mit dem Inde x um 1 senken.
      // Danach prüfen, ob alle Werte des Arrays auf 0 sind.
      let reqCheckArr = JSON.parse(JSON.stringify(this.REQUIREDSHIPS));
      for (let s of ships) {
        reqCheckArr[s.length]--;
      }
      for (let x of reqCheckArr) {
        if (x !== 0) {
          return {
            status: "fail",
            reason: "Es ist ein Fehler aufgetreten. Es müssen folgende Schiffe platziert werden: " + this.getRequiredShipsListAsText()
          }
        }
      }
    } else {
      return {
        status: "fail",
        reason: "Es ist ein Fehler aufgetreten. Es müssen folgende Schiffe platziert werden: " + this.getRequiredShipsListAsText()
      }
    }

    // Prüfen, ob alle Teile horiz. Schiff in der selben Reihe liegen ( [8,9,10,11,12] bspw. nicht akzeptieren).
    for (let s of shipsH) {
      let row = Math.floor(s[0] / this.FIELD_WIDTH);
      for (let i = 1; i < s.length; i++) {
        if (Math.floor(s[i] / this.FIELD_WIDTH) !== row) {
          return {
            status: "fail",
            reason: "Es ist ein Fehler aufgetreten. Es müssen folgende Schiffe platziert werden: " + this.getRequiredShipsListAsText()
          }
        }
      }
    }


    // Gehe alle Schiffe durch und prüfe, ob sie auf verbotenen Positionen stehen
    let forbiddenPositions = this.getForbiddenPos(shipsH, shipsV);
    for (let s of ships) {
      for (let pos of s) {
        if (forbiddenPositions.has(pos)) {
          return {
            status: "fail",
            reason: "Fehler! Schiffe dürfen nicht miteinander kollidieren!"
          }
        }
      }
    }

    return {
      status: "success",
      ships
    };
  }

  getShipsOfArray(arr) {
    let shipArray = [];
    let shipArrayH = [];
    let shipArrayV = [];
    let arrH = []; // Array, das mit den Positionen aller horizontaler Schiffe gefüllt wird

    // Vertikale Schiffe finden.
    for (let s of arr) {
      // Falls die Position schon Teil eines Schiffs ist, continue
      let foundIt = false;
      for (let sh of shipArray) {
        if (sh.indexOf(s) !== -1) {
          foundIt = true;
          break;
        }
      }
      if (foundIt) {
        continue;
      }

      let i = 0;
      while (arr.indexOf(s + (i + 1) * this.FIELD_WIDTH) !== -1) {
        i++;
      }
      if (i === 0) {
        arrH.push(s);
      } else {
        let newShip = [];
        for (let j = s; j < s + (i + 1) * this.FIELD_WIDTH; j += this.FIELD_WIDTH) {
          newShip.push(j);
        }
        shipArray.push(newShip);
        shipArrayV.push(newShip);
      }
    }

    // Horizontale Schiffe finden.
    for (let s of arrH) {
      // Falls die Position schon Teil eines Schiffs ist, continue
      let foundIt = false;
      for (let sh of shipArray) {
        if (sh.indexOf(s) !== -1) {
          foundIt = true;
          break;
        }
      }
      if (foundIt) {
        continue;
      }

      let i = 0;
      while (arr.indexOf(s + i + 1) !== -1) {
        i++;
      }
      if (i !== 0) {
        let newShip = [];
        for (let j = s; j < s + i + 1; j++) {
          newShip.push(j);
        }
        shipArray.push(newShip);
        shipArrayH.push(newShip);
      }
    }

    return {
      shipArray,
      shipArrayH,
      shipArrayV
    }
  }

  getForbiddenPos(arrH, arrV) {
    // Erstelle ein Array mit (für Schiffe) vebotenen Positionen
    // (Schritt 1: horizontal)
    let forbiddenPositions = new Set();
    for (let s of arrH) {

      // Positionen vor und hinter dem Schiff sind verboten
      if (s[0] % this.FIELD_WIDTH > 0) {
        forbiddenPositions = this.pushPosInSet(s[0] - 1, forbiddenPositions);
      }
      if ((s[0] + 1) % this.FIELD_WIDTH > 0) {
        forbiddenPositions = this.pushPosInSet(s[s.length - 1] + 1, forbiddenPositions);
      }

      // Reihen direkt neben dem Schiff & parallel zum Schiff sind verboten
      for (let i = 0; i < s.length; i++) {
        forbiddenPositions = this.pushPosInSet(s[i] - this.FIELD_WIDTH, forbiddenPositions);
        forbiddenPositions = this.pushPosInSet(s[i] + this.FIELD_WIDTH, forbiddenPositions);
      }

      // Positionen an den Ecken sind evtl. verboten
      if (!this.COLLISION_RULES.ALLOW_CORNER_COLLISIONS) {
        if (s[0] % this.FIELD_WIDTH > 0) {
          forbiddenPositions = this.pushPosInSet(s[0] - (this.FIELD_WIDTH + 1), forbiddenPositions);
          forbiddenPositions = this.pushPosInSet(s[0] + (this.FIELD_WIDTH - 1), forbiddenPositions);
        }
        if ((s[0] + 1) % this.FIELD_WIDTH > 0) {
          forbiddenPositions = this.pushPosInSet(s[s.length - 1] - (this.FIELD_WIDTH - 1), forbiddenPositions);
          forbiddenPositions = this.pushPosInSet(s[s.length - 1] + (this.FIELD_WIDTH + 1), forbiddenPositions);
        }
      }
    }

    // (Schritt 2: vertikal)
    for (let s of arrV) {

      // Positionen vor und hinter dem Schiff sind verboten
      forbiddenPositions = this.pushPosInSet(s[0] - this.FIELD_WIDTH, forbiddenPositions);
      forbiddenPositions = this.pushPosInSet(s[s.length - 1] + this.FIELD_WIDTH, forbiddenPositions);

      // Reihen direkt neben dem Schiff & parallel zum Schiff sind verboten
      for (let i = 0; i < s.length; i++) {
        if (s[i] % this.FIELD_WIDTH > 0) {
          forbiddenPositions = this.pushPosInSet(s[i] - 1, forbiddenPositions);
        }
        if ((s[i] + 1) % this.FIELD_WIDTH > 0) {
          forbiddenPositions = this.pushPosInSet(s[i] + 1, forbiddenPositions);
        }
      }

      // Positionen an den Ecken sind evtl. verboten
      if (!this.COLLISION_RULES.ALLOW_CORNER_COLLISIONS) {
        if (s[0] % this.FIELD_WIDTH > 0) {
          forbiddenPositions = this.pushPosInSet(s[0] - (this.FIELD_WIDTH + 1), forbiddenPositions);
          forbiddenPositions = this.pushPosInSet(s[s.length - 1] + (this.FIELD_WIDTH - 1), forbiddenPositions);
        }
        if ((s[0] + 1) % this.FIELD_WIDTH > 0) {
          forbiddenPositions = this.pushPosInSet(s[0] - (this.FIELD_WIDTH - 1), forbiddenPositions);
          forbiddenPositions = this.pushPosInSet(s[s.length - 1] + (this.FIELD_WIDTH + 1), forbiddenPositions);
        }
      }
    }
    return forbiddenPositions;
  }

  getRequiredShipsListAsText(arr) {
    let reqShips = [];
    for (let i = 0; i < this.REQUIREDSHIPS.length; i++) {
      if (this.REQUIREDSHIPS[i] > 0) {
        reqShips.push(this.REQUIREDSHIPS[i] + "x " + i + "er");
      }
    }
    return reqShips.join(", ");
  }

  pushPosInSet(pos, set) {
    if (pos >= 0 && pos < this.FIELD_HEIGHT * this.FIELD_WIDTH - 1) {
      set.add(pos);
    }
    return set;
  }
};