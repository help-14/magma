import { getOverrideCssEtag, readOverrideCss } from '$lib/server/config.js';

export async function GET({ request }) {
	const css = await readOverrideCss();
	const etag = await getOverrideCssEtag();

	if (request.headers.get('if-none-match') === etag) {
		return new Response(null, { status: 304 });
	}

	return new Response(css, {
		headers: {
			'content-type': 'text/css; charset=utf-8',
			'cache-control': 'public, max-age=0, must-revalidate',
			'etag': etag
		}
	});
}
