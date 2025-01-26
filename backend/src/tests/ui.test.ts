import { test, expect } from '@playwright/test';
import { openLoginPage } from '../utils';
import * as testUtils from "../utils";

test.describe('Index.html Accessibility Test', () => {
    const authData = testUtils.getAuthData();

    test('007 should verify that index looks as expected', async ({ page }) => {
        const indexPage = await openLoginPage(page);

        await indexPage.compareScreenshot('login-page.png');
    });

    test('008 Login Alert with empty credentials should looks as expected', async ({ page }) => {
        const indexPage = await openLoginPage(page);
        await indexPage.pressLoginButton();

        expect(indexPage.isAlertShown()).toBeTruthy();
        expect(await indexPage.getAlertText()).toBe("Wrong email or password.");
        expect(await indexPage.getAlertCloseButtonText()).toBe("Close");
    });

    test('009 Register Alert with empty credentials should looks as expected', async ({ page }) => {
        const indexPage = await openLoginPage(page);
        await indexPage.pressRegisterButton();

        expect(indexPage.isAlertShown()).toBeTruthy();
        expect(await indexPage.getAlertText()).toBe("Email and Password are required");
        expect(await indexPage.getAlertCloseButtonText()).toBe("Close");
    });

    test('010 Register Alert if User existed should looks as expected', async ({ page }) => {
        const indexPage = await openLoginPage(page);
        await indexPage.registerUser(authData.email, authData.password);

        expect(await indexPage.getAlertText()).toBe("Register error.");
    });

    test('011 Register Alert on register should looks as expected', async ({ page }) => {
        const indexPage = await openLoginPage(page);
        await indexPage.registerUser(authData.reg_new_test_usr, "password");

        expect(await indexPage.getAlertText()).toBe("User registered, you can Login now!");
    });
});
