import { setInteractive } from "../../core/pixi-utils.js";
import { AvatarFigure } from "./figure.js";
import { avatarConfig, getUsedAvatarLibraries } from "./shared.js";

export class AvatarImage extends PIXI.Container
{

	get figure()
	{
		return this._figure;
	}

	set figure(value)
	{
		this._figure = typeof value === "string" ? new AvatarFigure(value) : value;
		this.onFigureChanged();
	}

	constructor(figure = "lg-3116-110-92.hr-3163-61.sh-3275-92.hd-195-4.ha-3268-1415-92.ch-255-92", geometry = "vertical", avatarSet = "full")
	{
		super();

		setInteractive(this);

		this.canPoof = false;
		this.id = "avatar-" + window.performance.now();
		this.partContainer = new PIXI.Container();
		this.size = [0, 0];

		this.addChild(this.partContainer);

		this.actions = [avatarConfig.getAction("Default")];

		this.avatarSet = avatarSet;
		this.direction = 2;
		this.geometry = geometry;
		this.headDirection = this.direction;

		this.partDefinitions = {};
		this.sprites = {};

		this.ghost = true;

		this.isBuilding = false;
		this.isDownloading = false;
		this.isGatheringParts = false;

		this.decideGeometry();
		this.figure = figure;
		this.build();

		this.bg = new PIXI.Graphics();
		this.addChild(this.bg);

		this.render();
	}

	build()
	{
		if (this.isBuilding)
			return;

		this.isBuilding = true;

		const usedLibraries = getUsedAvatarLibraries(this).filter(lib => avatarConfig.getLibrary(lib) === undefined);

		if (usedLibraries.length > 0 && !this.isDownloading)
		{
			this.ghost = true;
			this.isDownloading = true;

			const download = () =>
			{
				if (usedLibraries.length === 0)
					return this.isDownloading = false;

				avatarConfig
					.loadLibrary(usedLibraries.shift())
					.then(download);
			};

			download();
		}
		else if (!this.isDownloading)
		{
			this.ghost = false;
		}

		this.decidePartStates();

		this.isBuilding = false;
	}

	decidePartStates()
	{
	}

	decideGeometry()
	{
		const geometry = avatarConfig.geometry.querySelector(`canvas[scale="h"] geometry[id="${this.geometry}"]`);
		const width = parseInt(geometry.getAttribute("width"));
		const height = this.geometry === "head" ? width : parseInt(geometry.getAttribute("height"));

		this.size = [width, height];
	}

	gatherParts()
	{
		if (this.isBusy())
			return;

		this.isGatheringParts = true;

		this.figure.parts.forEach(part =>
		{
			const settype = avatarConfig.figuredata.getSetType(part.type);

			if (settype === undefined)
				return;

			const set = settype.getSet(part.setId);
			const hiddenLayers = (set.hiddenLayers || []);

			set.parts.forEach(part =>
			{
				if (this.partDefinitions[part.type] === undefined)
					this.partDefinitions[part.type] = {hiddenLayers, parts: [], set};

				this.partDefinitions[part.type].parts.push(part);
			});
		});
	}

	isBusy()
	{
		return this.isGatheringParts;
	}

	onFigureChanged()
	{
		this.gatherParts();
	}

	render()
	{
		this.bg.fillColor = 0xFF0000;
		this.bg.drawRect(0, 0, this.size[0], this.size[1]);
	}

}
