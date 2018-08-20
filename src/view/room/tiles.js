import { tileHeight, tileWidth } from "./shared.js";

function drawTile(g, points, thickness)
{
	g.beginFill(0x989865);
	g.moveTo(points[0].x, points[0].y);
	g.lineTo(points[1].x, points[1].y);
	g.lineTo(points[2].x, points[2].y);
	g.lineTo(points[3].x, points[3].y);
	g.endFill();

	if (thickness > 0)
	{
		g.beginFill(0x838357);
		g.moveTo(points[1].x, points[1].y);
		g.lineTo(points[1].x, points[1].y + thickness);
		g.lineTo(points[2].x, points[2].y + thickness);
		g.lineTo(points[2].x, points[2].y);
		g.endFill();

		g.beginFill(0x6F6F49);
		g.moveTo(points[3].x, points[3].y);
		g.lineTo(points[3].x, points[3].y + thickness);
		g.lineTo(points[2].x, points[2].y + thickness);
		g.lineTo(points[2].x, points[2].y);
		g.endFill();
	}
}

export class TileBase extends PIXI.Graphics
{

	constructor(thickness)
	{
		super();

		this.row = 0;
		this.column = 0;

		this.cacheAsBitmap = true;
		this.interactive = true;
		this.thickness = thickness;

		this.on("pointertap", () => this.onClick());
		this.on("pointerover", () => this.onMouseOver());
		this.on("pointerout", () => this.onMouseOut());
	}

	onClick()
	{
		this.emit("tile-tap", {
			row: this.row,
			column: this.column,
			x: this.x,
			y: this.y,
			z: this.z,
			width: this.width,
			height: this.height,
			tile: this
		});
	}

	onMouseOver()
	{
		this.emit("tile-hover", {
			row: this.row,
			column: this.column,
			x: this.x,
			y: this.y,
			z: this.z,
			width: this.width,
			height: this.height,
			tile: this
		});
	}

	onMouseOut()
	{
		this.emit("tile-leave", {
			row: this.row,
			column: this.column,
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			tile: this
		});
	}

}

export class StairsSouth extends TileBase
{

	constructor(thickness)
	{
		super(thickness);
	}

}

export class StairsSouthEast extends TileBase
{

	constructor(thickness)
	{
		super(thickness);

		const allPoints = [];

		for (let step = 0; step < 4; step++)
		{
			let ax = step * 8;
			let ay = step * 12;

			const points = [
				new PIXI.Point((tileWidth / 2) + ax, ay),
				new PIXI.Point((tileWidth / 2) + (tileWidth / 8) + ax, (tileHeight / 8) + ay),
				new PIXI.Point((tileWidth / 2) - 24 + ax, 20 + ay),
				new PIXI.Point(ax, (tileHeight / 2) + ay)
			];

			allPoints.push(...points);

			drawTile(this, points, this.thickness);
		}
	}

}

export class StairsSouthWest extends TileBase
{

	constructor(thickness)
	{
		super(thickness);

		for (let step = 0; step < 4; step++)
		{
			let ax = step * -8;
			let ay = step * 12;

			const points = [
				new PIXI.Point((tileWidth / 2) + ax, ay),
				new PIXI.Point(tileWidth + ax, (tileHeight / 2) + ay),
				new PIXI.Point((tileWidth / 2) + 24 + ax, 20 + ay),
				new PIXI.Point((tileWidth / 2) - (tileWidth / 8) + ax, (tileHeight / 8) + ay)
			];

			drawTile(this, points, this.thickness);
		}
	}

}

export class Tile extends TileBase
{

	constructor(thickness)
	{
		super(thickness);

		const points = [
			new PIXI.Point(tileWidth / 2, 0),
			new PIXI.Point(tileWidth, tileHeight / 2),
			new PIXI.Point(tileWidth / 2, tileHeight),
			new PIXI.Point(0, tileHeight / 2)
		];

		drawTile(this, points, this.thickness);
	}

}
