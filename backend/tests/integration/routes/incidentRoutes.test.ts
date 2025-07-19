// tests/integration/routes/incidents.test.ts
import request from 'supertest';
import app from '@/app';
import sequelize from '@/config/database';
import Incident from '@/models/incident';

jest.mock('@/config/firebase', () => ({
    auth: () => ({
        verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user-id' }),
    }),
}));

jest.mock('@/config/openai', () => ({
    chat: {
        completions: {
            create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Mocked summary of the incident.' } }],
            }),
        },
    },
}));

beforeAll(async () => {
    await sequelize.sync({ force: true }); // Use test DB, clean start
});

afterAll(async () => {
    await sequelize.close();
});

describe('Incident Route Integration Tests', () => {
    const testIncident = {
        id: '12345',
        userId: 'test-user-id',
        type: 'Fall',
        description: 'The patient experienced a severe fall. They seem to have pain in their leg and head.',
        summary: null,
        toJSON: () => ({
            id: 12345,
            userId: 'test-user-id',
            type: 'Fall',
            description: 'The patient experienced a severe fall. They seem to have pain in their leg and head.',
            summary: null,
        })
    }

    const authHeader = { Authorization: 'Bearer valid-token' };

    describe('POST /incidents', () => {
        test('should create an incident', async () => {
            const response = await request(app)
                .post('/incidents')
                .set(authHeader)
                .send(testIncident);
    
            expect(response.status).toBe(200);
            expect(response.body.incident).toHaveProperty('id');
            expect(response.body.incident.type).toBe('Fall');
            expect(response.body.incident.userId).toBe('test-user-id');
        });
    })
    

    describe('GET /incidents', () => {
        test('should get all incidents', async () => {
            const response = await request(app)
                .get('/incidents')
                .set(authHeader);
            
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject([testIncident.toJSON()]);
        });

        test('no auth token should return with error', async () => {
            const response = await request(app)
                .get('/incidents')
            
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized user');;
        });
    });
    

    describe('GET /incidents/:id', () => {
        test('should get a single incident (GET /incidents/:id)', async () => {
            const response = await request(app)
                .get(`/incidents/${testIncident.id}`)
                .set(authHeader);
            
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject(testIncident.toJSON());
        });

        test('incident not found should return error', async () => {
            const response  = await request(app)
                .get('/incidents/9999')
                .set(authHeader);
            
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Incident not found');
        });
    });
    

    describe('POST /incidents/:id', () => {
        test('should update an incident (POST /incidents/:id)', async () => {
            const response = await request(app)
                .post(`/incidents/${testIncident.id}`)
                .set(authHeader)
                .send({ type: 'Slip', description: 'Updated description' });
        
            expect(response.status).toBe(200);
            expect(response.body.incident.type).toBe('Slip');
            expect(response.body.incident.description).toBe('Updated description');
        });

        test('incident not found should return error', async () => {
            const response = await request(app)
                .post('/incidents/9999')
                .set(authHeader)
                .send({ type: 'Slip Error', description: 'Updated error description' });
            
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Incident not found');
        });
    });
    

    describe('POST /incidents/:id/summarize', () => {
        test('should generate a summary (POST /incidents/:id/summarize)', async () => {
            const response = await request(app)
                .post(`/incidents/${testIncident.id}/summarize`)
                .set(authHeader);
        
            expect(response.status).toBe(200);
            expect(response.body.summary).toBe('Mocked summary of the incident.');

            const updated = await Incident.findByPk(testIncident.id);
            expect(updated?.summary).toBe('Mocked summary of the incident.');
        });

        test('incident not found should return error', async () => {
            const response = await request(app)
                .post('/incidents/9999/summarize')
                .set(authHeader)
            
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Incident not found');
        });
    });
    
});
