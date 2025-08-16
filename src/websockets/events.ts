import { WebSocket } from "ws";
import { getUserConnections } from "./userConnection";

export const broadcastToUser = (userId: string, data: any) => {
	const connections = getUserConnections(userId);
	if (connections) {
		const message = JSON.stringify(data);
		connections.forEach((ws: WebSocket) => {
			if (ws.readyState == ws.OPEN) {
				ws.send(message);
			}
		});
	}
};
