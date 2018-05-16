import { application } from "../../bootstrapper.js";
import { interfaceResources } from "./interface.js";
import { AvatarManager } from "../../view/avatar/manager.js";

const memenuSize = 60;
const memenuSizeHalf = Math.floor(memenuSize / 2);

export class MeMenu extends PIXI.Container
{

	get avatar()
	{
		return this._avatar;
	}

	get chatBubble()
	{
		return this._chatBubble;
	}

	constructor()
	{
		super();

		this._avatarHolder = new PIXI.Graphics();
		this._avatarHolder.buttonMode = true;
		this._avatarHolder.interactive = true;
		this._avatarHolder.on("pointerover", () => this.onAvatarHover());
		this._avatarHolder.on("pointerout", () => this.onAvatarLeave());

		this._avatar = application.getManager(AvatarManager).newAvatar("", "vertical", "head");
		this.avatar.canPoof = false;
		this.avatar.headDirection = 3;
		this.avatar.position.x = -15;
		this.avatar.position.y = -11;
		this.avatar.update();
		this._avatarHolder.addChild(this.avatar);

		this._chatBubble = new ChatBubble();
		this.chatBubble.position.x = memenuSize + 8;
		this.chatBubble.position.y = 8;
		this.chatBubble.on("pointerover", () => this.onChatBubbleHover());
		this.chatBubble.on("pointerout", () => this.onChatBubbleLeave());

		this.addChild(this._avatarHolder);
		this.addChild(this.chatBubble);

		this.draw();
		application.display.on("resize", () => this.draw());

		setTimeout(() => this.avatar.addAction("GestureSmile"), 500);
	}

	draw()
	{
		this.position.x = 16;
		this.position.y = application.display.height - (memenuSize + 16);

		this._avatarHolder.clear();

		this._avatarHolder.beginFill(0x000000, 0.25);
		this._avatarHolder.drawCircle(memenuSizeHalf, memenuSizeHalf + 2, memenuSizeHalf + 2);
		this._avatarHolder.endFill();

		this._avatarHolder.beginFill(0x0C3A65);
		this._avatarHolder.lineStyle(4, 0x244d74);
		this._avatarHolder.drawCircle(memenuSizeHalf, memenuSizeHalf, memenuSizeHalf);
		this._avatarHolder.endFill();
	}

	onAvatarHover()
	{
		this.avatar.removeAction("GestureSmile");
		this.avatar.addAction("GestureSurprised");
	}

	onAvatarLeave()
	{
		this.avatar.removeAction("GestureSurprised");
		this.avatar.addAction("GestureSmile");
	}

	onChatBubbleHover()
	{
		this.avatar.removeAction("GestureSmile");
		this.avatar.addAction("Talk");
	}

	onChatBubbleLeave()
	{
		this.avatar.removeAction("Talk");
		this.avatar.addAction("GestureSmile");
	}

}

class ChatBubble extends PIXI.Graphics
{

	constructor()
	{
		super();

		this.interactive = true;

		this.imLeft = new PIXI.Sprite(application.getResource(interfaceResources.chatBubble.left).texture); // 17x44
		this.imMiddle = new PIXI.extras.TilingSprite(application.getResource(interfaceResources.chatBubble.middle).texture); // 1x44
		this.imRight = new PIXI.Sprite(application.getResource(interfaceResources.chatBubble.right).texture); // 12x44

		this.imLeft.height = 44;
		this.imMiddle.height = 44;
		this.imRight.height = 44;

		this.addChild(this.imLeft);
		this.addChild(this.imMiddle);
		this.addChild(this.imRight);

		this.draw();
	}

	draw()
	{
		let textWidth = 100;

		this.imLeft.position.x = 0;
		this.imLeft.position.y = 0;

		this.imMiddle.position.x = 17;
		this.imMiddle.position.y = 0;
		this.imMiddle.width = textWidth;

		this.imRight.position.x = 17 + textWidth;
		this.imRight.position.y = 0;
	}

}
