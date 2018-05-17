export const walkTo = async (rv, avatar, cr, cc, row, column) =>
{
	let distance = Math.max(Math.abs(cr - row), Math.abs(cc - column));
	let pos = rv.getEntityPosition(avatar, row, column, 2);

	avatar.addAction("Move");

	let direction = 0;

	if (row < cr && column > cc)
		direction = 1;
	else if (row === cr && column > cc)
		direction = 2;
	else if (row > cr && column > cc)
		direction = 3;
	else if (row > cr && column === cc)
		direction = 4;
	else if (row > cr && column < cc)
		direction = 5;
	else if (row === cr && column < cc)
		direction = 6;
	else if (row < cr && column < cc)
		direction = 7;

	avatar.direction = avatar.headDirection = direction;
	avatar.z = pos.z;//Math.max(rv.getZ(row, column, 5), rv.getZ(cr, cc, 5));

	let animationDuration = 360 * distance;
	let anim = anime({
		targets: avatar,
		duration: animationDuration,
		x: pos.x,
		y: pos.y,
		easing: "linear"
	});

	// anim.update = () => rv.centerEntity(avatar, false);

	await anim.finished;

	cr = row;
	cc = column;

	avatar.z = pos.z;
	avatar.removeAction("Move");
	// rv.centerEntity(avatar);

	return {cr, cc, avatar};
};
