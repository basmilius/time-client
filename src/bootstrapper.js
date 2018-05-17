import { Logger } from "./core/logging.js";
import { Application } from "./application.js";

/**
 * @type {Application}
 */
export const application = new Application();

/**
 * Class Bootstrapper.
 */
export class Bootstrapper
{

	/**
	 * Initializes everything.
	 */
	static async init()
	{
		Logger.debug("Bootstrapper", "Loading everything..");

		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

		application.create();
		application.on("application-can-run", () => application.run());

		await application.initialize();
	}

}
