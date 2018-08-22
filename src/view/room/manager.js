import { application } from "../../bootstrapper.js";
import { Manager } from "../../core/manager/manager.js";
import { getDeliveryAssetsUrl } from "../../preferences.js";
import { RoomView } from "./room-view.js";

const roomAssets = {
	assets: getDeliveryAssetsUrl("/room-content/room_assets.xml"),
	sprites: getDeliveryAssetsUrl("/room-content/assets.json"),
	visualization: getDeliveryAssetsUrl("/room-content/room_visualization.xml")
};

let localRoomViewer;

function initRoomViewer()
{
	localRoomViewer = new RoomView();
}

export class RoomManager extends Manager
{

	get assets()
	{
		return this._assets;
	}

	get roomViewer()
	{
		return localRoomViewer;
	}

	get sceneryTexture()
	{
		return this._sceneryTexture;
	}

	get sprites()
	{
		return this._sprites;
	}

	get visualization()
	{
		return this._visualization;
	}

	constructor()
	{
		super();

		this._assets = null;
		this._sprites = null;
		this._visualization = null;

		initRoomViewer();

		this.roomViewer.visible = false;
	}

	async initialize()
	{
		await super.initialize();

		this.loadConfig(roomAssets.assets);
		this.loadConfig(roomAssets.sprites);
		this.loadConfig(roomAssets.visualization);
	}

	loadConfig(url)
	{
		this.loader
			.add(url)
			.on("complete", (loader, file) => loader.resources[url] !== undefined ? this.onConfigLoaded(url, file[url]) : undefined);
	}

	onConfigLoaded(url, file)
	{
		switch (url)
		{
			case roomAssets.assets:
				this._assets = file.data;
				break;

			case roomAssets.sprites:
				this._sprites = file.data;
				this._sceneryTexture = PIXI.Texture.fromImage(`data:image/png;base64,${this.sprites.resource}`);
				this.sprites.resource = undefined;
				break;

			case roomAssets.visualization:
				this._visualization = file.data;
				break;
		}
	}

	ensureRoomViewerIsMounted()
	{
		if (this.roomViewer.parent !== null)
			return;

		application.display.stage.addChild(this.roomViewer);
	}

	removeRoomViewer()
	{
		this.roomViewer.removeAllListeners();
		application.display.stage.removeChild(this.roomViewer);
	}

	showRoomViewer(heightmap, scenery = undefined)
	{
		this.ensureRoomViewerIsMounted();

		this.roomViewer.prepareHeightmap(heightmap, scenery);
		this.roomViewer.visible = true;
	}

}
