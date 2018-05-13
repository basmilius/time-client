import { Manager } from "../../core/manager/manager.js";
import { Toolbar } from "./toolbar.js";
import { MeMenu } from "./memenu.js";

export const interfaceResources = {
	chatBubble: {
		left: "./resource/image/interface/chat-bubble/left.png",
		middle: "./resource/image/interface/chat-bubble/middle.png",
		right: "./resource/image/interface/chat-bubble/right.png"
	}
};

export class InterfaceContainer extends PIXI.Container
{

	get memenu()
	{
		return this._memenu;
	}

	get toolbar()
	{
		return this._toolbar;
	}

	constructor()
	{
		super();

		this._memenu = new MeMenu();
		this._toolbar = new Toolbar();

		this.addChild(this.memenu);
		this.addChild(this.toolbar);

		this.memenu.avatar.figure = "hr-3163-61.cc-3075-73.ca-3175-92.hd-195-3.ch-3030-92.sh-3016-64.lg-3116-110-92";
	}

}

export class InterfaceManager extends Manager
{

	constructor()
	{
		super();
	}

	async initialize()
	{
		await super.initialize();

		this.loader.add(interfaceResources.chatBubble.left);
		this.loader.add(interfaceResources.chatBubble.middle);
		this.loader.add(interfaceResources.chatBubble.right);
	}

}
