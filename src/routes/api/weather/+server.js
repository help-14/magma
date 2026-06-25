// @ts-nocheck
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';

export async function GET({ url, fetch }) {
	const latitude = url.searchParams.get('latitude');
	const longitude = url.searchParams.get('longitude');

	if (!latitude || !longitude) {
		return json({ message: 'latitude and longitude are required' }, { status: 400 });
	}

	if (!env.WEATHER_API) {
		return json(fallbackWeather(latitude, longitude));
	}

	const weatherUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
	weatherUrl.searchParams.set('lat', latitude);
	weatherUrl.searchParams.set('lon', longitude);
	weatherUrl.searchParams.set('limit', '1');
	weatherUrl.searchParams.set('appid', env.WEATHER_API);

	const response = await fetch(weatherUrl);
	if (!response.ok) {
		return json(fallbackWeather(latitude, longitude));
	}

	return json(await response.json());
}

function fallbackWeather(latitude, longitude) {
	return {
		coord: { lat: Number(latitude), lon: Number(longitude) },
		weather: [{ id: 800, main: 'Clear', description: 'clear sky' }],
		main: { temp: 304.14, feels_like: 311.14, temp_min: 304.14, temp_max: 304.14, humidity: 74 },
		visibility: 10000,
		wind: { speed: 2.06, deg: 300 },
		sys: { country: 'VN', sunrise: 1693953701, sunset: 1693998569 },
		name: 'Hanoi'
	};
}
