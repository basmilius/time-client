import { application } from "../../bootstrapper.js";
import { interfaceResources } from "./interface.js";
import { getTextureFromRectangle } from "../../core/pixi-utils.js";
import { AvatarManager } from "../../view/avatar/manager.js";

export const bottomBarHeight = 70;

export class BottomBar extends PIXI.Container
{

	constructor()
	{
		super();

		this.background = new PIXI.Sprite(application.getResource(interfaceResources.bottomBar.background).texture);
		this.addChild(this.background);

		this.addChild(this.meButton = new BottomBarButtonMe());
		this.addChild(this.navigatorButton = new BottomBarButtonNavigator());
		this.addChild(this.friendsButton = new BottomBarButtonFriends());
		this.addChild(this.chatButton = new BottomBarButtonChat());
		this.addChild(this.catalogueButton = new BottomBarButtonCatalogue());
		this.addChild(this.inventoryButton = new BottomBarButtonInventory());
		this.addChild(this.helpButton = new BottomBarButtonHelp());

		this.draw();

		application.display.on("resize", () => this.draw());
	}

	draw()
	{
		const { width, height } = application.display.size;

		this.x = 0;
		this.y = height - bottomBarHeight;

		this.background.x = 0;
		this.background.y = 0;
		this.background.width = width;

		this.meButton.x = 24;
		this.navigatorButton.x = (width - 24) - 360;
		this.friendsButton.x = (width - 24) - 300;
		this.chatButton.x = (width - 24) - 240;
		this.catalogueButton.x = (width - 24) - 180;
		this.inventoryButton.x = (width - 24) - 120;
		this.helpButton.x = (width - 24) - 60;
	}

}

export class BottomBarButton extends PIXI.extras.AnimatedSprite
{

	constructor(textures)
	{
		super(textures);

		this.animationSpeed = 0.2;
		this.buttonMode = true;
		this.interactive = true;
		this.loop = false;
	}

}

export class BottomBarButtonMe extends PIXI.Graphics
{

	get figure()
	{
		return this.avatar.figure;
	}

	set figure(value)
	{
		this.avatar.figure = value;
	}

	constructor(figure = undefined)
	{
		super();

		this.avatar = application.getManager(AvatarManager).newAvatar(figure, "vertical", "head");
		this.addChild(this.avatar);

		this.avatar.canPoof = false;
		this.avatar.direction = this.avatar.headDirection = 3;
		this.avatar.addAction("GestureSmile");

		this.avatar.x = -10;
		this.avatar.y = -5;
	}

}

export class BottomBarButtonAnimatedHover extends BottomBarButton
{

	constructor(textures)
	{
		super(textures);

		this.animationSpeed = 0.2;
		this.buttonMode = true;
		this.interactive = true;
		this.loop = false;

		this.on("pointerover", () => this.onPointerOver());
		this.on("pointerout", () => this.onPointerOut());
	}

	onPointerOver()
	{
		this.animationSpeed = 0.2;
		this.play();
	}

	onPointerOut()
	{
		this.animationSpeed = -0.2;
		this.play();
	}

}

export class BottomBarButtonCatalogue extends BottomBarButtonAnimatedHover
{

	constructor()
	{
		const texture = application.getResource(interfaceResources.bottomBar.catalogue).texture;
		const textures = [
			getTextureFromRectangle(texture, 0, 0, 70, 70),
			getTextureFromRectangle(texture, 70, 0, 70, 70),
			getTextureFromRectangle(texture, 140, 0, 70, 70),
			getTextureFromRectangle(texture, 210, 0, 70, 70),
			getTextureFromRectangle(texture, 280, 0, 70, 70),
			getTextureFromRectangle(texture, 350, 0, 70, 70),
			getTextureFromRectangle(texture, 420, 0, 70, 70)
		];

		super(textures);
	}

}

export class BottomBarButtonChat extends BottomBarButton
{

	constructor()
	{
		const texture = application.getResource(interfaceResources.bottomBar.chat).texture;
		const textures = [
			getTextureFromRectangle(texture, 0, 0, 70, 70)
		];

		super(textures);
	}

}

export class BottomBarButtonChatMessages extends BottomBarButton
{

	constructor()
	{
		const texture = application.getResource(interfaceResources.bottomBar.chatMessages).texture;
		const textures = [
			getTextureFromRectangle(texture, 0, 0, 70, 70),
			getTextureFromRectangle(texture, 70, 0, 70, 70)
		];

		super(textures);

		this.animationSpeed = 0.025;
		this.loop = true;
		this.play();
	}

}

export class BottomBarButtonFriends extends BottomBarButtonAnimatedHover
{

	constructor()
	{
		const texture = application.getResource(interfaceResources.bottomBar.friends).texture;
		const textures = [
			getTextureFromRectangle(texture, 0, 0, 70, 70),
			getTextureFromRectangle(texture, 70, 0, 70, 70),
			getTextureFromRectangle(texture, 140, 0, 70, 70),
			getTextureFromRectangle(texture, 210, 0, 70, 70),
			getTextureFromRectangle(texture, 280, 0, 70, 70)
		];

		super(textures);
	}

}

export class BottomBarButtonFriendsInvited extends BottomBarButton
{

	constructor()
	{
		const texture = application.getResource(interfaceResources.bottomBar.friendsInvited).texture;
		const textures = [
			getTextureFromRectangle(texture, 0, 0, 70, 70),
			getTextureFromRectangle(texture, 70, 0, 70, 70)
		];

		super(textures);

		this.animationSpeed = 0.025;
		this.loop = true;
		this.play();
	}

}

export class BottomBarButtonHelp extends BottomBarButtonAnimatedHover
{

	constructor()
	{
		const texture = application.getResource(interfaceResources.bottomBar.help).texture;
		const textures = [
			getTextureFromRectangle(texture, 0, 0, 70, 70),
			getTextureFromRectangle(texture, 70, 0, 70, 70),
			getTextureFromRectangle(texture, 140, 0, 70, 70),
			getTextureFromRectangle(texture, 210, 0, 70, 70),
			getTextureFromRectangle(texture, 280, 0, 70, 70),
			getTextureFromRectangle(texture, 350, 0, 70, 70)
		];

		super(textures);
	}

}

export class BottomBarButtonInventory extends BottomBarButtonAnimatedHover
{

	constructor()
	{
		const texture = application.getResource(interfaceResources.bottomBar.inventory).texture;
		const textures = [
			getTextureFromRectangle(texture, 0, 0, 70, 70),
			getTextureFromRectangle(texture, 70, 0, 70, 70),
			getTextureFromRectangle(texture, 140, 0, 70, 70),
			getTextureFromRectangle(texture, 210, 0, 70, 70),
			getTextureFromRectangle(texture, 280, 0, 70, 70)
		];

		super(textures);
	}

}

export class BottomBarButtonNavigator extends BottomBarButtonAnimatedHover
{

	constructor()
	{
		const texture = application.getResource(interfaceResources.bottomBar.navigator).texture;
		const textures = [
			getTextureFromRectangle(texture, 0, 0, 70, 70),
			getTextureFromRectangle(texture, 70, 0, 70, 70),
			getTextureFromRectangle(texture, 140, 0, 70, 70),
			getTextureFromRectangle(texture, 210, 0, 70, 70)
		];

		super(textures);
	}

}
