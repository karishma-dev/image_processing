import { WebSocketServer } from "ws";
import {
	addUserConnection,
	getUserConnections,
	removeUserConnection,
} from "./userConnection";
import { authenticateWebSocket } from "./auth";
import { sub } from "./pubsub";

export function initializeWebsocket(server: any) {
	const wss = new WebSocketServer({ server });

	wss.on("connection", (ws) => {
		let userId: string | null = null;

		ws.on("message", (message) => {
			const parsedMessage = JSON.parse(message.toString());
			if (parsedMessage.type == "join") {
				userId = authenticateWebSocket(message.toString());
				if (userId) {
					addUserConnection(userId, ws);
					ws.send(
						JSON.stringify({
							type: "auth",
							success: true,
						})
					);
				} else {
					ws.send(
						JSON.stringify({
							type: "auth",
							success: false,
							message: "Authentication failed. Please check your credentials.",
						})
					);
				}
			}
		});

		ws.on("close", () => {
			if (userId) removeUserConnection(userId, ws);
		});

		ws.send(
			JSON.stringify({
				type: "welcome",
				message: "Connected to Websocket!",
			})
		);

		ws.on("error", (err) => {
			console.error(`Websocket error`, err);
			ws.send(
				JSON.stringify({
					type: "error",
					message: "A server error occurred. Please try again later.",
				})
			);
			if (userId) removeUserConnection(userId, ws);
		});
	});
}

sub.psubscribe("user:*:events");

sub.on("message", (pattern: string, channel: string, message: string) => {
	const userId = channel.split(":")[1];
	const connections = getUserConnections(userId);
	if (connections) {
		connections.forEach((ws) => {
			if (ws.readyState == ws.OPEN) {
				ws.send(message);
			}
		});
	}
});
