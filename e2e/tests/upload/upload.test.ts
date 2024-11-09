import { test, expect } from '@playwright/test';
import { UploadTester } from '../../testers';

test.describe('Upload Form', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible();
  });

  test('should open upload form and submit a file', async ({ page }) => {
    const uploadTester = new UploadTester(page);
    await uploadTester.testUploadBinFile();
  });

  test('should display an alert when no file is selected', async ({ page }) => {
    const uploadTester = new UploadTester(page);
    await uploadTester.testUploadNoFile();
  });
});
