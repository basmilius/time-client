import { AvatarConfig } from "./config.js";

export const avatarConfig = new AvatarConfig();

export class AvatarBodyPart
{

	constructor(id)
	{
		this.id = id;
		this.dx = 0;
		this.dy = 0;
		this.x = 0;
		this.y = 0;
		this.z = 0.0;
		this.radius = 0;
		this.items = [];
	}

}

export class AvatarColor
{

	constructor(paletteId, colorId, index, isClub, isSelectable, color)
	{
		this.paletteId = paletteId;
		this.colorId = colorId;
		this.index = index;
		this.isClub = isClub;
		this.isSelectable = isSelectable;
		this.color = parseInt(`0x${color}`);
	}

}

export class AvatarLibrary
{

	constructor(id, revision)
	{
		this.id = id;
		this.revision = revision;
		this.parts = [];
	}

}

export class AvatarPart
{

	constructor(id, type, index, isColorable, colorIndex)
	{
		this.id = id;
		this.type = type;
		this.index = index;
		this.isColorable = isColorable;
		this.colorIndex = colorIndex;
	}

}

export class AvatarSet
{

	constructor(id, gender, isClub, isColorable, isSelectable, isPreSelectable)
	{
		this.id = id;
		this.gender = gender;
		this.isClub = isClub;
		this.isColorable = isColorable;
		this.isSelectable = isSelectable;
		this.isPreSelectable = isPreSelectable;

		this.hiddenLayers = undefined;
		this.parts = undefined;
	}

}

export class AvatarSetType
{

	constructor(type, paletteId)
	{
		this.type = type;
		this.paletteId = paletteId;
		this.sets = [];
	}

	getSet(setId)
	{
		return this.sets.find(set => set.id === setId);
	}

}

export function getUsedAvatarLibraries(avatar)
{
	const libraries = [];

	avatar.partDefinitions.forEach(partDefinition =>
	{
		let part = partDefinition.parts[0];
		let library = avatarConfig.figuremap.querySelector(`part[id="${part.id}"][type="${part.type}"]`);

		if (library === null || library.parentNode === null)
			return;

		library = library.parentNode;
		libraries.push(library.getAttribute("id").toLowerCase());
	});

	return libraries.unique();
}
