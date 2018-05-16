const figures = [
	"hr-3163-61.cc-3075-73.ca-3175-92.hd-195-3.ch-3030-92.sh-3016-64.lg-3116-110-92",
	"lg-3116-110-92.hr-3163-61.sh-3275-92.hd-195-4.ha-3268-1415-92.ch-255-92",
	"hr-3012-44.hd-605-2.ch-3439-92-66.lg-3006-100-92.sh-725-92.he-3329-1412-100.ca-3414-1412.cc-3542-97-97",
	"hr-3012-1407.hd-600-3.ch-3013-93.lg-3006-110-1408.sh-725-92.he-1603-1328.cc-3390-110-106",
	"hr-834-34.hd-600-2.ch-3013-1330.lg-710-92.sh-730-1408.ha-3620.he-3579.ca-1815-1324",
	"hr-3012-1405.hd-600-1390.ch-3636-1324.lg-3418-110.sh-725-92.ea-3169-110.cc-3289-110",
	"hr-3012-61.hd-600-1370.ch-3399-92-1409.lg-3006-1409-92.sh-3064-89.ha-3586"
];

export const randomFigure = () => figures[Math.floor(Math.random() * figures.length)];

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
