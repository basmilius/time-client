import { application } from "../../bootstrapper.js";
import { Logger } from "../logging.js";

export class Manager
{

	get display()
	{
		return application.display;
	}

	get loader()
	{
		return application.loader;
	}

	get name()
	{
		return this._name;
	}

	get stage()
	{
		return application.stage;
	}

	constructor()
	{
		this._name = this.constructor.name;
	}

	async initialize()
	{
		Logger.debug(`Initializing manager: ${this.name}`)
	}

	dispose()
	{
	}

	log(...data)
	{
		console.log(this.name, ...data);
	}

	logDebug(...data)
	{
		console.debug(this.name, ...data);
	}

	logError(...data)
	{
		console.error(this.name, ...data);
	}

	logWarning(...data)
	{
		console.warn(this.name, ...data);
	}

}
