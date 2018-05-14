import { Bootstrapper } from "./bootstrapper.js";

Array.prototype.pushChain = function (...entries)
{
	this.push(...entries);

	return this;
};

Array.prototype.unique = function ()
{
	return this.filter((value, index, self) => self.indexOf(value) === index);
};

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
