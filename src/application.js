import { AvatarManager, initializeAvatarRenderer } from "./core/avatar/avatar.js";
import { Logger } from "./core/logging.js";
import { LoadingView } from "./view/loading-view.js";
import { Display } from "./display.js";
import { I18nManager } from "./core/i18n/i18n.js";
import { ConfigManager } from "./core/config/config.js";
import { initialLoadingDelay } from "./preferences.js";
import { InterfaceContainer, InterfaceManager } from "./ui/interface/interface.js";
import { RoomView } from "./view/room/room-view.js";
import { Avatar } from "./core/avatar/avatar.js";

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
		this.urls
			.filter(url => url.stage === stage)
			.map(url => url.url)
			.forEach(url => super.add(url));

		super.load(cb);
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

		initializeAvatarRenderer();

		// let avatar, frame = 0;

		this.stage.addChild(new RoomView());
		this.stage.addChild(new InterfaceContainer());
		this.stage.addChild(new Avatar("lg-3116-110-92.hr-3163-61.sh-3275-92.hd-195-4.ha-3268-1415-92.ch-255-92", "vertical", "full").setPosition(100, 100, 6));
		this.stage.addChild(new Avatar("lg-3116-110-92.hr-3163-61.sh-3275-92.hd-195-4.ha-3268-1415-92.ch-255-92", "vertical", "full").setPosition(200, 100, 4));
		this.stage.addChild(new Avatar("hr-3163-61.cc-3075-73.ca-3175-92.hd-195-3.ch-3030-92.sh-3016-64.lg-3116-110-92", "vertical", "full").setPosition(300, 100, 2));
		this.stage.addChild(new Avatar("hr-3163-61.cc-3075-73.ca-3175-92.hd-195-3.ch-3030-92.sh-3016-64.lg-3116-110-92", "vertical", "full").setPosition(400, 100, 0));
		this.stage.addChild(new Avatar("lg-3116-110-92.hr-3163-61.sh-3275-92.hd-195-4.ha-3268-1415-92.ch-255-92", "vertical", "full").setPosition(100, 300, 3));
		// this.stage.addChild(new Avatar("hr-3163-61.cc-3075-73.ca-3175-92.hd-195-3.ch-3030-92.sh-3016-64.lg-3116-110-92", "vertical", "full").setPosition(200, 300, 3));
		// this.stage.addChild(new Avatar("lg-3116-110-92.hr-3163-61.sh-3275-92.hd-195-4.ha-3268-1415-92.ch-255-92", "vertical", "full").setPosition(300, 300, 3));
		// this.stage.addChild(avatar = new Avatar("hd-195-3", "vertical", "full").setPosition(400, 300, 0));
		//
		// this.ticker.add(() =>
		// {
		// 	if (frame++ % 10 === 0)
		// 		avatar.direction = avatar.headDirection = (avatar.direction + 1) % 8;
		// });
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
