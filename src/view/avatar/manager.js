import { application } from "../../bootstrapper.js";
import { Manager } from "../../core/manager/manager.js";
import { AvatarImage } from "./avatar.js";
import { avatarConfig } from "./shared.js";

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

		application.once("application-loading-done", () => application.ticker.add(() => this.onGameTick()));
	}

	async initialize()
	{
		await super.initialize();

		avatarConfig.loadConfig("actions", this.loader);
		avatarConfig.loadConfig("animations", this.loader);
		avatarConfig.loadConfig("draworder", this.loader);
		avatarConfig.loadConfig("effectmap", this.loader);
		avatarConfig.loadConfig("figuredata", this.loader);
		avatarConfig.loadConfig("figuremap", this.loader);
		avatarConfig.loadConfig("geometry", this.loader);
		avatarConfig.loadConfig("offsets", this.loader);
		avatarConfig.loadConfig("partsets", this.loader);

		avatarConfig.loadLibrary("hh_human_acc_chest", this.loader);
		avatarConfig.loadLibrary("hh_human_acc_eye", this.loader);
		avatarConfig.loadLibrary("hh_human_acc_face", this.loader);
		avatarConfig.loadLibrary("hh_human_acc_head", this.loader);
		avatarConfig.loadLibrary("hh_human_acc_waist", this.loader);
		avatarConfig.loadLibrary("hh_human_body", this.loader);
		avatarConfig.loadLibrary("hh_human_face", this.loader);
		avatarConfig.loadLibrary("hh_human_hair", this.loader);
		avatarConfig.loadLibrary("hh_human_hats", this.loader);
		avatarConfig.loadLibrary("hh_human_item", this.loader);
		avatarConfig.loadLibrary("hh_human_leg", this.loader);
		avatarConfig.loadLibrary("hh_human_shirt", this.loader);
		avatarConfig.loadLibrary("hh_human_shoe", this.loader);

		avatarResources.poof.forEach(image => this.loader.add(image));
	}

	newAvatar(...options)
	{
		const avatar = new AvatarImage(...options);

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

			this.avatars.forEach(avatar => avatar.build());
		}
	}

}
