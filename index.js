const HTMLClient = require('./lib/HTMLClient');
const WSClient = require('./lib/WSClient');

var MODE_WS = 'ws';
var MODE_HTTP = 'http';

var NodeClient = (function (){

  var instance;
  function ini(){
    var senderConf = {};
    var sender = null;
    return {
      init : (config) => {
        //default origine is process path
        senderConf.origine = process.execPath;
        //priorité par défaut : console.error
        senderConf.priority = 'error';
        senderConf.typeMessage = 'error';

        if (config == undefined) throw new Error('config empty');

        if (config.mode == undefined) throw new Error('config empty');
        if (config.mode != MODE_WS && config.mode != MODE_HTTP) throw new Error('config value is incorrect');

        senderConf.mode = config.mode;

        if (senderConf.mode == MODE_WS){
          if (config.address == undefined || config.portws == undefined) throw new Error('websocket missing configuration')

          senderConf.addressws = config.addressws;
          senderConf.portws = config.portws;
        }

        if (senderConf.mode == MODE_HTTP){
          if (config.address == undefined || config.suffix == undefined) throw new Error('HTTP server url not configured');
          senderConf.address = config.address;

          if (config.port != undefined) senderConf.port = config.port;
        }

        if(config.suffix != undefined) senderConf.suffix = config.suffix;

        if (config.auth != undefined || config.user != undefined){
          if (config.auth != undefined) senderConf.auth = config.auth;

          if (config.user != undefined){
            if(config.pwd == undefined) throw new Error('pwd not configured');

            senderConf.auth = "Basic " + new Buffer(config.user + ':' + config.pwd).toString("base64");
          }
        }
      },

      setOrigine : (org) => {
        if (typeof org != "string") throw new Error('bad parameter');

        senderConf.origine = org;
      },

      setDefaultPriority : (prio) => {
        if (prio != undefined)
          senderConf.priority = prio;
      },

      setDefaultTypeMessage : (type) => {
        if (type != undefined)
          senderConf.typeMessage = type;
      },

      sendMessage : (message, prior, typeM, filter) => {

        let mess = {
          typeMessage : (typeM != undefined) ? typeM : senderConf.typeMessage,
          priority : (prior != undefined) ? prior : senderConf.priority,
          origine : senderConf.origine,
          message : message
        }

        if (filter != undefined) mess.filter = filter;

        return NodeClient.getInstance().getSender().sendMessage(mess);
      },

      getMessage : (filter) => {
        if (filter == undefined
          || (filter.typeMessage == undefined && senderConf.typeMessage == undefined))
          throw new Error('research criterias not meet');

        if (filter.typeMessage == undefined) filter.typeMessage = senderConf.typeMessage;

        return NodeClient.getInstance().getSender().getMessage(filter);
      },

      updateMessage : (message) => {
        return NodeClient.getInstance().getSender().updateMessage(message);
      },

      close : () => {
        NodeClient.getInstance().getSender().close();
      },

      getSender : () => {
        let config = {
        };

        if (senderConf.address != undefined) config.address = senderConf.address;
        if (senderConf.addressws != undefined) config.addressws = senderConf.addressws;
        if (senderConf.port != undefined) config.port = senderConf.port;
        if (senderConf.portws != undefined) config.portws = senderConf.portws;
        if (senderConf.suffix != undefined) config.suffix = senderConf.suffix;
        if (senderConf.auth != undefined) config.auth = senderConf.auth;

        if (senderConf.mode == MODE_WS && sender == undefined){
          sender = new WSClient(config);
        }

        if (senderConf.mode == MODE_HTTP && sender == undefined){
          let config = {
            address : senderConf.address
          };

          sender = new HTMLClient(config);
        }

        if(sender == undefined) throw new Error('configuration/initialisation problem - no mode managed');
        return sender;
      }
    }
  }

  return {
    getInstance : function() {
      if (!instance){
        instance = ini();
      }
      return instance;
    },
    destroy : function () {
      NodeClient.getInstance().close();
    }
  };

})();

module.exports = NodeClient;
