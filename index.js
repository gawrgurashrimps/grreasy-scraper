const {WoolworthsScraper} = require("./scrapers/woolworths");

const wwScraper = new WoolworthsScraper();

function fetchAll(onDone) {
    let allProducts = [];
    wwScraper.fetch().then((results) => {
        allProducts.push(...results);
        if (results.length === 0) {
            onDone(allProducts);
        } else {
            fetchAll((prods) => {
                allProducts.push(...results);
                onDone(allProducts);
            });
        }
    });
}

function saveProducts(products) {
    console.log("ALL PRODUCTS RETRIEVED!");
    // TODO: database stuff
    console.log(products);
}

wwScraper.init().then(() => {
    fetchAll(saveProducts);
});
