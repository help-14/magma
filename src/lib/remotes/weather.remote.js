// @ts-nocheck
import { query } from '$app/server';
import { env } from '$env/dynamic/private';
import * as v from 'valibot';

export const getWeather = query(
	v.object({
		latitude: v.number(),
		longitude: v.number()
	}),
	async ({ latitude, longitude }) => {
		if (!env.WEATHER_API) {
			return {
				name: 'Home',
				weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
				main: {
					temp: 298.15,
					feels_like: 298.15,
					temp_min: 296.15,
					temp_max: 300.15,
					humidity: 70
				},
				visibility: 10000,
				wind: { speed: 2.0, deg: 180 },
				sys: { country: 'US', sunrise: 0, sunset: 0 }
			};
		}

		const url = new URL('https://api.openweathermap.org/data/2.5/weather');
		url.searchParams.set('lat', String(latitude));
		url.searchParams.set('lon', String(longitude));
		url.searchParams.set('appid', env.WEATHER_API);

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Weather request failed.');
		}
		return response.json();
	}
);
