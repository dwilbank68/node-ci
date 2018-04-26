const pup = require('puppeteer');
const sessionFactory = require("../../tests/factories/sessionFactory");
const userFactory = require("../../tests/factories/userFactory");

class CustomPage {                                                              // 1
    static async build(){
        const browser = await pup.launch({headless:false})

        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {                                          // 2
            get: function(target, property) {
                return customPage[property] || browser[property] || page[property]
            }
        })

    }

    constructor(page) {
        this.page = page;
    }

    execRequests(actions) {                                                     // 3
        return Promise.all(
            actions.map(({method, path, data}) => {
                return this[method](path, data);
            })
        )
    }

    get(path) {
        const getFromConsole = (_path) => {
            const getObj = {
                method: 'GET',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' }
            }
            return fetch(_path, getObj).then(res => res.json());
        }

        return this.page.evaluate(getFromConsole, path)
    }

    async getContentsOf(selector){
        return this.page.$eval(selector, el => el.innerHTML);
    }

    async login() {
        const user = await userFactory();
        const {session, sig} = sessionFactory(user);

        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig});

        await this.page.goto('localhost:3000/blogs');                          // 5

        await this.page.waitFor('a[href="/auth/logout"]');
    }

    post(path, dataObj ){
        const postFromConsole = (_path, _dataObj) => {
            const postObj = {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(_dataObj)
            }
            return fetch(_path, postObj).then(res => res.json());
        }

        return this.page.evaluate(postFromConsole, path, dataObj)
    }
}

module.exports = CustomPage;

// 1 -  CustomPage will be called as 'page' in the tests
// 2 -  and the proxy will route any methods called on 'page'
//      to either puppeteer's Browser, puppeteer's page, or the
//      methods defined below on this CustomPage class
// 3 -  accepts an array of objects, each of which gives the path to test,
//      the method (get or push) to use, and the data to post (if any)
// 5 -  refresh the page so that the browser picks up cookies and
//      thinks it is logged in