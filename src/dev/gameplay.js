import { application } from "../bootstrapper.js";
import { AvatarManager } from "../view/avatar/manager.js";
import { Furni } from "../view/furni/furni.js";
import { RoomManager } from "../view/room/manager.js";
import { getDistance, getHeading } from "../view/room/shared.js";
import { randomFigure } from "./avatars.js";
import { heightMaps } from "./rooms.js";
import { NavigatorWindow } from "../ui/navigator/window.js";
import { InterfaceManager } from "../ui/interface/manager.js";
import { HotelViewManager } from "../view/hotel-view.js";

let generateFurnis = 0;
let generateHumans = 1;

let furnis = [];
let humans = [];

let controllingHuman = 0;

export function fakeGamePlay()
{
	application.getManager(HotelViewManager).hotelView.open();

	const nav = new NavigatorWindow();
	application.stage.addChild(nav);

	application.getManager(InterfaceManager).interface.bottomBar.navigatorButton.on("click", () =>
	{
		if (nav.opened)
			nav.close();
		else
			nav.open();
	});

	application.getManager(InterfaceManager).interface.bottomBar.friendsButton.on("click", () =>
	{
		const roomManager = application.getManager(RoomManager);

		if (application.getManager(HotelViewManager).hotelView.opened)
		{
			application.getManager(HotelViewManager).hotelView.close();

			setTimeout(() =>
			{
				roomManager.roomViewer.on("room-view-ready", () => roomManager.roomViewer.animateBuildingTiles());
				roomManager.showRoomViewer(heightMaps[Math.floor(Math.random() * heightMaps.length)]);
			}, 300);
		}
		else
		{
			application.getManager(HotelViewManager).hotelView.open();

			roomManager.removeRoomViewer();
		}
	});

	application.getManager(InterfaceManager).interface.bottomBar.friendsButton.emit("click");

	if (true === false)
	{
		const avatarManager = application.getManager(AvatarManager);
		const roomManager = application.getManager(RoomManager);

		roomManager.showRoomViewer(heightMaps[5]);

		for (let i = 0; i < generateFurnis; i++)
		{
			let furni = new Furni("throne");
			let position = roomManager.roomViewer.getRandomTile();

			furnis.push(furni);

			roomManager.roomViewer.addEntityToTile(furni, position.row, position.column);
		}

		for (let i = 0; i < generateHumans; i++)
		{
			let human = avatarManager.newAvatar(randomFigure());
			let position = roomManager.roomViewer.getRandomTile();

			human.direction = human.headDirection = Math.floor(Math.random() * 8) % 8;

			humans.push(new RoomUser(roomManager.roomViewer, human, position.row, position.column));

			roomManager.roomViewer.addEntityToTile(human, position.row, position.column);
		}

		roomManager.roomViewer.on("tile-click", evt => humans[controllingHuman].walkTo(evt.row, evt.column));
	}
}

class RoomUser
{

	get position()
	{
		return {row: this.row, column: this.column};
	}

	constructor(roomViewer, avatar, row, column)
	{
		this.roomViewer = roomViewer;
		this.avatar = avatar;
		this.row = row;
		this.column = column;
	}

	moveTo(row, column, heading = undefined)
	{
		let distance = getDistance(this.position, {row, column});
		heading = heading !== undefined ? heading : getHeading(this.position, {row, column}) || this.avatar.direction;

		const {x, y, z} = this.roomViewer.getEntityPosition(this.avatar, row, column);

		if (distance > 1)
		{
			this.teleportTo(row, column);
			return;
		}

		this.avatar.direction = this.avatar.headDirection = heading;

		let animationDuration = 360;
		let anim = anime({
			targets: this.avatar,
			duration: animationDuration,
			x,
			y,
			easing: "linear"
		});

		anim.update = a =>
		{
			if (a.currentTime < 180)
				return;

			anim.update = undefined;

			this.avatar.z = z;
			this.roomViewer.updateLayerOrder();
		};
	}

	teleportTo(row, column)
	{
		const {x, y, z} = this.roomViewer.getEntityPosition(this.avatar, row, column);

		this.avatar.position.x = x;
		this.avatar.position.y = y;
		this.avatar.z = z;

		this.roomViewer.updateLayerOrder();
	}

	walkTo(row, column)
	{
		let current = this.position;

		if (current.row === row && current.column === column)
			return;

		this.avatar.addAction("Move");

		const walk = () =>
		{
			let nextRow = current.row > row ? --current.row : current.row < row ? ++current.row : row;
			let nextColumn = current.column > column ? --current.column : current.column < column ? ++current.column : column;

			let heading = getHeading(this.position, {row: nextRow, column: nextColumn});

			this.column = nextColumn;
			this.row = nextRow;

			this.moveTo(nextRow, nextColumn, heading);

			setTimeout(() =>
			{
				if (!(current.row === row && current.column === column))
					walk();
				else
					this.avatar.removeAction("Move");
			}, 360);
		};

		walk();
	}

}
