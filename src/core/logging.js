const debugMode = true;

export class Logger
{

	static debug(...data)
	{
		if (!debugMode)
			return;

		console.log("[D]", ...data);
	}

	static error(...data)
	{
		console.error("[E]", ...data);
	}

}
