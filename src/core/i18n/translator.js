export class Translator
{

	static translate(str, params = {})
	{
		params.forEach((value, key) => str = str.replace(new RegExp(`%${key}%`, "g"), value));

		return str;
	}

}
