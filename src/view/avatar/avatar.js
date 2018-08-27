import { application } from "../../bootstrapper.js";
import { querySelectorAllArray } from "../../core/dom-utils.js";
import { FigureString } from "./figure.js";
import { AvatarManager, avatarResources } from "./manager.js";
import { actionComparator, defaultAction, getAction, getActivePartSets, getAnimationFrames, getAnimationFramesCount, getAnimationOffset, getDraworder, getFigureData, getFigureMap, getFlippedSetType, getGeometry, getOppositeDirection, getRemoveSetType, getSprite, getValidActionsForPart, isLibraryLoaded, loadAvatarClothingLibrary, loadingAvatar, radiusComparator } from "./shared.js";

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
		this._direction = value % 8;
		this.needsUpdate = true;
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

		if (!this.initialBuild)
			this.build();

		this.poof();
	}

	get geometry()
	{
		return this._geometry;
	}

	set geometry(value)
	{
		this._geometry = value;
		this.needsUpdate = true;
	}

	get headDirection()
	{
		return this._headDirection;
	}

	set headDirection(value)
	{
		this._headDirection = value % 8;
		this.needsUpdate = true;
	}

	constructor(figure = "hd-195-4", geometry = "vertical", avatarSet = "full")
	{
		super();

		this.interactive = true;
		this.initialBuild = true;
		this.canPoof = false;
		this.id = "avatar-" + window.performance.now();
		this.loader = new PIXI.loaders.Loader();
		this.needsUpdate = false;

		this.partContainer = new PIXI.Graphics();
		this.partContainer.interactive = false;
		this.addChild(this.partContainer);

		this._alsoUpdate = [];
		this._width = 0;
		this._height = 0;

		this._actions = [defaultAction];
		this._frames = {};
		this._intervals = {};

		this.avatarSet = avatarSet;
		this.direction = 2;
		this.figure = figure;
		this.geometry = geometry;
		this.headDirection = this.direction;

		this.build();
		this.addAction("Default");

		this.canPoof = true;
		this.initialBuild = false;

		(() =>
		{

			let canSpin = false;

			setInterval(() => canSpin ? this.direction = this.headDirection = this.direction + 1 : undefined, 100);

			let height = 354;
			let menu = new PIXI.Graphics();
			menu.x = 0;
			menu.y = -height;

			menu.beginFill(0xABCDEF);
			menu.drawRect(0, 0, 116, height);
			menu.endFill();

			const make = (txt, x, y, fn) =>
			{
				const el = new PIXI.Text(txt, new PIXI.TextStyle({fontSize: 13}));
				el.x = x;
				el.y = y;
				el.interactive = true;

				el.on("pointertap", fn);

				return el;
			};

			menu.addChild(make("Blow", 6, 6, () => this.hasAction("Blow") ? this.removeAction("Blow") : this.addAction("Blow")));
			menu.addChild(make("Lay", 6, 24, () => this.hasAction("Lay") ? this.removeAction("Lay") : this.addAction("Lay")));
			menu.addChild(make("Sit", 6, 42, () => this.hasAction("Sit") ? this.removeAction("Sit") : this.addAction("Sit")));
			menu.addChild(make("Laugh", 6, 60, () => this.hasAction("Laugh") ? this.removeAction("Laugh") : this.addAction("Laugh")));
			menu.addChild(make("Respect", 6, 78, () => this.hasAction("Respect") ? this.removeAction("Respect") : this.addAction("Respect")));
			menu.addChild(make("Sleep", 6, 96, () => this.hasAction("Sleep") ? this.removeAction("Sleep") : this.addAction("Sleep")));
			menu.addChild(make("Sign", 6, 114, () => this.hasAction("Sign") ? this.removeAction("Sign") : this.addAction("Sign")));
			menu.addChild(make("Talk", 6, 132, () => this.hasAction("Talk") ? this.removeAction("Talk") : this.addAction("Talk")));
			menu.addChild(make("Dance", 6, 150, () => this.hasAction("Dance") ? this.removeAction("Dance") : this.addAction("Dance")));
			menu.addChild(make("Wave", 6, 168, () => this.hasAction("Wave") ? this.removeAction("Wave") : this.addAction("Wave")));
			menu.addChild(make("Gesture", 6, 186, () => this.hasAction("Gesture") ? this.removeAction("Gesture") : this.addAction("Gesture")));
			menu.addChild(make("GestureSmile", 6, 204, () => this.hasAction("GestureSmile") ? this.removeAction("GestureSmile") : this.addAction("GestureSmile")));
			menu.addChild(make("GestureSad", 6, 222, () => this.hasAction("GestureSad") ? this.removeAction("GestureSad") : this.addAction("GestureSad")));
			menu.addChild(make("GestureAngry", 6, 240, () => this.hasAction("GestureAngry") ? this.removeAction("GestureAngry") : this.addAction("GestureAngry")));
			menu.addChild(make("GestureSurprised", 6, 258, () => this.hasAction("GestureSurprised") ? this.removeAction("GestureSurprised") : this.addAction("GestureSurprised")));
			menu.addChild(make("Move", 6, 276, () => this.hasAction("Move") ? this.removeAction("Move") : this.addAction("Move")));
			menu.addChild(make("Wave", 6, 294, () => this.hasAction("Wave") ? this.removeAction("Wave") : this.addAction("Wave")));
			menu.addChild(make("Idle", 6, 312, () => this.hasAction("Idle") ? this.removeAction("Idle") : this.addAction("Idle")));
			menu.addChild(make("Spin", 6, 330, () => canSpin = !canSpin));

			this.addChild(menu);

		})();
	}

	addAction(action)
	{
		if (this.hasAction(action))
			return;

		action = getAction(action);

		if (action === undefined)
			return;

		this._actions.push(action);
		this._frames[action.id] = 0;

		if (action.preventheadturn === "true")
			this.headDirection = this.direction;

		this._intervals[action.id] = setInterval(() => this.needsUpdate = true, 90);
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

		this._actions = this._actions.filter(a => a.id !== action);

		clearInterval(this._intervals[action.id]);
		delete this._intervals[action.id];
	}

	containsPoint(p)
	{
		if (!this.interactive)
			return false;

		let x = Math.floor(p.x - this.partContainer.worldTransform.tx);
		let y = Math.floor(p.y - this.partContainer.worldTransform.ty);

		if (x < 0 || y < 0 || x > this.partContainer.width || y > this.partContainer.height)
			return false;

		const pixels = application.display.renderer.plugins.extract.pixels(this.partContainer);
		const px = (x * 4) + (y * (this.partContainer.width * 4));

		return pixels[px + 3] > 0;
	}

	build()
	{
		if (this.isBuilding)
			return;

		this.isBuilding = true;
		this.needsUpdate = true;

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
					this.needsUpdate = true;
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
		{
			activePartSets.push(...getActivePartSets("figure"));
		}
		else
		{
			if (action["activepartset"] === "handRightAndHead")
			{
				activePartSets.push(...getActivePartSets("handRight"));
				activePartSets.push(...getActivePartSets("head"));
			}
			else
			{
				activePartSets.push(...getActivePartSets(action["activepartset"]));
			}
		}

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
				let typeProcessed = type === "hrb" ? "hr" : type;
				let lib = getFigureMap().querySelector(`part[id="${part.id}"][type="${typeProcessed}"]`);

				if (lib === null || lib.parentNode === null)
					return;

				lib = lib.parentNode;
				part.library = lib.getAttribute("id").toLowerCase();

				if (part.library === undefined && (type === "ls" || type === "rs" || type === "lc" || type === "rc"))
					part.library = "hh_human_shirt";

				libraries.push(part.library);
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
					paletteid: paletteid,
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
					PIXI.Texture.from(avatarResources.poof["1_1"]),
					PIXI.Texture.from(avatarResources.poof["1_2"]),
					PIXI.Texture.from(avatarResources.poof["1_3"]),
					PIXI.Texture.from(avatarResources.poof["1_4"])
				]),
				x: -4,
				y: -36
			},
			{
				sprite: new PIXI.extras.AnimatedSprite([
					PIXI.Texture.from(avatarResources.poof["2_1"]),
					PIXI.Texture.from(avatarResources.poof["2_2"]),
					PIXI.Texture.from(avatarResources.poof["2_3"]),
					PIXI.Texture.from(avatarResources.poof["2_4"])
				]),
				x: 4,
				y: 36
			},
			{
				sprite: new PIXI.extras.AnimatedSprite([
					PIXI.Texture.from(avatarResources.poof["3_1"]),
					PIXI.Texture.from(avatarResources.poof["3_2"]),
					PIXI.Texture.from(avatarResources.poof["3_3"]),
					PIXI.Texture.from(avatarResources.poof["3_4"])
				]),
				x: -4,
				y: 16
			},
			{
				sprite: new PIXI.extras.AnimatedSprite([
					PIXI.Texture.from(avatarResources.poof["3_1"]),
					PIXI.Texture.from(avatarResources.poof["3_2"]),
					PIXI.Texture.from(avatarResources.poof["3_3"]),
					PIXI.Texture.from(avatarResources.poof["3_4"])
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
		this.partContainer.cacheAsBitmap = false;
		this.alpha = this._loading ? 0.6 : 1.0;

		let draworderId = "std";

		if (this.hasActivePartSet("handLeft"))
			draworderId = "lh-up";
		else if (this.hasActivePartSet("handRightAndHead"))
			draworderId = "rh-up";

		let draworder = querySelectorAllArray(`action[id="${draworderId}"] direction[id="${this.direction}"] partList part`, getDraworder()).map(part => part.getAttribute("set-type"));

		if (draworder.length === 0)
			draworder = querySelectorAllArray(`action[id="std"] direction[id="${this.direction}"] partList part`, getDraworder()).map(part => part.getAttribute("set-type"));

		while (this.partContainer.children[0])
			this.partContainer.removeChild(this.partContainer.children[0]);

		for (let type of draworder)
			if (this._sprites[type] !== undefined)
				this._sprites[type].forEach(part => this.partContainer.addChild(part));

		// this.partContainer.cacheAsBitmap = true;
	}

	update()
	{
		if (!this.needsUpdate)
			return;

		this.needsUpdate = false;

		this.actions.sort(actionComparator).forEach(action => this.updateAction(action));
		this.render();
	}

	updateAction(action = null)
	{
		const center = {
			x: Math.floor(this._width / 2),
			y: Math.floor(this._height / 2)
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
				let partTypeFlipped = getFlippedSetType(partType);
				let partDirectionWithoutFlip = partDirection;
				let partSwapped = false;
				let removeSetType = getRemoveSetType(partType);
				let shouldCheckFlip = partType !== partTypeFlipped && partDirection > 3 && partDirection < 7;

				if (removeSetType !== null)
					hiddenlayers.push(removeSetType);

				let partValidActions = getValidActionsForPart(partType);
				let partFrames = getAnimationFrames(action.id, partType);

				if (activePartSets.indexOf(partType) === -1)
					continue;

				if (hiddenlayers.indexOf(partType) > -1)
					continue;

				if (avatarParts[partType] === undefined)
					continue;

				for (const part of avatarParts[partType].parts)
				{
					if (this._loading && part.library !== "hh_human_body")
						continue;

					if (part.library === undefined)
						continue; // Brainfart?

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
					let generateAssetName = (pa, pt, pi, pd, pf) => `h_${pa}_${pt}_${pi}_${pd}_${pf}`;
					let partDirectionOpposite = getOppositeDirection(partDirectionWithoutFlip);
					let sprite = null;

					let onPartSwapped = () => partSwapped = true;
					let onPartFlipped = () => partFlipped = partDirectionWithoutFlip > 3 && partDirectionWithoutFlip < 7;
					let onPartFlippedAndSwapped = () =>
					{
						onPartSwapped();
						onPartFlipped()
					};

					let test = [
						[generateAssetName(partAction, partType, part.id, partDirection, partFrame)],
						[generateAssetName(partAction, partType, part.id, partDirection, 0)],
						[generateAssetName(partAction, partType, part.id, partDirectionOpposite, partFrame), onPartFlipped],
						[generateAssetName(partAction, partType, part.id, partDirectionOpposite, 0), onPartFlipped],
						[generateAssetName("std", partType, part.id, partDirectionOpposite, partFrame)]
					];

					if (shouldCheckFlip)
					{
						test.unshift(
							[generateAssetName(partAction, partTypeFlipped, part.id, partDirection, partFrame), onPartSwapped],
							[generateAssetName(partAction, partTypeFlipped, part.id, partDirection, 0), onPartSwapped],
							[generateAssetName(partAction, partTypeFlipped, part.id, partDirectionOpposite, partFrame), onPartFlippedAndSwapped],
							[generateAssetName(partAction, partTypeFlipped, part.id, partDirectionOpposite, 0), onPartFlippedAndSwapped]
						);
					}

					while (sprite === null && test.length > 0)
					{
						let n = test.shift();
						sprite = getSprite(part.library, n[0], center);

						partFlipped = false;
						partSwapped = false;

						if (sprite === null || n[1] === undefined)
							continue;

						n[1]();
						break;
					}

					if (sprite === null)
					{
						delete this._sprites[partType];
						break;
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

						sprite.x = this._width + -sprite.x - animationOffset.x;
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

					if (part.index === 0)
						this._sprites[partType] = {};

					if (this._sprites[partType][part.index] !== undefined)
						this._sprites[partType][part.index].destroy(false);

					this._sprites[partType][part.index] = sprite;
				}
			}
		}
	}

	destroy()
	{
		application.getManager(AvatarManager).removeAvatar(this);
	}

}
