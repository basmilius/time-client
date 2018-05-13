let simpleDraggableTarget = null;

export function setInteractive(target)
{
	target.interactive = true;
}

export function simpleDraggable(target)
{
	setInteractive(target);

	let data = null;
	let pos = null;

	target.on("pointerdown", function (evt)
	{
		data = evt.data;
		simpleDraggableTarget = target;
		pos = data.getLocalPosition(simpleDraggableTarget);
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

		simpleDraggableTarget.position.x = p.x - pos.x;
		simpleDraggableTarget.position.y = p.y - pos.y;
	});
}

export function withInstance(instance, callback)
{
	callback(instance);

	return instance;
}
