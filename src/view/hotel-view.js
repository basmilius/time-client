import { application } from "../bootstrapper.js";
import { Easings } from "../ui/ui.js";
import { Manager } from "../core/manager/manager.js";
import { bottomBarHeight } from "../ui/interface/bottomBar.js";

export const hotelViewAssets = {
	hotel: "./resource/image/hotel-view/hotel.png",
	skyline: "./resource/image/hotel-view/skyline.png"
};

export class HotelView extends PIXI.Graphics
{

	constructor()
	{
		super();

		this.skyline = new PIXI.extras.TilingSprite(application.getResource(hotelViewAssets.skyline).texture);
		this.addChild(this.skyline);

		this.hotel = new PIXI.Sprite(application.getResource(hotelViewAssets.hotel).texture);
		this.addChild(this.hotel);

		this.visible = false;
		this.render();
	}

	close()
	{
		anime({
			targets: this,
			duration: 300,
			easing: Easings.SwiftOut,
			alpha: [1, 0]
		}).finished.then(() => this.visible = false);
	}

	open()
	{
		this.visible = true;

		const height = application.display.height;

		anime({
			targets: this,
			duration: 300,
			easing: Easings.SwiftOut,
			alpha: [0, 1]
		});

		anime({
			targets: this.skyline,
			delay: 150,
			duration: 750,
			easing: Easings.SwiftOut,
			alpha: [0, 1],
			y: [height, this.skyline.y]
		});

		anime({
			targets: this.hotel,
			delay: 225,
			duration: 750,
			easing: Easings.SwiftOut,
			y: [height, this.hotel.y]
		});
	}

	render()
	{
		const {width, height} = application.display.size;
		const bottomOffset = bottomBarHeight;

		this.clear();

		this.beginFill(0x25B8EE);
		this.drawRect(0, 0, width, height);
		this.endFill();

		this.hotel.x = width - 750;
		this.hotel.y = height - (568 + bottomOffset);

		this.skyline.height = 120;
		this.skyline.width = width;
		this.skyline.x = 0;
		this.skyline.y = height - (120 + bottomOffset);
	}

}

export class HotelViewManager extends Manager
{

	get hotelView()
	{
		return this._hotelView;
	}

	constructor()
	{
		super();

		application.once("application-loading-done", () => this.onApplicationLoadingDone());
	}

	async initialize()
	{
		this.loader.add(hotelViewAssets.hotel);
		this.loader.add(hotelViewAssets.skyline);
	}

	onApplicationLoadingDone()
	{
		this._hotelView = new HotelView();
		application.display.stage.addChild(this.hotelView);
	}

}
