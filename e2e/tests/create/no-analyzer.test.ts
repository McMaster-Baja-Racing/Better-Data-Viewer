import { test, expect } from '@playwright/test';
import { UploadTester, GraphTester } from '../../testers';

test.describe('Create graphs', () => {

  test.beforeEach(async ({ page }) => {
    const uploadTester = new UploadTester(page);

    await page.goto('http://localhost:5173/');
    await uploadTester.testUploadBinFile();
  });

  test('should open upload form and submit a file', async ({ page }) => {
    const graphTester = new GraphTester(page);
    await graphTester.testCreateGraph();
  });


});