import { test } from '@playwright/test';
import { UploadTester, GraphTester } from '../../testers';
import { WEB_SERVER_URL } from '../../playwright.config';

test.describe('Create graphs', () => {
  const fileName = '182848';

  test.beforeEach(async ({ page }) => {
    const uploadTester = new UploadTester(page, fileName);
    await page.goto(WEB_SERVER_URL);
    await uploadTester.testUploadBinFile();
  });

  test('should open upload form and submit a file', async ({ page }) => {
    const graphTester = new GraphTester(page, fileName);
    await graphTester.testCreateGraph();
  });
});