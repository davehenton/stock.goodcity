import Ember from "ember";
import config from '../config/environment';

export default Ember.Service.extend({
  isMobileApp: config.cordova.enabled,
  cordova: Ember.inject.service(),

  promptReviewModal() {
    if(this.get("isMobileApp")) {
      AppRate.preferences = { // jshint ignore:line
        displayAppName: config.APP.REVIEW_APP_NAME,
        usesUntilPrompt: 1,
        promptAgainForEachNewVersion: true,
        inAppReview: true,
        storeAppURL: {
          ios: config.APP.APPLE_APP_ID,
          android: config.APP.ANDROID_APP_URL,
        },
        customLocale: {
          title: "Would you mind rating %@?",
          message: "It won’t take more than a minute and helps to promote our app. Thanks for your support!",
          cancelButtonLabel: "No, Thanks",
          laterButtonLabel: "Remind Me Later",
          rateButtonLabel: "Rate It Now",
          yesButtonLabel: "Yes!",
          noButtonLabel: "Not really",
          appRatePromptTitle: 'Do you like using %@',
          feedbackPromptTitle: 'Mind giving us some feedback?',
        },
        callbacks: {
          handleNegativeFeedback: function(){
            console.log("negative feedback registered");
          },
          onRateDialogShow: function(){
            console.log("Rate dilogue shown");
          },
          onButtonClicked: function(buttonIndex){
            console.log("onButtonClicked -> " + buttonIndex + "clicked");
          }
        }
      };
      AppRate.promptForRating(false); // jshint ignore:line
    }
  }
});
