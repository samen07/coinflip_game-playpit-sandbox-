import { test, expect } from '@playwright/test';
import { IndexPage } from '../pages/index.page';

const TEST_ENV = 'http://localhost:3000';


test.describe('Index.html Accessibility Test', () => {
    test('007 should verify that index looks as expected', async ({ page }) => {
        await page.goto(TEST_ENV + '/index.html');
        const indexPage = new IndexPage(page);
        const isLoaded = await indexPage.isIndexPageLoaded();

        expect(isLoaded).toBe(true);

        const screenshot = await page.screenshot();

        expect(screenshot).toMatchSnapshot('login-page.png'); // Reference screenshot
    });
});

//make login, BUG search press Login button not dirrect but create Collection of buttons and press button where text is "Login"