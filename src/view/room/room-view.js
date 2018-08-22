import { advancedDraggable, withInstance } from "../../core/pixi-utils.js";
import { application } from "../../bootstrapper.js";
import { TileCursor } from "./cursor.js";
import { getDoorDirection, getHighestAndLowest, getStairsType, getTileHeightIndex, getTileImplementation, isDoor, needsWallColumn, needsWallRow, tileHeight, tileHeightHalf, tileWidthHalf } from "./shared.js";
import { Tile } from "./tiles.js";
import { WallColumn, WallCorner, WallRow } from "./walls.js";
import { Easings } from "../../ui/ui.js";
import { SceneryConfig } from "./scenery.js";

const buildWalls = true;
const enableScenery = true;

export class RoomView extends PIXI.Graphics
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

		this.posfix = {x: 0, y: 0};

		this.floorThickness = 8;
		this.wallThickness = 8;

		this.highest = 0;
		this.lowest = 0;

		this.offsets = {x: 0, y: 0};

		this.roomScale = 1;
		this.tileCursor = new TileCursor();
		this.tileCursor.visible = false;

		this.root = new PIXI.Container();

		this.tileSprites = new PIXI.Container();
		this.tileSprites.z = 10;

		this.wallSprites = new PIXI.Container();
		this.wallSprites.z = 20;

		this.root.addChild(this.tileSprites);
		this.root.addChild(this.wallSprites);
		this.root.addChild(this.tileCursor);

		this.addChild(this.root);

		const {width, height} = application.display.size;

		this.beginFill(0x000000);
		this.drawRect(0, 0, width, height);
		this.endFill();

		advancedDraggable(this.root, this, (x, y) =>
		{
			this.root.x = x;
			this.root.y = y;
		});

		application.display.on("tick", () => this.root.updateLayerOrder());
	}

	clearEverything()
	{
		while (this.tileSprites.children[0])
			this.tileSprites.removeChild(this.tileSprites.children[0]);

		while (this.wallSprites.children[0])
			this.wallSprites.removeChild(this.wallSprites.children[0]);

		while (this.root.children[0])
			this.root.removeChild(this.root.children[0]);

		this.root.addChild(this.tileSprites);
		this.root.addChild(this.wallSprites);
		this.root.addChild(this.tileCursor);

		this._entities = [];
		this._tiles = {};
	}

	prepareHeightmap(floorplan, sceneryConfig = undefined)
	{
		this.emit("room-view-emptied");

		this.clearEverything();

		if (!enableScenery)
			sceneryConfig = undefined;
		else if (sceneryConfig === undefined)
			sceneryConfig = new SceneryConfig("default", "default", "default");

		const tiles = this._heightmap = floorplan
			.trim()
			.split("\n")
			.map(row => row.split("").map(char => getTileHeightIndex(char)));

		const {highest, lowest} = getHighestAndLowest(this.heightmap);
		this.highest = highest;
		this.lowest = lowest;
		this.posfix = {x: 0, y: 0};

		if (tiles.length === 0)
			return;

		this.columns = tiles[0].length;
		this.rows = tiles.length;

		this.doors = [];

		for (let row = 0; row < tiles.length; row++)
		{
			this._tiles[row] = {};

			for (let column = 0; column < tiles[row].length; column++)
			{
				let tileHeightLocal = this.getTileHeight(row, column);

				if (tileHeightLocal === null)
					continue;

				let stairsType = getStairsType(tiles, row, column);
				let implementation = getTileImplementation(stairsType);

				let wallC = needsWallColumn(tiles, row, column);
				let wallR = needsWallRow(tiles, row, column);
				let wall = wallC || wallR;

				let x = this.getX(row, column);
				let y = this.getY(row, column);

				let isDoorColumn = isDoor(tiles, row - 1, column);
				let isDoorRow = isDoor(tiles, row, column - 1);
				let isADoor = isDoorColumn || isDoorRow;

				if (isADoor)
					if (isDoorColumn)
						this.doors.push({row: row - 1, column: column, direction: getDoorDirection(tiles, row - 1, column)});
					else
						this.doors.push({row: row, column: column - 1, direction: getDoorDirection(tiles, row, column - 1)});

				if (wall && buildWalls)
				{
					let wallImplementations = [];
					let top = Math.abs(this.highest - tileHeightLocal);

					if (wallC && wallR)
					{
						wallImplementations.push(new WallCorner(this.floorThickness, this.wallThickness, top, sceneryConfig));
						wallImplementations.push(new WallColumn(this.floorThickness, this.wallThickness, top, isDoorColumn, !needsWallColumn(tiles, row, column + 1), sceneryConfig));
						wallImplementations.push(new WallRow(this.floorThickness, this.wallThickness, top, isDoorRow, !needsWallRow(tiles, row + 1, column), sceneryConfig));
					}
					else if (wallC)
					{
						wallImplementations.push(new WallColumn(this.floorThickness, this.wallThickness, top, isDoorColumn, !needsWallColumn(tiles, row, column + 1), sceneryConfig));
					}
					else if (wallR)
					{
						wallImplementations.push(new WallRow(this.floorThickness, this.wallThickness, top, isDoorRow, !needsWallRow(tiles, row + 1, column), sceneryConfig));
					}

					for (const wi of wallImplementations)
					{
						this.wallSprites.addChild(withInstance(wi, wall =>
						{
							wall.x = x + tileWidthHalf;
							wall.y = y + (stairsType !== -1 ? tileHeight : 0);
						}));
					}
				}

				this.tileSprites.addChild(withInstance(new implementation(this.floorThickness, sceneryConfig), tile =>
				{
					this._tiles[row][column] = tile;

					tile.row = row;
					tile.column = column;

					tile.on("tile-tap", evt => this.onTileClick(evt));
					tile.on("tile-hover", evt => this.onTileHover(evt));
					tile.on("tile-leave", evt => this.onTileLeave(evt));

					tile.x = x;
					tile.y = y;
				}));
			}
		}

		this.tileSprites.children.forEach(child =>
		{
			if (child.x < this.posfix.x)
				this.posfix.x = child.x;

			if (child.y < this.posfix.y)
				this.posfix.y = child.y;
		});

		this.posfix.x = Math.abs(this.posfix.x);
		this.posfix.y = Math.abs(this.posfix.y);

		this.tileSprites.children.forEach(child =>
		{
			child.x += this.posfix.x;
			child.y += this.posfix.y;
		});

		this.wallSprites.children.forEach(child =>
		{
			child.x += this.posfix.x;
			child.y += this.posfix.y;
		});

		this.centerRoom();

		this.emit("room-view-ready");
	}

	addEntityToTile(entity, row, column, h)
	{
		this.root.addChild(entity);

		this.associateEntityToTile(entity, row, column, h);
	}

	removeEntity(entity)
	{
		this.removeChild(entity);
	}

	animateBuildingTiles()
	{
		if (true !== false)
			return;

		for (let row = 0; row < this.rows; row++)
		{
			for (let column = 0; column < this.columns; column++)
			{
				if (this.tiles[row][column] === undefined)
					continue;

				anime({
					targets: this.tiles[row][column],
					delay: (row + column) * 50,
					duration: 900,
					easing: Easings.DecelerationCurve,
					alpha: [0, 1],
					y: [this.tiles[row][column].y + application.display.height, this.tiles[row][column].y]
				});
			}
		}
	}

	associateEntityToTile(entity, row, column, h = 0)
	{
		let pos = this.getEntityPosition(entity, row, column, h);

		entity.position.x = pos.x;
		entity.position.y = pos.y;
		entity.z = pos.z;
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
				targets: this.root,
				x,
				y,
				duration: 800,
				easing: Easings.DecelerationCurve
			});
		}
		else
		{
			anime({
				targets: this.root,
				x,
				y,
				duration: 45,
				easing: "linear"
			});
		}
	}

	centerRoom()
	{
		this.root.x = this.width / 2 - this.root.width / 2;
		this.root.y = this.height / 2 - this.root.height / 2;
	}

	getClosestTile(x, y)
	{
	}

	getDoorTile(random = true)
	{
		if (!random)
			return this.doors[0];

		return this.doors[Math.floor(Math.random() * this.doors.length)];
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
		let z = this.getZ(row, column) + h;

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
		return (column - row) * tileWidthHalf + this.posfix.x;
	}

	getY(row, column)
	{
		let h = this.getTileHeight(row, column);

		if (h === undefined)
			h = 0;

		if (getStairsType(this.heightmap, row, column) !== -1)
			h += 1;

		return (column + row) * tileHeightHalf - (h * tileWidthHalf) + this.posfix.y;
	}

	getZ(row, column, add = 0)
	{
		if (isDoor(this.tiles, row, column))
			return (11 + add);

		return (row * this.columns) + column + add;
	}

	isValidTile(row, column)
	{
		return this.getTile(row, column) !== undefined;
	}

	onTileClick(evt)
	{
		this.emit("tile-tap", evt);
	}

	onTileHover(evt)
	{
		setTimeout(() =>
		{
			let {x, y} = this.getEntityPosition(this.tileCursor, evt.row, evt.column);

			this.currentHover = [evt.row, evt.column];
			this.tileCursor.visible = true;
			this.tileCursor.hover(x, y, 11);
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
