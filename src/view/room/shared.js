import { StairsSouth, StairsSouthEast, StairsSouthWest, Tile } from "./tiles.js";

const HeadingNorthEast = 0;
const HeadingNorthWest = 1;
const HeadingSouthEast = 2;
const HeadingSouthWest = 3;

const StairsTypeSouth = 3;
const StairsTypeSouthEast = 2;
const StairsTypeSouthWest = 4;

export const hitAreaOffset = 5000;

export const tileHeight = 32;
export const tileHeightHalf = tileHeight / 2;
export const tileWidth = 64;
export const tileWidthHalf = tileWidth / 2;

export function getDistance(a, b)
{
	return Math.max(Math.abs(a.row - b.row), Math.abs(a.column - b.column));
}

export function getHeading(a, b)
{
	if (a.row === b.row && a.column === b.column)
		return undefined;

	if (b.row < a.row && b.column > a.column)
		return 1;
	else if (b.row === a.row && b.column > a.column)
		return 2;
	else if (b.row > a.row && b.column > a.column)
		return 3;
	else if (b.row > a.row && b.column === a.column)
		return 4;
	else if (b.row > a.row && b.column < a.column)
		return 5;
	else if (b.row === a.row && b.column < a.column)
		return 6;
	else if (b.row < a.row && b.column < a.column)
		return 7;
	else
		return 0;
}

export function getDoorDirection(tiles, row, column)
{
	if (!isDoor(tiles, row, column))
		return null;

	return [HeadingNorthEast, HeadingNorthWest, HeadingSouthEast, HeadingSouthWest][getSurroundings(tiles, row, column).findIndex(t => t !== null)];
}

export function getStairsType(tiles, row, column)
{
	let tileHeight = getTile(tiles, row, column);
	let [tileNorthEast, tileNorthWest, tileSouthEast, tileSouthWest] = getSurroundings(tiles, row, column);

	if (tileNorthEast !== null && tileNorthWest !== null && Math.abs(tileHeight - tileNorthEast) === 1 && Math.abs(tileHeight - tileNorthWest) === 1)
		return StairsTypeSouth;
	else if (tileNorthWest !== null && Math.abs(tileHeight - tileNorthWest) === 1)
		return StairsTypeSouthEast;
	else if (tileNorthEast !== null && Math.abs(tileHeight - tileNorthEast) === 1)
		return StairsTypeSouthWest;

	// TODO: Other stairs.

	return -1;
}

export function getSurroundings(tiles, row, column)
{
	let tileNorthEast = getTile(tiles, row - 1, column);
	let tileNorthWest = getTile(tiles, row, column - 1);
	let tileSouthEast = getTile(tiles, row, column + 1);
	let tileSouthWest = getTile(tiles, row + 1, column);

	return [tileNorthEast, tileNorthWest, tileSouthEast, tileSouthWest];
}

export function getTile(tiles, row, column)
{
	if (typeof tiles[row] === "undefined")
		return null;

	if (typeof tiles[row][column] === "undefined")
		return null;

	return tiles[row][column];
}

export function getTileHeightIndex(char)
{
	if (char === "x")
		return null;

	return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"].indexOf(char);
}

export function getTileImplementation(type = -1)
{
	if (type === StairsTypeSouth)
		return StairsSouth;

	if (type === StairsTypeSouthEast)
		return StairsSouthEast;

	if (type === StairsTypeSouthWest)
		return StairsSouthWest;

	return Tile;
}

export function isDoor(tiles, row, column)
{
	if (getTile(tiles, row, column) === null)
		return false;

	return getSurroundings(tiles, row, column).filter(t => t !== null).length === 1;
}

export function needsWallC(tiles, row, column)
{
	if (isDoor(tiles, row, column))
		return false;

	let cy = row;

	while (cy > -1)
		if (getTile(tiles, --cy, column) !== null && !isDoor(tiles, cy, column))
			return false;

	return !((getTile(tiles, row - 1, column - 1) !== null && !isDoor(tiles, row - 1, column - 1)) || (getTile(tiles, row - 1, column + 1) !== null && !isDoor(tiles, row - 1, column + 1)));
}

export function needsWallR(tiles, row, column)
{
	if (isDoor(tiles, row, column))
		return false;

	let cx = column;

	while (cx > -1)
		if (getTile(tiles, row, --cx) !== null && !isDoor(tiles, row, cx))
			return false;

	return !((getTile(tiles, row - 1, column - 1) !== null && !isDoor(tiles, row - 1, column - 1)) || (getTile(tiles, row + 1, column - 1) !== null && !isDoor(tiles, row + 1, column - 1)));
}

export function getHighestAndLowest(heightmap)
{
	let highest = 0, lowest = 36;

	for (let row = 0; row < heightmap.length; row++)
	{
		for (let column = 0; column < heightmap[row].length; column++)
		{
			let h = heightmap[row][column];

			if (h > highest)
				highest = h;

			if (h < lowest)
				lowest = 0;
		}
	}

	return {highest, lowest};
}
