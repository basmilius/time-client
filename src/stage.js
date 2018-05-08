import { removeHtml } from "./core/dom-utils.js";

const stageElement = "main#stage-mount";

export class Stage
{

	constructor()
	{
		this.stage = document.querySelector(stageElement);

		this.dpi = 1; // window.devicePixelRatio;
		this.height = window.innerHeight / this.dpi;
		this.width = window.innerWidth / this.dpi;

		if (this.stage === null)
			throw new Error("Stage mount not found!");

		removeHtml(this.stage);

		this.initApp();
		this.initEvents();
		this.initGameLoop();
	}

	getRenderer()
	{
		return this.app.renderer;
	}

	getStage()
	{
		return this.app.stage;
	}

	getTicker()
	{
		return this.app.ticker;
	}

	initApp()
	{
		this.app = new PIXI.Application({
			width: this.width,
			height: this.height,
			antialiasing: true,
			transparent: false,
			resolution: this.dpi
		});

		this.stage.appendChild(this.app.view);
	}

	initEvents()
	{
		window.addEventListener("resize", () => this.onWindowResize());
	}

	initGameLoop()
	{
		this.app.ticker.add(delta => this.onTick(delta));
	}

	onTick()
	{
		this.height = window.innerHeight / this.dpi;
		this.width = window.innerWidth / this.dpi;
	}

	onWindowResize()
	{
		this.app.renderer.resize(window.innerWidth, window.innerHeight);
	}

}
