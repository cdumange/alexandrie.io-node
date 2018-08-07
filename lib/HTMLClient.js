const HTMLHandler = require('chcn.htmlhandler');

function HTMLClient (config){
  console.log(config);
  this.html = new HTMLHandler(config);
}

HTMLClient.prototype.sendMessage = function (message){
  return this.html.POST("", JSON.stringify(message));
}

HTMLClient.prototype.getMessage = function (filter){
  return this.html.POST("/search", JSON.stringify(filter));
}

HTMLClient.prototype.updateMessage = function (message){
  return this.html.POST("/update", JSON.stringify(message));
}

HTMLClient.prototype.close = function () {
  this.html = null;
}

module.exports = HTMLClient;
