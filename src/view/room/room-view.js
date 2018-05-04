import { withInstance } from "../../core/pixi-utils.js";
import { Bootstrapper } from "../../bootstrapper.js";

const tileHeight = 32;
const tileWidth = 64;

let heightMaps = [];

function drawTile(g, points, thickness)
{
	g.beginFill(0x989865);
	g.lineStyle(1.0, 0x8E8E5E);
	g.moveTo(points[0].x, points[0].y);
	g.lineTo(points[1].x, points[1].y);
	g.lineTo(points[2].x, points[2].y);
	g.lineTo(points[3].x, points[3].y);
	g.endFill();

	if (thickness > 0)
	{
		g.beginFill(0x838357);
		g.lineStyle(0.5, 0x7A7A51);
		g.moveTo(points[1].x, points[1].y);
		g.lineTo(points[1].x, points[1].y + thickness);
		g.lineTo(points[2].x, points[2].y + thickness);
		g.lineTo(points[2].x, points[2].y);
		g.endFill();

		g.beginFill(0x6F6F49);
		g.lineStyle(0.5, 0x676744);
		g.moveTo(points[3].x, points[3].y);
		g.lineTo(points[3].x, points[3].y + thickness);
		g.lineTo(points[2].x, points[2].y + thickness);
		g.lineTo(points[2].x, points[2].y);
		g.endFill();
	}
}

function getTile(tiles, row, column)
{
	if (typeof tiles[row] === "undefined")
		return null;

	if (typeof tiles[row][column] === "undefined")
		return null;

	return tiles[row][column];
}

function getTileHeight(char)
{
	if (char === "x")
		return null;

	return ["1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(char);
}

heightMaps.push(`
xxxxx
x000x
x000x
x000x
xxxxx
`);

heightMaps.push(`
xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxx22222222
xxxxxxxxxxx22222222
xxxxxxxxxxx22222222
xxxxxxxxxxx22222222
xxxxxxxxxxx22222222
xxxxxxxxxxx22222222
x222222222222222222
x222222222222222222
x222222222222222222
x222222222222222222
x222222222222222222
x222222222222222222
x2222xxxxxxxxxxxxxx
x2222xxxxxxxxxxxxxx
x2222211111xx000000
x222221111110000000
x222221111110000000
x2222211111xx000000
xx22xxx1111xxxxxxxx
xx11xxx1111xxxxxxxx
x1111xx1111xx000000
x1111xx111110000000
x1111xx111110000000
x1111xx1111xx000000
xxxxxxxxxxxxxxxxxxx
`);

export class RoomView extends PIXI.Graphics
{

	constructor()
	{
		super();

		this.prepareHeightmap(heightMaps[1]);

		// this.scale.x = 2;
		// this.scale.y = 2;

		Bootstrapper.getStage().getTicker().add(delta => this.onTick(delta));
	}

	prepareHeightmap(heightmap)
	{
		const rows = heightmap
			.trim()
			.split("\n")
			.map(row => row.split("").map(char => getTileHeight(char)));

		while (this.children[0])
			this.removeChild(this.children[0]);

		if (rows.length === 0)
			return;

		let tiles = [];

		let columnCount = rows[0].length;
		let rowCount = rows.length;

		for (let row = 0; row < rows.length; row++)
		{
			for (let column = 0; column < rows[row].length; column++)
			{
				const t = rows[row][column];

				if (t === null)
					continue;

				let implementation = Tile;

				let tileSouthEast = getTile(rows, row, column + 1);
				let tileSouthWest = getTile(rows, row + 1, column);

				if (tileSouthEast !== null && Math.abs(t - tileSouthEast) === 1)
					implementation = StairsSouthEast;

				if (tileSouthWest !== null && Math.abs(t - tileSouthWest) === 1)
					implementation = StairsSouthWest;

				this.addChild(withInstance(new implementation(), tile =>
				{
					tiles.push(tile);

					tile.x = (column - row) * 32;
					tile.y = (column + row) * 16 - (t * 32);
				}));
			}
		}

		// Re-center tiles.
		if (tiles.length > 0)
		{
			let xred = tiles.reduce((acc, cur) => acc.x < cur.x ? acc : cur).x;
			let yred = tiles.reduce((acc, cur) => acc.y < cur.y ? acc : cur).y;

			tiles.forEach(tile =>
			{
				tile.x -= xred;
				tile.y -= yred;
			});
		}

		// this.beginFill(0xABCDEF);
		// this.drawRect(0, 0, this.width, this.height);
		// this.endFill();
	}

	onTick(delta)
	{
		this.x = Math.floor((Bootstrapper.getStage().width / 2) - (this.width / 2));
		this.y = Math.floor((Bootstrapper.getStage().height / 2) - (this.height / 2));
	}

}

class TileBase extends PIXI.Graphics
{

	constructor()
	{
		super();

		this.cacheBitmap = true;
		this.thickness = 8;
	}

}

class StairsSouthEast extends TileBase
{

	constructor()
	{
		super();

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

			drawTile(this, points, this.thickness);
		}
	}

}

class StairsSouthWest extends TileBase
{

	constructor()
	{
		super();

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

class Tile extends TileBase
{

	constructor()
	{
		super();

		const points = [
			new PIXI.Point(tileWidth / 2, 0),
			new PIXI.Point(tileWidth, tileHeight / 2),
			new PIXI.Point(tileWidth / 2, tileHeight),
			new PIXI.Point(0, tileHeight / 2)
		];

		drawTile(this, points, this.thickness);
	}

}
