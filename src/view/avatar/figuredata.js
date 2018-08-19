import { AvatarColor, AvatarPart, AvatarSet, AvatarSetType } from "./shared.js";

export function parseFiguredata(data)
{
	const colors = [];
	const settypes = [];

	data.querySelectorAll("colors palette").forEach(palette =>
	{
		const paletteId = parseInt(palette.getAttribute("id"));

		palette.querySelectorAll("color").forEach(color =>
		{
			colors.push(new AvatarColor(
				paletteId,
				parseInt(color.getAttribute("id")),
				parseInt(color.getAttribute("index")),
				color.getAttribute("club") !== "0",
				color.getAttribute("selectable") === "1",
				color.textContent
			));
		});
	});

	data.querySelectorAll("sets settype").forEach(settype =>
	{
		const stDef = new AvatarSetType(settype.getAttribute("type"), parseInt(settype.getAttribute("paletteid")));

		settype.querySelectorAll("set").forEach(set =>
		{
			const sDef = new AvatarSet(
				parseInt(set.getAttribute("id")),
				set.getAttribute("gender"),
				set.getAttribute("club") !== "0",
				set.getAttribute("colorable") !== "0",
				set.getAttribute("selectable") !== "0",
				set.getAttribute("preselectable") !== "0"
			);

			set.querySelectorAll("hiddenlayers layer").forEach(layer =>
			{
				if (sDef.hiddenLayers === undefined)
					sDef.hiddenLayers = [];

				sDef.hiddenLayers.push(layer.getAttribute("parttype"));
			});

			set.querySelectorAll("part").forEach(part =>
			{
				if (sDef.parts === undefined)
					sDef.parts = [];

				sDef.parts.push(new AvatarPart(
					parseInt(part.getAttribute("id")),
					part.getAttribute("type"),
					parseInt(part.getAttribute("index")),
					part.getAttribute("colorable") !== "0",
					parseInt(part.getAttribute("colorindex"))
				));
			});

			stDef.sets.push(sDef);
		});

		settypes.push(stDef);
	});

	return new AvatarFigureData(colors, settypes);
}

class AvatarFigureData
{

	constructor(colors, settypes)
	{
		this.colors = colors;
		this.settypes = settypes;
	}

	getSetType(settype)
	{
		return this.settypes.find(s => s.type === settype);
	}

}
