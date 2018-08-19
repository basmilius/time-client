export function parseActions(data)
{
	let actions = [];

	data.querySelectorAll("action").forEach(action =>
	{
		let definition = new ActionDefinition(
			action.getAttribute("id"),
			action.getAttribute("state"),
			parseInt(action.getAttribute("precedence")),
			action.getAttribute("activepartset"),
			action.getAttribute("assetpartdefinition"),
			action.getAttribute("lay"),
			action.getAttribute("geometrytype"),
			action.getAttribute("main") === "1",
			action.getAttribute("isdefault") === "1",
			action.getAttribute("animation") === "1",
			action.getAttribute("startfromframezero") === "true",
			action.getAttribute("preventheadturn") === "true",
			(action.getAttribute("prevents") || "").split(",").filter(p => p !== "")
		);

		action.querySelectorAll("param").forEach(param =>
		{
			let id = param.getAttribute("id");
			let value = param.getAttribute("value");

			if (id === "default")
				definition.defaultParam = value;
			else
				definition.params[id] = value;
		});

		action.querySelectorAll("type").forEach(type =>
		{
			let typeDefinition = new ActionType(
				parseInt(type.getAttribute("id")),
				parseInt(type.getAttribute("value")),
				(type.getAttribute("prevents") || "").split(",").filter(p => p !== ""),
				type.getAttribute("preventheadturn") === "1",
				type.getAttribute("animated") === "1"
			);

			definition.types[typeDefinition.id] = typeDefinition;
		});

		actions.push(definition);
	});

	return actions;
}

export class ActionDefinition
{

	constructor(id, state, precedence, activePartSet, assetPartDefinition, lay, geometryType, main, isDefault, animation, startFromFrameZero, preventHeadTurn, prevents)
	{
		this.id = id;
		this.state = state;
		this.precedence = precedence;
		this.activePartSet = activePartSet;
		this.assetPartDefinition = assetPartDefinition;
		this.lay = lay;
		this.geometryType = geometryType;
		this.main = main;
		this.isDefault = isDefault;
		this.animation = animation;
		this.startFromFrameZero = startFromFrameZero;
		this.preventHeadTurn = preventHeadTurn;
		this.prevents = prevents;

		this.defaultParam = null;

		this.params = {};
		this.types = {};
	}

}

export class ActionType
{

	constructor(id, value, prevents, preventHeadTurn, animated)
	{
		this.id = id;
		this.value = isNaN(value) ? id : value;
		this.prevents = prevents;
		this.preventHeadTurn = preventHeadTurn;
		this.animated = animated;
	}

}
