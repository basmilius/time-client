import { tileHeight, tileWidth } from "./shared.js";

function drawTile(g, points, thickness, sceneryConfig)
{
	g.beginFill(0x989865);
	g.lineStyle(.5, 0x838357);
	g.moveTo(points[0].x, points[0].y);
	g.lineTo(points[1].x, points[1].y);
	g.lineTo(points[2].x, points[2].y);
	g.lineTo(points[3].x, points[3].y);
	g.endFill();

	// if (sceneryConfig !== null)
	// {
	// 	const sprite = new PIXI.extras.TilingSprite(sceneryConfig.getFloorTexture());
	// 	sprite.x = 0;
	// 	sprite.y = 0;
	// 	sprite.scale.y = 0.86062;
	// 	sprite.tilePosition.x = tileWidthHalf * 0.25;
	// 	sprite.tileTransform.skew.x = -0.523598776;
	// 	sprite.tileTransform.pivot.set(sprite.width / 2, sprite.height / 2);
	// 	sprite.tileTransform.rotation = 0.523598776;
	// 	sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
	// 	sprite.mask = withInstance(new PIXI.Graphics(), x =>
	// 	{
	// 		x.x = 0;
	// 		x.y = 0;
	//
	// 		x.beginFill(0x989865);
	// 		x.lineStyle(.5, 0x838357);
	// 		x.moveTo(points[0].x, points[0].y);
	// 		x.lineTo(points[1].x, points[1].y);
	// 		x.lineTo(points[2].x, points[2].y);
	// 		x.lineTo(points[3].x, points[3].y);
	// 		x.endFill();
	//
	// 		x.cacheAsBitmap = true;
	// 		g.addChild(x);
	// 	});
	//
	// 	g.addChild(sprite);
	// }

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

		this.cacheAsBitmap = false;
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

	constructor(thickness, sceneryConfig)
	{
		super(thickness);

		for (let step = 0; step < 4; step++)
		{
			let ax = step * 8;
			let ay = step * 12 + this.thickness;

			const points = [
				new PIXI.Point((tileWidth / 2) + ax, ay),
				new PIXI.Point((tileWidth / 2) + (tileWidth / 8) + ax, (tileHeight / 8) + ay),
				new PIXI.Point((tileWidth / 2) - 24 + ax, 20 + ay),
				new PIXI.Point(ax, (tileHeight / 2) + ay)
			];

			drawTile(this, points, this.thickness, sceneryConfig);
		}
	}

}

export class StairsSouthWest extends TileBase
{

	constructor(thickness, sceneryConfig)
	{
		super(thickness);

		for (let step = 0; step < 4; step++)
		{
			let ax = step * -8;
			let ay = step * 12 + this.thickness;

			const points = [
				new PIXI.Point((tileWidth / 2) + ax, ay),
				new PIXI.Point(tileWidth + ax, (tileHeight / 2) + ay),
				new PIXI.Point((tileWidth / 2) + 24 + ax, 20 + ay),
				new PIXI.Point((tileWidth / 2) - (tileWidth / 8) + ax, (tileHeight / 8) + ay)
			];

			drawTile(this, points, this.thickness, sceneryConfig);
		}
	}

}

export class Tile extends TileBase
{

	constructor(thickness, sceneryConfig)
	{
		super(thickness);

		const points = [
			new PIXI.Point(tileWidth / 2, 0),
			new PIXI.Point(tileWidth, tileHeight / 2),
			new PIXI.Point(tileWidth / 2, tileHeight),
			new PIXI.Point(0, tileHeight / 2)
		];

		drawTile(this, points, this.thickness, sceneryConfig);
	}

}
