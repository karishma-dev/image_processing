import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Image Processing App",
			version: "1.0.0",
			description: "API documentation for the Image Processing application",
		},
	},
	apis: [
		"./src/routes/*.ts",
		"./src/middleware/*.ts",
		"./src/docs/swagger/*.ts",
	],
};

const specs = swaggerJSDoc(swaggerOptions);

export { swaggerUi, specs };
