import { WebSocket } from "ws";

const userConnections: Record<string, Set<WebSocket>> = {};

export const addUserConnection = (userId: string, ws: WebSocket) => {
	if (!userConnections[userId]) {
		userConnections[userId] = new Set();
	}
	userConnections[userId].add(ws);
};

export const removeUserConnection = (userId: string, ws: WebSocket) => {
	if (userConnections[userId]) {
		userConnections[userId].delete(ws);
		if (userConnections[userId].size == 0) delete userConnections[userId];
	}
};

export const getUserConnections = (
	userId: string
): Set<WebSocket> | undefined => {
	return userConnections[userId];
};
