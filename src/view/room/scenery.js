import { application } from "../../bootstrapper.js";
import { RoomManager } from "./manager.js";

export class SceneryConfig
{

	get floor()
	{
		return this._floor;
	}

	set floor(value)
	{
		this._floor = value;
	}

	get landscape()
	{
		return this._landscape;
	}

	set landscape(value)
	{
		this._landscape = value;
	}

	get wall()
	{
		return this._wall;
	}

	set wall(value)
	{
		this._wall = value;
	}

	constructor(floor, landscape, wall)
	{
		this.floor = floor;
		this.landscape = landscape;
		this.wall = wall;
	}

	getFloorTexture()
	{
		return undefined;
	}

	getLandscapeTexture()
	{
		return undefined;
	}

	getWallTexture()
	{
		return getSceneryTexture("wall_texture_64_3_wall_color_invaders4");
	}

}

export function getSceneryTexture(asset)
{
	const roomManager = application.getManager(RoomManager);
	const sprites = roomManager.sprites.assets;
	const base = roomManager.sceneryTexture;

	if (sprites[asset] === undefined)
		sprites[asset] = [0, 0, 1, 1]; // Omit errors for now.

	const texture = new PIXI.Texture(base);
	texture.frame = new PIXI.Rectangle(...sprites[asset]);

	return texture;
}
