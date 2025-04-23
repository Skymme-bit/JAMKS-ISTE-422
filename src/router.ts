import fs from 'fs';
import express, { NextFunction, Request, Response } from 'express';
import { ENV } from './constants/environment-vars.constants';

const router = express.Router();

// Middleware to handle invalid endpoints
router.use((req: Request, res: Response, next: NextFunction) => {
    try {
        getEndpointControllerPath(req);
        next();
    } catch {
        res.status(404).json({
            error: {
                status: 404,
                message: "Endpoint not found"
            }
        });
    }
});

router.get('*', async (req: Request, res: Response, next: NextFunction) => {
    const endpoint = await import(getEndpointControllerPath(req));
    endpoint.getRoute(req, res, next);
});

router.post('*', async (req: Request, res: Response, next: NextFunction) => {
    const endpoint = await import(getEndpointControllerPath(req));
    endpoint.postRoute(req, res, next);
});

router.put('*', async (req: Request, res: Response, next: NextFunction) => {
    const endpoint = await import(getEndpointControllerPath(req));
    endpoint.putRoute(req, res, next);
});

router.delete('*', async (req: Request, res: Response, next: NextFunction) => {
    const endpoint = await import(getEndpointControllerPath(req));
    endpoint.deleteRoute(req, res, next);
});

function getEndpointControllerPath(req: Request): string {
    const paths = req.baseUrl.split('/');

    const ext = (ENV === 'dev') ? 'ts' : 'js';
    const route = `${__dirname}/endpoints/${paths[1]}.endpoint.${ext}`;
    if (paths.length === 1 || !fs.existsSync(route) || paths[1] == 'base') {
        throw new Error("Invalid endpoint");
    }

    return route;
}

export default router;