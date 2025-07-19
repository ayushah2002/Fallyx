import request from 'supertest';
import app from '@/app';
import admin from '@/config/firebase';

const mockAuth = {
    verifyIdToken: jest.fn()
};

jest.mock('@/config/firebase', () => ({
    __esModule: true,
    default: {
      auth: jest.fn(() => mockAuth)
    }
}));

jest.mock('@/models/incident');

describe('Auth Integration Tests', () => {
    const testUser = {
        uid: 'test-user-id',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockAuth.verifyIdToken.mockReset();
        
    });

    test('should allow access with valid token', async () => {
        (admin.auth().verifyIdToken as jest.Mock).mockResolvedValue(testUser);

        const response = await request(app)
            .get('/incidents')
            .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(200);
    });

    test('should deny access with invalid token', async () => {
        (admin.auth().verifyIdToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

        const response = await request(app)
            .get('/incidents')
            .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: 'Unauthorized user' });
    });

    test('should deny access with malformed token', async () => {
        const response = await request(app)
            .get('/incidents')
            .set('Authorization', 'MalformedToken');

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: 'Unauthorized user' });
    });

    test('should deny access with no token', async () => {
        const response = await request(app)
            .get('/incidents');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'Unauthorized user' });
    });
});