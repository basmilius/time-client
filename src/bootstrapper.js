import { Logger } from "./core/logging.js";
import { Stage } from "./stage.js";
import { LoadingView } from "./view/loading-view.js";
import { RoomView } from "./view/room/room-view.js";

let loadingView = null;
let stage = null;

/**
 * Class Bootstrapper.
 */
export class Bootstrapper
{

	/**
	 * Initializes everything.
	 */
	static init()
	{
		Logger.debug("Bootstrapper", "Loading everything..");

		stage = new Stage();

		loadingView = new LoadingView();

		// stage.getStage().addChild(loadingView);

		stage.getStage().addChild(new RoomView());
	}

	/**
	 * Gets the loader.
	 * @returns {PIXI.loader.Loader}
	 */
	static getLoader()
	{
		return PIXI.loader;
	}

	/**
	 * Gets a resource.
	 * @param {String} resource
	 * @returns {*}
	 */
	static getResource(resource)
	{
		return PIXI.loader.resources[resource];
	}

	/**
	 * Gets resources.
	 * @returns {*}
	 */
	static getResources()
	{
		return PIXI.loader.resources;
	}

	/**
	 * Gets the Stage.
	 * @returns {Stage}
	 */
	static getStage()
	{
		return stage;
	}

}
