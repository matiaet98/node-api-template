var exports = module.exports = {};
var config = require('./config');

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