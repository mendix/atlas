import { test, expect } from "@playwright/test";
const urls = require("./fixtures/pagesCollection.json");

test.describe("Screenshots of the pages", () => {
    for (const url of urls) {
        test(`matches snapshot for the page ${url.replace("/p/", "")}`, async ({ page }) => {
            await page.goto(url);

            await page.waitForLoadState("networkidle");
            await page.waitForSelector(".mx-page");

            await expect(page).toHaveScreenshot(`${url.replace("/p/", "")}.png`);
        });
    }
});
