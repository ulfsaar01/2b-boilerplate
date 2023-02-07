// Write your answer here
const XLSX = require("xlsx");
const fs = require("fs");
const axios = require("axios");

const bstr = fs.readFileSync("data/transactions.csv").toString();

const wb = XLSX.read(bstr, { type: "binary" });
const ws = wb.Sheets[wb.SheetNames[0]];
const transactions = XLSX.utils.sheet_to_json(ws, { raw: false });

let balance = {};
let portfolio = {};

for (let i = 0; i < transactions.length; i++) {
  const { transaction_type: type, token, amount } = transactions[i];

  if (!balance.hasOwnProperty(token)) {
    balance[token] = 0;
  }

  if (type === "DEPOSIT") {
    balance[token] += Number(amount);
  } else if (type === "WITHDRAWAL") {
    balance[token] -= Number(amount);
  }
}

const url = `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${Object.keys(
  balance
).join(",")}`;

axios
  .get(url)
  .then((res) => {
    const data = res.data;

    for (const key in data) {
      portfolio[key] =
        Number.parseFloat(balance[key] / data[key]).toFixed(2) + "$";
    }

    console.log("Balance: ", portfolio);
  })
  .catch((err) => console.log(err));
