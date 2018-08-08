module.exports = class PositionSet {
  constructor(height, width) {
    this.FIELD_HEIGHT = height;
    this.FIELD_WIDTH = width;
    this.set = new Set();
  }

  addPos(pos) {
    if (pos >= 0 && pos < this.FIELD_HEIGHT * this.FIELD_WIDTH - 1) {
      this.set.add(pos);
    }
  }

  hasPos(pos) {
    return this.set.has(pos);
  }



}