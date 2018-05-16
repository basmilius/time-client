import { Manager } from "../../core/manager/manager.js";
import { application } from "../../bootstrapper.js";
import { tileHeightHalf, tileWidthHalf } from "../room/shared.js";

const furniResources = {
	loading: "./resource/image/furni/loading.png"
};

export class Furni extends PIXI.Container
{

	get loading()
	{
		return this._loading;
	}

	set loading(value)
	{
		this._loading = value;
	}

	constructor(furniName)
	{
		super();

		this.furniName = furniName;

		this._loadingSprite = new PIXI.Sprite(application.getResource(furniResources.loading).texture);
		this.addChild(this._loadingSprite);

		this.loading = true;

		this.render();
	}

	getRoomOffsets()
	{
		return {
			x: -(tileWidthHalf + 2),
			y: -(tileHeightHalf + 34)
		};
	}

	render()
	{
	}

}

export class FurniManager extends Manager
{

	constructor()
	{
		super();
	}

	async initialize()
	{
		await super.initialize();

		this.loader.add(furniResources.loading);
	}

}
