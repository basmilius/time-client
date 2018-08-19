import { Manager } from "../../core/manager/manager.js";
import { InterfaceContainer, interfaceResources } from "./interface.js";
import { application } from "../../bootstrapper.js";

let localInterface;

function initInterface()
{
	localInterface = new InterfaceContainer();

	application.display.stage.addChild(localInterface);
}

export class InterfaceManager extends Manager
{

	get interface()
	{
		return localInterface;
	}

	constructor()
	{
		super();

		application.once("application-loading-done", () => initInterface());
	}

	async initialize()
	{
		await super.initialize();

		this.loader.add(interfaceResources.bottomBar.background);
		this.loader.add(interfaceResources.bottomBar.catalogue);
		this.loader.add(interfaceResources.bottomBar.chat);
		this.loader.add(interfaceResources.bottomBar.chatMessages);
		this.loader.add(interfaceResources.bottomBar.friends);
		this.loader.add(interfaceResources.bottomBar.friendsInvited);
		this.loader.add(interfaceResources.bottomBar.help);
		this.loader.add(interfaceResources.bottomBar.inventory);
		this.loader.add(interfaceResources.bottomBar.navigator);
		this.loader.add(interfaceResources.chatBubble.left);
		this.loader.add(interfaceResources.chatBubble.middle);
		this.loader.add(interfaceResources.chatBubble.right);
	}

}
