const { BaseScraper } = require("./base");
const { Product } = require("../types/product.js");
const axios = require("axios");

const BASE_URL = "https://www.woolworths.com.au";

class WoolworthsScraper extends BaseScraper {
    constructor() {
        super();
    }

    async init() {
        const BOOTSTRAP_PATH = "/api/ui/v2/bootstrap";
        const rawBootstrap = await axios.get(BASE_URL + BOOTSTRAP_PATH);
        this.categories = {};
        for (const categoryObject of rawBootstrap.data["ListTopLevelPiesCategories"]["Categories"]) {
            this.categories[categoryObject["NodeId"]] = {
                key: categoryObject["NodeId"],
                description: categoryObject["Description"],
                urlFriendlyName: categoryObject["UrlFriendlyName"],
            };
        }
        delete this.categories["1_B63CF9E"]; // HACK to ignore cigarettes (needs auth)
        this.categoriesKeys = Object.keys(this.categories);
        this.currentCategoryIndex = 0;
    }

    async fetch() {
        if (this.currentCategoryIndex >= this.categoriesKeys.length) {
            return []; // got all categories
        }

        let results = [];
        // keep going to next category if current one has zero products
        // unless of course we exhausted all categories
        while (this.currentCategoryIndex < this.categoriesKeys.length && results.length === 0) {
            const key = this.categoriesKeys[this.currentCategoryIndex];
            results.push(...(await this.fetchCategory(this.categories[key])));
            this.currentCategoryIndex++;
        }

        return results;
    }

    async fetchCategory(category) {
        const PAGE_SIZE = 36;
        const firstPage = await this.getProductPage(category, 1, PAGE_SIZE);
        const results = [];
        if ("Bundles" in firstPage.data && firstPage.data["Bundles"] !== null) {
            results.push(...this.parseBundles(category, firstPage.data["Bundles"]));
        }

        const numPages = Math.ceil(firstPage.data["TotalRecordCount"] / PAGE_SIZE);
        console.log(`will get ${numPages} pages`)
        for (let i = 2; i <= numPages; i++) {
            const page = await this.getProductPage(category, i, PAGE_SIZE);
            results.push(...this.parseBundles(category, page.data["Bundles"]));

            await new Promise(_ => setTimeout(_, 1000));
        }
        console.log("downloaded all");

        return results;
    }

    async getProductPage(category, pageNum, pageSize) {
        const PRODUCT_PATH_BASE = "/shop/browse";
        const PRODUCTS_PATH = "/apis/ui/browse/category";
        const productPath = PRODUCT_PATH_BASE + "/" + category["urlFriendlyName"];
        console.log(`getting products for category key ${category["description"]} page ${pageNum}`);
        return await axios.post(BASE_URL + PRODUCTS_PATH,
            {
                categoryId: category["key"],
                filters: [],
                formatObject: JSON.stringify({"name": category["description"]}),
                isBundle: false,
                isMobile: false,
                isSpecial: false,
                location: productPath,
                pageNumber: pageNum,
                pageSize: pageSize,
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
    }

    parseBundles(category, bundles) {
        const REGEX_PER_UNIT = /per (.*)/i;
        const REGEX_QTY_UNIT = /(\d+\.\d*|\d*\.\d+|\d+) ?(.*)/;
        let results = [];
        for (const bundle of bundles) {
            for (const product of bundle["Products"]) {
                if (product["Price"] === null) continue; // product unavailable

                let qty, unit;
                const qtyUnitPackage = product["PackageSize"].match(REGEX_QTY_UNIT);
                if (qtyUnitPackage !== null) {
                    qty = parseFloat(qtyUnitPackage[1]);
                    unit = qtyUnitPackage[2];
                } else {
                    const perUnitPackage = product["PackageSize"].match(REGEX_PER_UNIT);
                    if (perUnitPackage !== null) {
                        qty = 0; // TODO fix hack for "per unit" quantity?
                        unit = perUnitPackage[1];
                    } else {
                        qty = 1;
                        unit = "each";
                    }
                }

                const normalisedQtyUnit = this.normaliseUnit(qty, unit);
                qty = normalisedQtyUnit["qty"];
                unit = normalisedQtyUnit["unit"];

                results.push(new Product(
                    product["DisplayName"],
                    "Woolworths",
                    product["Price"],
                    qty,
                    unit,
                    this.normaliseCategory(category["urlFriendlyName"])
                ));
            }
        }

        return results;
    }

    normaliseUnit(qty, unit) {
        unit = unit.toLowerCase();
        switch (unit) {
            case "g":
            case "ml":
            case "each":
                return {
                    qty: Math.round(qty),
                    unit: unit
                }
            case "kg":
                return {
                    qty: Math.round(1000*qty),
                    unit: "g"
                }
            case "l":
                return {
                    qty: Math.round(1000*qty),
                    unit: "ml"
                }
            default:
                return {
                    qty: Math.round(qty),
                    unit: "each"
                }
        }
    }

    normaliseCategory(category) {
        // TODO: actually categorise
        return "other";
    }
}

module.exports = {
    WoolworthsScraper: WoolworthsScraper,
};
