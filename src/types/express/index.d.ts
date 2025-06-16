import { UserProfileInput } from "../../validators/userValidator";

// Make sure we're augmenting the correct module
declare global {
	namespace Express {
		interface Request {
			user?: { id: string };
		}
	}
}

// Export an empty object to make this a module
export {};
