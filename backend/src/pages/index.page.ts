import {GenericPage} from "./generic.page";

export class IndexPage extends GenericPage{
    private readonly authFormLocator = 'form#auth-form';
    private readonly loginButtonLocator = '[data-testid="login-button"]';
    private readonly alertTextLocator = '[data-testid="alert-message"]';
    private readonly alertCloseButtonLocator = '[data-testid="alert-close-button"]';
    private readonly registerButtonLocator = '[data-testid="register-button"]';
    private readonly emailInputFieldLocator = '[data-testid="email-input"]';
    private readonly passwordInputFieldLocator = '[data-testid="password-input"]';

    async isIndexPageLoaded(): Promise<boolean> {
        try {
            await this.page.locator(this.authFormLocator).waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch (error) {
            return false;
        }
    }

    async pressLoginButton(): Promise<IndexPage> {
        await this.page.locator(this.loginButtonLocator).click();
        await this.page.waitForSelector('#custom-alert', { state: 'visible', timeout: 5000 });

        return this;
    }

    async pressRegisterButton(): Promise<IndexPage> {
        await this.page.locator(this.registerButtonLocator).click();
        await this.page.waitForSelector('#custom-alert', { state: 'visible', timeout: 5000 });

        return this;
    }

    async getAlertText(): Promise<string> {
        const alertText = await this.page.locator(this.alertTextLocator).innerText();

        return alertText.trim();
    }

    async getAlertCloseButtonText(): Promise<string> {
        const alertText = await this.page.locator(this.alertCloseButtonLocator).innerText();

        return alertText.trim();
    }

    async registerUser(email: string, password: string): Promise<IndexPage> {
        await this.page.locator(this.emailInputFieldLocator).fill(email);
        await this.page.locator(this.passwordInputFieldLocator).fill(password);

        await this.page.locator(this.registerButtonLocator).click();
        await this.page.waitForSelector('#custom-alert', { state: 'visible', timeout: 5000 });

        return this;
    }
}
