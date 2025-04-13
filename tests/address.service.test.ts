import addressService from '../src/services/address.service';

describe('addressService.distance()', () => {
    it('should return distance in both km and mi when unit is not provided', async () => {
        const result = await addressService.distance({
            lat1: "43.084847",
            lon1: "-77.674194",
            lat2: "40.712776",
            lon2: "-74.005974"
        });

        expect(result).toHaveProperty('distance');
        expect(result.distance).toHaveProperty('km');
        expect(result.distance).toHaveProperty('mi');
        expect(typeof result.distance.km).toBe('number');
        expect(typeof result.distance.mi).toBe('number');
    });

    it('should return only miles when unit is "mi"', async () => {
        const result = await addressService.distance({
            lat1: "43.084847",
            lon1: "-77.674194",
            lat2: "40.712776",
            lon2: "-74.005974",
            unit: "mi"
        });

        expect(result.distance).toHaveProperty('mi');
        expect(result.distance).not.toHaveProperty('km');
    });

    it('should return only kilometer when unit is "km"', async () => {
        const result = await addressService.distance({
            lat1: "43.084847",
            lon1: "-77.674194",
            lat2: "40.712776",
            lon2: "-74.005974",
            unit: "km"
        });

        expect(result.distance).toHaveProperty('km');
        expect(result.distance).not.toHaveProperty('mi');
    });

    it('should throw an error when coordinates are missing', async () => {
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
            unit: "banana"
        });

        expect(result.distance).toHaveProperty('km');
        expect(result.distance).toHaveProperty('mi');
    });
});

// city lookup tests
describe('addressService.cityLookup()', () => {
    it('should return city name when zip is valid', async () => {
        globalThis.fetch = (async (_url: any, _options: any) => {
            return {
                ok: true,
                json: async () => [{ city: 'Rochester' }]
            } as Response;
        }) as any;

        const result = await addressService.cityLookup({ zip: '14623' });
        expect(result).toBe('Rochester');
    });

    it('should throw an error when zip is missing', async () => {
        const resultPromise = addressService.cityLookup({});
        await expect(resultPromise).rejects.toThrow('Zip code is required');
    });

    it('should throw an error when city is not found', async () => {
        globalThis.fetch = (async () => {
            return {
                ok: true,
                json: async () => []
            } as Response;
        }) as any;

        const resultPromise = addressService.cityLookup({ zip: '99999' });
        await expect(resultPromise).rejects.toThrow('City not found');
    });

    it('should throw an error when fetch fails', async () => {
        globalThis.fetch = (async () => {
            throw new Error('Simulated failure');
        }) as any;

        const resultPromise = addressService.cityLookup({ zip: 'FAIL' });
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
    
        // Clear the cache manually to be sure
        (addressService as any).cityCache = {};
    
        const first = await addressService.cityLookup({ zip: '14623' });
        const second = await addressService.cityLookup({ zip: '14623' });
    
        expect(first).toBe('Rochester');
        expect(second).toBe('Rochester');
        expect(fetchCount).toBe(1); // ✅ This should now be correct
    });
    
});
