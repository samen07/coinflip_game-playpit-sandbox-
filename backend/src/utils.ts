import * as fs from 'fs';
import config from './test_config';
import { Page } from '@playwright/test';
import { IndexPage } from './pages/index.page';
const BASE_FRONTEND_URL : string = config.BASE_FRONTEND_URL;

export function getAuthData(){
    const filePath = 'src\\tests\\test_login_data.json';
    const rawData = fs.readFileSync(filePath);
    const authData = JSON.parse(rawData.toString());

    return {
        email: authData.email as string,
        password: authData.password as string,
        wrongpassword: authData.wrongpassword as string,
    };
}

export async function openLoginPage(page: Page): Promise<IndexPage> {
    const indexPage = new IndexPage(page);

    await page.goto(`${BASE_FRONTEND_URL}/index.html`);
    const isLoaded = await indexPage.isIndexPageLoaded();

    if (!isLoaded) {
        throw new Error('Failed to load the index page.');
    }

    return indexPage;
}
