import { Page, expect } from '@playwright/test';
import { Tester } from './tester';
import path from 'path';
import * as fs from 'fs';

export class UploadTester extends Tester {
  binFilePath: string;
  csvFilePath: string;
  mp4FilePath: string;
  frontendFilePath: string;

  constructor(page: Page, binFileName: string) {
    super(page);
    this.binFilePath = path.join(__dirname, `../test-files/${binFileName}.bin`);;
    this.csvFilePath = '';
    this.mp4FilePath = '';
    this.frontendFilePath = `${binFileName}/BATT VOLT`;

    if (!fs.existsSync(this.binFilePath)) {
      throw new Error(`Test file not found at ${this.binFilePath}`);
    }
  }

  async testUploadBinFile() {
    // Check backend availability before proceeding
    try {
      await this.checkBackendAvailability();
    } catch (error) {
      throw new Error(`Backend check failed before upload test: ${error.message}`);
    }
    
    await this.openUploadForm();
    await this.uploadFile(this.binFilePath);
    await this.submitFile();
    await this.verifyFilesUploaded();
  }

  async testUploadNoFile() {
    // Check backend availability before proceeding
    try {
      await this.checkBackendAvailability();
    } catch (error) {
      throw new Error(`Backend check failed before no-file test: ${error.message}`);
    }
    
    await this.openUploadForm();
    await this.submitFile();
    await this.verifyNoFileSelectedAlert();
  }

  async awaitFileParsed(filePath: string) {
    let fileUploaded = false;
    
    while (!fileUploaded) {
      await this.openDownloadForm();
      await this.page.waitForTimeout(1000);

      if (await this.isFileVisible(filePath)) {
        fileUploaded = true;
      }
      
      await this.closeDownloadForm()
    }
  }

  // Basic functions

  async openUploadForm() {
    await this.page.getByRole('button', { name: 'Icon Upload Data' }).click();
  }

  async openDownloadForm() {
    await this.page.getByRole('button', { name: 'Download' }).click();
  }

  async closeDownloadForm() {
    await this.page.getByRole('button', { name: 'X' }).click();
  }

  async uploadFile(filePath: string) {
    await this.page.getByText('Choose a file or drag it hereDrop the file').click();
    await this.page.setInputFiles('input[type="file"]', filePath);
  }

  async submitFile() {
    await this.page.getByRole('button', { name: 'Submit right arrow' }).click();
  }

  async verifyFilesUploaded() {
    await expect(this.page.getByText('Files uploaded successfully')).toBeVisible();
  }

  async verifyNoFileSelectedAlert() {
    this.page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Please select a file');
      await dialog.accept();
    });
  }

  async isFileVisible(filePath: string) {
    const splitPath = filePath.split('/');
    for (const path of splitPath) {
      if (!await this.page.getByRole('cell', { name: path }).isVisible()) {
        return false;
      } else if (path === splitPath[splitPath.length - 1]) { 
        // If last path, return true
        return true;
      } else { 
        // Expand folder
        await this.page.getByRole('cell', { name: path }).click();
      }
    }
  }
}