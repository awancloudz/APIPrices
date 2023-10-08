const express = require("express");
const path = require("path");
const axios = require("axios");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname);

app.use(express.static("public"));
app.use(cors());

const PORT = process.env.PORT || 3001;

const uri = process.env.URI || "http://localhost:3001";

// first testing
app.get("/", (request, response) => {
  response.status(200).json({
    message: "Hello, world!",
    documentation: "https://oilprice-api.herokuapp.com/docs",
    author: "oilshit",
    repository: "https://github.com/oilshit/oilprice-api"
  });
});

// documentation
app.get("/docs", (request, response) => {
  response.render("docs");
});

app.get("/blend-list", (request, response) => {
  response.render("blend_list");
});

// API to get oilprice CSRF token
app.get("/csrf", async (request, response) => {
  try {
    const token = await axios.get("https://oilprice.com/ajax/csrf");

    console.log(token.data);

    response.json({
      status: token.status,
      message: "got a CSRF token!",
      data: {
        csrf_token: token.data.hash,
      },
    });
  } catch (error) {
    response
      .status(error.response.status)
      .send(`Cannot process the request: ${error.response.status}`);
  }
});

// API to get oil and gas price data based on period and blend
app.get("/prices/:period", async (request, response) => {
  let period;

  // switch period based on period param
  switch (request.params.period) {
    case "daily":
      period = 2;
      break;
    case "weekly":
      period = 3;
      break;
    case "monthly":
      period = 4;
      break;
    case "yearly":
      period = 5;
      break;
    case "max":
      period = 7;
      break;
    default:
      break;
  }

  try {
    var dataAll = [];
    var codeAll = [45,46,4464,51,53,52,50,29,4460,68,48,71,72,4466,257,144,151,76,26,27,44,140,54,4447,4448];

    // get CSRF token from /csrf route
    const csrf_token = await axios.get(`${uri}/csrf`).then((result) => {
      return result.data.data.csrf_token;
    });
    
    for (var i = 0; i < codeAll.length; i++) {
      var jsonprice = {};
      // get oil and gas price data based on period and blend
      const blend_data = await axios.post(
        `https://oilprice.com/freewidgets/json_get_oilprices`,
        `blend_id=${codeAll[i]}&period=${period}&op_csrf_token=${csrf_token}`,
        {
          headers: {
            Accept: "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/x-www-form-urlencoded",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Sec-GPC": 1,
            TE: "trailers",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );
    
      // small processings and deletion of unused properties
      /*[
        "id",
        "blend_name",
        "flag",
        "location",
        "section",
        "order",
        "day_template_order",
        "chart_periods",
        "update_text",
        "breaks",
        "formula",
        "hide",
        "source",
        "technicals_symbol",
        "technicals_enabled",
      ].forEach((item) => delete blend_data.data.blend[item]);
      Object.defineProperty(
        blend_data.data.blend,
        "name",
        Object.getOwnPropertyDescriptor(blend_data.data.blend, "spreadsheet_name")
      );
      delete blend_data.data.blend["spreadsheet_name"];*/

      jsonprice = {
        id: blend_data.data.blend.id,
        name: blend_data.data.blend.blend_name,
        last_price:  blend_data.data.last_price,
        change_percent: blend_data.data.change_percent,
        change: blend_data.data.change,
      }
      //console.log(blend_data.data);
      dataAll.push(jsonprice);
    }
    response.status(200).json(dataAll);
  }
  catch(error) {
    console.log(error);
    response.json({
      message: "request failed",
    });
  }
});

app.get("/oilprices/:period", async (request, response) => {
  let period;
  // switch period based on period param
  switch (request.params.period) {
    case "daily":
      period = 2;
      break;
    case "weekly":
      period = 3;
      break;
    case "monthly":
      period = 4;
      break;
    case "yearly":
      period = 5;
      break;
    case "max":
      period = 7;
      break;
    default:
      break;
  }

  try {
    var dataAll = [];
    var codeAll = [45,46,4464,51,53,52,50,29,4460,68,48,71,72,4466,257,144,151,76,26,27,44,140,54,4447,4448,4185,4186,4188,4189,4190,4402,152];

    // get CSRF token from /csrf route
    const csrf_token = await axios.get(`${uri}/csrf`).then((result) => {
      return result.data.data.csrf_token;
    });
    
    for (var i = 0; i < codeAll.length; i++) {
      var jsonprice = {};
      // get oil and gas price data based on period and blend
      const blend_data = await axios.post(
        `https://oilprice.com/freewidgets/json_get_oilprices`,
        `blend_id=${codeAll[i]}&period=${period}&op_csrf_token=${csrf_token}`,
        {
          headers: {
            Accept: "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/x-www-form-urlencoded",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Sec-GPC": 1,
            TE: "trailers",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );
    
      jsonprice = {
        id: blend_data.data.blend.id,
        name: blend_data.data.blend.blend_name,
        last_price:  blend_data.data.last_price,
        change_percent: blend_data.data.change_percent,
        change: blend_data.data.change,
        section: blend_data.data.blend.section
      }
      // console.log(blend_data.data);
      dataAll.push(jsonprice);
    }
    response.status(200).json(dataAll);
  }
  catch(error) {
    console.log(error);
    response.json({
      message: "request failed",
    });
  }
});
// app.get("/testprice",(request, response) =>{
//   let url = 'https://api.oilpriceapi.com/v1/prices/past_week/?by_type=daily_average_price'
//   const headers = {
//   'Authorization': 'Token d580687f774d6921563973c734b445d4',
//   'Content-Type': 'application/json'
//   }
  
//   fetch(url, { headers })
//     .then(response => response.json())
//     .then(price => console.log(price))
// });

app.listen(PORT, () => {
  console.log(`listening to http://localhost:${PORT}`);
});
