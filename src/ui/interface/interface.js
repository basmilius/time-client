import { BottomBar, bottomBarHeight } from "./bottomBar.js";
import { Easings } from "../ui.js";

export const interfaceResources = {
	chatBubble: {
		left: "./resource/image/interface/chat-bubble/left.png",
		middle: "./resource/image/interface/chat-bubble/middle.png",
		right: "./resource/image/interface/chat-bubble/right.png"
	},
	bottomBar: {
		background: "./resource/image/interface/bottom-bar/background.png",
		navigator: "./resource/image/interface/bottom-bar/navigator.png",
		friends: "./resource/image/interface/bottom-bar/friends.png",
		friendsInvited: "./resource/image/interface/bottom-bar/friends-invited.png",
		chat: "./resource/image/interface/bottom-bar/chat.png",
		chatMessages: "./resource/image/interface/bottom-bar/chat-messages.png",
		catalogue: "./resource/image/interface/bottom-bar/catalogue.png",
		inventory: "./resource/image/interface/bottom-bar/inventory.png",
		help: "./resource/image/interface/bottom-bar/help.png"
	}
};

export class InterfaceContainer extends PIXI.Container
{

	constructor()
	{
		super();

		this.z = 100000;

		this.init();
		this.hello();
	}

	init()
	{
		this.bottomBar = new BottomBar();
		this.addChild(this.bottomBar);
	}

	hello()
	{
		anime({
			targets: this.bottomBar,
			duration: 300,
			easing: Easings.SwiftOut,
			y: [this.bottomBar.y + bottomBarHeight, this.bottomBar.y]
		})
	}

}
