import { Manager } from "../../core/manager/manager.js";
import { getDeliveryAssetsUrl } from "../../preferences.js";

const roomAssets = {
	index: getDeliveryAssetsUrl("/room-content/index.xml"),
	assets: getDeliveryAssetsUrl("/room-content/room_assets.xml"),
	manifest: getDeliveryAssetsUrl("/room-content/manifest.xml"),
	visualization: getDeliveryAssetsUrl("/room-content/room_visualization.xml")
};

export class RoomManager extends Manager
{

	constructor()
	{
		super();
	}

	async initialize()
	{
		await super.initialize();

		this.loader.add(roomAssets.index);
		this.loader.add(roomAssets.assets);
		this.loader.add(roomAssets.manifest);
		this.loader.add(roomAssets.visualization);
	}

}
