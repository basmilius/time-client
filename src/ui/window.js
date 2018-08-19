import { simpleDraggable, withInstance } from "../core/pixi-utils.js";
import { application } from "../bootstrapper.js";
import { bottomBarHeight } from "./interface/bottomBar.js";

const contentMargin = 6;
const cornerRadius = 6;

export class Window extends PIXI.Container
{

	get height()
	{
		return this._height;
	}

	set height(value)
	{
		this._height = value;
	}

	get opened()
	{
		return this.visible;
	}

	get title()
	{
		return this.titleText.text.trim();
	}

	set title(value)
	{
		this.titleText.text = value;
	}

	get width()
	{
		return this._width;
	}

	set width(value)
	{
		this._width = value;
	}

	constructor()
	{
		super();

		this.x = 100;
		this.y = 100;
		this.z = 10000;
		this.visible = false;

		this.bg = new PIXI.Graphics();
		this.addChild(this.bg);

		this.init();

		this.title = "";

		this.render();

		application.display.on("tick", () => this.render());

		simpleDraggable(this);
	}

	init()
	{
		const style = new PIXI.TextStyle({
			align: "center",
			fontFamily: "proxima-nova",
			fontSize: 15,
			fontWeight: 700,
			fill: 0xE4E4E4
		});

		this.titleText = new PIXI.Text("", style);
		this.addChild(this.titleText);

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

	getDraggableRegion()
	{
		return {
			x: 0,
			y: 0,
			width: this.width,
			height: this.title !== "" ? 42 : 0
		};
	}

	getDraggingRegion()
	{
		return {
			x: 12,
			y: 12,
			width: application.display.width - 12,
			height: application.display.height - bottomBarHeight - 12
		};
	}

	close()
	{
		if (this.currentAnimation !== undefined)
			return;

		this.currentAnimation = anime({
			targets: this,
			duration: 210,
			easing: [.55, 0, .1, 1],
			alpha: [1, 0],
			y: [this.y, this.y + 24]
		}).finished.then(() =>
		{
			this.currentAnimation = undefined;
			this.y -= 24;
			this.visible = false;
		});
	}

	open()
	{
		if (this.currentAnimation !== undefined)
			return;

		this.visible = true;

		this.currentAnimation = anime({
			targets: this,
			duration: 210,
			easing: [.55, 0, .1, 1],
			alpha: [0, 1],
			y: [this.y + 24, this.y]
		}).finished.then(() =>
		{
			this.currentAnimation = undefined;
		});
	}

	render()
	{
		this.bg.clear();

		const width = Math.max(this.width || 0, super.width);
		const height = Math.max(this.height || 0, super.height);

		let contentOffset = 0;

		this.bg.beginFill(0x165679);
		this.bg.lineStyle(3, 0x1a658f);
		this.bg.drawRoundedRect(0, 0, width, height, cornerRadius);
		this.bg.endFill();

		this.bg.lineStyle(0);

		if (this.title !== "")
		{
			contentOffset = 39;
			this.titleText.x = width / 2;
			this.titleText.y = 15;
			this.titleText.anchor.x = 0.5;
			this.titleText.visible = true;

			let old = this.title;
			this.title = "";
			this.title = old;
		}
		else
		{
			this.titleText.visible = false;
		}

		this.bg.beginFill(0xFFFFFF);
		this.bg.drawRoundedRect(contentMargin, contentMargin + contentOffset, width - (contentMargin * 2), height - ((contentMargin * 2) + contentOffset), cornerRadius);
		this.bg.endFill();
	}

}
