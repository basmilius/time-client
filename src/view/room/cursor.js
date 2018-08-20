import { tileHeight, tileHeightHalf, tileWidth, tileWidthHalf } from "./shared.js";

const tileOffset = 1;

export class TileCursor extends PIXI.Graphics
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

		this.lineStyle(4, 0x000000, 0.2);
		this.moveTo(points[0].x, points[0].y);
		this.lineTo(points[1].x, points[1].y);
		this.lineTo(points[2].x, points[2].y);
		this.lineTo(points[3].x, points[3].y);
		this.lineTo(points[0].x, points[0].y);
		this.endFill();

		this.lineStyle(4, 0xFFFFFF);
		this.moveTo(points[0].x, points[0].y - tileOffset);
		this.lineTo(points[1].x, points[1].y - tileOffset);
		this.lineTo(points[2].x, points[2].y - tileOffset);
		this.lineTo(points[3].x, points[3].y - tileOffset);
		this.lineTo(points[0].x, points[0].y - tileOffset);
		this.endFill();
	}

	hover(x, y, z)
	{
		this.position.x = x;
		this.position.y = y - 2;
		this.z = z;
	}

	getRoomOffsets()
	{
		return {
			x: -tileWidthHalf,
			y: -tileHeightHalf
		};
	}

}
