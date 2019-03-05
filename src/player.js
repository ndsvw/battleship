const Field = require('./field');

module.exports = class Player {
	constructor(id) {
		this.id = id;
		this.field = new Field();
	}
};
