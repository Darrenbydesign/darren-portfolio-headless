import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/blog/", "/work/", "/about/"];

for (const route of routes) {
  test(`${route} has no detectable WCAG A or AA violations`, async ({ page }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}

test("index pages expose one primary heading and current navigation", async ({
  page,
}) => {
  for (const route of ["/blog/", "/work/"]) {
    await page.goto(route);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page.locator('nav[aria-label="Primary navigation"] [aria-current="page"]'),
    ).toHaveCount(1);
  }
});

test("mobile navigation exposes its expanded state and close control", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menuButton = page.getByRole("button", {
    name: "Open primary navigation menu",
  });
  await menuButton.click();

  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("button", { name: "Close mobile navigation menu" }),
  ).toBeVisible();
});

test("contact form exposes pending and completion states", async ({ page }) => {
  await page.route("**/", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({ status: 200, body: "ok" });
  });
  await page.goto("/");

  const form = page.locator("#contact-form");
  const status = page.getByRole("status");
  await page.getByLabel("Name").fill("Accessibility Test");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Message").fill("Testing status announcements.");
  await page.getByRole("button", { name: "Send Message" }).click();

  await expect(form).toHaveAttribute("aria-busy", "true");
  await expect(status).toBeVisible();
  await expect(status).toHaveText("Sending message...");
  await expect(status).toContainText("Message sent successfully!");
  await expect(form).not.toHaveAttribute("aria-busy");
});

test("reduced motion removes smooth scrolling and transitions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const motion = await page.evaluate(() => ({
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    transitionDuration: getComputedStyle(
      document.querySelector(".button") as HTMLElement,
    ).transitionDuration,
  }));

  expect(motion.scrollBehavior).toBe("auto");
  expect(parseFloat(motion.transitionDuration)).toBeLessThanOrEqual(0.00001);
});
