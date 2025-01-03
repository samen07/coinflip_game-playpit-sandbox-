import { Page, Locator } from '@playwright/test';

export class IndexPage {
    private readonly page: Page;
    private readonly authForm: Locator;

    constructor(page: Page) {
        this.page = page;
        this.authForm = page.locator('form#auth-form');
    }

    async isIndexPageLoaded(): Promise<boolean> {
        try {
            await this.authForm.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch (error) {
            return false;
        }
    }
}
