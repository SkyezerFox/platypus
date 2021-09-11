import express from "express";
import { createServer } from "http";
import { createLogger, Logger } from "winston";
import { Console } from "winston/lib/winston/transports";

import { Partional } from "./types";

import helmet from "helmet";
import morgan from "morgan";
import { notFound } from "./errors";

/**
 * An interface of available server options.
 */
export interface ServerOptions {
	level: string;
	port: number;
}

/**
 * The default server options.
 */
export const DEFAULT_OPTIONS: ServerOptions = {
	port: 8080,
	level: "http",
};

/**
 * A generic HTTP server implementation.
 */
export class PlatypusServer {
	/**
	 * The server options. Used when creating the HTTP listener.
	 */
	readonly options: ServerOptions;

	/**
	 * The Express application used for handling requests.
	 */
	readonly express = express();

	/**
	 * The HTTP server used for serving requests.
	 */
	readonly http = createServer(this.express);

	/**
	 * The winston logger used for logging to console.
	 */
	readonly logger: Logger;

	constructor(options?: Partional<ServerOptions>) {
		// configure default options.
		this.options = { ...DEFAULT_OPTIONS, ...options };
		// create the winston logger
		this.logger = createLogger({ transports: [new Console()], level: this.options.level });
		// setup middleware
		this.express.use(express.json(), helmet(), morgan("common", { stream: { write: (msg) => this.logger.http(msg) } }));
	}

	/**
	 * Start the server listening on the target port.
	 */
	async listen(): Promise<void> {
		// default not found handler
		this.express.use("*", (_, res) => notFound(res));
		// start listening on port specified in options.
		this.logger.info("Listening on port " + this.options.port);
		this.http.listen(this.options.port);
	}
}
