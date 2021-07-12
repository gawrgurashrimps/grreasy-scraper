class BaseScraper {
    constructor() {
        this._initted = false;
        if (this.constructor == BaseScraper) {
            throw new Error("BaseScraper cannot be instantiated");
        }
    }

    /* initialise the scraper, making any initial requests to get product
     * categories etc */
    async init() {
    }

    /* download product information for all products
     * returns array with objects describing each product 
     * limited number of products are downloaded at a time,
     * so repeatedly call this until no more products (empty list)
     * are returned */
    async fetch() {
    }
}

module.exports = {
    BaseScraper: BaseScraper,
};
