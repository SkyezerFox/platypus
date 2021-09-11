import { Response } from "express";

// Omit details from response if in production
const omitDetailsIfProd = (details?: string) => (process.env.NODE_ENV == "production" ? undefined : details);

// Internal error sending method.
const sendError = (res: Response, httpCode: number, code: number, msg: string, details?: string) => {
	details = omitDetailsIfProd(details);
	res.status(httpCode).json({ code, msg: `${httpCode}: ${msg}`, details });
};

/**
 * Return a "404: Not Found" response.
 * @param res The response to be returned.
 * @param details Any details to add to the error.
 * @returns
 */
export const notFound = (res: Response, details?: string): void => sendError(res, 404, 0, "Not Found", details);

/**
 * Return a "400: Bad Request" response.
 * @param res The response to be returned.
 * @param details Any details to add to the error.
 * @returns
 */
export const badRequest = (res: Response, details?: string): void => sendError(res, 400, 1, "Bad Request", details);

/**
 * Return a "401: Unauthorized" response.
 * @param res The response to be returned.
 * @param details Any details to add to the error.
 * @returns
 */
export const unauthorized = (res: Response, details?: string): void => sendError(res, 401, 2, "Unauthorized", details);

/**
 * Return a "403: Forbidden" response.
 * @param res The response to be returned.
 * @param details Any details to add to the error.
 * @returns
 */
export const forbidden = (res: Response, details?: string): void => sendError(res, 403, 3, "Forbidden", details);

/**
 * Return a "501: Not Implemented" response.
 * @param res The response to be returned.
 * @param details Any details to add to the error.
 * @returns
 */
export const notImplemented = (res: Response, details?: string): void =>
	sendError(res, 501, 3, "Not Implemented", details);
