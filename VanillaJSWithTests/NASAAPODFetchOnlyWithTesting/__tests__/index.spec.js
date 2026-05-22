import { test, expect } from '@playwright/test';

test.describe('NASA APOD Fetch Demo', () => {

  test.beforeEach(async ({ page }) => {
    // ✅ Mock the exact NASA endpoint
    await page.route('**/api.nasa.gov/planetary/apod**', async (route) => {
      console.log('✅ NASA APOD API request intercepted by Playwright!');

      // Simulate a tiny network delay so the loading state is visible
      await new Promise(r => setTimeout(r, 700));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          date: "2026-05-22",
          explanation: "This is a beautiful mocked explanation of a distant galaxy used for automated testing with Playwright.",
          hdurl: "https://picsum.photos/id/1015/1920/1080",
          title: "Playwright Test - Mocked Galaxy"
        }),
      });
    });

    await page.goto('/');
  });

  test('should load page correctly with initial placeholder', async ({ page }) => {
    await expect(page).toHaveTitle('NASA APOD Fetch Demo');
    await expect(page.getByText("Let's load some NASA images!!! Oh yeah")).toBeVisible();

    // Initial placeholder image
    await expect(page.locator('#imgfromnasafetch')).toHaveAttribute('src', 'images/image1.jpg');
  });

  test('should fetch NASA APOD data and update UI when button is clicked', async ({ page }) => {
    const button = page.getByRole('button', { name: /Click Me.*NOW/i });
    const img = page.locator('#imgfromnasafetch');

    // Click the button
    await button.click();

    // Should show loading image (thanks to the delay we added)
    await expect(img).toHaveAttribute('src', 'images/loading.jpg', { timeout: 5000 });

    // Then should update to the mocked hdurl
    await expect(img).toHaveAttribute('src', 'https://picsum.photos/id/1015/1920/1080', { timeout: 15000 });

    // Check the three paragraphs
    await expect(page.locator('#apiline4fetch')).toHaveText('2026-05-22');
    await expect(page.locator('#apiline5fetch')).toContainText('beautiful mocked explanation');
    await expect(page.locator('#apiline6fetch')).toHaveText('✅ API from NASA loaded successfully. Thank you!');

    console.log('🎉 All assertions passed - test successful!');
  });
});