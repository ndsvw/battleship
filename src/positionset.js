const Set = require("ndsvw-set");

module.exports = class PositionSet extends Set {
  // class PositionSet extends Set {
  constructor(height, width, arr) {
    if (typeof arr === "undefined") {
      super([]);
    } else {
      super(arr);
    }
    this.FIELD_HEIGHT = height;
    this.FIELD_WIDTH = width;
  }

  add(pos) {
    if (pos >= 0 && pos < this.FIELD_HEIGHT * this.FIELD_WIDTH - 1) {
      super.add(pos);
    }
  }

  hasPos(pos) {
    return this.contains(pos);
  }

  union(set2) {
    for (let e of set2.get()) {
      this.add(e);
    }
    return this;
  }

};