var AWS = require('aws-sdk'),
    sinon = require('sinon'),
    assert = require('assert'),
    app = require('../app'),
    chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    scanParam = require('./scanParam.json'),
    Promise = require('bluebird'),
    data = require('./item.json'),
    CONFIG = require('../config.json');

chai.use(chaiAsPromised);
app.updateConfig('./test/test_config.json');
app.configureAWS();
let dynamoDB, documentClient, update, scan;
dynamoDB = sinon.stub(AWS, 'DynamoDB').yields(documentClient);
update = sinon.stub().returns(Promise.resolve({}));
scan = sinon.stub().returns(Promise.resolve({}));
documentClient = sinon.stub(AWS.DynamoDB, 'DocumentClient').returns({scan: scan, update: update});


afterEach(function () {
    dynamoDB.restore();
});
describe('Update Dynamo Tests', function () {
    describe('Scan Tests', function () {
        it('Should call aws scan with params', function () {
            app.runDynamoUpdate(null);
            chai.assert.isTrue(scan.calledOnce);
            var arguments = scan.args[0][0];
            assert.equal(arguments.TableName, scanParam.TableName);
            assert.equal(arguments.FilterExpression, scanParam.FilterExpression);
            assert.deepEqual(arguments.ExpressionAttributeNames, scanParam.ExpressionAttributeNames);
            assert.deepEqual(arguments.ExpressionAttributeValues, scanParam.ExpressionAttributeValues);
            assert.equal(arguments.Limit, scanParam.Limit);
        });
    });
    describe('Remove Data and update Tests', function () {
        it('onScan method should handle error and reject promise', function () {
            error = {'error': "bad username"};
            const promise = app.onScan(error, null);
            return chai.expect(promise).to.rejected.then((response) => {
                assert.equal(response, "Unable to query");
            });
        });

        it('onScan should remove items from data and call update', function () {
            const promise = app.onScan(null, data);
            return chai.expect(promise).to.fulfilled.then((response) => {
                assert.equal(response, "Query successful");
                chai.assert.isTrue(update.calledOnce);
                chai.assert.isNotNull(update.args[0][0]);
                //Add other assets here for update.
            });

        });
    });

});