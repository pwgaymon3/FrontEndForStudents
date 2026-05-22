import { describe, test, expect, beforeEach, beforeAll, jest } from '@jest/globals';

/**
 * Unit tests for script.js (pure JavaScript logic only)
 */

describe('fetchNASAImage() - JavaScript Logic', () => {

  let mockImage;
  let mockDateParagraph;
  let mockExplanationParagraph;
  let mockStatusParagraph;

  beforeAll(() => {
    // Create mock DOM elements
    mockImage = { src: '' };
    mockDateParagraph = { textContent: '' };
    mockExplanationParagraph = { textContent: '' };
    mockStatusParagraph = { textContent: '' };

    // IMPORTANT: Mock getElementById BEFORE script.js is imported
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'imgfromnasafetch') return mockImage;
      if (id === 'apiline4fetch') return mockDateParagraph;
      if (id === 'apiline5fetch') return mockExplanationParagraph;
      if (id === 'apiline6fetch') return mockStatusParagraph;
      return null;
    });

    // Now safely import the script (top-level DOM selection happens here)
    return import('../script.js');
  });

  beforeEach(() => {
    // Reset mock element states for each test
    mockImage.src = '';
    mockDateParagraph.textContent = '';
    mockExplanationParagraph.textContent = '';
    mockStatusParagraph.textContent = '';

    global.fetch = jest.fn();
  });

  test('should immediately set loading state when called', () => {
    global.fetch.mockReturnValue(new Promise(() => {})); // pending promise

    window.LetsCallAPIFetch();

    expect(mockImage.src).toBe('images/loading.jpg');
    expect(mockDateParagraph.textContent).toBe('Loading...');
    expect(mockExplanationParagraph.textContent).toBe('Fetching beautiful space image from NASA...');
    expect(mockStatusParagraph.textContent).toBe('Please wait...');
  });

  test('should call the correct NASA APOD API URL', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ date: '2026-05-22', explanation: 'Test explanation', hdurl: 'https://example.com/image.jpg' })
    });

    window.LetsCallAPIFetch();

    await new Promise(resolve => setTimeout(resolve, 80));

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.nasa.gov/planetary/apod')
    );
  });

  test('should update UI with NASA data on successful fetch', async () => {
    const mockData = {
      date: '2026-05-22',
      explanation: 'This is a beautiful mocked explanation of a distant galaxy.',
      hdurl: 'https://picsum.photos/id/1015/1920/1080'
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    window.LetsCallAPIFetch();

    await new Promise(resolve => setTimeout(resolve, 80));

    expect(mockDateParagraph.textContent).toBe(mockData.date);
    expect(mockExplanationParagraph.textContent).toBe(mockData.explanation);
    expect(mockStatusParagraph.textContent).toBe('✅ API from NASA loaded successfully. Thank you!');
    expect(mockImage.src).toBe(mockData.hdurl);
  });

  test('should use data.url as fallback if hdurl is missing', async () => {
    const mockData = {
      date: '2026-05-22',
      explanation: 'Test',
      url: 'https://picsum.photos/id/202/800/600'
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    window.LetsCallAPIFetch();

    await new Promise(resolve => setTimeout(resolve, 80));

    expect(mockImage.src).toBe(mockData.url);
  });

  test('should handle fetch error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    window.LetsCallAPIFetch();

    await new Promise(resolve => setTimeout(resolve, 80));

    expect(mockImage.src).toBe('images/loading.jpg');
    expect(mockDateParagraph.textContent).toBe('Loading...');
    expect(mockExplanationParagraph.textContent).toBe('Sorry, something went wrong while fetching from NASA.');
    expect(mockStatusParagraph.textContent).toBe('❌ Failed to load image. Please try again.');
  });
});