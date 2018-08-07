const HTMLClient = require('./lib/HTMLClient');
const WSClient = require('./lib/WSClient');

const MODE_WS = 'ws';
const MODE_HTTP = 'http';

const DEFAULT_PRIO = 'error';
const DEFAULT_TYPEM = 'error';


var NodeClient = (function () {

  var instance;

  function ini() {
    var senderConf = null;
    var sender = null;
    return {
      init: (config) => {
        senderConf = {};
        sender = null;
        //treating rejection cause
        if (config == undefined) throw new Error('config empty');
        if (config.mode == undefined) throw new Error('config empty');
        if (config.mode != MODE_WS && config.mode != MODE_HTTP) throw new Error('config value is incorrect');

        //default origine is process path
        senderConf.origine = config.origine || process.execPath;
        //priorité par défaut : error
        senderConf.priority = config.defaultPrio || DEFAULT_PRIO;
        //default typeMessage : error
        senderConf.typeMessage = config.typeMessage || DEFAULT_TYPEM;

        senderConf.mode = config.mode;
        if (senderConf.mode == MODE_WS) {
          if (config.addressws == undefined || config.portws == undefined) throw new Error('websocket missing configuration')

          senderConf.addressws = config.addressws;
          senderConf.portws = config.portws;
        }

        if (senderConf.mode == MODE_HTTP) {
          if (config.address == undefined) throw new Error('HTTP server url not configured');
          senderConf.address = config.address;

          if (config.port != undefined) senderConf.port = config.port;
        }

        if (config.suffix != undefined) senderConf.suffix = config.suffix;

        if (config.auth != undefined || config.user != undefined) {
          if (config.auth != undefined) senderConf.auth = config.auth;

          if (config.user != undefined) {
            if (config.pwd == undefined) throw new Error('pwd not configured');

            senderConf.auth = "Basic " + new Buffer(config.user + ':' + config.pwd).toString("base64");
          }
        }
      },

      setOrigine: (org) => {
        if (!org || typeof org != "string") throw new Error('bad parameter');
        senderConf.origine = org;
      },

      setDefaultPriority: (prio) => {
        if (!prio || typeof prio != "string") throw new Error('bad parameter');
        senderConf.priority = prio;
      },

      setDefaultTypeMessage: (type) => {
        if (!type || typeof type != "string") throw new Error('bad parameter');
        senderConf.typeMessage = type;
      },

      sendMessage: (message, prior, typeM, filter) => {

        let mess = null;
        if (typeof (message) == "string") {
          mess = {
            typeMessage: (typeM != undefined) ? typeM : senderConf.typeMessage,
            priority: (prior != undefined) ? prior : senderConf.priority,
            origine: senderConf.origine,
            message: message
          }
          if (filter != undefined) mess.filter = filter;
        } else {
          //field message is an object, but not an AlexMessage (no message field)
          if (message.message == undefined) {
            mess = {};
            mess.message = message;
          } else mess = message;

          //type == object -> checking mandatory fields
          if (mess.typeMessage == undefined || mess.typeMessage == "") mess.typeMessage = typeM ? typeM : senderCOnf.typeMessage;
          if (mess.origine == undefined || mess.origine == "") mess.origine = senderConf.origine;
          if (mess.priority == undefined || mess.priority == "") mess.priority = prior ? prior : senderConf.priority;
          if (mess.filter == undefined && filter != undefined) mess.filter = filter;
        }
        return NodeClient.getInstance().getSender().sendMessage(mess);
      },

      getMessage: (filter) => {
        if (filter == undefined ||
          (filter.typeMessage == undefined && senderConf.typeMessage == undefined))
          throw new Error('research criterias not meet');

        if (filter.typeMessage == undefined) filter.typeMessage = senderConf.typeMessage;

        return NodeClient.getInstance().getSender().getMessage(filter);
      },

      updateMessage: (message) => {
        return NodeClient.getInstance().getSender().updateMessage(message);
      },

      close: () => {
        NodeClient.getInstance().getSender().close();
      },

      getSender: () => {
        if (sender == undefined) {


          if (senderConf.mode === MODE_WS) {
            let config = {};
            if (senderConf.addressws != undefined) config.addressws = senderConf.addressws;
            if (senderConf.portws != undefined) config.portws = senderConf.portws;
            if (senderConf.suffix != undefined) config.suffix = senderConf.suffix;
            if (senderConf.auth != undefined) config.auth = senderConf.auth;
            sender = new WSClient(config);
          }

          if (senderConf.mode === MODE_HTTP) {
            let config = {
              address : senderConf.address
            }

            if (senderConf.port) config.port = senderConf.port;
            if (senderConf.suffix) config.suffix = senderConf.suffix;

            sender = new HTMLClient(config);
          }
          if (sender == undefined) throw new Error('configuration/initialisation problem - no mode managed');
        }
        return sender;
      }

    }
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = ini();
      }
      return instance;
    },
    destroy: function () {
      NodeClient.getInstance().close();
    }
  };

})();

module.exports = NodeClient;