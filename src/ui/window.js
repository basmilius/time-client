import { withInstance } from "../core/pixi-utils.js";

export class Window extends PIXI.Graphics
{

	constructor()
	{
		super();

		this._height = 300;
		this._width = 540;

		this.x = 100;
		this.y = 100;

		this.beginFill(0xFFFFFF);
		this.drawRoundedRect(0, 0, this._width, this._height, 5);
		this.endFill();

		this.filters = [
			withInstance(new PIXI.filters.DropShadowFilter(), shadow =>
			{
				shadow.color = 0x000000;
				shadow.alpha = 0.2;
				shadow.blur = 2;
				shadow.distance = 1;
				shadow.rotation = 90;
			})
		];
	}

}
