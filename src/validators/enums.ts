import { z } from "zod";

export const OccupationEnum = z.enum([
	"DEVELOPER",
	"DESIGNER",
	"MANAGER",
	"OTHER",
]);
