/**
 * A small utility function to broadcast custom events for Google Analytics
 * @param {String} event The unique string for the event
 */
export function fireEvent(event = "") {
	if (!event || !window) return;

	// Make sure we have someplace to put this.
	window.dataLayer = window.dataLayer || [];

	// window.dataLayer.push({ event });

	window.dataLayer.push({ event: event });

	if (window.location.hostname.includes("localhost")) console.log(event);
}
