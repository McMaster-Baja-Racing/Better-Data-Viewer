import { test, expect } from '@playwright/test';
import path from 'path';
import * as fs from 'fs';

test.describe('Upload Form', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    // Verifies that the Upload button is visible before starting any tests
    await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible();
  });

  test('should open upload form and submit a file', async ({ page }) => {
    const filePath = path.join(__dirname, '../../test-files/endurance.bin');

    console.log("Resolved file path:", filePath);
    console.log("File exists:", fs.existsSync(filePath));

    if (!fs.existsSync(filePath)) {
      throw new Error(`Test file not found at ${filePath}`);
    }

    // Opens the upload form by clicking the Upload button
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Clicks on the file input label and uploads the file
    await page.locator('#label-file-upload').click();
    await page.setInputFiles('#label-file-upload', filePath); 
    
    // Clicks the submit button
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verifies that the 'Files Uploaded' text is visible
    await expect(page.getByText('Files Uploaded')).toBeVisible();
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
