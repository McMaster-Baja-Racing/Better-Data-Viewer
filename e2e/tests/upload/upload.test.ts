import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Upload Form', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    // Verifies that the Upload button is visible before starting any tests
    await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible();
  });

  test('should open upload form and submit a file', async ({ page }) => {
    const filePath = path.resolve(__dirname, './test-files/endurance.bin');

    // Opens the upload form by clicking the Upload button
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Clicks on the file input label and uploads the file
    await page.locator('#label-file-upload').click();
    await page.setInputFiles('#label-file-upload', filePath); 
    
    // Clicks the submit button
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Add assertions here to verify successful upload, if applicable
  });

  test('should display an alert when no file is selected', async ({ page }) => {
    // Open the upload form
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Set up an event listener for the alert dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Please select a file');
      await dialog.accept(); // Accepts (closes) the alert dialog
    });

    // Try to submit without selecting a file, triggering the alert
    await page.getByRole('button', { name: 'Submit' }).click();
  });
});
