import { application } from "../../bootstrapper.js";
import { querySelectorAllArray } from "../../core/dom-utils.js";
import { setInteractive } from "../../core/pixi-utils.js";
import { FigureString } from "./figure.js";
import { actionsSorted, defaultAction, getAction, getActivePartSets, getAnimationFrames, getAnimationFramesCount, getAnimationOffset, getDraworder, getFigureData, getFigureMap, getFlippedSetType, getGeometry, getRemoveSetType, getSprite, getValidActionsForPart, isLibraryLoaded, loadAvatarClothingLibrary, loadingAvatar, radiusComparator } from "./shared.js";
import { AvatarManager, avatarResources } from "./manager.js";

export class Avatar extends PIXI.Container
{

	get actions()
	{
		return this._actions;
	}

	get avatarSet()
	{
		return this._avatarSet;
	}

	set avatarSet(value)
	{
		this._avatarSet = value;
	}

	get direction()
	{
		return this._direction;
	}

	set direction(value)
	{
		this._direction = value;
	}

	get figure()
	{
		return this._figure;
	}

	set figure(value)
	{
		if (value === undefined)
			return;

		this._figure = new FigureString(value);
		this.poof();
	}

	get geometry()
	{
		return this._geometry;
	}

	set geometry(value)
	{
		this._geometry = value;
	}

	get headDirection()
	{
		return this._headDirection;
	}

	set headDirection(value)
	{
		this._headDirection = value;
	}

	constructor(figure = "lg-3116-110-92.hr-3163-61.sh-3275-92.hd-195-4.ha-3268-1415-92.ch-255-92", geometry = "vertical", avatarSet = "full")
	{
		super();

		setInteractive(this);

		this.canPoof = false;
		this.id = "avatar-" + window.performance.now();
		this.loader = new PIXI.loaders.Loader();
		this.partContainer = new PIXI.Container();

		this.addChild(this.partContainer);

		this._alsoUpdate = [];
		this._ticker = false;
		this._width = 0;
		this._height = 0;

		this._actions = [defaultAction];
		this._frames = {};

		this.avatarSet = avatarSet;
		this.direction = 2;
		this.figure = figure;
		this.geometry = geometry;
		this.headDirection = this.direction;

		this.build();
		this.canPoof = true;
	}

	addAction(action)
	{
		for (let a of this._actions)
			if (a.id === action)
				return;

		action = getAction(action);

		if (action === undefined)
			return;

		this._actions
			.pushChain(action)
			.sort((a, b) => actionsSorted.indexOf(b.id) - actionsSorted.indexOf(a.id));

		this._frames[action.id] = 0;

		if (action["preventheadturn"] === "true")
			this._headDirection = this.direction;
	}

	hasAction(action)
	{
		let found = false;

		for (let a of this._actions)
			if (a.id === action)
				found = true;

		return found;
	}

	removeAction(action)
	{
		if (!this.hasAction(action))
			return;

		this._actions = this._actions
			.filter(a => a.id !== action)
			.sort((a, b) => actionsSorted.indexOf(b.id) - actionsSorted.indexOf(a.id));
	}

	setPosition(x, y, dir = 3)
	{
		this.x = x;
		this.y = y;

		this.direction = dir;
		this.headDirection = dir;

		return this;
	}

	build()
	{
		if (this.isBuilding)
			return;

		this.isBuilding = true;

		this.emit("avatar-build", this);
		this.invalidate();

		const libraries = this.getLibraries().filter(library => !isLibraryLoaded(library));

		if (libraries.length > 0)
		{
			this._loading = true;

			const download = () =>
			{
				if (libraries.length === 0)
				{
					this._loading = false;
					return;
				}

				loadAvatarClothingLibrary(libraries.shift(), this.loader).then(download);
			};

			download();
		}

		this.update();

		this.isBuilding = false;
	}

	decideGeometry()
	{
		const geometry = getGeometry().querySelector(`canvas[scale="h"] geometry[id="${this.geometry}"]`);
		this._height = parseInt(geometry.getAttribute("height"));
		this._width = parseInt(geometry.getAttribute("width"));

		if (this.geometry === "head")
			this._height = this._width;
	}

	getActivePartSets(action = null)
	{
		let activePartSets = [];

		if (action === null)
			activePartSets.push(...getActivePartSets("figure"));
		else
			activePartSets.push(...getActivePartSets(action["activepartset"]));

		return activePartSets.unique();
	}

	hasActivePartSet(id)
	{
		for (let action of this.actions)
			if (action !== null && action["activepartset"] === id)
				return true;

		return false;
	}

	getBodyparts()
	{
		const bodyparts = [];

		querySelectorAllArray(`avatarset[id="${this.avatarSet}"] bodypart`, getGeometry())
			.forEach(part => bodyparts.push(part.getAttribute("id")));

		return bodyparts;
	}

	getLibraries()
	{
		const libraries = [];

		this._parts.forEach((settype, type) =>
		{
			settype.parts.forEach(part =>
			{
				let lib = getFigureMap().querySelector(`part[id="${part.id}"][type="${type}"]`);

				if (lib === null || lib.parentNode === null)
					return;

				lib = lib.parentNode;

				libraries.push(part["library"] = lib.getAttribute("id").toLowerCase());
			});
		});

		return libraries.unique();
	}

	getRoomOffsets()
	{
		let x = -(this._width / 2);
		let y = -104;

		return {x, y};
	}

	gatherParts()
	{
		this.figure.parts.forEach((data, type) =>
		{
			const settype = getFigureData().querySelector(`sets > settype[type="${type}"]`);

			if (settype === null)
				return;

			const set = settype.querySelector(`set[id="${data.id}"]`);
			const parts = set.getElementsByTagName("part");

			const colorable = set.getAttribute("colorable") === "1";
			const hiddenlayers = [];
			const paletteid = settype.getAttribute("paletteid");

			const setHiddenlayers = set.querySelectorAll("hiddenlayers layer");
			if (setHiddenlayers !== null)
				setHiddenlayers.forEach(layer => hiddenlayers.push(layer.getAttribute("parttype")));

			parts.forEach(part =>
			{
				const partType = part.getAttribute("type");

				if (this._parts[partType] === undefined)
					this._parts[partType] = {hiddenlayers, parts: []};

				this._parts[partType].parts.push({
					id: parseInt(part.getAttribute("id")),
					colorable: part.getAttribute("colorable") === "1" && colorable,
					colorindex: parseInt(part.getAttribute("colorindex")),
					index: parseInt(part.getAttribute("index")),
					paletteid,
					set: type,
					type: partType
				});
			});
		});
	}

	invalidate()
	{
		this._parts = {};
		this._sprites = {};

		this.decideGeometry();
		this.gatherParts();
	}

	poof()
	{
		if (!this.canPoof)
			return;

		const clouds = [
			{
				sprite: new PIXI.extras.AnimatedSprite([
					application.getResource(avatarResources.poof["1_1"]).texture,
					application.getResource(avatarResources.poof["1_2"]).texture,
					application.getResource(avatarResources.poof["1_3"]).texture,
					application.getResource(avatarResources.poof["1_4"]).texture
				]),
				x: -4,
				y: -36
			},
			{
				sprite: new PIXI.extras.AnimatedSprite([
					application.getResource(avatarResources.poof["2_1"]).texture,
					application.getResource(avatarResources.poof["2_2"]).texture,
					application.getResource(avatarResources.poof["2_3"]).texture,
					application.getResource(avatarResources.poof["2_4"]).texture
				]),
				x: 4,
				y: 36
			},
			{
				sprite: new PIXI.extras.AnimatedSprite([
					application.getResource(avatarResources.poof["3_1"]).texture,
					application.getResource(avatarResources.poof["3_2"]).texture,
					application.getResource(avatarResources.poof["3_3"]).texture,
					application.getResource(avatarResources.poof["3_4"]).texture
				]),
				x: -4,
				y: 16
			},
			{
				sprite: new PIXI.extras.AnimatedSprite([
					application.getResource(avatarResources.poof["3_1"]).texture,
					application.getResource(avatarResources.poof["3_2"]).texture,
					application.getResource(avatarResources.poof["3_3"]).texture,
					application.getResource(avatarResources.poof["3_4"]).texture
				]),
				x: 4,
				y: -16
			}
		];

		let cx = this._width / 2, cy = this._height / 2;
		let fn = cloud =>
		{
			this.addChild(cloud.sprite);
			cloud.sprite.anchor.set(0.5);
			cloud.sprite.animationSpeed = 0.2;
			cloud.sprite.loop = false;
			cloud.sprite.hitArea = null;
			cloud.sprite.position.x = cx + cloud.x;
			cloud.sprite.position.y = cy + cloud.y;
			cloud.sprite.play();

			setTimeout(() => this.removeChild(cloud.sprite), 330);

			if (clouds[0] !== undefined)
				setTimeout(() => fn(clouds.shift()), 45);
		};

		fn(clouds.shift());
	}

	render()
	{
		if (this._loading)
		{
			const cmf = new PIXI.filters.AlphaFilter();
			cmf.alpha = 0.8;
			this.filters = [cmf];
		}
		else
		{
			this.filters = [];
		}

		let draworderId = "std";

		if (this.hasActivePartSet("handLeft"))
			draworderId = this.direction > 3 && this.direction < 7 ? "rh-up" : "lh-up";
		else if (this.hasActivePartSet("handRightAndHead"))
			draworderId = this.direction > 3 && this.direction < 7 ? "lh-up" : "rh-up";

		let draworder = querySelectorAllArray(`action[id="${draworderId}"] direction[id="${this.direction}"] partList part`, getDraworder()).map(part => part.getAttribute("set-type"));

		if (draworder.length === 0)
			draworder = querySelectorAllArray(`action[id="std"] direction[id="${this.direction}"] partList part`, getDraworder()).map(part => part.getAttribute("set-type"));

		while (this.partContainer.children[0])
			this.partContainer.removeChild(this.partContainer.children[0]);

		for (let type of draworder)
			if (this._sprites[type] !== undefined)
				this._sprites[type].forEach(part => this.partContainer.addChild(part));
	}

	update()
	{
		this.actions.forEach(action => this.updateAction(action));
		this.render();
	}

	updateAction(action = null)
	{
		const center = {
			x: this._width / 2,
			y: this._height / 2
		};

		if (action === null)
			return;

		const activePartSets = this.getActivePartSets(action);
		const frame = ++this._frames[action.id] || 0;

		const hiddenlayers = [];
		const avatarParts = this._loading ? (loadingAvatar !== null ? loadingAvatar._parts : {}) : this._parts;

		if (avatarParts === undefined)
			return;

		avatarParts.forEach(data => hiddenlayers.push(...data.hiddenlayers));

		let bodyparts = [];
		this.getBodyparts().forEach(bodypart => bodyparts.push(getGeometry().querySelector(`type[id="${this.geometry}"] bodypart[id="${bodypart}"]`)));

		for (const partset of bodyparts.sort(radiusComparator))
		{
			let bodypart = partset.getAttribute("id");
			let items = querySelectorAllArray("item", partset).sort(radiusComparator);

			for (const item of items)
			{
				let partDirection = bodypart === "head" ? this.headDirection : this.direction;
				let partType = item.getAttribute("id");
				let partDirectionWithoutFlip = partDirection;
				let partTypeWithoutFlip = partType;
				let partSwapped = false;
				let removeSetType = getRemoveSetType(partType);

				if (removeSetType !== null)
					hiddenlayers.push(removeSetType);

				if (partDirection > 3 && partDirection < 7)
				{
					partSwapped = true;
					partType = getFlippedSetType(partType);
				}

				let partValidActions = getValidActionsForPart(partType);
				let partFrames = getAnimationFrames(action.id, partType);

				if (activePartSets.indexOf(partTypeWithoutFlip) === -1)
					continue;

				if (this._sprites[partTypeWithoutFlip] === undefined)
					this._sprites[partTypeWithoutFlip] = {};

				if (hiddenlayers.indexOf(partType) > -1)
					continue;

				if (avatarParts[partTypeWithoutFlip] === undefined)
					continue;

				for (const part of avatarParts[partTypeWithoutFlip].parts)
				{
					if (this._loading && part.library !== "hh_human_body")
						break; // Other parts are probably from another library.

					let offset = {
						x: parseInt(partset.getAttribute("x")),
						y: parseInt(partset.getAttribute("y"))
					};

					let partFlipped = false;
					let partFrame = frame % (partFrames !== null ? Object.values(partFrames).length : 1);
					let partAction = (partFrames && partFrames[partFrame] ? partFrames[partFrame].assetpartdefinition : action.assetpartdefinition);

					if (partValidActions.indexOf(partAction) === -1)
						partAction = partValidActions[0];

					partDirection = bodypart === "head" ? this.headDirection : this.direction;
					partFrame = partFrames && partFrames[partFrame] ? partFrames[partFrame].number : 0;

					let animationOffset = getAnimationOffset(action.id, bodypart, frame % getAnimationFramesCount(action.id), partDirection);
					let generateAssetName = () => `h_${partAction}_${partType}_${part.id}_${partDirection}_${partFrame}`;
					let sprite = getSprite(part.library, generateAssetName(), center);

					if (sprite === null)
					{
						let opf = partFrame;
						partFrame = 0;
						sprite = getSprite(part.library, generateAssetName(), center);
						partFrame = opf;
					}

					if (sprite === null)
					{
						partDirection = 6 - partDirection;
						partFlipped = partDirectionWithoutFlip > 3 && partDirectionWithoutFlip < 7;
						sprite = getSprite(part.library, generateAssetName(), center);
					}

					if (sprite === null)
					{
						let opa = partAction;
						partAction = "std";
						sprite = getSprite(part.library, generateAssetName(), center);
						partAction = opa;
					}

					if (sprite === null)
					{
						// if (partType !== "ey" && partType !== "fc")
						// 	Logger.debug("Sprite not found!", generateAssetName(), part.library, partType);

						break; // Don't draw incomplete pieces.
					}

					if (!partSwapped)
					{
						sprite.x += offset.x + animationOffset.x;
						sprite.y += offset.y + animationOffset.y;
					}
					else
					{
						sprite.x -= offset.x + animationOffset.x;
						sprite.y -= offset.y + animationOffset.y;
					}

					if (partFlipped)
					{
						sprite.scale.x = -1;
						sprite.x = (((this._width - sprite.width) - sprite.x) + sprite.width) + animationOffset.x;
					}

					sprite.x = Math.floor(sprite.x);
					sprite.y = Math.floor(sprite.y);

					if (part.colorable && partType !== "ey" && !this._loading)
					{
						const colors = this.figure.parts[part.set].color;
						const color = colors[part.colorindex - 1] || colors[0];
						const fdColor = getFigureData().querySelector(`palette[id="${part.paletteid}"] color[id="${color}"]`);

						if (fdColor !== null)
							sprite.tint = parseInt(`0x${fdColor.textContent}`);
					}

					if (this._sprites[partTypeWithoutFlip][part.index] !== undefined)
						this._sprites[partTypeWithoutFlip][part.index].destroy(false);

					this._sprites[partTypeWithoutFlip][part.index] = sprite;
				}
			}
		}
	}

	destroy()
	{
		application.getManager(AvatarManager).removeAvatar(this);
	}

}
