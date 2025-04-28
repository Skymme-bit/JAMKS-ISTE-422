import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

/**
 * BaseEndpoint class
 *
 * Provides a standardized structure for API endpoint classes.
 *
 * All major HTTP methods (GET, POST, PUT, DELETE) are expected to be overridden
 * by child classes. By default, each method will throw a BadRequest error if not implemented.
 */
class BaseEndpoint {
    // Extension map (currently unused, could be helpful for dynamic routing)
    private readonly extensions = new Map<string, string>([
        ["dev", ".js"],
        ["prod", ".ts"]
    ]);

    public constructor() { }

    /**
     * Default GET handler.
     * Throws an error unless overridden by child class.
     */
    public get(_req: Request, _res: Response, _next: NextFunction): void {
        throw new createHttpError.BadRequest("GET not implemented");
    }

    /**
     * Default POST handler.
     * Throws an error unless overridden by child class.
     */
    public post(_req: Request, _res: Response, _next: NextFunction): void {
        throw new createHttpError.BadRequest("POST not implemented");
    }

    /**
     * Default PUT handler.
     * Throws an error unless overridden by child class.
     */
    public put(_req: Request, _res: Response, _next: NextFunction): void {
        throw new createHttpError.BadRequest("PUT not implemented");
    }

    /**
     * Default DELETE handler.
     * Throws an error unless overridden by child class.
     */
    public delete(_req: Request, _res: Response, _next: NextFunction): void {
        throw new createHttpError.BadRequest("DELETE not implemented");
    }

    /**
     * Executes a sub-route method dynamically based on the request.
     * For example, /address/count with POST becomes method `count_post`.
     *
     * @param endPointMethod - The child endpoint instance
     * @param req - Express Request
     * @param res - Express Response
     * @param next - Express NextFunction
     */
    public executeSubRoute(endPointMethod: any, req: Request, res: Response, next: NextFunction) {
        let subRoute = req.originalUrl.split('/')[2];
        subRoute = `${subRoute}_${req.method.toLowerCase()}` // Format: {subroute}_{method}

        const temp = endPointMethod[subRoute as keyof typeof endPointMethod];
        if (!temp) {
            // If no method matching the subroute and HTTP verb is found
            throw new createHttpError.BadRequest(); // Dynamically call the matched handler
        }

        temp(req, res, next);
    }
}

export default BaseEndpoint;