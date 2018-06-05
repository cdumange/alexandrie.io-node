const assert = require('assert');
const logger = require('../index');

const config = {
  mode : "ws",
  addressws : "localhost",
  portws : 65123,
  address : 9514,
  suffix : ""
}

describe('test alexandrie.io-Node', () => {
  before( async() => {
    logger.getInstance().init(config);
    logger.getInstance().setOrigine('testNode');
  });

  it('test Send', async () => {
    logger.getInstance().sendMessage("test");
    assert.ok(true);
  });
  var messageAMod = null;
  it('getMessage', async() => {
    const filter = {
      dateD : new Date(Date.UTC(2018,05,01)).toISOString(),
      message : 'test'
    };
    let ret = await logger.getInstance().getMessage(filter)
    assert.ok(ret != undefined);
    assert.ok(ret.length != undefined);
    assert.ok(ret.length > 0);

    messageAMod = ret[0];
  });

  it('modification du message', async() => {
    let mess = messageAMod;
    mess.message='ce Message de test a été changé';
    let ret = await logger.getInstance().updateMessage(mess);
    assert.ok(ret != undefined);
    assert.ok(ret > 0);
  });

  after(() => {
    logger.destroy();
  })
});
