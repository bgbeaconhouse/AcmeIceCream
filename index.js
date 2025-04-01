require("dotenv").config()
const pg = require("pg")
const client = new pg.Client(process.env.DATABASE_URL)
const express = require("express")
const app = express();

app.use(express.json());
app.use(require('morgan')('dev'));

//CREATE

app.post("/api/flavors", async (req, res, next) => {
    try {
        const SQL = /*SQL*/`
        INSERT INTO flavors(name)
        VALUES($1)
        RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name])
        res.status(201).res.send(response.rows[0])
       
    } catch (error) {
        next(error)
    }
});

app.get("/api/flavors", async (req, res, next) => {
    try {
        const SQL = /*SQL*/`
        SELECT * FROM flavors ORDER BY created_at DESC
        `;
        const response = await client.query(SQL)
        res.send(response.rows);
    } catch (error) {
        next(error)
    }
});

app.get("/api/flavors/:id", async (req, res, next) => {
    try {
        const SQL = /*SQL*/`
        SELECT * FROM flavors WHERE id =$1 
        `;
        const response = await client.query(SQL, [req.params.id])
        res.send(response.rows);
    } catch (error) {
        next(error)
    }
});

app.put("/api/flavors/:id", async (req, res, next) => {
    try {
        const SQL = /*SQL*/`
        UPDATE flavors
        SET name=$1, is_favorite=$2, updated_at=now()
        WHERE id = $3
        RETURNING *
        `;
        const response = await client.query(SQL, [
            req.body.name, req.body.is_favorite, req.params.id,
        ]);
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
});

app.delete("/api/flavors/:id", async (req, res, next) => {
    try {
        const SQL = `
        DELETE FROM flavors WHERE id =$1
        `;
        await client.query(SQL, [req.params.id]);
        res.sendStatus(204);
    } catch (error) {
        next(error)
    }
});


const init = async () => {
    await client.connect()
    console.log(('connected to database'));

    let SQL = /*sql*/ `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        is_favorite BOOLEAN DEFAULT FALSE,
        name VARCHAR(255) NOT NULL
    );
    `;
    await client.query(SQL)
    console.log('tables created');
    SQL = /*SQL*/`
    INSERT INTO flavors(name, is_favorite) VALUES('Chocolate', false);
    INSERT INTO flavors(name, is_favorite) VALUES('Strawberry', false);
    INSERT INTO flavors(name, is_favorite) VALUES('Vanilla', false);
    INSERT INTO flavors(name, is_favorite) VALUES('Rocky Road', true);
    `;
    await client.query(SQL);
    console.log('data seeded');

    const port = process.env.PORT;
    app.listen(port, () => console.log(`listening on port ${port}`));

};

init();