import Ember from 'ember';
import config from '../config/environment';

export default Ember.Component.extend({
  messageBox: Ember.inject.service(),
  isMobileApp: config.cordova.enabled,
  paramName: null,

  actions: {
    scanBarcode(){
      var onSuccess = res => {
        if (!res.cancelled) {
          var key = this.get("paramName") || "searchInput";
          var queryParams = {};
          var strippedURL = res.text.substring(res.text.lastIndexOf('=') + 1);
          queryParams[key] = strippedURL;
          this.get('router').transitionTo(this.get("route"), { queryParams: queryParams });
        }
      };

      var onError = error => this.get("messageBox").alert("Scanning failed: " + error);
      var options = {"formats": "QR_CODE ,CODE_128", "orientation" : "portrait"};

      window.cordova.plugins.barcodeScanner.scan(onSuccess, onError, options);
    }
  }
});

