const Page = require('../../../../tests/helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();                                      // 1
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('When logged in', async () => {

    beforeEach(async () => {
        await page.login();
        // await page.click('a[href="/blogs/new"]');
        await page.click('a.btn-floating');
    });

    test('can see blog create form', async () => {
        const text = await page.getContentsOf('form label');
        expect(text).toEqual('Blog Title');
    });

    describe('and using invalid inputs', async () => {

        beforeEach(async () => {
            await page.click('form button');
        });

        test('the form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');
            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        })

    });

    describe('and using valid inputs', async () =>  {

        beforeEach(async () => {
            await page.type('.title input', 'kangaroo');
            await page.type('.content input', 'kangaroo content bleh');
            await page.click('form button');
        });

        test('submit takes user to review screen', async () => {
            const x = await page.getContentsOf('form h5');
            expect(x).toEqual('Please confirm your entries');

        })

        test('submit then save adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card')
            // there will only be one submitted post
            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('.card-content p');
            expect(title).toEqual('kangaroo');
            expect(content).toEqual('kangaroo content bleh');

        })

        // .toBe        compare arrays - ensure they are same object, or check numbers
        // .toEqual     compare content of arrays, objects

        // .toBe        compare arrays - ensure they are same object, or check numbers
        // .toEqual     compare content of arrays, objects

    });

});

describe('when user not logged in', function() {

    const actions = [
        {method:'get',  path:'/api/blogs'},
        {method:'post', path:'/api/blogs', data: {title:'T', content:'C'}}
    ]

    test('blog actions are prohibited', async () => {
        const results = await page.execRequests(actions);                    // 6
        for (let result of results) {
            expect(result).toEqual({error:'You must log in!'});
        }
    });
    

    
});

// 1 -  returns a proxy which allows you to call methods on puppeteer's
//      browser object, page object, and your own custom page
// 6 -  await result of Promise.all (array of results)