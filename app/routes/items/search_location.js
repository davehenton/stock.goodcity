import Ember from "ember";
import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({

  queryParams: {
    isSet: false
  },

  orderId: null,
  itemMoveBackLinkPath: Ember.computed.localStorage(),
  itemPreviousRoute: Ember.computed.localStorage(),

  beforeModel() {
    this._super(...arguments);
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();
    var path = "items.index";

    if(previousRoute) {
      if(previousRoute.name === "orders.dispatched_items") {
        this.set("orderId", previousRoute.params.order_id);
      }
      this.set('itemPreviousRoute', previousRoute.name);
      var routeName = previousRoute.name;
      if(routeName.indexOf("dispatched_items")){
        path = routeName;
      }
    }

    this.set("itemMoveBackLinkPath", path);
  },

  model(params) {
    var item = this.store.peekRecord("item", params.item_id);
    var recentlyUsedLocations = this.store.peekAll('location').filterBy('recentlyUsedAt');

    return Ember.RSVP.hash({
      item: item || this.store.findRecord('item', params.item_id),
      locations: recentlyUsedLocations.get('length') !== 0 ? recentlyUsedLocations : this.store.query('location', { recently_used: true })
    });
  },

  setupController(controller, model){
    this._super(controller, model);
    model.item.get('packagesLocations').filterBy('isEditing', true).setEach('isEditing', false);
    controller.set('searchText', "");
    controller.set("orderIdForOrderDetail", this.get("orderId"));
    controller.set('moveItemPath', this.get('itemPreviousRoute'));
    controller.set('backLinkPath', this.get('itemMoveBackLinkPath'));
    controller.set('selectedLocation', null);
  }
});

