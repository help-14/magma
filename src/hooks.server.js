import { paraglideMiddleware } from '$lib/paraglide/server';

/** @type {import('@sveltejs/kit').Handle} */
const paraglideHandle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;
		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html.replace('%lang%', locale).replace('%dir%', 'ltr');
			}
		});
	});

export const handle = paraglideHandle;
