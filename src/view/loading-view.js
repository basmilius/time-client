import { Bootstrapper } from "../bootstrapper.js";
import { Translator } from "../core/i18n/translator.js";

const resourceLogo = "/resource/image/logo.png";

export class LoadingView extends PIXI.Graphics
{

	constructor()
	{
		super();

		this.logo = null;

		this.init();
		this.loadResources();

		Bootstrapper.getStage().getTicker().add(delta => this.onTick(delta));
	}

	init()
	{
		const style = new PIXI.TextStyle({
			align: "center",
			fontFamily: "Segoe UI",
			fontSize: 17,
			fill: "white",
			wordWrap: true,
			wordWrapWidth: 360
		});
		this.text = new PIXI.Text(Translator.translate("Please wait while David brings your stuff to the topmost floor! (%percentage%%)", 0), style);

		this.addChild(this.text);

		this.percentage = 0;
	}

	loadResources()
	{
		Bootstrapper.getLoader()
			.add(resourceLogo)
			.load(() => this.onResourcesLoaded());
	}

	onResourcesLoaded()
	{
		this.logo = new PIXI.Sprite(Bootstrapper.getResource(resourceLogo).texture);

		this.addChild(this.logo);
	}

	onTick()
	{
		const percentage = this.percentage = (this.percentage + 1) % 100;

		this.clear();

		this.beginFill(0x000000);
		this.drawRect(0, 0, window.innerWidth, window.innerHeight);
		this.endFill();

		this.beginFill(0x000000);
		this.lineStyle(1, 0x565656);
		this.drawRect(window.innerWidth - 328, window.innerHeight - 60, 304, 36);
		this.endFill();

		this.beginFill(0x565656);
		this.drawRect(window.innerWidth - 326, window.innerHeight - 58, (this.percentage / 100) * 300, 32);
		this.endFill();

		if (this.logo !== null)
		{
			this.logo.x = Math.round((Bootstrapper.getStage().width / 2) - (this.logo.width / 2));
			this.logo.y = Math.round((Bootstrapper.getStage().height / 2) - this.logo.height);
		}

		this.text.position.set(
			Math.floor((Bootstrapper.getStage().width / 2) - (this.text.width / 2)),
			Math.floor(Bootstrapper.getStage().height / 2) + 30
		);

		this.text.text = Translator.translate("Please wait while David brings your stuff to the topmost floor! (%percentage%%)", { percentage });
	}

}
