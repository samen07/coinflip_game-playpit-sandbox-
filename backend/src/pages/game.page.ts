import {GenericPage} from "./generic.page";

export class GamePage extends GenericPage{
    private readonly gamePageLocator = '[data-testid="game-container"]';
    private readonly playButtonLocator = '[data-testid="play-btn"]';
    private readonly exitButtonLocator = '[data-testid="exit-btn"]';
    private readonly addMoneyButtonLocator = '[data-testid="add-money-btn"]';


    async isPlayPageLoaded(): Promise<boolean> {
        try {
            await this.page.locator(this.gamePageLocator).waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch (error) {
            return false;
        }
    }
}
