import { application } from "../../bootstrapper.js";

const toolbarHeight = 54;

export class Toolbar extends PIXI.Graphics
{

	constructor()
	{
		super();

		this.draw();

		application.display.on("resize", () => this.draw());
	}

	draw()
	{
		this.clear();

		this.beginFill(0x24211C);
		this.drawRect(0, 0, application.display.width, toolbarHeight);
		this.endFill();

		this.beginFill(0x27251F);
		this.drawRect(0, 0, application.display.width, 6);
		this.endFill();

		this.beginFill(0x201D19);
		this.drawRect(0, toolbarHeight - 6, application.display.width, 6);
		this.endFill();

		this.beginFill(0x33312B);
		this.drawRect(0, toolbarHeight, application.display.width, 3);
		this.endFill();
	}

}
