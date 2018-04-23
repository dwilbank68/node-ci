jest.setTimeout(10000);

const Page = require('../../../../tests/helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();                                      // 1
    await page.goto('localhost:3000');
})

afterEach(async () => {
    await page.close();
})