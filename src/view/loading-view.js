import { application } from "../bootstrapper.js";
import { I18nManager } from "../core/i18n/i18n.js";

const resourceLogo = "/resource/image/logo.png";

class LoadingBar extends PIXI.Graphics
{

	constructor()
	{
		super();

		this.barColor = 0x888888;
		this.barHeight = 12;
		this.barThickness = 2;
		this.barWidth = 300;
		this.percentage = 0;

		application.display.ticker.add(delta => this.onTick(delta));
	}

	onTick()
	{
		this.clear();

		this.beginFill(this.barColor);
		this.drawRect(0, 0, Math.round(this.percentage / 100 * this.barWidth), this.barHeight);
		this.endFill();

		this.lineStyle(this.barThickness, this.barColor);

		this.moveTo(-this.barThickness, -this.barThickness);
		this.lineTo(this.barWidth + this.barThickness, -this.barThickness);
		this.lineTo(this.barWidth + this.barThickness, this.barHeight + this.barThickness);
		this.lineTo(-this.barThickness, this.barHeight + this.barThickness);
		this.lineTo(-this.barThickness, -this.barThickness);
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
	}

	constructor()
	{
		super();

		this.loader = new PIXI.loaders.Loader();
		this.loadingBar = new LoadingBar();

		this.logo = null;

		this.init();
		this.loadResources();

		application.display.ticker.add(delta => this.onTick(delta));
	}

	init()
	{
		const style = new PIXI.TextStyle({
			align: "center",
			fontFamily: "Segoe UI",
			fontSize: 13,
			fill: "white",
			wordWrap: true,
			wordWrapWidth: 360
		});

		this.text = new PIXI.Text("", style);
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

		this.emit("loader-ready");

		application.loader.on("progress", state => this.percentage = state.progress);
	}

	onTick()
	{
		const percentage = this.percentage;

		this.clear();

		const height = application.display.height;
		const width = application.display.width;

		this.beginFill(0x0);
		this.drawRect(0, 0, width, height);
		this.endFill();

		this.loadingBar.position.x = Math.round((width / 2) - (this.loadingBar.width / 2));
		this.loadingBar.position.y = height - (this.loadingBar.height + 91);

		if (this.logo !== null)
		{
			this.logo.x = Math.round((width / 2) - (this.logo.width / 2));
			this.logo.y = Math.round((height / 2) - (this.logo.height / 2));
		}

		this.text.text = application.getManager(I18nManager).getString("loading-view.starting-up", {percentage}, "");

		this.text.position.set(
			Math.floor((width / 2) - (this.text.width / 2)),
			this.loadingBar.position.y - 30
		);
	}

}
