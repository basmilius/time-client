
export function evaluateString(string, context = {})
{
	string = string.replace(new RegExp("\\${(.*?)}", "g"), (matches, contents) => findKey(contents, context));

	return string;
}

export function findKey(key, object, defaultValue = undefined)
{
	const keyParts = key.split(".");
	let current = object;

	for (const keyPart of keyParts)
	{
		if (current[keyPart] === undefined)
			return defaultValue;

		current = current[keyPart];
	}

	return current;
}
