import { Page, expect } from '@playwright/test';
import { Tester } from './tester';

export class GraphTester extends Tester {
  frontendFilePath: string;

  constructor(page: Page, binFileName: string) {
    super(page);
    this.frontendFilePath = `${binFileName}/BATT VOLT`;
  }

  async testCreateGraph() {
    await this.openGraphForm();
    await this.pressNextButton();
    await this.selectFile(this.frontendFilePath);
    await this.pressNextButton();
    await this.submitGraph();
    await this.verifyGraphCreated();
  }

  // Basic functions

  async openGraphForm() {
    await this.page.getByRole('button', { name: 'Create Graph' }).click();
  }

  async pressNextButton() {
    await this.page.getByRole('button', { name: 'Next' }).click();
  }

  async selectFile(filePath: string) {
    const splitPath = filePath.split('/');
    for (const folder of splitPath) {
      await this.page.getByRole('cell', { name: folder }).click();
    }
  }

  async submitGraph() {
    await this.page.getByRole('button', { name: 'Submit' }).click();
  }

  async verifyGraphCreated() {
    await expect(this.page.getByText('Graph Created')).toBeVisible();
  }
}