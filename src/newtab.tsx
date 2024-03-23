import { useStorage } from '@plasmohq/storage/hook';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { SettingsIcon } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
	GEOLOCATION_KEY,
	TEMPERATURE_UNIT_KEY,
	WEATHER_ENABLED_KEY,
} from './constants';
import './styles.css';
import { getGeolocation, type GeolocationData } from './utils/geolocation';
import { useWeatherCondition, type TemperatureUnit } from './utils/weather';

const timeFormatter = Intl.DateTimeFormat([], {
	hour: '2-digit',
	minute: '2-digit',
});

const dateFormatter = Intl.DateTimeFormat([], {
	day: 'numeric',
	month: 'short',
	weekday: 'long',
});

function Time() {
	const [dateTime, setDateTime] = useState(() => new Date());
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		intervalRef.current = setInterval(() => {
			setDateTime(new Date());
		}, 1000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	return (
		<>
			<h1 className="text-6xl font-bold">{timeFormatter.format(dateTime)}</h1>
			<h2 className="text-2xl font-semibold">
				{dateFormatter.format(dateTime)}
			</h2>
		</>
	);
}

function Weather() {
	const weatherCondition = useWeatherCondition();
	const [temperatureUnit] = useStorage<TemperatureUnit>(TEMPERATURE_UNIT_KEY);

	if (!weatherCondition) {
		return null;
	}

	const temperature = (
		temperatureUnit === 'fahrenheit'
			? (weatherCondition.temperature * 9) / 5 + 32
			: weatherCondition.temperature
	).toFixed();
	const unit = temperatureUnit === 'fahrenheit' ? 'F' : 'C';
	const WeatherIcon = weatherCondition.icon;

	return (
		<div className="flex items-center gap-1.5">
			<WeatherIcon />
			<span className="leading-none">
				{temperature}°{unit}
			</span>
		</div>
	);
}

function Option({
	label,
	description,
	children,
}: {
	label: string;
	description?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="flex items-center justify-between">
			<div>
				<p className="font-semibold">{label}</p>
				{description && (
					<p className="text-sm/tight text-neutral-600 dark:text-neutral-400">
						{description}
					</p>
				)}
			</div>
			{children}
		</div>
	);
}

function Settings() {
	const [weatherEnabled, setWeatherEnabled] = useStorage<boolean>(
		WEATHER_ENABLED_KEY,
		(weatherEnabled) =>
			typeof weatherEnabled === 'undefined' ? false : weatherEnabled
	);
	const [geolocation, setGeolocation] = useStorage<GeolocationData | null>(
		GEOLOCATION_KEY,
		(location) => (typeof location === 'undefined' ? null : location)
	);
	const [temperatureUnit, setTemperatureUnit] = useStorage<TemperatureUnit>(
		TEMPERATURE_UNIT_KEY,
		(temperatureUnit) =>
			typeof temperatureUnit === 'undefined' ? 'celsius' : temperatureUnit
	);

	const [revealGeolocation, setRevealGeolocation] = useState(false);

	return (
		<PopoverPrimitive.Root>
			<PopoverPrimitive.Trigger
				className="text-black focus:outline-none data-[state=open]:text-black/80 dark:text-white dark:data-[state=open]:text-white/80"
				aria-label="Settings"
			>
				<SettingsIcon
					className="text-black transition-colors hover:text-black/80 dark:text-white dark:hover:text-white/80"
					width={18}
					height={18}
				/>
			</PopoverPrimitive.Trigger>

			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Content
					className="w-[22rem] space-y-2.5 rounded-md bg-neutral-100 p-3.5 text-neutral-900 shadow-md focus:outline-none dark:bg-neutral-900 dark:text-neutral-100 dark:shadow-none"
					align="start"
					side="top"
					sideOffset={10}
				>
					<Option
						label="Show Weather"
						description={
							<>
								Provided by{' '}
								<a
									className="font-medium text-neutral-800 hover:underline dark:text-neutral-200"
									href="https://open-meteo.com"
								>
									Open-Meteo.com
								</a>
							</>
						}
					>
						<input
							className="focus:outline-none"
							type="checkbox"
							checked={weatherEnabled}
							onChange={() => {
								setWeatherEnabled((weatherEnabled) => !weatherEnabled);
							}}
						/>
					</Option>

					<Option
						label="Current Location"
						description={
							geolocation ? (
								<>
									Location is set
									{revealGeolocation
										? ` to ${geolocation.latitude}, ${geolocation.longitude}.`
										: '.'}{' '}
									<button
										className="font-medium text-neutral-800 hover:underline dark:text-neutral-200"
										aria-label="Reveal location coords"
										onClick={() => {
											setRevealGeolocation(
												(revealGeolocation) => !revealGeolocation
											);
										}}
									>
										{revealGeolocation ? 'Hide' : 'Reveal'}
									</button>
								</>
							) : (
								'No location set.'
							)
						}
					>
						<button
							className="block w-20 rounded bg-neutral-50 py-1 text-sm font-semibold text-neutral-950 focus:outline-none dark:bg-neutral-950 dark:text-neutral-50"
							onClick={async () => {
								const geolocation = await getGeolocation();
								setGeolocation(geolocation);
							}}
						>
							Find Me
						</button>
					</Option>

					<Option label="Temperature Unit">
						<select
							className="appearance-none rounded bg-neutral-50 px-2 py-1 text-sm font-semibold text-neutral-950 hover:cursor-pointer focus:outline-none dark:bg-neutral-950 dark:text-neutral-50"
							value={temperatureUnit}
							onChange={(e) => {
								setTemperatureUnit(e.currentTarget.value as TemperatureUnit);
							}}
						>
							<option value="celsius">Celsius (°C)</option>
							<option value="fahrenheit">Fahrenheit (°F)</option>
						</select>
					</Option>
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	);
}

export default function NewTab() {
	const [weatherEnabled] = useStorage<boolean>(WEATHER_ENABLED_KEY);
	const [location] = useStorage<GeolocationData | null>(GEOLOCATION_KEY);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center">
			<Time />

			<div className="absolute bottom-6 flex w-full items-center justify-between px-6 font-semibold text-black/[55%] dark:text-white/[55%]">
				<Settings /> {weatherEnabled && location && <Weather />}
			</div>
		</main>
	);
}
