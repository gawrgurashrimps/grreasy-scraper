class Product {
    constructor(name, origin, price, qty, unit, category) {
        const ALLOWABLE_UNITS = ["g", "ml", "each"];

        if (name == null || origin == null || price == null || qty == null || unit == null) {
            throw new Error("Product attributes (other than category) cannot be null/undefined");
        }

        if (price < 0) {
            throw new Error("price cannot be negative");
        }
        if (qty < 0) {
            throw new Error("qty cannot be negative");
        }

        if (!ALLOWABLE_UNITS.includes(unit)) {
            throw new Error(`unit (${unit}) is not in allowable set ${ALLOWABLE_UNITS}`);
        }

        this.name = name;
        this.origin = origin;
        this.price = price;
        this.qty = qty;
        this.unit = unit;
        this.category = category;
    }
}

module.exports = {
    Product: Product,
}
