import { Bootstrapper } from "./bootstrapper.js";

Object.prototype.forEach = function (callback)
{
	for (let key in this)
		if (this.hasOwnProperty(key))
			callback(this[key], key);
};

Bootstrapper.init();
