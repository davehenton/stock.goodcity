import getOrderRoute from './get_order';
import Ember from 'ember';

export default getOrderRoute.extend({

  orderBackLinkPath: Ember.computed.localStorage(),
  itemIdforHistoryRoute: null,
  organisationIdforHistoryRoute: null,

  setHistoryRoute(routeName, previousRoute) {
    if(routeName === "items.history" || routeName === "items.partial_undesignate") {
      this.set("itemIdforHistoryRoute", previousRoute.params.item_id);
    } else if(routeName === "organisations.orders"){
      this.set("organisationIdforHistoryRoute", previousRoute.params.organisation_id);
    }
  },

  setPath(routeName, path) {
    if(routeName.indexOf("orders")) {
      switch(routeName) {
        case "items.search_order": path = "items"; break;
        case "items.detail": path = path; break;
        default: path = routeName;
      }
    } else if(routeName.indexOf("orders") === 0 && routeName !== "organisations.orders") {
      path = this.get("orderBackLinkPath") || path;
    }
    return path;
  },

  beforeModel() {
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();
    var path = "orders.index";
    if(previousRoute) {
      var routeName = previousRoute.name;
      this.setHistoryRoute(routeName, previousRoute);
      path = this.setPath(routeName, path);
    }
    this.set("orderBackLinkPath", path);
  },

  model(params) {
    return (this.store.peekRecord("designation", params.order_id, { reload: true }) || this.store.findRecord("designation", params.order_id, { reload: true }));
  },

  afterModel(model) {
    var organisation;
    if(model) {
      var organisationId = model.get('gcOrganisationId');
      var ordersPackages = this.store.query("orders_package", {   search_by_order_id: model.get("id") });
      if(organisationId) {
        organisation = this.store.findRecord('gcOrganisation', organisationId);
        this.store.pushPayload(organisation);
      }
      this.store.pushPayload(ordersPackages);
    }
  },

  setupController(controller, model){
    if(model) {
      var itemId = this.get('itemIdforHistoryRoute');
      var organisation_id = this.get('organisationIdforHistoryRoute');
      if(itemId)
      {
        controller.set('itemIdforHistoryRoute', itemId);
      } else if(organisation_id){
        controller.set('organisationIdforHistoryRoute', organisation_id);
      }
      this._super(controller, model);
      controller.set('backLinkPath', this.get('orderBackLinkPath'));
    }
  }
});
