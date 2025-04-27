import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';

import createHttpError from 'http-errors';
import router from './router';
import loggerService from './services/logger.service';

// App Initialization
const app = express();
// Security: Hides the fact that the app uses Express
app.disable("x-powered-by")
// Security: Hides the fact that the app uses Express
app.use(cors())
// Allow credentials (cookies, auth) and any origin
app.use(cors({ credentials: true, origin: '*' }));

/**
 * Health check route used by monitoring tools or load balancers.
 * Returns "OK" if the server is operational, or 503 if shutting down.
 */
app.locals.HEALTH_CHECK_ENABLED = true;
app.get("/health", (_, res) => {
    if (app.locals.HEALTH_CHECK_ENABLED) {
        res.end("OK\n");
        return;
    }

    res.status(503).end("Server shutting down!");
})

// Automatically parse incoming JSON requests
app.use(express.json());
// Delegate all requests to the router
app.use('*', router);

/**
 * Middleware that handles invalid endpoints.
 * If no route matched before, respond with 400 Bad Request.
 */
app.use(async (req, res: Response, next: NextFunction) => {
    next(createHttpError.BadRequest());
});

/**
 * Centralized error handling middleware.
 * Logs the error and returns a generic 500 Internal Server Error response.
 */
app.use(async (err: any, req: Request, res: Response) => {
    loggerService.error({ message: err.message, path: req.path }).flush();
    res.status(500).send({
        error: {
            status: 500,
            message: "Internal Error",
        }
    });
});

export default app;