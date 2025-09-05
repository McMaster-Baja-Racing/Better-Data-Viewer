import { Page, expect } from '@playwright/test';
import { Tester } from './tester';

export class GraphTester extends Tester {
  constructor(page: Page, binFileName: string) {
    super(page);
  }

  async selectPreset(presetButtonName: string) {
    await this.page.getByRole('button', { name: presetButtonName }).click();
  }

  async selectExistingFile(fileName: string) {
    await this.page.getByRole('cell', { name: fileName }).click();
  }

  async submitGraph() {
    await this.page.getByRole('button', { name: 'Submit right arrow' }).click();
  }

  async verifyDashboardCreated() {
    // todo better way to verify that a graph was actually made
    await expect(this.page.getByText('Dashboard', { exact: true })).toBeVisible();
  }

  async testCreateGraphWithPreset(presetButtonName: string, fileName: string) {
    await this.selectPreset(presetButtonName);
    await this.selectExistingFile(fileName);
    await this.submitGraph();
    await this.verifyDashboardCreated();
  }
}