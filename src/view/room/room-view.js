import { simpleDraggable, withInstance } from "../../core/pixi-utils.js";
import { application } from "../../bootstrapper.js";
import { TileCursor } from "./cursor.js";
import { getHighestAndLowest, getStairsType, getTileHeightIndex, getTileImplementation, hitAreaOffset, isDoor, needsWallC, needsWallR, tileHeight, tileHeightHalf, tileWidthHalf } from "./shared.js";
import { Tile, TileBase } from "./tiles.js";
import { WallColumn, WallCorner, WallRow } from "./walls.js";

const debugDoor = false;
const debugWalls = false;

export class RoomView extends PIXI.Container
{

	get entities()
	{
		return this._entities;
	}

	get heightmap()
	{
		return this._heightmap;
	}

	get roomScale()
	{
		return this.scale.x;
	}

	set roomScale(value)
	{
		this.scale.x = value;
		this.scale.y = value;
	}

	get tiles()
	{
		return this._tiles;
	}

	constructor()
	{
		super();

		this.z = 1000;

		this._entities = [];
		this._heightmap = {};
		this._tiles = {};

		this.columns = 0;
		this.rows = 0;

		this.floorThickness = 8;
		this.wallThickness = 8;

		this.highest = 0;
		this.lowest = 0;

		this.offsets = {x: 0, y: 0};

		this.roomScale = 1;
		this.tileCursor = new TileCursor();
		this.tileCursor.visible = false;

		simpleDraggable(this);

		// application.display.on("tick", delta => this.rotation = this.rotation + (.036 * delta) % 1);
	}

	clearEverything()
	{
		while (this.children[0])
			this.removeChild(this.children[0]);

		this.addChild(this.tileCursor);

		this._entities = [];
		this._tiles = {};
	}

	prepareHeightmap(floorplan)
	{
		this.emit("room-view-emptied");

		this.clearEverything();

		const tiles = this._heightmap = floorplan
			.trim()
			.split("\n")
			.map(row => row.split("").map(char => getTileHeightIndex(char)));

		const {highest, lowest} = getHighestAndLowest(this.heightmap);
		this.highest = highest;
		this.lowest = lowest;

		if (tiles.length === 0)
			return;

		this.columns = tiles[0].length;
		this.rows = tiles.length;

		for (let row = 0; row < tiles.length; row++)
		{
			this._tiles[row] = {};

			for (let column = 0; column < tiles[row].length; column++)
			{
				let tileHeightLocal = this.getTileHeight(row, column);

				if (tileHeightLocal === null)
					continue;

				let door = isDoor(tiles, row, column);
				// let doorDirection = door ? getDoorDirection(tiles, row, column) : null;
				let stairsType = getStairsType(tiles, row, column);
				let implementation = getTileImplementation(stairsType);

				let wallC = needsWallC(tiles, row, column);
				let wallR = needsWallR(tiles, row, column);
				let wall = wallC || wallR;

				let x = this.getX(row, column);
				let y = this.getY(row, column);
				let z = this.getRealZ(row, column, 1);

				if (wall)
				{
					let wallImplementations = [];
					let isDoorColumn = isDoor(tiles, row - 1, column);
					let isDoorRow = isDoor(tiles, row, column - 1);
					let isADoor = isDoorColumn || isDoorRow;
					let top = Math.abs(this.highest - tileHeightLocal);

					if (wallC && wallR)
					{
						wallImplementations.push(new WallCorner(this.floorThickness, this.wallThickness, top));
						wallImplementations.push(new WallColumn(this.floorThickness, this.wallThickness, top, isDoorColumn));
						wallImplementations.push(new WallRow(this.floorThickness, this.wallThickness, top, isDoorRow));
					}
					else if (wallC)
					{
						wallImplementations.push(new WallColumn(this.floorThickness, this.wallThickness, top, isDoorColumn));
					}
					else if (wallR)
					{
						wallImplementations.push(new WallRow(this.floorThickness, this.wallThickness, top, isDoorRow));
					}

					for (const wi of wallImplementations)
					{
						this.addChild(withInstance(wi, wall =>
						{
							this.entities.push(wall);

							wall.x = x + tileWidthHalf;
							wall.y = y + (stairsType !== undefined ? tileHeight : 0);
							wall.z = this.getRealZ(row, column, isADoor ? 3 : 0);
						}));
					}
				}

				this.addChild(withInstance(new implementation(this.floorThickness), tile =>
				{
					this.entities.push(tile);
					this._tiles[row][column] = tile;

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

					tile.on("tile-click", evt => this.onTileClick(evt));
					tile.on("tile-hover", evt => this.onTileHover(evt));
					tile.on("tile-leave", evt => this.onTileLeave(evt));

					tile.x = x;
					tile.y = y;
					tile.z = z;
				}));
			}
		}

		this.centerRoom();

		this.position.x = Math.floor((application.display.width / 2) - (this.width / 2));
		this.position.y = Math.floor((application.display.height / 2) - (this.height / 2 - 115));

		this.hitArea = new PIXI.Rectangle(-hitAreaOffset, -hitAreaOffset, this.width + (hitAreaOffset * 2), this.height + (hitAreaOffset * 2));

		this.emit("room-view-ready");
	}

	addEntityToTile(entity, row, column, h)
	{
		this.addChild(entity);

		this.associateEntityToTile(entity, row, column, h);
	}

	associateEntityToTile(entity, row, column, h = 0)
	{
		let pos = this.getEntityPosition(entity, row, column, h);

		entity.position.x = pos.x;
		entity.position.y = pos.y;
		entity.z = pos.z;

		this.updateLayerOrder();
	}

	centerEntity(entity, animate = true)
	{
		let x = application.display.width / 2;
		let y = application.display.height / 2;

		x -= Math.round(entity.x + entity.width / 2);
		y -= Math.round(entity.y + entity.height / 2);

		x = x - (x % 2);

		if (animate)
		{
			anime({
				targets: this,
				x,
				y,
				duration: 800,
				easing: "easeInOutSine"
			});
		}
		else
		{
			anime({
				targets: this,
				x,
				y,
				duration: 45,
				easing: "linear"
			});
		}
	}

	centerRoom()
	{
		if (this.entities.length > 0)
		{
			let xred = this.entities.reduce((acc, cur) => acc.x < cur.x ? acc : cur).x;
			let yred = this.entities
				.filter(acc => acc instanceof TileBase)
				.reduce((acc, cur) => acc.y < cur.y ? acc : cur).y;

			this.offsets.x = -xred;
			this.offsets.y = -yred;

			this.entities.forEach(entity =>
			{
				entity.x -= xred;
				entity.y -= yred;
			});
		}
	}

	getClosestTile(x, y)
	{
	}

	getEntityPosition(entity, row, column, h = 0)
	{
		let offsets = {x: 0, y: 0};
		let tile = this.getTile(row, column);

		if (entity.getRoomOffsets !== undefined)
			offsets = entity.getRoomOffsets();

		let isStairs = !(tile instanceof Tile);

		let x = (this.getX(row, column) + tileWidthHalf) + (offsets.x + this.offsets.x);
		let y = (this.getY(row, column) + tileHeightHalf) + (offsets.y + this.offsets.y) + (tile && isStairs ? tileHeightHalf : 0);
		let z = this.getZ(row, column + 2, 5) + h;

		if (isDoor(this.tiles, row, column))
			z = this.getRealZ(row, column, 4);

		return {x, y, z, isStairs};
	}

	getRandomTile()
	{
		let row = Math.floor(Math.random() * this.rows);
		let column = Math.floor(Math.random() * this.columns);

		if (!this.isValidTile(row, column))
			return this.getRandomTile();

		return {row, column};
	}

	getTile(row, column)
	{
		if (this.tiles[row] === undefined)
			return undefined;

		return this.tiles[row][column] || undefined;
	}

	getTileHeight(row, column)
	{
		if (this.heightmap[row] === undefined)
			return undefined;

		return this.heightmap[row][column];
	}

	getX(row, column)
	{
		return (column - row) * tileWidthHalf;
	}

	getY(row, column)
	{
		let h = this.getTileHeight(row, column);

		if (h === undefined)
			h = 0;

		if (getStairsType(this.heightmap, row, column) !== undefined)
			h += 1;

		return (column + row) * tileHeightHalf - (h * tileWidthHalf);
	}

	getZ(row, column, add = 0)
	{
		row *= 1000;
		column *= 1000;

		return (row * this.columns) + column + add;
	}

	getRealZ(row, column, add = 0)
	{
		return (row * this.columns) + column + add;
	}

	isValidTile(row, column)
	{
		return this.getTile(row, column) !== undefined;
	}

	onTileClick(evt)
	{
		this.emit("tile-click", evt);
	}

	onTileHover(evt)
	{
		setTimeout(() =>
		{
			let {x, y} = this.getEntityPosition(this.tileCursor, evt.row, evt.column);

			this.currentHover = [evt.row, evt.column];
			this.tileCursor.visible = true;
			this.tileCursor.hover(x, y, this.getRealZ(evt.row, evt.column, 2));
			this.updateLayerOrder();
		}, 1);
	}

	onTileLeave(evt)
	{
		this.currentHover = undefined;

		setTimeout(() =>
		{
			if (this.currentHover !== undefined && (evt.x !== this.currentHover.x || evt.y !== this.currentHover.y))
				return;

			this.tileCursor.visible = false;
		}, 2);
	}

}
