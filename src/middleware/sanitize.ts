import { Request, Response, NextFunction } from "express";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

function sanitizeInput(input: any): any {
	if (typeof input === "string") {
		return DOMPurify.sanitize(input);
	}
	if (Array.isArray(input)) {
		return input.map(sanitizeInput);
	}
	if (typeof input === "object" && input !== null) {
		const sanitizedObject: Record<string, any> = {};
		for (const key in input) {
			if (input.hasOwnProperty(key)) {
				sanitizedObject[key] = sanitizeInput(input[key]);
			}
		}
		return sanitizedObject;
	}
	return input;
}

export function sanitizeMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
): void {
	if (req.body) req.body = sanitizeInput(req.body);
	// if (req.query) req.query = sanitizeInput(req.query);
	if (req.params) req.params = sanitizeInput(req.params);
	next();
}
