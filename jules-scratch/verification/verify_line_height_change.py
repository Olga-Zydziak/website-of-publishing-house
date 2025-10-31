
import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        manager_path = os.path.abspath('manager.html')
        index_path = os.path.abspath('index.html')

        await page.goto('file://' + manager_path)

        await page.wait_for_selector('.ql-editor', state='visible')

        await page.click('.ql-editor')
        await page.keyboard.type('This text should have a line height of 2.0.')
        await page.keyboard.press('Control+A')

        await page.locator('.ql-toolbar .ql-line-height').click()
        await page.locator('.ql-picker-item[data-value="2.0"]').click()

        await page.click('button[type="submit"]')

        await page.goto('file://' + index_path)

        await page.wait_for_selector('#tab-panel-body')

        await page.screenshot(path='jules-scratch/verification/line_height_verification.png')

        await browser.close()

asyncio.run(main())
