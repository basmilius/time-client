import { Bootstrapper } from "../bootstrapper.js";
import { Translator } from "../core/i18n/translator.js";

const resourceLogo = "/resource/image/logo-2x.png";
const resourceHotel = "/resource/image/loading-view/hotel.png";
const resourceSkyline = "/resource/image/loading-view/skyline.png";

class LoadingBar extends PIXI.Graphics
{

	constructor()
	{
		super();

		this.percentage = 0;

		Bootstrapper.getStage().getTicker().add(delta => this.onTick(delta));
	}

	onTick()
	{
		this.clear();

		this.beginFill(0x25b8ee);
		this.lineStyle(1, 0x006699);
		this.drawRect(0, 0, 203, 23);
		this.endFill();

		this.beginFill(0x006699);
		this.lineStyle(0);
		this.drawRect(1, 2, Math.round(this.percentage / 100 * 200), 20);
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
		this.loadingBar.percentage = value;
	}

	constructor()
	{
		super();

		this.loadingBar = new LoadingBar();

		this.logo = null;
		this.hotel = null;
		this.skyline = null;

		this.init();
		this.loadResources();

		Bootstrapper.getStage().getTicker().add(delta => this.onTick(delta));
	}

	init()
	{
		const style = new PIXI.TextStyle({
			align: "center",
			fontFamily: "Segoe UI",
			fontSize: 16,
			fill: "white",
			wordWrap: true,
			wordWrapWidth: 360
		});

		this.text = new PIXI.Text("", style);
	}

	loadResources()
	{
		Bootstrapper.getLoader()
			.add(resourceLogo)
			.add(resourceHotel)
			.add(resourceSkyline)
			.load(() => this.onResourcesLoaded());
	}

	onResourcesLoaded()
	{
		this.logo = new PIXI.Sprite(Bootstrapper.getResource(resourceLogo).texture);
		this.hotel = new PIXI.Sprite(Bootstrapper.getResource(resourceHotel).texture);
		this.skyline = new PIXI.extras.TilingSprite(Bootstrapper.getResource(resourceSkyline).texture);

		this.addChild(this.skyline);
		this.addChild(this.hotel);
		this.addChild(this.logo);

		this.addChild(this.loadingBar);
		this.addChild(this.text);
	}

	onTick()
	{
		const percentage = this.percentage = (this.percentage + 1) % 100;

		this.clear();

		this.beginFill(0x25b8ee);
		this.drawRect(0, 0, window.innerWidth, window.innerHeight);
		this.endFill();

		this.loadingBar.position.x = Math.round((Bootstrapper.getStage().width / 2) - (this.loadingBar.width / 2));
		this.loadingBar.position.y = Math.round((Bootstrapper.getStage().height / 2) - (this.loadingBar.height / 2) + 102);

		if (this.logo !== null)
		{
			this.logo.x = Math.round((Bootstrapper.getStage().width / 2) - (this.logo.width / 2));
			this.logo.y = Math.round((Bootstrapper.getStage().height / 2) - this.logo.height);
		}

		if (this.hotel !== null)
		{
			this.hotel.x = Math.floor(-(this.hotel.width / 2));
			this.hotel.y = Math.floor(window.innerHeight - (this.hotel.width / 2));
		}

		if (this.skyline !== null)
		{
			this.skyline.x = 0;
			this.skyline.y = window.innerHeight - this.skyline.height;
			this.skyline.width = window.innerWidth;
		}

		this.text.position.set(
			Math.floor((Bootstrapper.getStage().width / 2) - (this.text.width / 2)),
			Math.floor(Bootstrapper.getStage().height / 2) + 30
		);

		this.text.text = Translator.translate("Please wait while David brings your stuff to the topmost floor! (%percentage%%)", {percentage});
	}

}
