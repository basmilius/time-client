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
import { SceneryConfig } from "../view/room/scenery.js";

let generateFurnis = 0;
let generateHumans = 10;

let furnis = [];
let humans = [];

let controllingHuman = 0;

export function fakeGamePlay()
{
	const theRandomFigure = randomFigure();

	const avatarManager = application.getManager(AvatarManager);
	const roomManager = application.getManager(RoomManager);
	const hotelViewManager = application.getManager(HotelViewManager);
	const interfaceManager = application.getManager(InterfaceManager);

	hotelViewManager.hotelView.open();

	const nav = new NavigatorWindow();
	application.stage.addChild(nav);

	interfaceManager.interface.bottomBar.navigatorButton.on("pointertap", () =>
	{
		if (nav.opened)
			nav.close();
		else
			nav.open();
	});

	interfaceManager.interface.bottomBar.friendsButton.on("pointertap", () =>
	{
		if (hotelViewManager.hotelView.opened)
		{
			hotelViewManager.hotelView.close();

			setTimeout(() =>
			{
				roomManager.roomViewer.on("room-view-ready", () => roomManager.roomViewer.animateBuildingTiles());
				roomManager.roomViewer.on("tile-tap", evt => humans[controllingHuman].walkTo(evt.row, evt.column));
				roomManager.showRoomViewer(heightMaps[3], new SceneryConfig("default", "default", "default"));

				for (let i = 0; i < generateHumans; i++)
				{
					let human = avatarManager.newAvatar(randomFigure());
					let position = roomManager.roomViewer.getRandomTile();

					if (i === controllingHuman)
						position = roomManager.roomViewer.getDoorTile(true);

					human.direction = human.headDirection = position.direction || Math.floor(Math.random() * 8) % 8;
					human.addAction("Wave");

					humans.push(new RoomUser(roomManager.roomViewer, human, position.row, position.column));
					human.on("pointertap", () => human.figure = randomFigure());

					roomManager.roomViewer.addEntityToTile(human, position.row, position.column);
				}
			}, 300);
		}
		else
		{
			humans.forEach(human => roomManager.roomViewer.removeEntity(human.avatar));
			humans.forEach(human => avatarManager.removeAvatar(human.avatar));

			humans = undefined;
			humans = [];

			hotelViewManager.hotelView.open();
			roomManager.removeRoomViewer();
		}
	});

	interfaceManager.interface.bottomBar.meButton.figure = theRandomFigure;

	if (true === false)
	{
		for (let i = 0; i < generateFurnis; i++)
		{
			let furni = new Furni("throne");
			let position = roomManager.roomViewer.getRandomTile();

			furnis.push(furni);

			roomManager.roomViewer.addEntityToTile(furni, position.row, position.column);
		}
	}

	interfaceManager.interface.bottomBar.friendsButton.emit("pointertap");
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
