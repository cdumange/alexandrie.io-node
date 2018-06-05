const HTMLHandler = require('chcn.htmlhandler');

function HTMLClient (config){
  this.html = new HTMLHandler(config);
}

HTMLClient.prototype.sendMessage = async function (message){
  return html.post("", JSON.stringify(message));
}

HTMLClient.prototype.getMessage = async function (filter){
  return html.post("/search", JSON.stringify(filter));
}

HTMLClient.prototype.updateMessage = async function (message){
  return html.post("/update", JSON.stringify(message));
}

module.exports = HTMLClient;
