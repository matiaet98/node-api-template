var exports = module.exports = {};
var config = require('./config');
var oracledb = require('oracledb');

exports.handleConnection = function (request, response, callback) {
    oracledb.getConnection({
            user: config.user,
            password: config.password,
            connectString: config.connectString
        },
        function (err, connection) {
            if (err) {
                console.log('Error in acquiring connection ...');
                console.log('Error message ' + err.message);
                response.writeHead(500, {
                    'Content-Type': 'application/json'
                });
                response.end(JSON.stringify({
                    status: 500,
                    message: "Error connecting to DB",
                    detailed_message: err.message
                }));
                return;
            }
            callback(request, response, connection);
        });
}

exports.release = function (connection) {
    connection.close(
        function (err) {
            if (err) {
                console.error(err.message);
            }
        });
}

exports.close = function (connection, resultSet) {
    resultSet.close(
        function (err) {
            if (err) {
                console.error(err.message);
            }
            exports.release(connection);
        });
}

exports.fetchRows = function (connection, resultSet, numRows, allRows) {
    resultSet.getRow(
        function (err, row) {
            if (row) {
                allRows.push(row);
                exports.fetchRows(connection, resultSet, numRows, allRows);
                return;
            }
            exports.close(connection, resultSet);
        });
}