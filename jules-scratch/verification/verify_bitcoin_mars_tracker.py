from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # 1. Arrange: Go to the Spaceship Dashboard.
    page.goto("http://localhost:3000/spaceship-dashboard")

    # 2. Act: Find the link to the Bitcoin-Mars Treasury Tracker and click it.
    tracker_link = page.get_by_role("link", name="Bitcoin-Mars Treasury Tracker")
    expect(tracker_link).to_be_visible()
    tracker_link.click()

    # 3. Assert: Confirm the navigation was successful.
    expect(page).to_have_url("http://localhost:3000/bitcoin-mars-tracker")
    expect(page.get_by_text("Mars Mission Progress")).to_be_visible()

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/bitcoin_mars_tracker_verification.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)