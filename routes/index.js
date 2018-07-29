var express = require('express');
var router = express.Router();
var database = require('../database');
var oracledb = require('oracledb');
var numRows = 1; // rows que devuelve el fetch al cursor, 0 para ilimitado


/*
create or replace PROCEDURE GET_TEST(I_ID IN NUMBER,O_CURSOR OUT SYS_REFCURSOR)
AS
BEGIN
    OPEN O_CURSOR FOR
        SELECT "ID","TEXT"
        FROM "ORA"."TBL_TEST"
        WHERE "ID" = I_ID;
END;
*/

router.get('/', function (req, res, next) {
  database.handleConnection(req, res, function (req, res, conn) {
    var bindvars = {
      id: req.query.id,
      cursor: {
        type: oracledb.CURSOR,
        dir: oracledb.BIND_OUT
      }
    }
    conn.execute(
      "BEGIN ORA.GET_TEST(:id, :cursor); END;",
      bindvars,
      function (err, results) {
        var allRows = [];

        if (err) throw err;

        function processResultSet() {
          results.outBinds.cursor.getRows(10000, function (err, rows) {
            if (err) throw err;

            if (rows.length) {
              rows.forEach(function (row) {
                newRow = `{`;
                results.outBinds.cursor.metaData.forEach(function (el, ind) {
                  newRow += `"` + el.name + `":"` + row[ind] + `",`;
                });
                newRow = newRow.slice(0, -1) + `}`;
                allRows.push(JSON.parse(newRow));
              });
              processResultSet();
              return;
            }
            database.release(conn);
            res.send(JSON.parse(JSON.stringify(allRows)));
          });
        }
        processResultSet();
      });
  });
});

module.exports = router;