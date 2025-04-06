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
        // Complete this
    }

    // private async getDistance(lat1: string, lon1: string, lat2: string, lon2: string) {
    //     // Defining this function inside of this private method means it's
    //     // not accessible outside of it, which is perfect for encapsulation.
    //     const toRadians = (degrees: string) => {
    //         return degrees * (Math.PI / 180);
    //     }

    //     // Radius of the Earth in KM
    //     const R = 6371;

    //     // Convert Lat and Longs to Radians
    //     const dLat = toRadians(lat2 - lat1);
    //     const dLon = toRadians(lon2 - lon1);

    //     // Haversine Formula to calculate the distance between two locations
    //     // on a sphere.
    //     const a =
    //         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    //         Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    //         Math.sin(dLon / 2) * Math.sin(dLon / 2);

    //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    //     // convert and return distance in KM
    //     return R * c;
    // }
}

export default new AddressService();