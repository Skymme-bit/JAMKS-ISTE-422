import loggerService from "./logger.service";

class AddressService {
    private static fetchUrl = 'https://ischool.gccis.rit.edu/addresses/';

    constructor() { }

    public async count(addressRequest?: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            if (!addressRequest.city && !addressRequest.zip) {
                return reject(new Error('Missing required search field. Please provide at least a city or zip.'));
            }

            this.request(addressRequest)
                .then((response) => {
                    if (!Array.isArray(response)) {
                        return reject(new Error('Unexpected response from address API'));
                    }

                    if (response.length === 0) {
                        return resolve({
                            count: 0,
                            note: 'No results found for this query.'
                        });
                    }

                    resolve({
                        count: response.length
                    });
                })
                .catch((err) => {
                    reject(new Error('Failed to fetch from address API'));
                });
        });
    }

    public async request(addressRequest?: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            fetch(AddressService.fetchUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addressRequest)
            })
                .then(async (response) => {
                    resolve(await response.json());
                })
                .catch((err) => {
                    loggerService.error({ path: "/address/request", message: `${(err as Error).message}` }).flush();
                    reject(err);
                });
        });
    }

    public async distance(addressRequest?: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const {
                lat1, lon1,
                lat2, lon2,
                unit
            } = addressRequest || {};

            if (!lat1 || !lon1 || !lat2 || !lon2) {
                return reject(new Error('Missing coordinates. Required: lat1, lon1, lat2, lon2.'));
            }

            const toRadians = (degrees: number) => degrees * (Math.PI / 180);

            const R = 6371;
            const dLat = toRadians(parseFloat(lat2) - parseFloat(lat1));
            const dLon = toRadians(parseFloat(lon2) - parseFloat(lon1));

            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(toRadians(parseFloat(lat1))) * Math.cos(toRadians(parseFloat(lat2))) *
                Math.sin(dLon / 2) ** 2;

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distanceInKm = R * c;
            const distanceInMi = distanceInKm * 0.621371;

            let result: any = {
                km: parseFloat(distanceInKm.toFixed(2)),
                mi: parseFloat(distanceInMi.toFixed(2))
            };

            if (unit === 'km') {
                result = { km: result.km };
            } else if (unit === 'mi') {
                result = { mi: result.mi };
            }

            resolve({ distance: result });
        });
    }

    public async cityLookup(addressRequest?: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            fetch(AddressService.fetchUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addressRequest)
            })
                .then(async (response) => {
                    if (!response.ok) {
                        return reject(new Error("Failed to fetch from address API"));
                    }
    
                    const data = await response.json();
                    if (!Array.isArray(data) || data.length === 0 || !data[0].city) {
                        return reject(new Error("City not found for given zip code."));
                    }
    
                    resolve(data[0].city);
                })
                .catch((err) => {
                    loggerService.error({ path: "/address/city", message: `${(err as Error).message}` }).flush();
                    reject(err);
                });
        });
    }
    
}

export default new AddressService();