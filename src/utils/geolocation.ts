export type GeolocationData = {
	latitude: number;
	longitude: number;
};

export function getGeolocation() {
	return new Promise<GeolocationData>((resolve, reject) =>
		window.navigator.geolocation.getCurrentPosition(
			(location) =>
				resolve({
					latitude: Number(location.coords.latitude.toFixed(2)),
					longitude: Number(location.coords.longitude.toFixed(2)),
				}),
			(err) => reject(err)
		)
	);
}
