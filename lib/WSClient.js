const io = require('socket.io-client')
const HTMLClient = require('./HTMLClient');

var socket = null;
var html = null;

function WSClient(config){
  if(socket == undefined){
    if (config == undefined || config.addressws == undefined || config.portws == undefined)
      throw new Error('WS config error');

    this.url = (config.addressws.indexOf('ws://') > 0) ? "" : 'ws://'  +
      config.addressws + ':' + config.portws;

    socket = io.connect(this.url);
  }
}

WSClient.prototype.sendMessage = function (message){
  this.getSocket().emit('msg', message);
}

WSClient.prototype.getMessage = function (filter){
  return new Promise((resolve) => {
    let mess = filter;
    mess.backKey = getBackKey(mess);

    this.getSocket().once(mess.backKey, (retour) => {
      resolve(retour);
    });
    this.getSocket().emit('getMsg', mess);
  });
}

WSClient.prototype.updateMessage = function (mess){
  return new Promise((resolve) => {
    mess.backKey = getBackKey(mess);

    this.getSocket().once(mess.backKey, (ret) => {
      resolve (ret);
    });

    this.getSocket().emit('updateMessage', mess);
  });
}


WSClient.prototype.getSocket = function (){
  if (socket == undefined){
    socket = io.connect(this.url);
  }
  return socket;
}

WSClient.prototype.close = () => {
  if (socket != undefined)
    socket.close();
}

const getBackKey = (mess) => {
  return new Date().toISOString() + JSON.stringify(mess).substring(0,5);
}

module.exports = WSClient;
