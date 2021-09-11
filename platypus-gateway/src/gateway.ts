import { createServer, Server } from "http";
import { connect, NatsConnection } from "nats";
import {} from "pino";
import WebSocket, { Server as SocketServer } from "ws";

import { PlatypusClient } from "./client";
import { logger } from "./logger";

interface GatewayOptions {
	port: number;
}

const DEFAULT_SERVER_OPTIONS: GatewayOptions = {
	port: 8080,
};

export class PlatypusGateway {
	/**
	 * Gateway options.
	 */
	readonly options: GatewayOptions;
	/**
	 * HTTP server instance.
	 */
	http: Server;
	/**
	 * Socket server instance.
	 */
	ws: SocketServer;
	/**
	 * NATS connection instance.
	 */
	nc!: NatsConnection;
	/**
	 * Array of connected clients.
	 */
	clients = new Map<number, PlatypusClient>();
	/**
	 * Next client ID.
	 */
	nextClientId = 0;

	constructor(options?: Partial<GatewayOptions>) {
		this.options = { ...DEFAULT_SERVER_OPTIONS, ...options };
		this.http = createServer();
		this.ws = new SocketServer({ server: this.http });
		// on connection, handle connection.
		this.ws.on("connection", (ws) => this.handleIncomingConnection(ws));
	}

	handleIncomingConnection(ws: WebSocket): void {
		const client = new PlatypusClient(this, this.nextClientId++, ws);
		this.clients.set(client.id, client);
	}

	/**
	 * Start the server listening.
	 */
	async listen(): Promise<void> {
		this.nc = await connect();
		this.http.listen(this.options.port);
		logger.info("Listening...");
	}
}
