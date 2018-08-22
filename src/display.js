import { removeHtml } from "./core/dom-utils.js";

let frame = 0;

const stageElement = "main#stage-mount";

export class Display extends PIXI.utils.EventEmitter
{

	get frame()
	{
		return frame;
	}

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

	get size()
	{
		return {width: this.width, height: this.height};
	}

	constructor()
	{
		super();

		this.dpi = window.devicePixelRatio;
		this.mount = document.querySelector(stageElement);

		if (this.mount === null)
			throw new Error("Display mount not found!");

		removeHtml(this.mount);

		this.initApp();
		this.initEvents();

		this.ticker.add(delta => this.onTick(delta));
	}

	initApp()
	{
		this.app = new PIXI.Application({
			height: window.innerHeight,
			width: window.innerWidth,
			antialiasing: true,
			transparent: false,
			resolution: this.dpi,
			roundPixels: false,
			powerPreference: "high-performance",
			forceFXAA: true
		});

		this.mount.appendChild(this.view);

		this.view.style.height = window.innerHeight + "px";
		this.view.style.width = window.innerWidth + "px";
	}

	initEvents()
	{
		window.addEventListener("resize", () => this.onWindowResize());
	}

	onTick(delta)
	{
		frame++;

		this.emit("tick", delta);

		if (frame % 12 === 0)
			this.emit("tick-update", delta);

		this.stage.updateLayerOrder();
	}

	onWindowResize()
	{
		this.renderer.resize(window.innerWidth, window.innerHeight);
		this.emit("resize");

		this.view.style.height = window.innerHeight + "px";
		this.view.style.width = window.innerWidth + "px";
	}

}
