import { application } from "../../bootstrapper.js";
import { Logger } from "../../core/logging.js";
import { querySelectorAllArray } from "../../core/dom-utils.js";
import { Manager } from "../../core/manager/manager.js";
import { InitializerLoader } from "../../application.js";
import { setInteractive } from "../../core/pixi-utils.js";

const ROOT = "https://cdn.mili.us/time/assets/clothing";
const LIBS = `${ROOT}/lib`;

const LOADED_CONFIGS = {};
const LOADED_LIBS = {};
const LOADED_TEXTURES = {};
const LOADING_LIBS = {};

const avatarResources = {
	poof: {
		"1_1": "./resource/image/avatar/poof/1-1.png",
		"1_2": "./resource/image/avatar/poof/1-2.png",
		"1_3": "./resource/image/avatar/poof/1-3.png",
		"1_4": "./resource/image/avatar/poof/1-4.png",
		"2_1": "./resource/image/avatar/poof/2-1.png",
		"2_2": "./resource/image/avatar/poof/2-2.png",
		"2_3": "./resource/image/avatar/poof/2-3.png",
		"2_4": "./resource/image/avatar/poof/2-4.png",
		"3_1": "./resource/image/avatar/poof/3-1.png",
		"3_2": "./resource/image/avatar/poof/3-2.png",
		"3_3": "./resource/image/avatar/poof/3-3.png",
		"3_4": "./resource/image/avatar/poof/3-4.png",
		"4_1": "./resource/image/avatar/poof/4-1.png",
		"4_2": "./resource/image/avatar/poof/4-2.png",
		"4_3": "./resource/image/avatar/poof/4-3.png",
		"4_4": "./resource/image/avatar/poof/4-4.png"
	}
};

let actionsSorted = null;
let defaultAction = null;
let loadingAvatar = null;
let radiusComparator = (a, b) => b.getAttribute("z") - a.getAttribute("z");

export function initializeAvatarRenderer()
{
	if (actionsSorted === null)
		actionsSorted = querySelectorAllArray("action", getActions()).map(action => action.getAttribute("id"));

	if (defaultAction === null)
		defaultAction = getAction("Default");

	if (loadingAvatar === null)
		loadingAvatar = new Avatar("hd-195-1");
}

export function getAvatarClothingConfigUrl(config)
{
	return `${ROOT}/${config}.xml`;
}

export function getAvatarClothingLibraryUrl(library)
{
	return `${LIBS}/${library}.json`;
}

export function getValidActionsForPart(partType)
{
	const actions = ["std"];

	switch (partType)
	{
		case "bd":
			actions.push("sit", "lay", "wlk");
			break;

		case "hd":
			actions.push("lsp", "lay", "spk");
			break;

		case "fa":
			actions.push("lsp", "lay");
			break;

		case "ea":
			actions.push("lay");
			break;

		case "ey":
			actions.push("agr", "sad", "sml", "srp", "lag", "lsp", "lay", "eyb");
			break;

		case "fc":
			actions.push("agr", "blw", "sad", "spk", "srp", "sml", "lsp", "lay");
			break;

		case "hr":
		case "hrb":
			actions.push("lay");
			break;

		case "he":
			actions.push("lay");
			break;

		case "ha":
			actions.push("spk", "lay");
			break;

		case "ch":
			actions.push("lay");
			break;

		case "cc":
			actions.push("lay");
			break;

		case "ca":
			actions.push("lay");
			break;

		case "lg":
			actions.push("sit", "wlk", "lay");
			break;

		case "lh":
			actions.push("respect", "sig", "wav", "wlk", "lay");
			break;

		case "ls":
			actions.push("wlk", "wav", "lay");
			break;

		case "lc":
			actions.push("wlk", "wav", "lay");
			break;

		case "rh":
			actions.push("drk", "crr", "wlk", "lay", "blw");
			break;

		case "rs":
			actions.push("drk", "crr", "wlk", "lay");
			break;

		case "rc":
			actions.push("drk", "crr", "wlk", "lay");
			break;

		case "ri":
			actions.push("crr", "drk");
			break;

		case "li":
			actions.push("sig");
			break;

		case "sh":
			actions.push("sit", "wlk", "lay");
			break;
	}

	return actions;
}

export function isLibraryLoaded(library)
{
	return LOADED_LIBS[library] !== undefined;
}

export function loadAvatarClothingConfig(config, loader)
{
	return new Promise(resolve =>
	{
		const configUrl = getAvatarClothingConfigUrl(config);
		const isInitializerLoader = loader instanceof InitializerLoader;

		if (isInitializerLoader)
		{
			loader
				.add(configUrl)
				.on("complete", () => application.getResource(configUrl) !== undefined ? LOADED_CONFIGS[config] = application.getResource(configUrl).data : undefined);

			resolve();
		}
		else
		{
			Logger.debug(`Loading avatar clothing config: ${config}`);

			loader
				.add(configUrl)
				.on("complete", () =>
				{
					LOADED_CONFIGS[config] = application.getResource(configUrl).data;

					if (!isInitializerLoader)
						resolve(LOADED_CONFIGS[config]);
				})
				.load();
		}
	});
}

export function loadAvatarClothingLibrary(library, loader)
{
	if (LOADING_LIBS[library] !== undefined)
		return LOADING_LIBS[library];

	if (isLibraryLoaded(library))
		return Promise.resolve(LOADED_LIBS[library]);

	return LOADING_LIBS[library] = new Promise(resolve =>
	{
		const libraryUrl = getAvatarClothingLibraryUrl(library);
		const isInitializerLoader = loader instanceof InitializerLoader;
		if (isInitializerLoader)
		{
			loader
				.add(libraryUrl)
				.on("complete", () => application.getResource(libraryUrl, loader) !== undefined ? LOADED_LIBS[library] = application.getResource(libraryUrl, loader).data : undefined);

			resolve();
		}
		else
		{
			Logger.debug(`Loading avatar clothing library: ${library}`);

			loader
				.add(libraryUrl)
				.on("complete", () =>
				{
					LOADING_LIBS[library] = undefined;
					LOADED_LIBS[library] = application.getResource(libraryUrl, loader).data;
					resolve(LOADED_LIBS[library]);
				})
				.load();
		}
	});
}

/**
 * Gets a single action.
 * @param {String} id
 * @returns {Object}
 */
function getAction(id)
{
	const action = getActions().querySelector(`action[id="${id}"]`);
	const definition = {};

	if (action === null)
		return undefined;

	action.attributes.forEach(attribute => definition[attribute.name] = attribute.value);

	return definition;
}

/**
 * Gets actions.xml.
 * @returns {Document}
 */
function getActions()
{
	return LOADED_CONFIGS["actions"];
}

/**
 * Gets animations.xml.
 * @returns {Document}
 */
function getAnimations()
{
	return LOADED_CONFIGS["animations"];
}

/**
 * Gets draworder.xml.
 * @returns {Document}
 */
function getDraworder()
{
	return LOADED_CONFIGS["draworder"];
}

/**
 * Gets figuredata.xml.
 * @returns {Document}
 */
function getFigureData()
{
	return LOADED_CONFIGS["figuredata"];
}

/**
 * Gets figuremap.xml.
 * @returns {Document}
 */
function getFigureMap()
{
	return LOADED_CONFIGS["figuremap"];
}

/**
 * Gets geometry.xml.
 * @returns {Document}
 */
function getGeometry()
{
	return LOADED_CONFIGS["geometry"];
}

/**
 * Gets partsets.xml.
 * @returns {Document}
 */
function getPartSets()
{
	return LOADED_CONFIGS["partsets"];
}

/**
 * Gets a part sprite.
 * @param {String} library
 * @param {String} asset
 * @param {Object} center
 * @returns {PIXI.Sprite}
 */
function getSprite(library, asset, center = {x: 0, y: 0})
{
	if (LOADED_LIBS[library] === undefined || LOADED_LIBS[library][asset] === undefined)
		return null;

	const sprite = new PIXI.Sprite(getTexture(library, asset));

	sprite.x = center.x - (LOADED_LIBS[library][asset].offset.x + center.x - 12);
	sprite.y = center.y - (LOADED_LIBS[library][asset].offset.y - (center.y / 2) - 6);

	return sprite;
}

/**
 * Gets a part texture.
 * @param {String} library
 * @param {String} asset
 * @returns {PIXI.Texture}
 */
function getTexture(library, asset)
{
	if (LOADED_LIBS[library] === undefined || LOADED_LIBS[library][asset] === undefined)
		return null;

	if (LOADED_TEXTURES[`${library}:${asset}`] !== undefined)
		return LOADED_TEXTURES[`${library}:${asset}`];

	return LOADED_TEXTURES[`${library}:${asset}`] = PIXI.Texture.fromImage("data:image/png;base64," + LOADED_LIBS[library][asset]["asset"]);
}

/**
 * Returns a flipped version of {@see setType}.
 * @param setType
 * @returns {String}
 */
function getFlippedSetType(setType)
{
	let flippedSetType = getPartSets().querySelector(`partSet part[set-type="${setType}"]`).getAttribute("flipped-set-type");

	if (flippedSetType !== null && flippedSetType !== "")
		return flippedSetType;

	return setType;
}

/**
 * Checks if a set type needs to be removed.
 * @param setType
 * @returns {String}
 */
function getRemoveSetType(setType)
{
	let removeSetType = getPartSets().querySelector(`partSet part[set-type="${setType}"]`).getAttribute("remove-set-type");

	if (removeSetType !== null && removeSetType !== "")
		return removeSetType;

	return null;
}

/**
 * Gets active partset by id.
 * @param {String} id
 * @returns {Array}
 */
function getActivePartSets(id)
{
	const result = [];
	const activeParts = getPartSets().querySelectorAll(`activePartSet[id="${id}"] activePart`);

	activeParts.forEach(activePart => result.push(activePart.getAttribute("set-type")));

	return result;
}

/**
 * Gets animation frames.
 * @param {String} id
 * @param {String} type
 * @returns {Array}
 */
function getAnimationFrames(id, type)
{
	const defs = getAnimations().querySelectorAll(`action[id="${id}"] part[set-type="${type}"] frame`);
	const frames = [];

	defs.forEach(def =>
	{
		const repeats = def.hasAttribute("repeats") ? parseInt(def.getAttribute("repeats")) : 1;

		for (let i = 0; i < repeats; i++)
			frames.push({number: parseInt(def.getAttribute("number")), assetpartdefinition: def.getAttribute("assetpartdefinition")});
	});

	return frames;
}

/**
 * Gets animation frames.
 * @param {String} id
 * @returns {Number}
 */
function getAnimationFramesCount(id)
{
	const frames = getAnimations().querySelectorAll(`action[id="${id}"] part:first-child frame`).length;
	const offsets = getAnimations().querySelectorAll(`action[id="${id}"] offsets frame`).length;

	return Math.max(frames, offsets);
}

/**
 * Gets animation offset.
 * @param id
 * @param geometryId
 * @param frame
 * @param direction
 * @returns {{x: number, y: number}}
 */
function getAnimationOffset(id, geometryId, frame, direction)
{
	if (isNaN(frame) || isNaN(direction))
		return {x: 0, y: 0};

	const bodypart = getAnimations().querySelector(`action[id="${id}"] offsets frame[id="${frame}"] directions direction[id="${direction}"] bodypart[id="${geometryId}"]`);

	if (bodypart === null)
		return {x: 0, y: 0};

	return {
		x: parseInt(bodypart.getAttribute("dx")),
		y: parseInt(bodypart.getAttribute("dy"))
	};
}

export class FigureString
{

	get parts()
	{
		return this._parts;
	}

	constructor(figure)
	{
		this._parts = {};

		this.parse(figure);
	}

	hasPartId(type, id)
	{
		if (!this.hasPartType(type))
			return false;

		return this._parts[type].id === id;
	}

	hasPartType(type)
	{
		return this._parts[type] !== undefined;
	}

	parse(figure)
	{
		figure = figure.split(".");
		figure = figure.map(part => part.split("-"));
		figure = figure.sort((a, b) => a[0].localeCompare(b[0]));
		figure.forEach(part => this._parts[part[0]] = {id: parseInt(part[1]), color: [part[2], part[3]].filter(n => n !== null)});
	}

	toString()
	{
		const str = [];

		this.parts.forEach((data, type) => str.push([type, data.id, ...data.color].join("-")));

		return str.join(".");
	}

}

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

		this.canPoof = true;
		this.lastUpdate = -1;
		this.loader = new PIXI.loaders.Loader();
		this.partContainer = new PIXI.Container();

		this.addChild(this.partContainer);

		this._alsoUpdate = [];
		this._initial = true;
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

		this._initial = false;

		this.buildSync();
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

	async build()
	{
		if (this._initial === true)
			return;

		this.emit("avatar-build", this);

		this.lastUpdate = application.ticker.lastTime;

		this.invalidate();
		this.decideGeometry();
		this.gatherParts();

		const libraries = this.getLibraries();

		for (let library of libraries)
		{
			if (isLibraryLoaded(library))
				continue;

			await loadAvatarClothingLibrary(library, this.loader);
		}

		this._loading = false;
		this.update();
	}

	buildSync()
	{
		this.build().then();
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
			if (action["activepartset"] === id)
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
		this._loading = true;
		this._parts = {};
		this._sprites = {};

		this.decideGeometry();
	}

	poof()
	{
		if (this._initial || !this.canPoof)
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

		if (this._ticker === false)
		{
			this._ticker = true;

			application.ticker.add(() =>
			{
				if (this.lastUpdate === -1 || (application.ticker.lastTime - this.lastUpdate) > 120)
					this.buildSync();
			});
		}
	}

	update()
	{
		this.actions.forEach(action => this.updateAction(action));
		this.render();
	}

	updateAction(action = null)
	{
		if (this._initial === true)
			return;

		const center = {
			x: this._width / 2,
			y: this._height / 2
		};

		const activePartSets = this.getActivePartSets(action);
		const frame = ++this._frames[action.id] || 0;

		const hiddenlayers = [];
		const avatarParts = this._loading ? (loadingAvatar !== null ? loadingAvatar._parts : {}) : this._parts;

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

				if (activePartSets.indexOf(partType) === -1)
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

}

export class AvatarManager extends Manager
{

	constructor()
	{
		super();
	}

	async initialize()
	{
		await super.initialize();

		await loadAvatarClothingLibrary("hh_human_body", this.loader);
		await loadAvatarClothingConfig("actions", this.loader);
		await loadAvatarClothingConfig("animations", this.loader);
		await loadAvatarClothingConfig("draworder", this.loader);
		await loadAvatarClothingConfig("effectmap", this.loader);
		await loadAvatarClothingConfig("figuredata", this.loader);
		await loadAvatarClothingConfig("figuremap", this.loader);
		await loadAvatarClothingConfig("geometry", this.loader);
		await loadAvatarClothingConfig("offsets", this.loader);
		await loadAvatarClothingConfig("partsets", this.loader);

		avatarResources.poof.forEach(image => this.loader.add(image));
	}

}
