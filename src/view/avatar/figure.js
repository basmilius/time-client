export class FigureString
{

	get parts()
	{
		return this._parts;
	}

	constructor(figure)
	{
		this._parts = {};

		this.parse(figure);
	}

	hasPartId(type, id)
	{
		if (!this.hasPartType(type))
			return false;

		return this._parts[type].id === id;
	}

	hasPartType(type)
	{
		return this._parts[type] !== undefined;
	}

	parse(figure)
	{
		figure = figure.split(".");
		figure = figure.map(part => part.split("-"));
		figure = figure.sort((a, b) => a[0].localeCompare(b[0]));
		figure.forEach(part => this._parts[part[0]] = {id: parseInt(part[1]), color: [part[2], part[3]].filter(n => n !== null)});
	}

	toString()
	{
		const str = [];

		this.parts.forEach((data, type) => str.push([type, data.id, ...data.color].join("-")));

		return str.join(".");
	}

}
