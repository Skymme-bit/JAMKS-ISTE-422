import fs from 'fs';
import express, { NextFunction, Request, Response } from 'express';
import { ENV } from './constants/environment-vars.constants';

// Initialize Express Router
const router = express.Router();

/**
 * Middleware that checks if the requested endpoint exists.
 * If it doesn't exist, responds with a 404 JSON error.
 */
router.use((req: Request, res: Response, next: NextFunction) => {
    try {
        getEndpointControllerPath(req); // Dynamically resolve endpoint
        next();
    } catch {
        // If endpoint resolution fails, return 404 error
        res.status(404).json({
            error: {
                status: 404,
                message: "Endpoint not found"
            }
        });
    }
});

/**
 * Handles all GET requests and routes them dynamically to the correct controller.
 */
router.get('*', async (req: Request, res: Response, next: NextFunction) => {
    const endpoint = await import(getEndpointControllerPath(req));
    endpoint.getRoute(req, res, next);
});

/**
 * Handles all POST requests and routes them dynamically to the correct controller.
 */
router.post('*', async (req: Request, res: Response, next: NextFunction) => {
    const endpoint = await import(getEndpointControllerPath(req));
    endpoint.postRoute(req, res, next);
});

/**
 * Handles all PUT requests and routes them dynamically to the correct controller.
 */
router.put('*', async (req: Request, res: Response, next: NextFunction) => {
    const endpoint = await import(getEndpointControllerPath(req));
    endpoint.putRoute(req, res, next);
});

/**
 * Handles all DELETE requests and routes them dynamically to the correct controller.
 */
router.delete('*', async (req: Request, res: Response, next: NextFunction) => {
    const endpoint = await import(getEndpointControllerPath(req));
    endpoint.deleteRoute(req, res, next);
});

/**
 * Dynamically builds the path to the endpoint controller file based on the request.
 *
 * @param req - Incoming request object
 * @returns The full filesystem path to the controller module
 * @throws Error if the endpoint path is invalid
 */
function getEndpointControllerPath(req: Request): string {
    const paths = req.baseUrl.split('/');

    // Determine file extension based on environment (ts for dev, js for prod)
    const ext = (ENV === 'dev') ? 'ts' : 'js';
    const route = `${__dirname}/endpoints/${paths[1]}.endpoint.${ext}`;

    // Validate route existence
    if (paths.length === 1 || !fs.existsSync(route) || paths[1] == 'base') {
        throw new Error("Invalid endpoint");
    }

    return route;
}

export default router;