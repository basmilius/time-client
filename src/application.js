import { AvatarManager } from "./view/avatar/manager.js";
import { Logger } from "./core/logging.js";
import { LoadingView } from "./view/loading-view.js";
import { Display } from "./display.js";
import { I18nManager } from "./core/i18n/i18n.js";
import { ConfigManager } from "./core/config/config.js";
import { initialLoadingDelay } from "./preferences.js";
import { InterfaceManager } from "./ui/interface/manager.js";
import { FurniManager } from "./view/furni/furni.js";
import { RoomManager } from "./view/room/manager.js";
import { fakeGamePlay } from "./dev/gameplay.js";
import { HotelViewManager } from "./view/hotel-view.js";
import { LOADED_LIBS } from "./view/avatar/shared.js";

export class InitializerLoader extends PIXI.loaders.Loader
{

	constructor()
	{
		super();

		this.urls = [];
	}

	add(url, stage = 1)
	{
		this.urls.push({
			stage,
			url
		});

		return this;
	}

	load()
	{
		Logger.debug("InitializerLoader", "Skipped load() initializing..");
	}

	realLoad(cb, stage = 1)
	{
		const valid = this.urls
			.filter(url => url.stage === stage)
			.map(url => url.url);

		const urls = valid.filter(url => typeof url === "string");
		const promises = valid.filter(url => typeof url !== "string");

		urls.forEach(url => super.add(url));

		const executor = async () =>
		{
			await new Promise(resolve => super.load(resolve));

			for (let promise of promises)
				await promise;
		};

		executor()
			.then(() => cb());
	}

}

export class Application extends PIXI.utils.EventEmitter
{

	get display()
	{
		return this._display;
	}

	get loader()
	{
		return this._loader;
	}

	get stage()
	{
		return this.display.stage;
	}

	get ticker()
	{
		return this.display.ticker;
	}

	constructor()
	{
		super();

		this._display = new Display();
		this._loader = new InitializerLoader();

		this.managers = [];
	}

	addDefaultManagers()
	{
		this.addManager(new ConfigManager());
		this.addManager(new I18nManager());

		this.addManager(new AvatarManager());
		this.addManager(new FurniManager());
		this.addManager(new HotelViewManager());
		this.addManager(new RoomManager());

		this.addManager(new InterfaceManager());
	}

	addManager(manager)
	{
		Logger.debug("Application", `Added manager ${manager.constructor.name}`);
		this.managers.push(manager);
	}

	getManager(managerClass)
	{
		return this.managers.find(manager => manager instanceof managerClass);
	}

	create()
	{
		this.loadingView = new LoadingView();
		this.loadingView.on("loader-ready", () => this.emit("application-can-run"));
		this.stage.addChild(this.loadingView);

		this.addDefaultManagers();
	}

	async initialize()
	{
		await this.managers.forEach(async manager => await manager.initialize());
	}

	async run()
	{
		this.loadingView.loadingBar.alpha = 0;
		setTimeout(() => this.loader.realLoad(() => this.onLoadingStage0Done(), 0), initialLoadingDelay);
	}

	onLoadingStage0Done()
	{
		this.loadingView.loadingBar.alpha = 1;
		this.loadingView.percentage = 0;
		this.loader.realLoad(() => this.onLoadingStage1Done(), 1);
	}

	onLoadingStage1Done()
	{
		Logger.debug("Application", "Loading of manager data done!");
		this.emit("application-loading-done");

		delete this.loader;

		this.stage.removeChild(this.loadingView);

		fakeGamePlay();
	}

	getResource(resource, loader = undefined)
	{
		return (loader || this.loader).resources[resource];
	}

	getResources(loader = undefined)
	{
		return (loader || this.loader).resources;
	}

}
