import { application} from "../../bootstrapper.js";
import { Manager } from "../../core/manager/manager.js";
import { getDeliveryAssetsUrl } from "../../preferences.js";
import { RoomView } from "./room-view.js";

const roomAssets = {
	index: getDeliveryAssetsUrl("/room-content/index.xml"),
	assets: getDeliveryAssetsUrl("/room-content/room_assets.xml"),
	manifest: getDeliveryAssetsUrl("/room-content/manifest.xml"),
	visualization: getDeliveryAssetsUrl("/room-content/room_visualization.xml")
};

let localRoomViewer;

function initRoomViewer()
{
	localRoomViewer = new RoomView();
}

export class RoomManager extends Manager
{

	get roomViewer()
	{
		return localRoomViewer;
	}

	constructor()
	{
		super();

		initRoomViewer();

		this.roomViewer.visible = false;
	}

	async initialize()
	{
		await super.initialize();

		this.loader.add(roomAssets.index);
		this.loader.add(roomAssets.assets);
		this.loader.add(roomAssets.manifest);
		this.loader.add(roomAssets.visualization);
	}

	ensureRoomViewerIsMounted()
	{
		if (this.roomViewer.parent !== null)
			return;

		application.display.stage.addChild(this.roomViewer);
	}

	removeRoomViewer()
	{
		application.display.stage.removeChild(this.roomViewer);
	}

	showRoomViewer(heightmap)
	{
		this.ensureRoomViewerIsMounted();

		this.roomViewer.prepareHeightmap(heightmap);
		this.roomViewer.visible = true;
	}

}
