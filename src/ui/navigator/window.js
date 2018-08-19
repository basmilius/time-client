import { Window } from "../window.js";
import { application } from "../../bootstrapper.js";

export class NavigatorWindow extends Window
{

	constructor()
	{
		super();

		this.height = 540;
		this.width = 420;
		this.title = "Navigator";
	}

	open()
	{
		this.x = application.display.width / 2 - this.width / 2;
		this.y = application.display.height / 2 - this.height / 2;

		super.open();
	}

}
