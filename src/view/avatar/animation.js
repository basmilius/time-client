import { AvatarBodyPart } from "./shared.js";

export function parseAnimations(data)
{
	let animations = [];

	data.querySelectorAll("action").forEach(action =>
	{
		let definition = new AnimationActionDefinition(action.getAttribute("id"));

		action.querySelectorAll("offsets frame").forEach(frame =>
		{
			const number = parseInt(frame.getAttribute("id"));
			let fDef = new AnimationActionOffsetFrameDefinition(number);

			frame.querySelectorAll("directions direction").forEach(direction =>
			{
				const dir = parseInt(direction.getAttribute("id"));
				let dDef = new AnimationActionOffsetFrameDirectionDefinition(dir);

				direction.querySelectorAll("bodypart").forEach(bodypart =>
				{
					const bp = new AvatarBodyPart(bodypart.getAttribute("id"));

					bp.dx = parseInt(bodypart.getAttribute("dx"));
					bp.dy = parseInt(bodypart.getAttribute("dy"));

					dDef.bodyparts.push(bp);
				});

				fDef.directions.push(dDef);
			});

			definition.offsets.push(fDef);
		});

		action.querySelectorAll("part").forEach(part =>
		{
			let pDef = new AnimationActionPartDefinition(part.getAttribute("set-type"));

			part.querySelectorAll("frame").forEach(frame =>
			{
				for (let i = 0; i < parseInt(frame.getAttribute("repeats") || 1); i++)
					pDef.frames.push(new AnimationActionPartFrameDefinition(parseInt(frame.getAttribute("number")), frame.getAttribute("assetpartdefinition")));
			});

			definition.parts.push(pDef);
		});

		animations.push(definition);
	});

	return animations;
}

export class AnimationActionDefinition
{

	constructor(id)
	{
		this.id = id;
		this.offsets = [];
		this.parts = [];
	}

}

export class AnimationActionOffsetFrameDefinition
{

	constructor(number)
	{
		this.number = number;
		this.directions = [];
	}

}

export class AnimationActionOffsetFrameDirectionDefinition
{

	constructor(direction)
	{
		this.direction = direction;
		this.bodyparts = [];
	}

}

export class AnimationActionPartDefinition
{

	constructor(setType)
	{
		this.setType = setType;
		this.frames = [];
	}

}

export class AnimationActionPartFrameDefinition
{

	constructor(number, partDefinition)
	{
		this.number = number;
		this.partDefinition = partDefinition;
	}

}
