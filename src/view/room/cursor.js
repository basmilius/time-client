import { tileHeight, tileHeightHalf, tileWidth, tileWidthHalf } from "./shared.js";
import { withInstance } from "../../core/pixi-utils.js";

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

		this.lineStyle(4, 0xFFFFFF);
		this.moveTo(points[0].x, points[0].y - 1);
		this.lineTo(points[1].x, points[1].y - 1);
		this.lineTo(points[2].x, points[2].y - 1);
		this.lineTo(points[3].x, points[3].y - 1);
		this.lineTo(points[0].x, points[0].y - 1);
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
