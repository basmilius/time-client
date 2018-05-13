import { simpleDraggable, withInstance } from "../../core/pixi-utils.js";
import { application } from "../../bootstrapper.js";

const debugDoor = false;
const debugWalls = false;

const tileHeight = 32;
const tileHeightHalf = tileHeight / 2;
const tileWidth = 64;
const tileWidthHalf = tileWidth / 2;

let heightMaps = [];

export const Heading = {
	NorthEast: 0,
	NorthWest: 1,
	SouthEast: 2,
	SouthWest: 3
};

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

function getDoorDirection(tiles, row, column)
{
	if (!isDoor(tiles, row, column))
		return null;

	return [Heading.NorthEast, Heading.NorthWest, Heading.SouthEast, Heading.SouthWest][getSurroundings(tiles, row, column).findIndex(t => t !== null)];
}

function getSurroundings(tiles, row, column)
{
	let tileNorthEast = getTile(tiles, row - 1, column);
	let tileNorthWest = getTile(tiles, row, column - 1);
	let tileSouthEast = getTile(tiles, row, column + 1);
	let tileSouthWest = getTile(tiles, row + 1, column);

	return [tileNorthEast, tileNorthWest, tileSouthEast, tileSouthWest];
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

	return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"].indexOf(char);
}

function isDoor(tiles, row, column)
{
	if (getTile(tiles, row, column) === null)
		return false;

	return getSurroundings(tiles, row, column).filter(t => t !== null).length === 1;
}

function needsWallC(tiles, row, column)
{
	if (isDoor(tiles, row, column))
		return false;

	let cy = row;

	while (cy > 0)
		if (getTile(tiles, --cy, column) !== null && !isDoor(tiles, row, cy))
			return false;

	return !((getTile(tiles, row - 1, column - 1) !== null && !isDoor(tiles, row - 1, column - 1)) || (getTile(tiles, row - 1, column + 1) !== null && !isDoor(tiles, row - 1, column + 1)));
}

function needsWallR(tiles, row, column)
{
	if (isDoor(tiles, row, column))
		return false;

	let cx = column;

	while (cx > 0)
		if (getTile(tiles, row, --cx) !== null && !isDoor(tiles, row, cx))
			return false;

	return !((getTile(tiles, row - 1, column - 1) !== null && !isDoor(tiles, row - 1, column - 1)) || (getTile(tiles, row + 1, column - 1) !== null && !isDoor(tiles, row + 1, column - 1)));
}

heightMaps.push(`
xxxxx
x000x
0000x
x000x
x000x
x000x
xxxxx
`);

heightMaps.push(`
xxxxx
x110x
x110x
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

heightMaps.push(`
xxxxxxxxxxxxxxxxxxxxxx
x22222222222222222222x
x22222222222222222222x
x22222222222222222222x
x22222222222222222222x
x22222222222222222222x
x22222222222222222222x
x22222222222222222222x
x000x11xxxxxxxx11x000x
x00000000000000000000x
x00000000000000000000x
x00000000000000000000x
x00000000000000000000x
x00000000000000000000x
x00000000000000000000x
x00000000000000000000x
x00000000000000000000x
x00000000000000000000x
xxxxxxxxxxxxxxxxxxxxxx
`);

heightMaps.push(`
xxxxxxxxxxxxxxxxxxx
xxxxxxx222222222222
xxxxxxx222222222222
xxxxxxx222222222222
xxxxxxx222222222222
xxxxxxx222222222222
xxxxxxx222222222222
xxxxxxx222222222222
xxxxxxx111111111111
x222221111111111111
x222221111111111111
x222221111111111111
x222221111111111111
x222221111111111111
x222221111111111111
x222221111111111111
x222221111111111111
x2222xx111111111111
x2222xx000000000000
x2222xx000000000000
x2222xx000000000000
x2222xx000000000000
x2222xx000000000000
22222xx000000000000
x2222xx000000000000
xxxxxxxxxxxxxxxxxxx
`);

heightMaps.push(`
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
x222222222x000000000000000000000000xxxx
x222222222x000000000000000000000000xxxx
x222222222x000000000000000000000000xxxx
x222222222x000000000000000000000000xxxx
x222222222x000000000000000000000000xxxx
x222222222x000000000000000000000000xxxx
x222222222x000000000000000000000000xxxx
x222222222x000000000000000000000000xxxx
x222222222x00000000xxxxxxxx00000000xxxx
x11xxxxxxxx00000000xxxxxxxx00000000xxxx
x00x000000000000000xxxxxxxx00000000xxxx
x00x000000000000000xxxxxxxx00000000xxxx
x000000000000000000xxxxxxxx00000000xxxx
x000000000000000000xxxxxxxx00000000xxxx
0000000000000000000xxxxxxxx00000000xxxx
x000000000000000000xxxxxxxx00000000xxxx
x00x000000000000000xxxxxxxx00000000xxxx
x00x000000000000000xxxxxxxx00000000xxxx
x00xxxxxxxxxxxxxxxxxxxxxxxx00000000xxxx
x00xxxxxxxxxxxxxxxxxxxxxxxx00000000xxxx
x00x0000000000000000000000000000000xxxx
x00x0000000000000000000000000000000xxxx
x0000000000000000000000000000000000xxxx
x0000000000000000000000000000000000xxxx
x0000000000000000000000000000000000xxxx
x0000000000000000000000000000000000xxxx
x00x0000000000000000000000000000000xxxx
x00x0000000000000000000000000000000xxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
`);

export class RoomView extends PIXI.Container
{

	get roomScale()
	{
		return this.scale.x;
	}

	set roomScale(value)
	{
		this.scale.x = value;
		this.scale.y = value;
	}

	constructor()
	{
		super();

		simpleDraggable(this);
		this.prepareHeightmap(heightMaps[4]);

		this.roomScale = 1;
		this.tileCursor = new TileCursor();

		this.on("pointerout", () => this.onTileLeave());

		application.ticker.add(() => this.onTick());
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

		for (let row = 0; row < rows.length; row++)
		{
			for (let column = 0; column < rows[row].length; column++)
			{
				const t = rows[row][column];

				if (t === null)
					continue;

				let implementation = Tile;
				let tileNorthEast, tileNorthWest, tileSouthEast, tileSouthWest;

				[tileNorthEast, tileNorthWest, tileSouthEast, tileSouthWest] = getSurroundings(rows, row, column);

				let door = isDoor(rows, row, column);
				let doorDirection = door ? getDoorDirection(rows, row, column) : null;

				let wallC = needsWallC(rows, row, column);
				let wallR = needsWallR(rows, row, column);
				let wall = wallC || wallR;

				if (tileSouthEast !== null && tileSouthWest !== null && Math.abs(t - tileSouthEast) === 1 && Math.abs(t - tileSouthWest) === 1)
					implementation = StairsSouth;
				else if (tileSouthEast !== null && Math.abs(t - tileSouthEast) === 1)
					implementation = StairsSouthEast;
				else if (tileSouthWest !== null && Math.abs(t - tileSouthWest) === 1)
					implementation = StairsSouthWest;

				let x = (column - row) * tileWidthHalf;
				let y = (column + row) * tileHeightHalf - (t * tileWidthHalf);
				let z = row << 16 | column;

				if (wall)
				{
					let wallImplementations = [];

					if (wallC && wallR)
					{
						wallImplementations.push(new WallCorner());
						wallImplementations.push(new WallColumn(isDoor(rows, row - 1, column)));
						wallImplementations.push(new WallRow(isDoor(rows, row, column - 1)));
					}
					else if (wallC)
					{
						wallImplementations.push(new WallColumn(isDoor(rows, row - 1, column)));
					}
					else if (wallR)
					{
						wallImplementations.push(new WallRow(isDoor(rows, row, column - 1)));
					}

					for (const wi of wallImplementations)
					{
						this.addChild(withInstance(wi, wall =>
						{
							tiles.push(wall);

							wall.x = x + tileWidthHalf;
							wall.y = y;
							wall.z = z - 1;
						}));
					}
				}

				this.addChild(withInstance(new implementation(), tile =>
				{
					tiles.push(tile);

					tile.row = row;
					tile.column = column;

					if (debugDoor && door)
						tile.tint = 0xFF0000;

					if (debugWalls)
						if (wallC && wallR)
							tile.tint = 0x00FFFF;
						else if (wallC)
							tile.tint = 0x00FF00;
						else if (wallR)
							tile.tint = 0x0000FF;

					tile.on("hover", evt => this.onTileHover(evt));

					tile.x = x;
					tile.y = y;
					tile.z = z;
				}));
			}
		}

		if (tiles.length > 0)
		{
			let xred = tiles.reduce((acc, cur) => acc.x < cur.x ? acc : cur).x;
			let yred = tiles.reduce((acc, cur) => acc.y < cur.y ? acc : cur).y;

			tiles.forEach(tile =>
			{
				tile.x -= xred;
				// tile.y -= yred;
			});
		}

		this.position.x = Math.floor((application.display.width / 2) - (this.width / 2));
		this.position.y = Math.floor((application.display.height / 2) - (this.height / 2));
	}

	onTick()
	{
		this.updateLayerOrder();
	}

	onTileHover(evt)
	{
		this.addChild(this.tileCursor);
		this.tileCursor.hover(evt.row, evt.column, evt.x, evt.y, evt.z, evt.tile);
	}

	onTileLeave()
	{
		this.removeChild(this.tileCursor);
	}

}

class WallBase extends PIXI.Graphics
{

	constructor()
	{
		super();

		this.doorHeight = 85;
		this.tileThickness = 8;
		this.wallHeight = 115;
		this.wallThickness = 8;
	}

}

class WallColumn extends WallBase
{

	constructor(doorMode)
	{
		super();

		let hole = doorMode ? this.doorHeight : 0;

		this.beginFill(0x9697A1);
		this.moveTo(tileWidthHalf, tileHeightHalf + this.tileThickness);
		this.lineTo(tileWidthHalf + this.wallThickness, tileHeightHalf + this.tileThickness - (this.wallThickness / 2));
		this.lineTo(tileWidthHalf + this.wallThickness, tileHeightHalf - (this.wallThickness / 2) - this.wallHeight);
		this.lineTo(tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.lineTo(tileWidthHalf, tileHeightHalf + this.tileThickness);
		this.endFill();

		this.beginFill(0xB5B9C9);
		this.moveTo(tileWidthHalf, tileHeightHalf + this.tileThickness - hole);
		this.lineTo(tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.lineTo(0, tileHeightHalf - this.wallHeight - tileHeightHalf);
		this.lineTo(0, this.tileThickness - hole);
		this.lineTo(tileWidthHalf, tileHeightHalf + this.tileThickness - hole);
		this.endFill();

		this.beginFill(0x71727B);
		this.moveTo(tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.lineTo(0, tileHeightHalf - this.wallHeight - tileHeightHalf);
		this.lineTo(this.wallThickness, tileHeightHalf - this.wallHeight - tileHeightHalf - (this.wallThickness / 2));
		this.lineTo(tileWidthHalf + this.wallThickness, tileHeightHalf - this.wallHeight - (this.wallThickness / 2));
		this.lineTo(tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.endFill();
	}

}

class WallCorner extends WallBase
{

	constructor()
	{
		super();

		this.beginFill(0x71727B);
		this.moveTo(0, -this.wallHeight);
		this.lineTo(this.wallThickness, -this.wallHeight - (this.wallThickness / 2));
		this.lineTo(0, -this.wallHeight - this.wallThickness);
		this.lineTo(-this.wallThickness, -this.wallHeight - (this.wallThickness / 2));
		this.lineTo(0, -this.wallHeight);
		this.endFill();
	}

}

class WallRow extends WallBase
{

	constructor(doorMode)
	{
		super();

		let hole = doorMode ? this.doorHeight : 0;

		this.beginFill(0xBABECE);
		this.moveTo(-tileWidthHalf, tileHeightHalf + this.tileThickness);
		this.lineTo(-tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.lineTo(-tileWidthHalf - this.wallThickness, tileHeightHalf - this.wallHeight - (this.wallThickness / 2));
		this.lineTo(-tileWidthHalf - this.wallThickness, tileHeightHalf + this.tileThickness - (this.wallThickness / 2));
		this.lineTo(-tileWidthHalf, tileHeightHalf + this.tileThickness);
		this.endFill();

		this.beginFill(0x92939D);
		this.moveTo(-tileWidthHalf, tileHeightHalf + this.tileThickness - hole);
		this.lineTo(-tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.lineTo(0, tileHeightHalf - this.wallHeight - tileHeightHalf);
		this.lineTo(0, this.tileThickness - hole);
		this.lineTo(-tileWidthHalf, tileHeightHalf + this.tileThickness - hole);
		this.endFill();

		this.beginFill(0x71727B);
		this.moveTo(-tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.lineTo(0, tileHeightHalf - this.wallHeight - tileHeightHalf);
		this.lineTo(-this.wallThickness, tileHeightHalf - this.wallHeight - tileHeightHalf - (this.wallThickness / 2));
		this.lineTo(-tileWidthHalf - this.wallThickness, tileHeightHalf - this.wallHeight - (this.wallThickness / 2));
		this.lineTo(-tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.endFill();
	}

}

class TileBase extends PIXI.Graphics
{

	constructor()
	{
		super();

		this.row = 0;
		this.column = 0;

		this.interactive = true;
		this.thickness = 8;

		this.on("pointerover", () => this.onMouseOver());
		this.on("pointerout", () => this.onMouseOut());
	}

	onMouseOver()
	{
		this.emit("hover", {
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
		this.emit("leave", {
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

class TileCursor extends PIXI.Graphics
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

		this.lineStyle(4, 0xFFFFFF);
		this.moveTo(points[0].x, points[0].y);
		this.lineTo(points[1].x, points[1].y);
		this.lineTo(points[2].x, points[2].y);
		this.lineTo(points[3].x, points[3].y);
		this.lineTo(points[0].x, points[0].y);
		this.endFill();

		this.filters = [
			withInstance(new PIXI.filters.DropShadowFilter(), shadow =>
			{
				shadow.color = 0x000000;
				shadow.alpha = 0.2;
				shadow.blur = 0;
				shadow.distance = 2;
				shadow.rotation = 90;
			})
		];
	}

	hover(row, column, x, y, z, tile)
	{
		let nx = x;
		let ny = y;

		if (!(tile instanceof Tile))
			ny += tileHeightHalf;

		this.position.x = nx;
		this.position.y = ny - 2;

		this.z = z + 1;
	}

}

class StairsSouth extends TileBase
{

	constructor()
	{
		super();
	}

}

class StairsSouthEast extends TileBase
{

	constructor()
	{
		super();

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
