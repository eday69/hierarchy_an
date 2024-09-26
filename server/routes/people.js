const express = require('express');
const { parse } = require('csv-parse/sync');
const fs = require('fs')

const router = express.Router();
const DATA_FILE = './fixture/hierarchyData.csv';
const fileData = fs.readFileSync(DATA_FILE).toString();

router.get('/', function(req, res) {
  try {
    const records = parse(fileData, {
      columns: true,
      skip_empty_lines: true,
      cast: true
    });

    res.status(200).send({ data: records });
  } catch (e){
    res.status(404);
  }
});

module.exports = router;
