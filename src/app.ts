import { Console } from "console";
import express from "express";
const hbs = require("hbs");
const path = require("path");
var bodyParser = require("body-parser");
const multer = require("multer");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../template/views");
const partial_path = path.join(__dirname, "../template/partials");
const port = 8000;
const app = express();
const connectionPool = require("./db/conn");

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerPartials(partial_path);
app.use(bodyParser.urlencoded({ extended: false }));

//storage
const Storage = multer.diskStorage({
  destination: "uploads",
  filename: (req: any, file: any, cb: any) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: Storage,
}).single("file");

app.get("/createdb", (req, res) => {
  connectionPool.use(async (clientConnection: any) => {
    const statement = await clientConnection.execute({
      sqlText: "CREATE DATABASE NODEBASE",
      complete: function(err: any, stmt: any, rows: any) {
        var stream = statement.streamRows();
        stream.on("data", function(row: any) {
          console.log(row);
        });
        stream.on("end", function(row: any) {
          console.log("DATA BASE Creation successful");
        });
      },
    });
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", (req, res) => {
  const users = {
    FIRSTNAME: req.body.firstName,
    LASTNAME: req.body.lastName,
    AGE: req.body.Age,
    MOBILE: req.body.mobile,
    // FILE: {
    //   data: req.file.filename,
    //   contentType: "image/png",
    // },
  };

  console.log(users);
  // const sql = `INSERT INTO MYDATABASE.MYDATABASE VALUES (${users.FIRSTNAME}, ${users.LASTNAME}, ${users.AGE}, ${users.MOBILE})`;
  // console.log(sql);
  // Insert data into database
  connectionPool.use(async (clientConnection: any) => {
    const statement = await clientConnection.execute({
      sqlText: `INSERT INTO MYDATABASE.PUBLIC.ENQUIRY (FIRSTNAME, LASTNAME, AGE, MOBILE) VALUES ('${users.FIRSTNAME}', '${users.LASTNAME}', ${users.AGE}, ${users.MOBILE})`, // ${'<your-variable-name>'} for variable values
      complete: function(err: any, stmt: any) {
        if (err) {
          console.error(
            "Failed to execute statement due to the following error: " +
              err.message
          );
        } else {
          console.log("Successfully executed statement: " + stmt.getSqlText());
        }
      },
    });
  });

  res.status(200).render("index");
});

app.get("/table", (req, res) => {
  connectionPool.use(async (clientConnection: any) => {
    const statement = await clientConnection.execute({
      sqlText: `SELECT * FROM MYDATABASE.PUBLIC.ENQUIRY`,
      complete: function(err: any, rows: any, fields: any) {
        if (err) {
          console.error(
            "Failed to execute statement due to the following error: " +
              err.message
          );
        } else {
          console.log(fields);
          res.render("table", {
            users: fields,
            title: "Rizwan",
          });
        }
      },
    });
  });
});
app.get("/edit/:id", (req, res) => {
  // console.log(
  //   `SELECT * FROM MYDATABASE.PUBLIC.ENQUIRY WHERE ID = ${req.params.id}`
  // );
  connectionPool.use(async (clientConnection: any) => {
    const statement = await clientConnection.execute({
      sqlText: `SELECT * FROM MYDATABASE.PUBLIC.ENQUIRY WHERE ID = ${req.params.id}`,
      complete: function(err: any, rows: any, field: any) {
        if (err) {
          console.error(
            "Failed to execute statement due to the following error: " +
              err.message
          );
        } else {
          console.log(field);
          res.render("update", {
            users: field,
            title: "Rizwan",
          });
        }
      },
    });
  });
});
// app.get("/update", (req, res) => {
//   res.render("update");
// });

app.post("/update/:id", urlencodedParser, (req, res) => {
  connectionPool.use(async (clientConnection: any) => {
    const statement = await clientConnection.execute({
      sqlText: `UPDATE MYDATABASE.PUBLIC.ENQUIRY SET FIRSTNAME = '${req.body.firstName}', LASTNAME = '${req.body.lastName}', AGE = '${req.body.Age}', MOBILE = '${req.body.mobile}' WHERE ID = '${req.params.id}';`,
      complete: function(err: any, row: any, field: any) {
        if (err) {
          console.error(
            "Failed to execute statement due to the following error: " +
              err.message
          );
        } else {
          console.log(row);
          res.redirect("/table");
        }
      },
    });
  });
});

app.get("/delete/:id", (req, res) => {
  // console.log(
  //   `SELECT * FROM MYDATABASE.PUBLIC.ENQUIRY WHERE ID = ${req.params.id}`
  // );
  connectionPool.use(async (clientConnection: any) => {
    const statement = await clientConnection.execute({
      sqlText: `DELETE FROM MYDATABASE.PUBLIC.ENQUIRY WHERE ID = ${req.params.id}`,
      complete: function(err: any, rows: any, field: any) {
        if (err) {
          console.error(
            "Failed to execute statement due to the following error: " +
              err.message
          );
        } else {
          console.log(field);
          res.redirect("/table");
        }
      },
    });
  });
});
app.listen(port, () => console.log("app is running " + port));
