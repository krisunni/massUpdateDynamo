let winston = require('winston'),
    AWS = require('aws-sdk'),
    fs = require('fs');
let docClient, paramsForScanningDynamoTable, carrier, CONFIG;
// Create a Winston logger with error.log file and info.log file.
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({
            filename: 'error.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'info.log',
            level: 'info'
        })
    ]
});
// Print Winston logs to console if environment is not production
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

function updateDynamoItem(id) {
    paramsForUpdate = {
        TableName: CONFIG.tableName,
        Key: {
            "Id": id,
        },
        UpdateExpression: "",
        ExpressionAttributeValues: {
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(paramsForUpdate, function (err, data) {
        if (err) {
            logger.error(`Error contact id: ${err.stack}`);
        } else {
            logger.log('info', `Removed entry from first: ${id}`);
        }
    });
}

function onScan(err, data) {
    let shouldUpdateItem = false;
    return new Promise((resolve, reject) => {
        if (err || !data.Items) {
            logger.error(`Error scanning Table: ${err.stack}`);
            reject(`Unable to query`)
        } else {
            data.Items.forEach(function (item) {
                shouldUpdateItem = false;
                //do item update here and set shouldUpdateItem = true
                //Call update item if
                shouldUpdateItem = true;
                if (shouldUpdateItem == true) {
                    updateDynamoItem(item.Id);
                }
            });
            // LastEvaluatedKey for pagination of scan results
            if (data.Items.length > 0 && data.LastEvaluatedKey != undefined && data.LastEvaluatedKey.Id != null) {
                runDynamoUpdate(data.LastEvaluatedKey.Id);
            }
            resolve('Query successful');
        }
    })
};

function configureAWS() {
    //Configure AWS to use correct region and profile from config file.
    AWS.config.update({region: CONFIG.region});
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: CONFIG.profile});
    docClient = new AWS.DynamoDB.DocumentClient();
    AWS.config.update({region: CONFIG.region});
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: CONFIG.profile});
    docClient = new AWS.DynamoDB.DocumentClient();
}

function runDynamoUpdate(LastEvaluatedKey) {
    configureAWS();
    //This is the parameter for scanning DynamoTable
    paramsForScanningDynamoTable = {
        TableName: CONFIG.tableName,
        FilterExpression: "#Id BETWEEN :idFrom AND :idTo",
        Limit: CONFIG.limit,
        ExpressionAttributeNames: {
            "#Id": "Id"
        },
        ExpressionAttributeValues: {
            ":idFrom": CONFIG.startID,
            ":idTo": CONFIG.endID
        }
    };
    //If LastEvaluatedKey is passed in then we need to scan again.
    if (LastEvaluatedKey != null && LastEvaluatedKey !== undefined) {
        paramsForScanningDynamoTable.ExclusiveStartKey = {"Id": LastEvaluatedKey};
    }
    docClient.scan(paramsForScanningDynamoTable, onScan);
}

module.exports.runDynamoUpdate = function (LastEvaluatedKey) {
    CONFIG = JSON.parse(fs.readFileSync(`config.json`, 'utf8'));
    logger.log('info', `Start ID: ${CONFIG.startID} and End ID ${CONFIG.endID}`);
    runDynamoUpdate(LastEvaluatedKey);
};

module.exports.onScan = function (err, data) {
    return onScan(err, data);
};

module.exports.updateConfig = function (pathToConfig) {
    CONFIG = JSON.parse(fs.readFileSync(pathToConfig, 'utf8'));
};

module.exports.configureAWS = configureAWS;