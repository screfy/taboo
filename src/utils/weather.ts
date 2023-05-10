import { Storage } from '@plasmohq/storage';
import { useStorage } from '@plasmohq/storage/hook';
import {
	CloudDrizzle,
	CloudFog,
	CloudLightning,
	CloudRain,
	CloudSnow,
	CloudSun,
	Snowflake,
	Sun,
	type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
	GEOLOCATION_KEY,
	WEATHER_DATA_KEY,
	WEATHER_DATA_TTL,
} from '../constants';
import type { GeolocationData } from './geolocation';

export type TemperatureUnit = 'celsius' | 'fahrenheit';

type WeatherData = {
	timestamp: number;
	conditions: {
		time: number;
		temperature: number;
		weatherCode: number;
	}[];
};

type OpenMeteoResponse = {
	hourly: {
		time: number[];
		temperature_2m: number[];
		weathercode: number[];
	};
};

// NOTE: We do not want to store weather data in synced storage so we are
// creating this local because the `useStorage` hook from Plasmo is using synced
// storage by default:
const cache = new Storage({ area: 'local' });

// See: https://open-meteo.com/en/docs#weathervariables
// TODO: Show icon with sun or moon based on time:
const weatherIconMap: Record<number, LucideIcon> = {
	0: Sun,
	1: Sun,
	2: CloudSun,
	3: CloudSun,
	45: CloudFog,
	48: CloudFog,
	51: CloudDrizzle,
	53: CloudDrizzle,
	55: CloudDrizzle,
	56: CloudDrizzle,
	57: CloudDrizzle,
	61: CloudRain,
	63: CloudRain,
	65: CloudRain,
	66: CloudRain,
	67: CloudRain,
	71: CloudSnow,
	73: Snowflake,
	75: Snowflake,
	77: Snowflake,
	80: CloudDrizzle,
	81: CloudDrizzle,
	82: CloudDrizzle,
	85: CloudSnow,
	86: CloudSnow,
	95: CloudLightning,
	96: CloudLightning,
	99: CloudLightning,
};

export function useWeatherCondition() {
	const [geolocation] = useStorage<GeolocationData | null>(GEOLOCATION_KEY);
	const [condition, setCondition] = useState<{
		temperature: number;
		icon: LucideIcon;
	} | null>(null);

	useEffect(() => {
		async function loadWeatherData() {
			if (!geolocation) {
				return;
			}

			let data = await cache.get<WeatherData | null>(WEATHER_DATA_KEY);

			if (!data || data.timestamp <= Date.now()) {
				const res = (await fetch(
					`https://api.open-meteo.com/v1/forecast?latitude=${geolocation.latitude}&longitude=${geolocation.longitude}&hourly=temperature_2m,weathercode&timeformat=unixtime`
				).then((res) => res.json())) as OpenMeteoResponse;

				data = {
					// Cache weather data for 2 hours:
					timestamp: Date.now() + WEATHER_DATA_TTL,
					conditions: res.hourly.time.map((time, i) => ({
						time: time * 1_000,
						temperature: res.hourly.temperature_2m[i],
						weatherCode: res.hourly.weathercode[i],
					})),
				};

				cache.set(WEATHER_DATA_KEY, data);
			}

			const currentCondition =
				[...data.conditions]
					.reverse()
					.find((condition) => Date.now() >= condition.time) ?? null;

			if (currentCondition) {
				setCondition({
					temperature: currentCondition.temperature,
					icon: weatherIconMap[currentCondition.weatherCode],
				});
			}
		}

		loadWeatherData();
	}, [geolocation]);

	return condition;
}
