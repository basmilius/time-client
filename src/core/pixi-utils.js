export function getTextureFromRectangle(base, x, y, width, height)
{
	const texture = new PIXI.Texture(base);
	texture.frame = new PIXI.Rectangle(x, y, width, height);

	return texture;
}

export function setInteractive(target)
{
	target.interactive = true;
}

export function simpleDraggable(target)
{
	setInteractive(target);

	let simpleDraggableTarget = null;
	let data = null;
	let pos = null;

	target.on("pointerdown", function (evt)
	{
		data = evt.data;
		simpleDraggableTarget = target;
		pos = data.getLocalPosition(simpleDraggableTarget);

		if (typeof target.getDraggableRegion === "undefined")
			return;

		const {x, y, width, height} = target.getDraggableRegion();

		if (pos.x < x || pos.x > width || pos.y < y || pos.y > height)
		{
			data = null;
			pos = null;
			simpleDraggableTarget = null;
		}
	});

	target.on("pointerup", function ()
	{
		data = null;
		pos = null;
		simpleDraggableTarget = null;
	});

	target.on("pointermove", function ()
	{
		if (simpleDraggableTarget === null)
			return;

		const p = data.getLocalPosition(simpleDraggableTarget.parent);

		let newX = p.x - pos.x;
		let newY = p.y - pos.y;

		if (typeof target.getDraggingRegion !== "undefined")
		{
			const {x, y, width, height} = target.getDraggingRegion();
			const bounds = typeof target.getDraggableRegion !== "undefined" ? target.getDraggableRegion() : target;

			if (newX < x)
				newX = x;

			if ((newX + bounds.width) > width)
				newX = (width - bounds.width);

			if (newY < y)
				newY = y;

			if ((newY + bounds.height) > height)
				newY = (height - bounds.height);
		}

		simpleDraggableTarget.position.x = newX;
		simpleDraggableTarget.position.y = newY;
	});
}

export function withInstance(instance, callback)
{
	callback(instance);

	return instance;
}
