import loggerService from "./logger.service";

/**
 * AddressService class to interact with address API
 * Provides functionality to request addresses, calculate distances, and lookup cities.
 */
class AddressService {
    private static fetchUrl = 'https://ischool.gccis.rit.edu/addresses/';
    private cityCache: Record<string, string> = {}; // In-memory cache for city lookups

    constructor() {}

    /**
     * Count the number of addresses matching the provided criteria
     * @param addressRequest - Request body containing city or zip
     * @returns Object with count (and note if no results)
     */
    public async count(addressRequest?: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            loggerService.info({ path: "/address/count", message: "Received count request" }).flush();

            if (!addressRequest.city && !addressRequest.zip) {
                // If neither city nor zip provided, reject early
                loggerService.warning({ path: "/address/count", message: "Missing city or zip" }).flush();
                return reject(new Error('Missing required search field. Please provide at least a city or zip.'));
            }

            // Call request() internally
            this.request(addressRequest)
                .then((response) => {
                    if (!Array.isArray(response)) {
                        loggerService.warning({ path: "/address/count", message: "Non-array response from address API" }).flush();
                        return reject(new Error('Unexpected response from address API'));
                    }

                    if (response.length === 0) {
                        // No results found
                        loggerService.info({ path: "/address/count", message: "Query returned no results" }).flush();
                        return resolve({
                            count: 0,
                            note: 'No results found for this query.'
                        });
                    }

                    loggerService.info({ path: "/address/count", message: `Query returned ${response.length} result(s)` }).flush();
                    resolve({
                        count: response.length
                    });
                })
                .catch((err) => {
                    loggerService.error({ path: "/address/count", message: `Count failed: ${(err as Error).message}` }).flush();
                    reject(new Error('Failed to fetch from address API'));
                });
        });
    }

    /**
     * Sends a POST request to the address API
     * Supports optional pagination with page and limit
     * @param addressRequest - JSON body with search criteria
     * @returns List of addresses matching the criteria
     */
    public async request(addressRequest?: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            fetch(AddressService.fetchUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addressRequest)
            })
                .then(async (response) => {
                    let result: any = await response.json();

                    if (!Array.isArray(result)) {
                        loggerService.warning({
                            path: "/address/request",
                            message: "Non-array response from address API"
                        }).flush();
                        return reject(new Error('Unexpected response from address API'));
                    }

                    let { page, limit } = addressRequest;

                    // Validate pagination parameters
                    if (page !== undefined && isNaN(page)) {
                        loggerService.warning({
                            path: "/address/request",
                            message: "Invalid page format; expected a number"
                        }).flush();
                        page = undefined;
                    }

                    if (limit !== undefined && isNaN(limit)) {
                        loggerService.warning({
                            path: "/address/request",
                            message: "Invalid limit format; expected a number"
                        }).flush();
                        limit = undefined;
                    }

                    // Default to page 1 if limit provided but page missing
                    if (limit !== undefined && page === undefined) {
                        page = 1;
                        loggerService.info({
                            path: "/address/request",
                            message: "Page value not provided; defaulting to page 1"
                        }).flush();
                    }

                    // Apply manual pagination if needed
                    if (page !== undefined && limit !== undefined) {
                        const startIndex = (page - 1) * limit;
                        const endIndex = startIndex + limit;
                        result = result.slice(startIndex, endIndex);
                        loggerService.info({
                            path: "/address/request",
                            message: `Paginated result: page ${page}, limit ${limit}, returning ${result.length} records`
                        }).flush();
                    } else {
                        loggerService.info({
                            path: "/address/request",
                            message: `Request successful, returning ${result.length} total records`
                        }).flush();
                    }

                    resolve(result);
                })
                .catch((err) => {
                    loggerService.error({
                        path: "/address/request",
                        message: `Request failed: ${(err as Error).message}`
                    }).flush();
                    reject(err);
                });
        });
    }

    /**
     * Calculates the distance between two sets of coordinates
     * Supports output in kilometers, miles, or both
     * @param addressRequest - Coordinates (lat1, lon1, lat2, lon2) and optional unit
     * @returns Distance between the points
     */
    public async distance(addressRequest?: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            loggerService.info({
                path: "/address/distance",
                message: "Received distance calculation request"
            }).flush();

            const { lat1, lon1, lat2, lon2, unit } = addressRequest || {};

            if (!lat1 || !lon1 || !lat2 || !lon2) {
                loggerService.warning({
                    path: "/address/distance",
                    message: "Missing coordinates in request. Required: lat1, lon1, lat2, lon2."
                }).flush();

                return reject(new Error('Missing coordinates. Required: lat1, lon1, lat2, lon2.'));
            }

            try {
                // Helper to convert degrees to radians
                const toRadians = (degrees: number) => degrees * (Math.PI / 180);

                // Haversine Formula for great-circle distance
                const R = 6371; // Radius of Earth in kilometers
                const dLat = toRadians(parseFloat(lat2) - parseFloat(lat1));
                const dLon = toRadians(parseFloat(lon2) - parseFloat(lon1));

                const a =
                    Math.sin(dLat / 2) ** 2 +
                    Math.cos(toRadians(parseFloat(lat1))) * Math.cos(toRadians(parseFloat(lat2))) *
                    Math.sin(dLon / 2) ** 2;

                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distanceInKm = R * c;
                const distanceInMi = distanceInKm * 0.621371;

                // Default return both units
                let result: any = {
                    km: parseFloat(distanceInKm.toFixed(2)),
                    mi: parseFloat(distanceInMi.toFixed(2))
                };

                // Restrict based on requested unit
                if (unit === 'km') {
                    result = { km: result.km };
                } else if (unit === 'mi') {
                    result = { mi: result.mi };
                }

                loggerService.info({
                    path: "/address/distance",
                    message: "Distance calculated successfully"
                }).flush();

                resolve({ distance: result });
            } catch (err) {
                loggerService.error({
                    path: "/address/distance",
                    message: `Unexpected distance calculation error: ${(err as Error).message}`
                }).flush();

                reject(new Error('Distance calculation failed'));
            }
        });
    }

    /**
     * Looks up the city based on a ZIP or postal code
     * Supports US and Canadian postal codes
     * Uses an in-memory cache to reduce API calls
     * @param addressRequest - Request with a single "zip" field
     * @returns City name if found
     */
    public async cityLookup(addressRequest?: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            loggerService.info({
                path: "/address/city",
                message: "Received city lookup request"
            }).flush();

            const zip = addressRequest?.zip;

            // Validate US (5-digit) or Canadian (6-character) postal codes
            const isUSZip = typeof zip === 'string' && /^\d{5}$/.test(zip);
            const isCanadianPostal = typeof zip === 'string' && /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(zip);

            if (!zip || (!isUSZip && !isCanadianPostal) || Object.keys(addressRequest).length !== 1) {
                loggerService.warning({
                    path: "/address/city",
                    message: "Invalid or missing zip. Only valid U.S. or Canadian postal codes allowed, no additional fields"
                }).flush();

                return reject(new Error('Zip code is required (5-digit U.S. or 6-character Canadian) and no additional fields are allowed.'));
            }

            // Check cache first
            if (this.cityCache[zip]) {
                loggerService.info({
                    path: "/address/city",
                    message: `Cache hit for zip ${zip}`
                }).flush();

                return resolve(this.cityCache[zip]);
            }

            try {
                // Fetch from API if not cached
                const response = await fetch(AddressService.fetchUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ zipcode: zip })
                });

                if (!response.ok) {
                    loggerService.warning({
                        path: "/address/city",
                        message: `Address API returned bad response: ${response.status}`
                    }).flush();

                    return reject(new Error('Failed to fetch from address API'));
                }

                const data = await response.json();

                if (!Array.isArray(data) || data.length === 0 || !data[0].city) {
                    loggerService.warning({
                        path: "/address/city",
                        message: "No city found for given zip"
                    }).flush();

                    return reject(new Error('City not found'));
                }

                const city = data[0].city;
                this.cityCache[zip] = city; // Store in cache for future lookups

                loggerService.info({
                    path: "/address/city",
                    message: `City '${city}' found for zip ${zip}`
                }).flush();

                resolve(city);
            } catch (error) {
                loggerService.error({
                    path: "/address/city",
                    message: `City lookup failed: ${(error as Error).message}`
                }).flush();

                reject(new Error('Failed to fetch from address API'));
            }
        });
    }
}

export default new AddressService();