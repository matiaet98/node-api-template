var express = require('express');
var router = express.Router();
var database = require('../database');

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
      id: req.params.id,
      cursor: {
        type: oracledb.CURSOR,
        dir: oracledb.BIND_OUT
      }
    }
    conn.execute(
      "BEGIN ORA.GET_TEST(:id, :cursor); END;",
      bindvars,
      function (err, result) {
        if (err) {
          console.error(err.message);
          database.release(connection);
          return;
        }
        console.log(result.outBinds.cursor.metaData);
        //fetchRowsFromRS(connection, result.outBinds.cursor, numRows);
      });
  });
  res.send({
    some: 'jsonnnn'
  });
});

module.exports = router;