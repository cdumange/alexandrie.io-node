const assert = require('assert');
const logger = require('../index');

const config = {
    mode: "http",
    address: "localhost",
    port: 9514,
    suffix: "rest"
}


const configws = {
    mode: "ws",
    addressws: "localhost",
    portws: 65123
}


const mess = {
    typeMessage: 'eai',
    origine: 'testUnitaire',
    message: 'test client HTML',
    priority: 'info'
};

const now = new Date();

const filter = {
    typeMessage: mess.typeMessage,
    message: mess.message,
    dateD: now.toISOString()
}

describe('testing CLIENT', () => {
    describe('testing REST', () => {
        before(() => {
            logger.getInstance().init(config);
        });

        it('Testing sending a message', async () => {
            const ret = await logger.getInstance().sendMessage(mess);
            assert(ret && ret.code === 200);
        });
        let up = null;
        it('Testing getting the same message', async () => {
            const ret = await logger.getInstance().getMessage(filter);
            assert(ret && ret.code === 200);
            const tab = JSON.parse(ret.body);
            assert(tab && tab.length > 0);
            up = tab[0];
        });

        it('Testing updating the same message', async () => {
            up.priority = 'warn';
            const ret = await logger.getInstance().updateMessage(up);
            assert(ret && ret.code === 200);
        });

        after(() => {
            logger.destroy();
        });
    })


    describe('testing WS', () => {
        before(() => {
            logger.getInstance().init(configws);
            logger.getInstance().setOrigine('testNode');
        });

        it('test Send', async () => {
            logger.getInstance().sendMessage("test");
            assert.ok(true);
        });

        let messageAMod = null;
        it('getMessage', async () => {
            const filter = {
                dateD: new Date(Date.UTC(2018, 05, 01)).toISOString(),
                message: 'test'
            };
            const ret = await logger.getInstance().getMessage(filter)
            assert.ok(ret != undefined);
            assert.ok(ret.length != undefined);
            assert.ok(ret.length > 0);

            messageAMod = ret[0];
        });

        it('modification du message', async () => {
            const mess = messageAMod;
            mess.message = 'ce Message de test a été changé';
            const ret = await logger.getInstance().updateMessage(mess);
            assert.ok(ret != undefined);
            assert.ok(ret > 0);
        });

        after(() => {
            logger.destroy();
        })
    });

});