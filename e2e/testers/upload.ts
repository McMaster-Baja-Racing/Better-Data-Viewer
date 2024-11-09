import { Page, expect } from '@playwright/test';
import { Tester } from './tester';
import path from 'path';
import * as fs from 'fs';

export class UploadTester extends Tester {
  binFilePath: string;
  csvFilePath: string;
  mp4FilePath: string;

  constructor(page: Page) {
    super(page);
    this.binFilePath = path.join(__dirname, '../test-files/endurance.bin');
    this.csvFilePath = '';
    this.mp4FilePath = '';

    if (!fs.existsSync(this.binFilePath)) {
      throw new Error(`Test file not found at ${this.binFilePath}`);
    }
  }

  async testUploadBinFile() {
    await this.openUploadForm();
    await this.uploadFile(this.binFilePath);
    await this.submitFile();
    await this.verifyFilesUploaded();
  }

  async testUploadNoFile() {
    await this.openUploadForm();
    await this.submitFile();
    await this.verifyNoFileSelectedAlert();
  }

  // Basic functions

  async openUploadForm() {
    await this.page.getByRole('button', { name: 'Upload' }).click();
  }

  async uploadFile(filePath: string) {
    await this.page.locator('#label-file-upload').click();
    await this.page.setInputFiles('#label-file-upload', filePath);
  }

  async submitFile() {
    await this.page.getByRole('button', { name: 'Submit' }).click();
  }

  async verifyFilesUploaded() {
    await expect(this.page.getByText('Files Uploaded')).toBeVisible();
  }

  async verifyNoFileSelectedAlert() {
    this.page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Please select a file');
      await dialog.accept();
    });
  }
}