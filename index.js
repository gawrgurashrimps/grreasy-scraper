const {WoolworthsScraper} = require("./scrapers/woolworths");
const {insertProducts} = require("./db/db");


(async () => {
    const wwScraper = new WoolworthsScraper();

    async function fetchAll() {
        let results;
        while ((results = await wwScraper.fetch()).length != 0) {
            saveProducts(results);
        }
    }

    function saveProducts(products) {
        console.log(products);
        insertProducts(products);
    }

    await wwScraper.init();
    await fetchAll();
    console.log("Everything fetched");
    await new Promise(_ => setTimeout(_, 10000)); // HACK to finish off db stuff
    process.exit(0);
})();
