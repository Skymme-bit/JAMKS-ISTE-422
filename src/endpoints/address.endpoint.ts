import { NextFunction, Request, Response } from 'express';
import baseEndpoint from './base.endpoint';
import addressService from '../services/address.service';
import responseWrapper from '../services/response.service';

import { RESPONSE_STATUS_OK, RESPONSE_STATUS_FAIL, RESPONSE_EVENT_READ } from '../constants/generic.constants';

const ERROR_MISSING_SEARCH = 'Missing required search';
const ERROR_UNEXPECTED_RESPONSE = 'Unexpected response';
const ERROR_FAILED_FETCH = 'Failed to fetch';
const ERROR_MISSING_COORDINATES = 'Missing coordinates';
const ERROR_ZIP_REQUIRED = 'Zip code is required';
const ERROR_CITY_NOT_FOUND = 'City not found';

class AddressEndpoint extends baseEndpoint {
    public post(req: Request, res: Response, next: NextFunction) {
        super.executeSubRoute(addressEndpoint, req, res, next);
    }

    private count_post(req: Request, res: Response, next: NextFunction) {
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

    private distance_post(req: Request, res: Response, next: NextFunction) {
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

    private request_post(req: Request, res: Response, next: NextFunction) {
        addressService.request(req.body)
            .then((response) => {
                res.status(200).send(responseWrapper(RESPONSE_STATUS_OK, RESPONSE_EVENT_READ, response));
            }).catch((err) => {
            res.status(400).send(responseWrapper(RESPONSE_STATUS_FAIL, RESPONSE_EVENT_READ, err));
        });
    }

    private city_post(req: Request, res: Response, next: NextFunction) {
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

const addressEndpoint = new AddressEndpoint();

const getRoute = addressEndpoint.get;
const postRoute = addressEndpoint.post;
const putRoute = addressEndpoint.put;
const deleteRoute = addressEndpoint.delete;

export { getRoute, postRoute, putRoute, deleteRoute };