import { decode, encode } from "cbor";
import WebSocket, { Data } from "ws";

import { PlatypusGateway } from "./gateway";
import { logger } from "./logger";
import { IncomingPacket } from "./packets";

/**
 * A client connected to the Gateway.
 */
export class PlatypusClient {
	constructor(readonly gtw: PlatypusGateway, readonly id: number, readonly socket: WebSocket) {
		this.setupListeners();
		this.socket.send(encode({ op: 0 }));
		logger.info(`[${this.id}] Sending handshake packet...`);
	}

	/**
	 * Close the client connection with the specified code.
	 * @param code
	 */
	close(code?: number): void {
		if (this.socket.readyState === WebSocket.OPEN) {
			this.socket.close(code);
		}
		this.gtw.clients.delete(this.id);
	}

	/**
	 * Setup listeners for this client.
	 */
	setupListeners(): void {
		this.socket
			.on("close", () => this.close())
			.on("error", () => this.close())
			.on("message", (data) => this.handleMessage(data));
	}

	/**
	 * Handle a message from a client.
	 * @param data
	 */
	handleMessage(data: Data): void {
		if (!(data instanceof Buffer)) {
			return this.close(1007);
		}
		let decoded: IncomingPacket;
		try {
			decoded = decode(data);
		} catch (err) {
			return this.close(1007);
		}
	}
}
