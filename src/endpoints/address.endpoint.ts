import { NextFunction, Request, Response } from 'express';
import baseEndpoint from './base.endpoint';
import addressService from '../services/address.service';
import responseWrapper from '../services/response.service';

import { RESPONSE_STATUS_OK, RESPONSE_STATUS_FAIL, RESPONSE_EVENT_READ } from '../constants/generic.constants';

// Define known error messages for standardized error handling
const ERROR_MISSING_SEARCH = 'Missing required search';
const ERROR_UNEXPECTED_RESPONSE = 'Unexpected response';
const ERROR_FAILED_FETCH = 'Failed to fetch';
const ERROR_MISSING_COORDINATES = 'Missing coordinates';
const ERROR_ZIP_REQUIRED = 'Zip code is required';
const ERROR_CITY_NOT_FOUND = 'City not found';

/**
 * AddressEndpoint class
 *
 * Handles specific sub-routes for address-related functionalities:
 * - Count addresses
 * - Calculate distance
 * - Request address data
 * - Lookup city based on zip
 */
class AddressEndpoint extends baseEndpoint {
    /**
     * Overrides base POST handler to dynamically dispatch subroutes (e.g., /count, /distance)
     */
    public post(req: Request, res: Response, next: NextFunction) {
        super.executeSubRoute(addressEndpoint, req, res, next);
    }

    /**
     * Handles POST /address/count
     * Returns the count of addresses matching the search criteria.
     */
    private count_post(req: Request, res: Response) {
        addressService.count(req.body)
            .then((response) => {
                res.status(200).send(responseWrapper(RESPONSE_STATUS_OK, RESPONSE_EVENT_READ, response));
            })
            .catch((err) => {
                const message = err.message || 'Internal Server Error';
                const statusCode = message.includes(ERROR_MISSING_SEARCH) ? 400 :
                    message.includes(ERROR_UNEXPECTED_RESPONSE) ? 500 :
                        message.includes(ERROR_FAILED_FETCH) ? 503 : 500;

                res.status(statusCode).send(responseWrapper(RESPONSE_STATUS_FAIL, RESPONSE_EVENT_READ, { message }));
            });
    }

    /**
     * Handles POST /address/distance
     * Calculates the distance between two latitude/longitude coordinates.
     */
    private distance_post(req: Request, res: Response) {
        addressService.distance(req.body)
            .then((response) => {
                res.status(200).send(responseWrapper(RESPONSE_STATUS_OK, RESPONSE_EVENT_READ, response));
            })
            .catch((err) => {
                const message = err.message || 'Internal Server Error';
                const statusCode = message.includes(ERROR_MISSING_COORDINATES) ? 400 : 500;
                res.status(statusCode).send(responseWrapper(RESPONSE_STATUS_FAIL, RESPONSE_EVENT_READ, { message }));
            });
    }

    /**
     * Handles POST /address/request
     * Forwards the request to the upstream API and returns paginated results if applicable.
     */
    private request_post(req: Request, res: Response) {
        addressService.request(req.body)
            .then((response) => {
                res.status(200).send(responseWrapper(RESPONSE_STATUS_OK, RESPONSE_EVENT_READ, response));
            }).catch((err) => {
            res.status(400).send(responseWrapper(RESPONSE_STATUS_FAIL, RESPONSE_EVENT_READ, err));
        });
    }

    /**
     * Handles POST /address/city
     * Looks up a city name based on a zip code.
     */
    private city_post(req: Request, res: Response) {
        addressService.cityLookup(req.body)
            .then((city) => {
                res.status(200).send(responseWrapper(RESPONSE_STATUS_OK, RESPONSE_EVENT_READ, { city }));
            })
            .catch((err) => {
                const message = err.message || 'Internal Server Error';
                const statusCode = message.includes(ERROR_ZIP_REQUIRED) ? 400 :
                    message.includes(ERROR_CITY_NOT_FOUND) ? 404 :
                        message.includes(ERROR_FAILED_FETCH) ? 503 : 500;

                res.status(statusCode).send(responseWrapper(RESPONSE_STATUS_FAIL, RESPONSE_EVENT_READ, { message }));
            });
    }
}

// Instantiate a single endpoint object to export routes
const addressEndpoint = new AddressEndpoint();

// Export the route handlers to be mounted by the router
const getRoute = addressEndpoint.get;
const postRoute = addressEndpoint.post;
const putRoute = addressEndpoint.put;
const deleteRoute = addressEndpoint.delete;

export { getRoute, postRoute, putRoute, deleteRoute };