import { Console } from "console";
import express from "express";
import { query } from "express";
import { fileURLToPath } from "url";
const hbs = require("hbs");
const path = require("path");

var bodyParser = require("body-parser");
var bcrypt = require("bcryptjs");
var paginateHelper = require("express-handlebars-paginate");
const multer = require("multer");
const upload = require("../middleware/upload");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../template/views");
const partial_path = path.join(__dirname, "../template/partials");
const port = 8000;
const app = express();
const connectionPool = require("./db/conn");

app.use(express.static(static_path));
app.use(express.static("uploads"));

app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerPartials(partial_path);
hbs.handlebars.registerHelper(
  "paginateHelper",
  paginateHelper.createPagination
);

app.use(bodyParser.urlencoded({ extended: false }));

//storage

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

app.post("/", upload, (req, res) => {
  interface pole {
    FIRSTNAME: string;
    LASTNAME: string;
    AGE: number;
    MOBILE: number;
    FILE: any;
  }

  const users: pole = {
    FIRSTNAME: req.body.firstName,
    LASTNAME: req.body.lastName,
    AGE: req.body.Age,
    MOBILE: req.body.mobile,
    FILE: req.file?.filename,
  };
  console.log(users.FILE);

  console.log(users);
  // const sql = `INSERT INTO MYDATABASE.MYDATABASE VALUES (${users.FIRSTNAME}, ${users.LASTNAME}, ${users.AGE}, ${users.MOBILE})`;
  // console.log(sql);
  // Insert data into database
  connectionPool.use(async (clientConnection: any) => {
    const statement = await clientConnection.execute({
      sqlText: `INSERT INTO MYDATABASE.PUBLIC.ENQUIRY (FIRSTNAME, LASTNAME, AGE, MOBILE, IMAGE) VALUES ('${users.FIRSTNAME}', '${users.LASTNAME}', ${users.AGE}, ${users.MOBILE}, '${users.FILE}')`, // ${'<your-variable-name>'} for variable values
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
          // console.log(fields);
          res.render("table", {
            pagination: { page: 1, limit: 10, totalRows: 10 },
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
      sqlText: `UPDATE MYDATABASE.PUBLIC.ENQUIRY SET FIRSTNAME = '${req.body.firstName}', LASTNAME = '${req.body.lastName}', AGE = '${req.body.Age}', MOBILE = '${req.body.mobile}', IMAGE = '${req.file?.filename}' WHERE ID = '${req.params.id}';`,
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

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const Regis = {
    EMAIL: req.body.email,
    PASSWORD: req.body.password,
  };

  connectionPool.use(async (clientConnection: any) => {
    const statement = await clientConnection.execute({
      sqlText: `SELECt * FROM MYDATABASE.PUBLIC.REGISTER WHERE EMAIL = '${Regis.EMAIL}'`,

      // sqlText: `SELECT * FROM MYDATABASE.PUBLIC.REGISTER WHERE ID = '${login.EMAIL}'`,
      // const match = await bcrypt.compare(password, REGISTER.PASSWORD);
      complete: function(err: any, rows: any, field: any) {
        if (err) {
          console.error(
            "Failed to execute statement due to the following error: " +
              err.message
          );
        } else {
          const hashedPassword = field[0].PASSWORD;
          //get the hashedPassword from result
          if (bcrypt.compare(Regis.PASSWORD, hashedPassword)) {
            console.log(hashedPassword + Regis.PASSWORD);
            res.send(`${field[0].FIRSTNAME}---------> Login Successful
            [ { ID:${field[0].ID}, is logged in!`);
          } else {
            console.log("---------> Password Incorrect");
            res.send("Password incorrect!");
          } //end of bcrypt.compare()

          console.log(field[0].FIRSTNAME);
          res.send("Login Successful");
        }
      },
    });
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  interface regis {
    FIRSTNAME: string;
    LASTNAME: string;
    EMAIL: string;
    PASSWORD: string;
  }

  const register: regis = {
    FIRSTNAME: req.body.firstname,
    LASTNAME: req.body.lastname,
    EMAIL: req.body.email,
    PASSWORD: req.body.password,
  };
  var HASHPASSWORD = await bcrypt.hash(register.PASSWORD, 10);

  console.log(HASHPASSWORD);

  // const sql = `INSERT INTO MYDATABASE.MYDATABASE VALUES (${users.FIRSTNAME}, ${users.LASTNAME}, ${users.AGE}, ${users.MOBILE})`;
  // console.log(sql);
  // Insert data into database
  connectionPool.use(async (clientConnection: any) => {
    const statement = await clientConnection.execute({
      sqlText: `INSERT INTO MYDATABASE.PUBLIC.REGISTER (FIRSTNAME, LASTNAME, EMAIL, PASSWORD) VALUES ('${register.FIRSTNAME}', '${register.LASTNAME}', '${register.EMAIL}', '${HASHPASSWORD}')`, // ${'<your-variable-name>'} for variable values
      complete: function(err: any, stmt: any) {
        if (err) {
          console.error(
            "Failed to execute statement due to the following error: " +
              err.message
          );
        } else {
          // console.log("Successfully executed statement: " + stmt.getSqlText());
          console.log("Successfully Added the Data");
        }
      },
    });
  });

  res.status(200).render("register");
});

app.listen(port, () => console.log("app is running " + port));
