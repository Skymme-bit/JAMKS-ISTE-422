import addressService from '../services/address.service';

describe('addressService.distance()', () => {
    it('should return distance in both km and mi when unit is not provided', async () => {
        // Provide two sets of latitude/longitude coordinates
        const result = await addressService.distance({
            lat1: "43.084847",
            lon1: "-77.674194",
            lat2: "40.712776",
            lon2: "-74.005974"
        });

        // The response must include a "distance" object
        expect(result).toHaveProperty('distance');

        // The distance object must include both kilometers and miles
        expect(result.distance).toHaveProperty('km');
        expect(result.distance).toHaveProperty('mi');

        // Each of the distances must be a number
        expect(typeof result.distance.km).toBe('number');
        expect(typeof result.distance.mi).toBe('number');
    });

    // Validate distance contains both km and mi
    it('should return only miles when unit is "mi"', async () => {
        const result = await addressService.distance({
            lat1: "43.084847",
            lon1: "-77.674194",
            lat2: "40.712776",
            lon2: "-74.005974",
            unit: "mi" // Specifically request miles
        });

        // Validate that only miles is returned
        expect(result.distance).toHaveProperty('mi');
        expect(result.distance).not.toHaveProperty('km');
        expect(typeof result.distance.mi).toBe('number');
    });

    it('should return only kilometer when unit is "km"', async () => {
        const result = await addressService.distance({
            lat1: "43.084847",
            lon1: "-77.674194",
            lat2: "40.712776",
            lon2: "-74.005974",
            unit: "km" // Specifically request kilometers
        });

        // Validate that only kilometers is returned
        expect(result.distance).toHaveProperty('km');
        expect(result.distance).not.toHaveProperty('mi');
        expect(typeof result.distance.km).toBe('number');
    });

    it('should throw an error when coordinates are missing', async () => {
        // Missing lat2/lon2 should cause an error
        await expect(addressService.distance({
            lat1: "43.084847",
            lon1: "-77.674194"
        })).rejects.toThrow('Missing coordinates');
    });

    it('should return both units if unit is invalid or unrecognized', async () => {
        const result = await addressService.distance({
            lat1: "43.084847",
            lon1: "-77.674194",
            lat2: "40.712776",
            lon2: "-74.005974",
            unit: "banana" // invalid unit
        });

        // Should fallback to both units
        expect(result.distance).toHaveProperty('km');
        expect(result.distance).toHaveProperty('mi');
    });
});

// Tests for request() method
describe('addressService.request()', () => {
    // Mock the global fetch function before running these tests
    beforeAll(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([
                    { address: 'Address 1' },
                    { address: 'Address 2' },
                    { address: 'Address 3' },
                    { address: 'Address 4' },
                    { address: 'Address 5' },
                    { address: 'Address 6' },
                ])
            })
        ) as jest.Mock;
    });

    it('should return paginated results correctly', async () => {
        // Request page 2 with 2 results per page
        const result = await addressService.request({
            page: 2,
            limit: 2
        });

        // Should return addresses 3 and 4
        expect(result.length).toBe(2);
        expect(result[0].address).toBe('Address 3');
        expect(result[1].address).toBe('Address 4');
    });

    it('should return all results if page and limit are missing', async () => {
        const result = await addressService.request({});

        // Should return all 6 addresses
        expect(result.length).toBe(6);
    });

    it('should return empty array if page is out of bounds', async () => {
        const result = await addressService.request({
            page: 5,
            limit: 10
        });

        // Since there are only 6 addresses, page 5 is out of bounds
        expect(result.length).toBe(0);
    });
});

// Tests for cityLookup() method
describe('addressService.cityLookup()', () => {
    it('should return city name when zip is valid', async () => {
        // Mock a successful fetch returning a city
        globalThis.fetch = (async () => {
            return {
                ok: true,
                json: async () => [{ city: 'Rochester' }]
            } as Response;
        }) as any;

        const result = await addressService.cityLookup({ zip: '14623' });
        // Should return the expected city name
        expect(result).toBe('Rochester');
    });

    it('should throw an error when zip is missing', async () => {
        const resultPromise = addressService.cityLookup({});
        await expect(resultPromise).rejects.toThrow('Zip code is required');
    });

    it('should throw an error when city is not found', async () => {
        // Mock an empty array being returned
        globalThis.fetch = (async () => {
            return {
                ok: true,
                json: async () => []
            } as Response;
        }) as any;

        const resultPromise = addressService.cityLookup({ zip: '99999' });
        // No city found → should throw
        await expect(resultPromise).rejects.toThrow('City not found');
    });

    it('should throw an error when fetch fails', async () => {
        // Simulate a network failure
        globalThis.fetch = (async () => {
            throw new Error('Simulated failure');
        }) as any;

        const resultPromise = addressService.cityLookup({ zip: '12345' });

        await expect(resultPromise).rejects.toThrow('Failed to fetch from address API');
    });

    it('should return city from cache on repeated call', async () => {
        let fetchCount = 0;

        (global as any).fetch = async () => {
            fetchCount++;
            return {
                ok: true,
                json: async () => [{ city: 'Rochester' }]
            };
        };

        // Reset cache
        (addressService as any).cityCache = {};

        // First lookup should call fetch
        const first = await addressService.cityLookup({ zip: '14623' });
        // Second lookup should use the cache
        const second = await addressService.cityLookup({ zip: '14623' });

        expect(first).toBe('Rochester');
        expect(second).toBe('Rochester');
        expect(fetchCount).toBe(1); // cache used second time
    });

});

// Tests for count() method
describe('AddressService.count()', () => {
    // Reset mocks after each test
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return count 0 when no results found', async () => {
        // Force request() to return an empty array
        jest.spyOn(addressService as any, 'request').mockResolvedValueOnce([]);

        const result = await addressService.count({ city: 'Nowhere' });

        expect(result).toEqual({
            count: 0,
            note: 'No results found for this query.'
        });
    });

    it('should return correct count when results are found', async () => {
        // Force request() to return 3 results
        jest.spyOn(addressService as any, 'request').mockResolvedValueOnce([
            { id: 1 }, { id: 2 }, { id: 3 }
        ]);

        const result = await addressService.count({ zip: '12345' });

        expect(result).toEqual({ count: 3 });
    });

    it('should throw an error if both city and zip are missing', async () => {
        // Missing city and zip should throw
        await expect(addressService.count({ state: 'NY' }))
            .rejects
            .toThrow('Missing required search field');
    });

    it('should throw an error if request() returns non-array', async () => {
        // Force request() to return an invalid format
        jest.spyOn(addressService as any, 'request').mockResolvedValueOnce({ foo: 'bar' });

        await expect(addressService.count({ city: 'Rochester' }))
            .rejects
            .toThrow('Unexpected response from address API');
    });

    it('should throw an error if request() fails', async () => {
        // Simulate a network failure
        jest.spyOn(addressService as any, 'request').mockRejectedValueOnce(new Error('network error'));

        await expect(addressService.count({ zip: '14623' }))
            .rejects
            .toThrow('Failed to fetch from address API');
    });
});