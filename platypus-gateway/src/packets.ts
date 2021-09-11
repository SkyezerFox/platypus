export interface Packet {
	op: number;
	data?: any;
}

//#region Incoming packets

interface IdentifyPacket extends Packet {
	op: 0;
	data: {
		token: string;
	};
}

export type IncomingPacket = IdentifyPacket;

//#endregion

//#region Outgoing packets

interface HelloPacket {
	op: 0;
}

//#endregion
