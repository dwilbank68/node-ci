const pup = require('puppeteer');
const sessionFactory = require("../../tests/factories/sessionFactory");
const userFactory = require("../../tests/factories/userFactory");

class CustomPage {
    static async build(){
        const browser = await pup.launch({headless:false})

        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function(target, property) {
                return customPage[property] || browser[property] || page[property]
            }
        })

    }

    constructor(page) {
        this.page = page;
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
}

module.exports = CustomPage;


// 5 -  refresh the page so that the browser picks up cookies and
//      thinks it is logged in