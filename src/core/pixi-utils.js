export function withInstance(instance, callback)
{
	callback(instance);

	return instance;
}
