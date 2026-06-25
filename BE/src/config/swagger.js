import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MedsReminder API',
            version: '1.0.0',
            description: 'API documentation for the MedsReminder backend system',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Local development',
            },
            ...(process.env.BACKEND_URL ? [{
                url: process.env.BACKEND_URL,
                description: 'Production server',
            }] : []),
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your access token (obtained from /api/v1/auth/login)',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64f000000000000000000001' },
                        name: { type: 'string', example: 'Nguyễn Văn A' },
                        email: { type: 'string', format: 'email', example: 'nguyenvana@example.com' },
                        phone: { type: 'string', example: '0901234567' },
                        roleId: { type: 'string', example: '64f000000000000000000010' },
                        avatar: { type: 'string' },
                        birthday: { type: 'string', format: 'date-time' },
                        gender: { type: 'string', enum: ['male', 'female', 'other'] },
                        isActive: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Role: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64f000000000000000000010' },
                        roleName: { type: 'string', enum: ['patient', 'caregiver', 'admin'], example: 'caregiver' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                AuthTokens: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        deviceId: { type: 'string', example: 'DEVICE_A1B2C3D4' },
                    },
                },
                AuthTokensResponse: {
                    type: 'object',
                    properties: {
                        user: { $ref: '#/components/schemas/User' },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                        deviceId: { type: 'string', example: 'DEVICE_A1B2C3D4' },
                    },
                },
            },
        },
        security: [
            { bearerAuth: [] },
        ],
    },
    apis: ['./src/api/routers/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export function setupSwagger(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
