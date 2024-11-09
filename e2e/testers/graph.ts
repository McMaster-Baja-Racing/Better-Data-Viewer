import { Page, expect } from '@playwright/test';
import { Tester } from './tester';

export class GraphTester extends Tester {

  constructor(page: Page) {
    super(page);
  }

  async testCreateGraph() {
    await this.openGraphForm();
    await this.page.waitForTimeout(20000);
    await this.pressNextButton();
    await this.selectFile('endurance/BATT PERC');
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