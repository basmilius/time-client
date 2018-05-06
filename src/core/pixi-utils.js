let simpleDraggableTarget = null;

export function simpleDraggable(target)
{
	target.interactive = true;

	target.on("mousedown", function ()
	{
		simpleDraggableTarget = target;
	});

	target.on("mouseup", function ()
	{
		simpleDraggableTarget = null;
	});

	target.on("mousemove", function(evt)
	{
		if (simpleDraggableTarget === null)
			return;

		simpleDraggableTarget.position.x += evt.data.originalEvent.movementX;
		simpleDraggableTarget.position.y += evt.data.originalEvent.movementY;
	});
}

export function withInstance(instance, callback)
{
	callback(instance);

	return instance;
}
