import config from '../../config/environment';
import Ember from "ember";
import searchModule from "../search_module";

export default searchModule.extend({

  isMobileApp: config.cordova.enabled,
  displayItemOptions: false,
  displaySetBlock: false,
  displayItemOptionsList: true,
  searchModelName: "item",

  onItemSetIdChange: Ember.observer("itemSetId", function() {
    // wait before applying the filter
    if (this.get("itemSetId")) {
      Ember.run.debounce(this, this.applyFilter, 0);
    }
  }),
});
