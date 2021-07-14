const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'products',
    connectionLimit: 10,
    supportBigNumbers: true
});

function query(sql, args) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                return reject(err);
            }
            connection.query(sql, args, function(err, result) {
                connection.release();
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    });
}

function insertProducts(products) {
    const sqlPrefix =
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
        `;
    const sqlRow =
        `

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
            )
        `;
    const sqlAllRows = Array(products.length).fill(sqlRow).join(",") + ";"
    const sqlAllAttributes = products.map(product => [
        product.name,
        product.origin,
        product.price,
        product.qty,
        product.unit,
        product.category,
    ]).flat();

    query(sqlPrefix + sqlAllRows, sqlAllAttributes);
}

module.exports = {
    insertProducts: insertProducts,
};
