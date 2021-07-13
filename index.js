const {WoolworthsScraper} = require("./scrapers/woolworths");


(async () => {
    const wwScraper = new WoolworthsScraper();

    async function fetchAll() {
        let results;
        while ((results = await wwScraper.fetch()).length != 0) {
            saveProducts(results);
        }
    }

    function saveProducts(products) {
        // TODO: database stuff
        console.log(products);
    }

    await wwScraper.init();
    await fetchAll();
    console.log("Everything fetched");
})();
