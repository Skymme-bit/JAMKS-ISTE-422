import fs from 'fs';
import path from 'path';
import express, { NextFunction, Request, Response } from 'express';

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
    const [, name] = req.baseUrl.split('/');
    if (!name || name === 'base') throw new Error("Invalid endpoint");

    const base = path.join(__dirname, 'endpoints', `${name}.endpoint`);
    const candidates = [base + '.js', base + '.ts'];
    const found = candidates.find(p => fs.existsSync(p));
    if (!found) throw new Error("Invalid endpoint");
    return found;
}

export default router;