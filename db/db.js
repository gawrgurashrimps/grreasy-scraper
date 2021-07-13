const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'products',
});

function insertProducts(products) {
    for (const product of products) {
        connection.query(
            `
            INSERT INTO items
                (
                    name,
                    origin_id,
                    price,
                    quantity,
                    fk_unit,
                    fk_category
                )
                VALUES
                (
                    ?,
                    (
                        SELECT id
                        FROM origin
                        WHERE name = ?
                    ),
                    ?,
                    ?,
                    (
                        SELECT id
                        FROM unit
                        WHERE name = ?
                    ),
                    (
                        SELECT id
                        FROM category
                        WHERE name = ?
                    )
                );
            `,
            [
                product.name,
                product.origin,
                product.price,
                product.qty,
                product.unit,
                product.category,
            ],
            (err, result) => {
                if (err) throw err;
        })
    }
}

module.exports = {
    insertProducts: insertProducts,
};
