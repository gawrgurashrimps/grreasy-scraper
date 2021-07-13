const { BaseScraper } = require("./base");
const { Product } = require("../types/product.js");
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
        return this.parseBundles(category, rawProducts.data["Bundles"]);
    }

    parseBundles(category, bundles) {
        const REGEX_EACH_UNIT = /each/i;
        const REGEX_PER_UNIT = /per (.*)/i;
        const REGEX_QTY_UNIT = /(\d+) ?(.*)/;
        let results = [];
        for (const bundle of bundles) {
            for (const product of bundle["Products"]) {
                if (product["Price"] === null) continue; // product unavailable

                let qty, unit;
                const qtyUnitPackage = product["PackageSize"].match(REGEX_QTY_UNIT);
                if (qtyUnitPackage !== null) {
                    qty = parseInt(qtyUnitPackage[1]);
                    unit = qtyUnitPackage[2];
                } else {
                    const perUnitPackage = product["PackageSize"].match(REGEX_PER_UNIT);
                    if (perUnitPackage !== null) {
                        qty = 0; // TODO fix hack for "per unit" quantity?
                        unit = perUnitPackage[1];
                    } else {
                        const eachPackage = product["PackageSize"].match(REGEX_EACH_UNIT);
                        if (eachPackage !== null) {
                            qty = 1;
                            unit = "each";
                        } else {
                            throw new Error("Unknown package size " + product["PackageSize"]);
                        }
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

        console.log(results);
        return results;
    }

    normaliseUnit(qty, unit) {
        unit = unit.toLowerCase();
        const REGEX_TO_REMOVE = /\s|punnet/g;
        unit = unit.replaceAll(REGEX_TO_REMOVE, "");
        switch (unit) {
            case "g":
            case "ml":
            case "each":
                return {
                    qty: qty,
                    unit: unit
                }
            case "kg":
                return {
                    qty: 1000*qty,
                    unit: "g"
                }
            case "l":
                return {
                    qty: 1000*qty,
                    unit: "ml"
                }
            default:
                throw new Error("Unknown unit: " + unit);
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
