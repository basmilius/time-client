/**
 * Applies styles to an element.
 *
 * @param {HTMLElement} element
 * @param {Object} styles
 */
export function applyStyles(element, styles)
{
	styles.forEach((value, key) => element.style.setProperty(key, value));
}

/**
 * Creates an element.
 *
 * @param {String} tagName
 * @param {Function} callback
 *
 * @returns {HTMLElement}
 */
export function createElement(tagName, callback = null)
{
	const element = document.createElement(tagName);

	if (callback !== null)
		callback(element);

	return element;
}

/**
 * Removes contents.
 *
 * @param {HTMLElement} element
 */
export function removeHtml(element)
{
	element.innerHTML = "";
}
