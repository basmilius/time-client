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
	let i = 0;

	this.children.sort((a, b) =>
	{
		let az = a.z || 0;
		let bz = b.z || 0;

		if (az === bz)
			return this.children.indexOf(a) - this.children.indexOf(b);

		return az - bz;
	});
};

Bootstrapper.init().then(() =>
{
});
