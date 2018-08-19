import { InitializerLoader } from "../../application.js";
import { getDeliveryAssetsUrl } from "../../preferences.js";
import { parseActions } from "./action.js";
import { parseAnimations } from "./animation.js";
import { parseFiguredata } from "./figuredata.js";

export class AvatarConfig
{

	get actions()
	{
		return this._actions;
	}

	get animations()
	{
		return this._animations;
	}

	get draworder()
	{
		return this._draworder;
	}

	get effectmap()
	{
		return this._effectmap;
	}

	get figuredata()
	{
		return this._figuredata;
	}

	get figuremap()
	{
		return this._figuremap;
	}

	get geometry()
	{
		return this._geometry;
	}

	get offsets()
	{
		return this._offsets;
	}

	get partsets()
	{
		return this._partsets;
	}

	constructor()
	{
		this._actions = null;
		this._animations = null;
		this._draworder = null;
		this._effectmap = null;
		this._figuredata = null;
		this._figuremap = null;
		this._geometry = null;
		this._offsets = null;
		this._partsets = null;

		this.libraries = {};
		this.loader = new PIXI.loaders.Loader();
		this.loadingPromises = {};
	}

	getLibrary(library)
	{
		return this.libraries[library] || undefined;
	}

	loadConfig(config, loader)
	{
		const configUrl = getDeliveryAssetsUrl(`/clothing/${config}.xml`);

		loader.add(configUrl).on("complete", () => loader.resources[configUrl] !== undefined ? this.onConfigLoaded(config, loader.resources[configUrl].data) : undefined);
	}

	loadLibrary(library, loader = this.loader)
	{
		const isMainLoader = loader instanceof InitializerLoader;
		const libraryUrl = getDeliveryAssetsUrl(`/clothing/lib/${library}.json`);

		if (isMainLoader)
		{
			loader
				.add(libraryUrl)
				.on("complete", () => loader.resources[libraryUrl] !== undefined ? this.libraries[library] = loader.resources[libraryUrl] : undefined);
		}
		else
		{
			if (this.loadingPromises[library] !== undefined)
				return this.loadingPromises[library];

			return this.loadingPromises[library] = new Promise(resolve =>
			{
				loader
					.reset()
					.add(libraryUrl)
					.on("complete", () =>
					{
						if (loader.resources[libraryUrl] === undefined)
							return;

						console.log("avatar:config", `Downloaded clothing library ${library}!`);

						resolve(this.libraries[library] = loader.resources[libraryUrl]);
					})
					.load();
			});
		}
	}

	onConfigLoaded(config, data)
	{
		switch (config)
		{
			case "actions":
				this._actions = parseActions(data);
				break;

			case "animations":
				this._animations = parseAnimations(data);
				break;

			case "figuredata":
				this._figuredata = parseFiguredata(data);
				break;

			default:
				this[`_${config}`] = data;
				console.log("avatar:config", `No config handler for ${config}!`);
				break;
		}
	}

	getAction(action)
	{
		return this._actions.find(a => a.id === action);
	}

}
