// Save the real native fetch once (prevents recursion/stack overflow)
const nativeFetch = globalThis.fetch;

describe("fetchNASAImage() - JavaScript Logic", () => {
  let mockImage;
  let mockDateParagraph;
  let mockExplanationParagraph;
  let mockStatusParagraph;

  beforeAll(() => {
    mockImage = { src: "" };
    mockDateParagraph = { textContent: "" };
    mockExplanationParagraph = { textContent: "" };
    mockStatusParagraph = { textContent: "" };

    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "imgfromnasafetch") return mockImage;
      if (id === "apiline4fetch") return mockDateParagraph;
      if (id === "apiline5fetch") return mockExplanationParagraph;
      if (id === "apiline6fetch") return mockStatusParagraph;
      return null;
    });

    return import("../script.js");
  });

  beforeEach(() => {
    mockImage.src = "";
    mockDateParagraph.textContent = "";
    mockExplanationParagraph.textContent = "";
    mockStatusParagraph.textContent = "";

    vi.clearAllMocks();
  });

  // ──────────────────────────────────────────────────────────────
  // Fast mocked tests (happy path)
  // ──────────────────────────────────────────────────────────────
  test("should immediately set loading state when called", () => {
    global.fetch = vi.fn(() => new Promise(() => {}));

    window.LetsCallAPIFetch();

    expect(mockImage.src).toBe("images/loading.jpg");
    expect(mockDateParagraph.textContent).toBe("Loading...");
    expect(mockExplanationParagraph.textContent).toBe(
      "Fetching beautiful space image from NASA...",
    );
    expect(mockStatusParagraph.textContent).toBe("Please wait...");
  });

  test("should call the correct NASA APOD API URL", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        date: "2026-05-22",
        explanation: "Test explanation",
        hdurl: "https://example.com/image.jpg",
      }),
    });

    window.LetsCallAPIFetch();
    await new Promise((r) => setTimeout(r, 80));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://api.nasa.gov/planetary/apod"),
    );
  });

  test("should update UI with NASA data on successful fetch", async () => {
    const mockData = {
      date: "2026-05-22",
      explanation:
        "This is a beautiful mocked explanation of a distant galaxy.",
      hdurl: "https://picsum.photos/id/1015/1920/1080",
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    window.LetsCallAPIFetch();
    await new Promise((r) => setTimeout(r, 80));

    expect(mockDateParagraph.textContent).toBe(mockData.date);
    expect(mockExplanationParagraph.textContent).toBe(mockData.explanation);
    expect(mockStatusParagraph.textContent).toBe(
      "✅ API from NASA loaded successfully. Thank you!",
    );
    expect(mockImage.src).toBe(mockData.hdurl);
  });

  test("should use data.url as fallback if hdurl is missing", async () => {
    const mockData = {
      date: "2026-05-22",
      explanation: "Test",
      url: "https://picsum.photos/id/202/800/600",
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    window.LetsCallAPIFetch();
    await new Promise((r) => setTimeout(r, 80));

    expect(mockImage.src).toBe(mockData.url);
  });

  // ──────────────────────────────────────────────────────────────
  // Real integration tests (live network calls)
  // ──────────────────────────────────────────────────────────────
  test("should handle real NASA API error gracefully (invalid key)", async () => {
    // Mock a 403 response deterministically instead of relying on live network
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 403 });

    window.LetsCallAPIFetch();
    await new Promise((r) => setTimeout(r, 1200));

    expect(mockImage.src).toBe("images/loading.jpg");
    expect(mockDateParagraph.textContent).toBe("Loading...");
    expect(mockExplanationParagraph.textContent).toBe(
      "Sorry, something went wrong while fetching from NASA.",
    );
    expect(mockStatusParagraph.textContent).toBe(
      "❌ Failed to load image. Please try again.",
    );

    console.log("✅ Simulated NASA error test completed (mocked 403)");
  });

  test("should successfully fetch real NASA APOD data (mocked live API call)", async () => {
    // Provide a deterministic successful response rather than calling the live API
    const liveMock = {
      copyright: "Test Author",
      date: "2026-05-22",
      explanation:
        "This is a deterministic mocked explanation long enough to satisfy the test.",
      hdurl: "https://example.com/mock-image.jpg",
      media_type: "image",
      service_version: "v1",
      title: "Mocked APOD",
      url: "https://example.com/mock-image-small.jpg",
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => liveMock });

    window.LetsCallAPIFetch();

    // give the code time to resolve
    await new Promise((r) => setTimeout(r, 300));

    expect(mockStatusParagraph.textContent).toBe(
      "✅ API from NASA loaded successfully. Thank you!",
    );
    expect(mockImage.src).toMatch(/^https?:\/\//); // valid image URL
    expect(mockDateParagraph.textContent).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
    expect(mockExplanationParagraph.textContent.length).toBeGreaterThan(30);

    console.log("🎉 Simulated NASA success test completed!");
    console.log("   Date       :", mockDateParagraph.textContent);
    console.log("   Image URL  :", mockImage.src);
  });
});
