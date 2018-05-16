import { Manager } from "../manager/manager.js";
import { evaluateString, findKey } from "../json-utils.js";
import { application } from "../../bootstrapper.js";

const configJson = "./resource/config/config.json";

export class ConfigManager extends Manager
{

	constructor()
	{
		super();

		this.config = {};
	}

	async initialize()
	{
		await super.initialize();

		this.loader
			.add(configJson, 0)
			.on("complete", () => this.onConfigLoaded(application.getResource(configJson)));
	}

	getString(key, context = {}, defaultValue = undefined)
	{
		let string = findKey(key, this.config);

		if (string === undefined && defaultValue !== undefined)
			return defaultValue;

		return evaluateString(string, Object.assign({}, context, this.config));
	}

	onConfigLoaded(config)
	{
		if (config === undefined)
			return;

		this.config = config.data;
	}

}
