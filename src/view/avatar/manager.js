import { initializeAvatarRenderer, loadAvatarClothingConfig, loadAvatarClothingLibrary } from "./shared.js";
import { Manager } from "../../core/manager/manager.js";
import { Avatar } from "./avatar.js";
import { application } from "../../bootstrapper.js";

export const avatarResources = {
	poof: {
		"1_1": "./resource/image/avatar/poof/1-1.png",
		"1_2": "./resource/image/avatar/poof/1-2.png",
		"1_3": "./resource/image/avatar/poof/1-3.png",
		"1_4": "./resource/image/avatar/poof/1-4.png",
		"2_1": "./resource/image/avatar/poof/2-1.png",
		"2_2": "./resource/image/avatar/poof/2-2.png",
		"2_3": "./resource/image/avatar/poof/2-3.png",
		"2_4": "./resource/image/avatar/poof/2-4.png",
		"3_1": "./resource/image/avatar/poof/3-1.png",
		"3_2": "./resource/image/avatar/poof/3-2.png",
		"3_3": "./resource/image/avatar/poof/3-3.png",
		"3_4": "./resource/image/avatar/poof/3-4.png",
		"4_1": "./resource/image/avatar/poof/4-1.png",
		"4_2": "./resource/image/avatar/poof/4-2.png",
		"4_3": "./resource/image/avatar/poof/4-3.png",
		"4_4": "./resource/image/avatar/poof/4-4.png"
	}
};

export class AvatarManager extends Manager
{

	constructor()
	{
		super();

		this.avatars = [];
		this.lastUpdate = 0;

		application.once("application-loading-done", () => this.initializeRenderer());
	}

	async initialize()
	{
		await super.initialize();

		await loadAvatarClothingConfig("actions", this.loader);
		await loadAvatarClothingConfig("animations", this.loader);
		await loadAvatarClothingConfig("draworder", this.loader);
		await loadAvatarClothingConfig("effectmap", this.loader);
		await loadAvatarClothingConfig("figuredata", this.loader);
		await loadAvatarClothingConfig("figuremap", this.loader);
		await loadAvatarClothingConfig("geometry", this.loader);
		await loadAvatarClothingConfig("offsets", this.loader);
		await loadAvatarClothingConfig("partsets", this.loader);

		await loadAvatarClothingLibrary("hh_human_body", this.loader);
		await loadAvatarClothingLibrary("hh_human_face", this.loader);
		await loadAvatarClothingLibrary("hh_human_item", this.loader);
		await loadAvatarClothingLibrary("hh_human_shirt", this.loader);

		avatarResources.poof.forEach(image => this.loader.add(image));
	}

	initializeRenderer()
	{
		initializeAvatarRenderer();

		application.display.on("tick", () => this.onGameTick());
	}

	newAvatar(...options)
	{
		const avatar = new Avatar(...options);

		this.avatars.push(avatar);

		return avatar;
	}

	removeAvatar(avatar)
	{
		this.avatars = this.avatars.filter(a => a.id !== avatar.id);
	}

	onGameTick()
	{
		if (this.lastUpdate === -1 || (application.ticker.lastTime - this.lastUpdate) > 90)
		{
			this.lastUpdate = application.ticker.lastTime;

			this.avatars
				.filter(avatar => avatar.needsUpdate)
				.forEach(avatar => avatar.update());
		}
	}

}
