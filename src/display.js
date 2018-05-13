import { removeHtml } from "./core/dom-utils.js";

const stageElement = "main#stage-mount";

export class Display extends PIXI.utils.EventEmitter
{

	get renderer()
	{
		return this.app.renderer;
	}

	get stage()
	{
		return this.app.stage;
	}

	get ticker()
	{
		return this.app.ticker;
	}

	get view()
	{
		return this.app.view;
	}

	get height()
	{
		return this.renderer.height / this.dpi;
	}

	get width()
	{
		return this.renderer.width / this.dpi;
	}

	constructor()
	{
		super();

		this.dpi = 1;//window.devicePixelRatio;
		this.mount = document.querySelector(stageElement);

		if (this.mount === null)
			throw new Error("Display mount not found!");

		removeHtml(this.mount);

		this.initApp();
		this.initEvents();
	}

	initApp()
	{
		this.app = new PIXI.Application({
			height: window.innerHeight / this.dpi,
			width: window.innerWidth / this.dpi,
			antialiasing: false,
			transparent: false,
			resolution: this.dpi,
			roundPixels: false
		});

		this.mount.appendChild(this.view);
	}

	initEvents()
	{
		window.addEventListener("resize", () => this.onWindowResize());
	}

	onWindowResize()
	{
		this.renderer.resize(window.innerWidth / this.dpi, window.innerHeight / this.dpi);

		this.emit("resize");
	}

}
