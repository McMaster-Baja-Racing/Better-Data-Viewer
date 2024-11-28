import { Page } from '@playwright/test';

export abstract class Tester {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}