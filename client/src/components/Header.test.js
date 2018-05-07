jest.setTimeout(10000);

const Page = require('../../../tests/helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();                                      // 1
    await page.goto('http://localhost:3000');
})

afterEach(async () => {
    await page.close();
})

test('header has correct text', async () => {
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster');
})

test('clicking login starts oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
    // expect.stringContaining('accounts.google.com');
})

test('when signed in, shows logout button', async () => {
    await page.login();
    const text = await page.getContentsOf('a[href="/auth/logout"]');
    expect(text).toEqual('Logout');
})

// 1 -  page is proxy which calls methods on the custom page, the puppeteer page,
//      or the browser
// .toBe        compare arrays - ensure they are same object, or check numbers
// .toEqual     compare content of arrays, objects
