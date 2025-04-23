import addressService from '../services/address.service';

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
        expect(typeof result.distance.mi).toBe('number');
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
        expect(typeof result.distance.km).toBe('number');
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

describe('addressService.request()', () => {
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
        const result = await addressService.request({
            page: 2,
            limit: 2
        });

        expect(result.length).toBe(2);
        expect(result[0].address).toBe('Address 3');
        expect(result[1].address).toBe('Address 4');
    });

    it('should return all results if page and limit are missing', async () => {
        const result = await addressService.request({});

        expect(result.length).toBe(6);
    });

    it('should return empty array if page is out of bounds', async () => {
        const result = await addressService.request({
            page: 5,
            limit: 10
        });

        expect(result.length).toBe(0);
    });
});

describe('addressService.cityLookup()', () => {
    it('should return city name when zip is valid', async () => {
        globalThis.fetch = (async () => {
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

        (addressService as any).cityCache = {};

        const first = await addressService.cityLookup({ zip: '14623' });
        const second = await addressService.cityLookup({ zip: '14623' });

        expect(first).toBe('Rochester');
        expect(second).toBe('Rochester');
        expect(fetchCount).toBe(1);
    });

});

describe('AddressService.count()', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return count 0 when no results found', async () => {
        jest.spyOn(addressService as any, 'request').mockResolvedValueOnce([]); // 👈 on force une réponse vide

        const result = await addressService.count({ city: 'Nowhere' });

        expect(result).toEqual({
            count: 0,
            note: 'No results found for this query.'
        });
    });

    it('should return correct count when results are found', async () => {
        jest.spyOn(addressService as any, 'request').mockResolvedValueOnce([
            { id: 1 }, { id: 2 }, { id: 3 }
        ]);

        const result = await addressService.count({ zip: '12345' });

        expect(result).toEqual({ count: 3 });
    });

    it('should throw an error if both city and zip are missing', async () => {
        await expect(addressService.count({ state: 'NY' }))
            .rejects
            .toThrow('Missing required search field');
    });

    it('should throw an error if request() returns non-array', async () => {
        jest.spyOn(addressService as any, 'request').mockResolvedValueOnce({ foo: 'bar' });

        await expect(addressService.count({ city: 'Rochester' }))
            .rejects
            .toThrow('Unexpected response from address API');
    });

    it('should throw an error if request() fails', async () => {
        jest.spyOn(addressService as any, 'request').mockRejectedValueOnce(new Error('network error'));

        await expect(addressService.count({ zip: '14623' }))
            .rejects
            .toThrow('Failed to fetch from address API');
    });
});