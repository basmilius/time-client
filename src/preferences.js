export const deliveryRoot = "https://cdn.mili.us/time";
export const initialLoadingDelay = 0;

export function getDeliveryUrl(path)
{
	return deliveryRoot + path;
}

export function getDeliveryAssetsUrl(path)
{
	return getDeliveryUrl("/assets" + path);
}
