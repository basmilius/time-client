import { StairsSouth, StairsSouthEast, StairsSouthWest, Tile } from "./tiles.js";

export const hitAreaOffset = 5000;

export const tileHeight = 32;
export const tileHeightHalf = tileHeight / 2;
export const tileWidth = 64;
export const tileWidthHalf = tileWidth / 2;

export const Heading = {
	NorthEast: 0,
	NorthWest: 1,
	SouthEast: 2,
	SouthWest: 3
};

export const StairsType = {
	South: 3,
	SouthEast: 2,
	SouthWest: 4
};

export function getDoorDirection(tiles, row, column)
{
	if (!isDoor(tiles, row, column))
		return null;

	return [Heading.NorthEast, Heading.NorthWest, Heading.SouthEast, Heading.SouthWest][getSurroundings(tiles, row, column).findIndex(t => t !== null)];
}

export function getStairsType(tiles, row, column)
{
	let tileHeight = getTile(tiles, row, column);
	let [tileNorthEast, tileNorthWest, tileSouthEast, tileSouthWest] = getSurroundings(tiles, row, column);

	if (tileNorthEast !== null && tileNorthWest !== null && Math.abs(tileHeight - tileNorthEast) === 1 && Math.abs(tileHeight - tileNorthWest) === 1)
		return StairsType.South;
	else if (tileNorthWest !== null && Math.abs(tileHeight - tileNorthWest) === 1)
		return StairsType.SouthEast;
	else if (tileNorthEast !== null && Math.abs(tileHeight - tileNorthEast) === 1)
		return StairsType.SouthWest;

	// TODO: Other stairs.

	return undefined;
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

export function getTileImplementation(stairsType = undefined)
{
	if (stairsType === StairsType.South)
		return StairsSouth;

	if (stairsType === StairsType.SouthEast)
		return StairsSouthEast;

	if (stairsType === StairsType.SouthWest)
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

	while (cy > 0)
		if (getTile(tiles, --cy, column) !== null && !isDoor(tiles, row, cy))
			return false;

	return !((getTile(tiles, row - 1, column - 1) !== null && !isDoor(tiles, row - 1, column - 1)) || (getTile(tiles, row - 1, column + 1) !== null && !isDoor(tiles, row - 1, column + 1)));
}

export function needsWallR(tiles, row, column)
{
	if (isDoor(tiles, row, column))
		return false;

	let cx = column;

	while (cx > 0)
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
