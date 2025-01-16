import { expect, Page } from '@playwright/test';

export class GenericPage {
    protected readonly page: Page;
    private readonly alertLocator = '[data-testid="custom-alert"]';

    constructor(page: Page) {
        this.page = page;
    }

    async compareScreenshot(snapshotName: string): Promise<void> {
        const screenshot = await this.page.screenshot();
        expect(screenshot).toMatchSnapshot(snapshotName);
    }

    async isAlertShown(): Promise<boolean> {

        return this.page.locator(this.alertLocator).isVisible();
    }
}
