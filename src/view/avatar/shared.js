import { application } from "../../bootstrapper.js";
import { Avatar } from "./avatar.js";
import { Logger } from "../../core/logging.js";
import { querySelectorAllArray } from "../../core/dom-utils.js";
import { getDeliveryAssetsUrl } from "../../preferences.js";
import { InitializerLoader } from "../../application.js";

export const LOADED_CONFIGS = {};
export const LOADED_LIBS = {};
export const LOADED_TEXTURES = {};
export const LOADING_LIBS = {};

export let actionsSorted = null;
export let defaultAction = null;
export let loadingAvatar = null;
export let radiusComparator = (a, b) => b.getAttribute("z") - a.getAttribute("z");

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
	return getDeliveryAssetsUrl(`/clothing/${config}.xml`);
}

export function getAvatarClothingLibraryUrl(library)
{
	return getDeliveryAssetsUrl(`/clothing/sprite/${library}.json`);
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

		loader
			.add(configUrl)
			.on("complete", () => application.getResource(configUrl) !== undefined ? LOADED_CONFIGS[config] = application.getResource(configUrl).data : undefined);

		resolve();
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
				.use((asset, next) =>
				{
					if (asset.name !== libraryUrl)
						return next();

					LOADED_LIBS[library] = asset.data;

					getTexture(library, true)
						.then(() => next());
				});

			resolve();
		}
		else
		{
			Logger.debug(`Loading avatar clothing library: ${library}`);

			loader
				.add(libraryUrl)
				.on("complete", () =>
				{
					LOADED_LIBS[library] = application.getResource(libraryUrl, loader).data;
					LOADING_LIBS[library] = undefined;

					getTexture(library, true)
						.then(() => resolve(LOADED_LIBS[library]));
				})
				.load();
		}
	});
}

export function getAction(id)
{
	const action = getActions().querySelector(`action[id="${id}"]`);
	const definition = {};

	if (action === null)
		return undefined;

	action.attributes.forEach(attribute => definition[attribute.name] = attribute.value);

	return definition;
}

export function getActions()
{
	return LOADED_CONFIGS["actions"];
}

export function getAnimations()
{
	return LOADED_CONFIGS["animations"];
}

export function getDraworder()
{
	return LOADED_CONFIGS["draworder"];
}

export function getFigureData()
{
	return LOADED_CONFIGS["figuredata"];
}

export function getFigureMap()
{
	return LOADED_CONFIGS["figuremap"];
}

export function getGeometry()
{
	return LOADED_CONFIGS["geometry"];
}

export function getPartSets()
{
	return LOADED_CONFIGS["partsets"];
}

export function getSprite(library, asset, center = {x: 0, y: 0})
{
	if (LOADED_LIBS[library] === undefined)
		return null;

	try
	{
		const data = LOADED_LIBS[library]["assets"][asset];

		if (data === undefined)
			return null;

		const texture = new PIXI.Texture(getTexture(library));
		texture.frame = new PIXI.Rectangle(data[0], data[1], data[2], data[3]);

		const sprite = new PIXI.Sprite(texture);

		sprite.x = center.x - (data[4] + center.x - 12);
		sprite.y = center.y - (data[5] - (center.y / 2) - 6);

		return sprite;
	}
	catch (err)
	{
		return null;
	}
}

export function getTexture(library, promise = false)
{
	if (LOADED_LIBS[library] === undefined)
		return null;

	if (LOADED_TEXTURES[library] !== undefined)
		return promise ? Promise.resolve(LOADED_TEXTURES[library]) : LOADED_TEXTURES[library];

	if (!promise)
	{
		const texture = LOADED_TEXTURES[library] = PIXI.Texture.from("data:image/png;base64," + LOADED_LIBS[library].resource);
		LOADED_LIBS[library].resource = undefined;
		return texture;
	}

	return new Promise(resolve =>
	{
		LOADED_TEXTURES[library] = PIXI.Texture.from("data:image/png;base64," + LOADED_LIBS[library].resource);
		LOADED_LIBS[library].resource = undefined;
		resolve(LOADED_TEXTURES[library]);
	});
}

export function getFlippedSetType(setType)
{
	let flippedSetType = getPartSets().querySelector(`partSet part[set-type="${setType}"]`).getAttribute("flipped-set-type");

	if (flippedSetType !== null && flippedSetType !== "")
		return flippedSetType;

	return setType;
}

export function getRemoveSetType(setType)
{
	let removeSetType = getPartSets().querySelector(`partSet part[set-type="${setType}"]`).getAttribute("remove-set-type");

	if (removeSetType !== null && removeSetType !== "")
		return removeSetType;

	return null;
}

export function getActivePartSets(id)
{
	const result = [];
	const activeParts = getPartSets().querySelectorAll(`activePartSet[id="${id}"] activePart`);

	activeParts.forEach(activePart => result.push(activePart.getAttribute("set-type")));

	return result;
}

export function getAnimationFrames(id, type)
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

export function getAnimationFramesCount(id)
{
	const frames = getAnimations().querySelectorAll(`action[id="${id}"] part:first-child frame`).length;
	const offsets = getAnimations().querySelectorAll(`action[id="${id}"] offsets frame`).length;

	return Math.max(frames, offsets);
}

export function getAnimationOffset(id, geometryId, frame, direction)
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
