import { IncidentController } from '@/controllers/incidentController';
import incidentService from '@/services/incidentService';

jest.mock('@/services/incidentService');

describe('Incident Controller Unit Tests', () => {
    let controller: IncidentController;
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: jest.Mock;

    const testIncident = {
        id: '12345',
        userId: 'test-user-id',
        type: 'Fall',
        description: 'The patient experienced a severe fall.',
        summary: null,
        toJSON: () => ({
            id: '12345',
            userId: 'test-user-id',
            type: 'Fall',
            description: 'The patient experienced a severe fall.',
            summary: null
        })
    };

    beforeEach(() => {
        controller = new IncidentController();
        mockNext = jest.fn();
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };

        mockRequest = {
            params: {},
            body: {},
            user: { uid: 'test-user-id' }
        };
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create incident successfully', async () => {
            mockRequest.body = {
                id: '12345',
                type: 'Fall',
                description: 'The patient experienced a severe fall.',
                summary: null,
            };
            (incidentService.create as jest.Mock).mockResolvedValue(testIncident.toJSON());

            await controller.create(mockRequest, mockResponse);

            expect(incidentService.create).toHaveBeenCalledWith('test-user-id', {
                id: '12345',
                type: 'Fall',
                description: 'The patient experienced a severe fall.',
                summary: null,
            });

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Incident created',
                incident: testIncident.toJSON()
            });
        });

        it('should handle unauthorized user', async () => {
            mockRequest.user = null;

            await controller.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Unauthorized user'
            });
        });

        it('should handle creation failure', async () => {
            mockRequest.body = {
                type: 'Fall',
                description: 'The patient experienced a severe fall.'
            };
            (incidentService.create as jest.Mock).mockRejectedValue(new Error('DB error'));

            await controller.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Failed to create incident'
            });
        });
    });

    describe('update', () => {
        it('should update incident successfully', async () => {
            mockRequest.params = { id: '12345' };
            mockRequest.body = { description: 'Updated description' };
            (incidentService.update as jest.Mock).mockResolvedValue(testIncident);

            await controller.update(mockRequest, mockResponse);

            expect(incidentService.update).toHaveBeenCalledWith('12345', {
                description: 'Updated description'
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Incident updated',
                incident: testIncident
            });
        });

        it('should handle incident not found', async () => {
            mockRequest.params = { id: '12345' };
            mockRequest.body = { description: 'Updated description' };
            (incidentService.update as jest.Mock).mockResolvedValue(null);

            await controller.update(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Incident not found'
            });
        });
    });

    describe('getAll', () => {
        it('should return all incidents for user', async () => {
            (incidentService.findAllByUser as jest.Mock).mockResolvedValue([testIncident.toJSON()]);

            await controller.getAll(mockRequest, mockResponse);

            expect(incidentService.findAllByUser).toHaveBeenCalledWith('test-user-id');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith([testIncident.toJSON()]);
        });

        it('should handle incident not found', async () => {
            mockRequest.params = { id: '99999' };
            (incidentService.findAllByUser as jest.Mock).mockResolvedValue(null);

            await controller.getOne(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Incident not found'
            });
        });
    });

    describe('getOne', () => {
        it('should return single incident', async () => {
            mockRequest.params = { id: '12345' };
            (incidentService.findById as jest.Mock).mockResolvedValue(testIncident.toJSON());

            await controller.getOne(mockRequest, mockResponse);

            expect(incidentService.findById).toHaveBeenCalledWith('12345');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(testIncident.toJSON());
        });

        it('should handle incident not found', async () => {
            mockRequest.params = { id: '99999' };
            (incidentService.findById as jest.Mock).mockResolvedValue(null);

            await controller.getOne(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Incident not found'
            });
        });

    });

    describe('summarize', () => {
    it('should generate summary successfully', async () => {
        const mockSummary = 'Summary of the incident';
        mockRequest.params = { id: '12345' };
        (incidentService.generateSummary as jest.Mock).mockResolvedValue(mockSummary);

        await controller.summarize(mockRequest, mockResponse);

        expect(incidentService.generateSummary).toHaveBeenCalledWith('12345');
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Summary generated',
            summary: mockSummary
        });
    });

    });
});