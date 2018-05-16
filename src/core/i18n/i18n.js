import { Manager } from "../manager/manager.js";
import { application } from "../../bootstrapper.js";
import { evaluateString, findKey } from "../json-utils.js";
import { ConfigManager } from "../config/config.js";

const textsJson = "./resource/config/texts.json";

export class I18nManager extends Manager
{

	constructor()
	{
		super();

		this.texts = {};
	}

	async initialize()
	{
		await super.initialize();

		this.loader
			.add(textsJson, 0)
			.on("complete", () => this.onTextsLoaded(application.getResource(textsJson)));
	}

	getString(key, context = {}, defaultValue = undefined)
	{
		let string = findKey(key, this.texts);

		if (string === undefined && defaultValue !== undefined)
			return defaultValue;

		return evaluateString(string, Object.assign({}, context, this.text, application.getManager(ConfigManager).config));
	}

	onTextsLoaded(texts)
	{
		if (texts === undefined)
			return;

		this.texts = texts.data;
	}

}
