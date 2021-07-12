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
        this.category = {};
        for (const categoryObject of rawBootstrap.data["ListTopLevelPiesCategories"]["Categories"]) {
            this.category[categoryObject["NodeId"]] = {
                description: categoryObject["Description"],
                urlFriendlyName: categoryObject["UrlFriendlyName"],
            };
        }
        console.log(this.category);
    }

    async fetch() {
        const PRODUCTS_PATH = "/apis/ui/browse/category";
        const PRODUCT_PATH_BASE = "/shop/browse";
        // TODO: more than one category
        const categoryKey = "1-E5BEE36E";
        const category = this.category[categoryKey];
        const productPath = PRODUCT_PATH_BASE + "/" + category["urlFriendlyName"];
        console.log("getting products for category key " + categoryKey);
        const rawProducts = await axios.post(BASE_URL + PRODUCTS_PATH,
            {
                categoryId: categoryKey,
                filters: [],
                formatObject: JSON.stringify({"name": category["description"]}),
                isBundle: false,
                isMobile: false,
                isSpecial: false,
                location: productPath,
                pageNumber: 1,
                pageSize: 36,
                sortType: "TraderRelevance",
                token: "",
                url: productPath,
            },
            {
                headers: {
                    "Accept-Encoding": "gzip",
                    "Accept-Language": "en-US",
                }
            }
        );
        console.log("downloaded");
        console.log(rawProducts.data);
    }
}

module.exports = {
    WoolworthsScraper: WoolworthsScraper,
};
