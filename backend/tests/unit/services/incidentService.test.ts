import { IncidentService } from '@/services/incidentService';
import Incident from '@/models/incident';
import openai from '@/config/openai';

jest.mock('@/models/incident');
jest.mock('@/config/openai');

describe('Incident Service Unit Tests', () => {
    let incidentService: IncidentService;

    const testIncident = {
        id: '12345',
        userId: 'test-user-id',
        type: 'Fall',
        description: 'The patient experienced a severe fall. They seem to have pain in their leg and head.',
        summary: null,
        save: jest.fn(),
        update: jest.fn(),
    };

    beforeEach(() => {
        incidentService = new IncidentService();
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should successfully create an incident', async () => {
            (Incident.create as jest.Mock).mockResolvedValue(testIncident);

            const response = await incidentService.create('test-user-id', {
                type: 'Fall',
                description: 'The patient experienced a severe fall.'
            });

            expect(Incident.create).toHaveBeenCalledWith({
                userId: 'test-user-id',
                type: 'Fall',
                description: 'The patient experienced a severe fall.'
            });
            console.log(response)
            expect(response).toEqual(testIncident);
        });

        it('should throw error when creation fails', async () => {
            (Incident.create as jest.Mock).mockRejectedValue(new Error('DB error'));

            await expect(incidentService.create('test-user-id', {
                type: 'Fall',
                description: 'The patient experienced a severe fall.'
            })).rejects.toThrow('DB error');
        });
    });

    describe('update', () => {
        it('should successfully update an incident', async () => {
            (Incident.findByPk as jest.Mock).mockResolvedValue(testIncident);

            const result = await incidentService.update('12345', {
                description: 'Updated description'
            });

            expect(Incident.findByPk).toHaveBeenCalledWith('12345');
            expect(testIncident.save).toHaveBeenCalled();
            expect(result).toEqual(testIncident);
        });

        it('should return null when incident not found', async () => {
            (Incident.findByPk as jest.Mock).mockResolvedValue(null);

            const result = await incidentService.update('12345', {
                description: 'Updated description'
            });
            expect(result).toBeNull();
        });

        it('should throw error when update fails', async () => {
            (Incident.findByPk as jest.Mock).mockResolvedValue({
            ...testIncident,
            save: jest.fn().mockRejectedValue(new Error('DB error'))
            });

            await expect(incidentService.update('12345', {
            description: 'Updated description'
            })).rejects.toThrow('DB error');
        });
    });

    describe('findAllByUser', () => {
        it('should return incidents for user', async () => {
            (Incident.findAll as jest.Mock).mockResolvedValue([testIncident]);

            const result = await incidentService.findAllByUser('test-user-id');

            expect(Incident.findAll).toHaveBeenCalledWith({
            where: { userId: 'test-user-id' }
            });
            expect(result).toEqual([testIncident]);
        });

        it('should throw error when retrieval fails', async () => {
            (Incident.findAll as jest.Mock).mockRejectedValue(new Error('DB error'));

            await expect(incidentService.findAllByUser('test-user-id'))
            .rejects.toThrow('DB error');
        });
    });

    describe('findById', () => {
        it('should return incident by id', async () => {
            (Incident.findByPk as jest.Mock).mockResolvedValue(testIncident);

            const result = await incidentService.findById('12345');

            expect(Incident.findByPk).toHaveBeenCalledWith('12345');
            expect(result).toEqual(testIncident);
        });

        it('should return null when incident not found', async () => {
            (Incident.findByPk as jest.Mock).mockResolvedValue(null);

            const result = await incidentService.findById('12345');

            expect(result).toBeNull();
        });
    });

    describe('generateSummary', () => {
        it('should generate and save summary', async () => {
            const mockSummary = 'Summary of the incident';
            (Incident.findByPk as jest.Mock).mockResolvedValue(testIncident);
            (openai.chat.completions.create as jest.Mock).mockResolvedValue({
            choices: [{ message: { content: mockSummary } }]
            });

            const result = await incidentService.generateSummary('12345');

            expect(Incident.findByPk).toHaveBeenCalledWith('12345');
            expect(openai.chat.completions.create).toHaveBeenCalled();
            expect(testIncident.update).toHaveBeenCalledWith({ summary: mockSummary });
            expect(result).toBe(mockSummary);
        });

        it('should return null when incident not found', async () => {
            (Incident.findByPk as jest.Mock).mockResolvedValue(null);

            const result = await incidentService.generateSummary('12345');

            expect(result).toBeNull();
        });

        it('should throw error when OpenAI fails', async () => {
            (Incident.findByPk as jest.Mock).mockResolvedValue(testIncident);
            (openai.chat.completions.create as jest.Mock).mockRejectedValue(new Error('OpenAI error'));

            await expect(incidentService.generateSummary('12345'))
            .rejects.toThrow('OpenAI error');
        });
    });
});