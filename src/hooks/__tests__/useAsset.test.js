import { renderHook } from '@testing-library/react-hooks';
import { useAsset } from '../useAsset';
import { assetLoader } from '../../utils/assetLoader';

jest.mock('../../utils/assetLoader');

describe('useAsset', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should load asset successfully', async () => {
        const mockImage = new Image();
        assetLoader.loadImage.mockResolvedValueOnce(mockImage);

        const { result, waitForNextUpdate } = renderHook(() => 
            useAsset('test.jpg')
        );

        expect(result.current.asset).toBe(null);
        expect(result.current.error).toBe(null);

        await waitForNextUpdate();

        expect(result.current.asset).toBe(mockImage);
        expect(result.current.error).toBe(null);
    });

    it('should handle loading errors', async () => {
        const error = new Error('Failed to load');
        assetLoader.loadImage.mockRejectedValueOnce(error);

        const { result, waitForNextUpdate } = renderHook(() => 
            useAsset('test.jpg')
        );

        await waitForNextUpdate();

        expect(result.current.asset).toBe(null);
        expect(result.current.error).toBe(error);
    });
});