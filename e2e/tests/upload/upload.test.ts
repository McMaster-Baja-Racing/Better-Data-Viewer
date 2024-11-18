import { test, expect } from '@playwright/test';
import { UploadTester } from '../../testers';
import { WEB_SERVER_URL } from '../../playwright.config';

test.describe('Upload Form', () => {
  const fileName = '182848';

  test.beforeEach(async ({ page }) => {
    await page.goto(WEB_SERVER_URL);
    await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible();
  });

  test('should open upload form and submit a file', async ({ page }) => {
    const uploadTester = new UploadTester(page, fileName);
    await uploadTester.testUploadBinFile();
  });

  test('should display an alert when no file is selected', async ({ page }) => {
    const uploadTester = new UploadTester(page, fileName);
    await uploadTester.testUploadNoFile();
  });
});
