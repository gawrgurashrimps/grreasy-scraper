const {WoolworthsScraper} = require("./scrapers/woolworths");

const wwScraper = new WoolworthsScraper();

wwScraper.init().then(() => {
    wwScraper.fetch();
});
