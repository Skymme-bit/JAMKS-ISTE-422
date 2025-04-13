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
