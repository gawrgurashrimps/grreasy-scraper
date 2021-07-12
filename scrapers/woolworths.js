const { BaseScraper } = require("./base");
console.log(BaseScraper);
const axios = require("axios");

const BASE_URL = "https://www.woolworths.com.au";

class WoolworthsScraper extends BaseScraper {
    constructor() {
        super();
    }

    async init() {
        const BOOTSTRAP_PATH = "/api/ui/v2/bootstrap";
        const rawBootstrap = await axios.get(BASE_URL + BOOTSTRAP_PATH);
        console.log(rawBootstrap.data);
    }
}

module.exports = {
    WoolworthsScraper: WoolworthsScraper,
};
