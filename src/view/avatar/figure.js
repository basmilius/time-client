/**
 * Class AvatarFigure.
 *
 * @author Bas Milius <bas@mili.us>
 * @since 2018-05-20
 */
export class AvatarFigure
{

	/**
	 * AvatarFigure Constructor.
	 *
	 * @param {String} figure
	 *
	 * @author Bas Milius <bas@mili.us>
	 * @since 2018-05-20
	 */
	constructor(figure)
	{
		this.parts = [];

		this.parse(figure);
	}

	/**
	 * Gets a figure part.
	 *
	 * @param {String} type
	 *
	 * @returns {AvatarFigurePart|undefined}
	 *
	 * @author Bas Milius <bas@mili.us>
	 * @since 2018-05-20
	 */
	getPart(type)
	{
		for (let part of this.parts)
			if (part.type === type)
				return part;

		return undefined;
	}

	/**
	 * Gets the set id for a part type.
	 *
	 * @param {String} type
	 *
	 * @returns {Number}
	 *
	 * @author Bas Milius <bas@mili.us>
	 * @since 2018-05-20
	 */
	getPartSetId(type)
	{
		for (let part of this.parts)
			if (part.type === type)
				return part.setId;

		return 0;
	}

	/**
	 * Gets the colors for a part type.
	 *
	 * @param {String} type
	 *
	 * @returns {Array<Number>|null}
	 *
	 * @author Bas Milius <bas@mili.us>
	 * @since 2018-05-20
	 */
	getPartSetColorIds(type)
	{
		for (let part of this.parts)
			if (part.type === type)
				return part.colorIds;

		return null;
	}

	/**
	 * Parses our figure string into parts.
	 *
	 * @param {String} figure
	 *
	 * @private
	 * @author Bas Milius <bas@mili.us>
	 * @since 2018-05-20
	 */
	parse(figure)
	{
		for (let part of figure.split("."))
		{
			let data = part.split("-");
			let type = data.shift();
			let setId = parseInt(data.shift());
			let colors = data.map(color => parseInt(color));

			this.parts.push(new AvatarFigurePart(type, setId, colors));
		}

		this.parts.sort((a, b) => a.type.localeCompare(b.type));
	}

	/**
	 * Removes a type from figure.
	 *
	 * @param {String} type
	 *
	 * @author Bas Milius <bas@mili.us>
	 * @since 2018-05-20
	 */
	removeType(type)
	{
		this.parts = this.parts.filter(part => part.type !== type);
	}

	/**
	 * Returns the String representation of this figure.
	 *
	 * @returns {String}
	 *
	 * @author Bas Milius <bas@mili.us>
	 * @since 2018-05-20
	 */
	toString()
	{
		return this.parts.map(part => part.toString()).join(".");
	}

}

/**
 * Class AvatarFigurePart.
 *
 * @author Bas Milius <bas@mili.us>
 * @since 2018-05-20
 */
export class AvatarFigurePart
{

	/**
	 * Gets the color ids.
	 *
	 * @returns {Array<Number>}
	 *
	 * @author Bas Milius <bas@mili.us>
	 * @since 2018-05-20
	 */
	get colorIds()
	{
		return this._colorIds;
	}

	/**
	 * Gets the set id.
	 *
	 * @returns {Number}
	 *
	 * @author Bas Milius <bas@mili.us>
	 * @since 2018-05-20
	 */
	get setId()
	{
		return this._setId;
	}

	/**
	 * Gets the type.
	 *
	 * @returns {String}
	 *
	 * @author Bas Milius <bas@mili.us>
	 * @since 2018-05-20
	 */
	get type()
	{
		return this._type;
	}

	/**
	 * AvatarFigurePart Constructor.
	 *
	 * @param {String} type
	 * @param {Number} setId
	 * @param {Array<Number>} colorIds
	 *
	 * @author Bas Milius <bas@mili.us>
	 * @since 2018-05-20
	 */
	constructor(type, setId, colorIds)
	{
		this._type = type;
		this._setId = setId;
		this._colorIds = colorIds;
	}

	/**
	 * Returns the String representation of this figure part.
	 *
	 * @returns {String}
	 *
	 * @author Bas Milius <bas@mili.us>
	 * @since 2018-05-20
	 */
	toString()
	{
		return [this.type, this.setId, ...this.colorIds].join("-");
	}

}
