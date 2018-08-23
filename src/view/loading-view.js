import { application } from "../bootstrapper.js";
import { I18nManager } from "../core/i18n/i18n.js";

const resourceLogo = "/resource/image/logo.png";

class LoadingBar extends PIXI.Graphics
{

	get percentage()
	{
		return this._percentage;
	}

	set percentage(value)
	{
		this._percentage = value;
		this.render();
	}

	constructor()
	{
		super();

		this.barHeight = 30;
		this.barThickness = 2;
		this.barWidth = 300;
		this.percentage = 0;
	}

	render()
	{
		this.clear();

		this.beginFill(0x000000);
		this.lineStyle(this.barThickness, 0x434343);
		this.drawRoundedRect(0, 0, this.barWidth, this.barHeight, 6);
		this.endFill();

		this.beginFill(0x575757);
		this.lineStyle(null);
		this.drawRoundedRect(this.barThickness, this.barThickness, Math.round(this.percentage / 100 * (this.barWidth - this.barThickness * 2)), this.barHeight - this.barThickness * 2, 4);
		this.endFill();
	}

}

export class LoadingView extends PIXI.Graphics
{

	get percentage()
	{
		return this.loadingBar.percentage || 0;
	}

	set percentage(value)
	{
		this.loadingBar.percentage = Math.round(value);
		this.render();
	}

	constructor()
	{
		super();

		this.loader = new PIXI.loaders.Loader();
		this.loadingBar = new LoadingBar();

		this.logo = null;

		this.init();
		this.loadResources();
	}

	init()
	{
		const style = new PIXI.TextStyle({
			align: "center",
			fontFamily: "proxima-nova",
			fontSize: 15,
			fontWeight: 300,
			fill: 0xFFFFFF,
			wordWrap: true,
			wordWrapWidth: this.loadingBar.barWidth
		});

		this.text = new PIXI.Text("", style);

		application.display.on("resize", () => this.render());
	}

	loadResources()
	{
		this.loader
			.add(resourceLogo)
			.load(() => this.onResourcesLoaded())
	}

	onResourcesLoaded()
	{
		this.logo = new PIXI.Sprite(application.getResource(resourceLogo, this.loader).texture);

		this.addChild(this.logo);
		this.addChild(this.loadingBar);
		this.addChild(this.text);

		this.logo.visible = false;

		application.loader.on("progress", state => this.percentage = state.progress);

		this.render();
		this.emit("loader-ready");
	}

	render()
	{
		const percentage = this.percentage;

		this.clear();

		const height = application.display.height;
		const width = application.display.width;

		this.beginFill(0x000000);
		this.drawRect(0, 0, width, height);
		this.endFill();

		this.loadingBar.position.x = (width / 2) - (this.loadingBar.barWidth / 2);
		this.loadingBar.position.y = height - (this.loadingBar.barHeight + 60);

		if (this.logo !== null)
		{
			this.logo.visible = true;
			this.logo.x = Math.round((width / 2) - (this.logo.width / 2));
			this.logo.y = Math.round((height / 2) - (this.logo.height / 2));
		}

		this.text.text = application.getManager(I18nManager).getString("loading-view.starting-up", {percentage}, "");

		this.text.position.set(
			(this.loadingBar.position.x + (this.loadingBar.barWidth / 2)) - (this.text.width / 2),
			this.loadingBar.position.y - 30
		);
	}

}
