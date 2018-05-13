import { Bootstrapper } from "./bootstrapper.js";

Object.prototype.forEach = function (callback)
{
	for (let key in this)
		if (this.hasOwnProperty(key))
			callback(this[key], key);
};

PIXI.Container.prototype.updateLayerOrder = function ()
{
	this.children.sort(function (a, b)
	{
		a.z = a.z || 0;
		b.z = b.z || 0;

		return a.z - b.z
	});
};

Bootstrapper.init().then(() =>
{
});
