import { describe, expect, test } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { Request, Response, NextFunction } from 'express';

jest.mock('@/middleware/auth', () => ({
  authenticateUser: (req: Request, res: Response, next: NextFunction) => {
    if (req.headers['authorization'] === 'Invalid-token') {
      return next();
    }
    (req as any).user = { uid: 'test-user-id' };
    return next();
  }
}));

jest.mock('../src/config/openai', () => ({
  __esModule: true,
  default: {
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }
}));

import openai from '../src/config/openai';

// MOCK (TEST) DATA
const testData = {
  id: '12345',
  userId: 'test-user-id',
  type: 'Fall',
  description: 'The patient experienced a severe fall. They seem to have pain in their leg and head.',
  summary: null,
  save: jest.fn(),
  toJSON: jest.fn().mockReturnValue({
    id: '12345',
    userId: 'test-user-id',
    type: 'Fall',
    description: 'The patient experienced a severe fall. They seem to have pain in their leg and head.',
    summary: null,
  })
}

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('../src/models/incident');
import Incident from '../src/models/incident';

// TEST CASES FOR INCIDENTS API
describe('Incidents API', () => {

  describe('Unauthorized Requests Error Checks', () => {
    test('Should return error if user is not authenticated - POST', async () => {

      const response = await request(app)
        .post('/incidents')
        .set('authorization', 'Invalid-token')
        .send({
          id: testData.id,
          type: testData.type,
          description: testData.description,
        });
  
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Unauthorized user" })
    })

    test('Should return error if user is not authenticated - GET', async () => {
      const response = await request(app)
        .get('/incidents')
        .set('authorization', 'Invalid-token')
      
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Unauthorized user" })
    })

    test('Should return error if user is not authenticated - GET with ID', async () => {
  
      const response = await request(app)
        .get(`/incidents/${testData.userId}`)
        .set('authorization', 'Invalid-token')
      
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Unauthorized user" })
    })

    test('Should return error if user is not authenticated - POST with ID', async () => {

      const response = await request(app)
        .post(`/incidents/${testData.id}`)
        .set('authorization', 'Invalid-token')
        .send({
          id: testData.id,
          userId: 'test-user-id',
          type: 'New Fall',
          description: 'New description',
        })
      
      expect(response.status).toBe(401)
      expect(response.body).toEqual({ message: "Unauthorized user" })
    })
  })

  describe('Authorized requests check', () => {
    describe('POST incidents', () => {
      test('Should create an incident successfully', async () => {
        (Incident.create as jest.Mock).mockResolvedValue(testData);
    
        const response = await request(app)
          .post('/incidents')
          .send({
            id: testData.id,
            type: testData.type,
            description: testData.description,
            summary: testData.summary,
          });
    
        expect(response.status).toBe(201);
        expect(response.body.incident.type).toBe("Fall");
        expect(response.body.incident.userId).toBe('test-user-id');
      });
    
      test('Should return error of duplicate id (primary key)', async () => {
        const testError = new Error('Duplicate ID');
        (testError as any).name = 'SequelizeUniqueConstraintError';
        (Incident.create as jest.Mock).mockRejectedValue(testError);
    
        const response = await request(app)
          .post('/incidents')
          .send({
            id: testData.id,
            type: testData.type,
            description: testData.description,
            summary: testData.summary,
          });
    
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Failed to create incident" })
      });    
    })

    describe('GET incidents', () => {
      test('Should GET all incidents for user', async () => {
        (Incident.findAll as jest.Mock).mockResolvedValue([testData]);
    
        const response = await request(app)
          .get('/incidents')
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual([testData.toJSON()]);
        expect(Incident.findAll).toHaveBeenCalledWith({
          where: { userId: 'test-user-id' }
        })
      })

      test('Should fail to get all incidents', async () => {
        (Incident.findAll as jest.Mock).mockRejectedValue(new Error('Database Failure'));
    
        const response = await request(app)
          .get('/incidents')
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Failed to get incidents" });
      })
    })

    describe('GET Incident (singular)', () => {
      test('Should receive a single incident', async () => {
        (Incident.findByPk as jest.Mock).mockResolvedValue(testData);
    
        const response = await request(app)
          .get(`/incidents/${testData.id}`)
        
        expect(response.status).toBe(200);
        expect(Incident.findByPk).toHaveBeenCalledWith(testData.id);
        expect(response.body).toEqual(testData.toJSON());
      })
    
      test('Should return error if incident not found', async () => {
        (Incident.findByPk as jest.Mock).mockResolvedValue(null);
    
        const invalidIncidentId = '00000'
        const response = await request(app)
          .get(`/incidents/${invalidIncidentId}`)
        
        expect(response.status).toBe(404);
        expect(Incident.findByPk).toHaveBeenCalledWith(invalidIncidentId);
        expect(response.body).toEqual({ message: "Incident not found" })
      })
      
      test('Should fail to get all incidents', async () => {
        (Incident.findByPk as jest.Mock).mockRejectedValue(new Error('Database Failure'));
    
        const response = await request(app)
          .get(`/incidents/${testData.id}`)
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Failed to get incident." });
      })
      
    })

    describe('POST Update Incident', () => {
      test('Should update the incident', async () => {
        (Incident.findByPk as jest.Mock).mockResolvedValue(testData);

        const response = await request(app)
          .post(`/incidents/${testData.id}`)
          .send({
            id: testData.id,
            userId: 'test-user-id',
            type: 'New Fall',
            description: 'New description',
          })

        expect(response.status).toBe(201)
        expect(Incident.findByPk).toHaveBeenCalledWith(testData.id);
        expect(testData.save).toHaveBeenCalled();

      })

      test('Should not update the incident - incident not found', async () => {
        (Incident.findByPk as jest.Mock).mockResolvedValue(null);

        const invalidIncidentId = '00000'
        const response = await request(app)
          .post(`/incidents/${invalidIncidentId}`)
          .send({
            id: testData.id,
            userId: 'test-user-id',
            type: 'New Fall',
            description: 'New description',
          })
        
        
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "Incident not found" })
      })

      test('Should fail to update incident', async () => {
        const testFailData = {
          ...testData,
          save: jest.fn().mockRejectedValue(new Error('Database error')),
        };

        (Incident.findByPk as jest.Mock).mockResolvedValue(testFailData);

        const response = await request(app)
          .post(`/incidents/${testData.id}`)
          .send({
            id: testData.id,
            userId: 'test-user-id',
            type: 'New Fall',
            description: 'New description',
          })

        expect(response.status).toBe(500)
        expect(response.body).toEqual({ error: "Failed to update incident" })

      })
    })

    describe('Summarize Incident', () => {

      test('Should fail to get summary', async () => {
        (Incident.findByPk as jest.Mock).mockResolvedValue(testData);

        (openai.chat.completions.create as jest.Mock).mockRejectedValue(new Error('OpenAI error'));
    
        const response = await request(app)
          .post(`/incidents/${testData.id}/summarize`)
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Failed to generate summary for incident" });
      })

      test('Should fail to find incident', async () => {
        (Incident.findByPk as jest.Mock).mockResolvedValue(null);
    
        const invalidIncidentId = '00000'
        const response = await request(app)
          .post(`/incidents/${invalidIncidentId}/summarize`)
        
        expect(response.status).toBe(404);
        expect(Incident.findByPk).toHaveBeenCalledWith(invalidIncidentId);
        expect(response.body).toEqual({ message: "Incident not found" })
      })

      test('Should generate a summary using OpenAI', async () => {
        (Incident.findByPk as jest.Mock).mockResolvedValue(testData);
        const testSum =
          'Patient experienced a fall. The symptoms that are seen could suggest a concussion and potential damage to their leg.';
      
          jest.spyOn(openai.chat.completions, 'create').mockResolvedValue({
            id: "chatcmpl-123",
            object: "chat.completion",
            created: Date.now(),
            model: "gpt-4o-mini",
            choices: [
              {
                index: 0,
                finish_reason: "stop",
                logprobs: null,
                message: {
                  role: "assistant",
                  content: testSum,
                  refusal: null
                }
              }
            ]
          });
          
      
        const response = await request(app).post(
          `/incidents/${testData.id}/summarize`
        );
      
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          message: 'Summary generated for incident',
          summarized: testSum
        });
        expect(testData.save).toHaveBeenCalled();
        expect(testData.summary).toBe(testSum);
    
        expect(openai.chat.completions.create).toHaveBeenCalledWith(expect.objectContaining({
          model: expect.any(String),
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining(testData.description)
            })
          ]),
          temperature: expect.any(Number)
        }));
      });
    })
  })
  
});


