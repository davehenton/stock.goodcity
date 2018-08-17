import Ember from "ember";
import config from '../../config/environment';
import AjaxPromise from 'stock/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({

  backLinkPath: "",
  displayAllItems: false,
  displayItemOptions: true,
  isMobileApp: config.cordova.enabled,
  itemIdforHistoryRoute: null,
  organisationIdforHistoryRoute: null,
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  appReview: Ember.inject.service(),
  isOrderProcessRestarted: false,

  displayOrderOptions: Ember.computed({
    get: function() {
      return false;
    },
    set: function(key, value) {
      return value;
    }
  }),

  ordersPackagesLengthMoreThenThree: Ember.observer('model.ordersPackages', function() {
    var ordersPackages = this.get("model.ordersPackages");
    ordersPackages.canonicalState.forEach(record => {
      if(record && record._data.state === "cancelled") {
          ordersPackages.canonicalState.removeObject(record);
      }
    });
    return (ordersPackages.canonicalState.length) >= 3 ? this.set("displayAllItems", false) : this.set("displayAllItems", true);
  }),

  filteredOrdersPkgsByState(state) {
    var ordersPackages =  this.get("model.ordersPackages").filterBy('state', state);
    return this.get("displayAllItems") ? ordersPackages : ordersPackages.slice(0, 3);
  },

  activeItemsList: Ember.computed('model.items', 'displayAllItems', 'model.ordersPackages', 'model.ordersPackages.@each.quantity', 'model.ordersPackages.@each.state', function() {
    ordersPackages =  this.get("model.ordersPackages").rejectBy('state', "cancelled").rejectBy("state", "dispatched");
    return this.get("displayAllItems") ? ordersPackages : ordersPackages.slice(0, 3);
  }),

  dispatchedtemsList: Ember.computed('model.items', 'displayAllItems', 'model.ordersPackages', 'model.ordersPackages.@each.quantity', 'model.ordersPackages.@each.state', function() {
    return this.filteredOrdersPkgsByState("dispatched");
  }),

  cancelledOrdersPackages: Ember.computed('model.items', 'displayAllItems', "model.ordersPackages", "model.ordersPackages.@each.quantity", 'model.ordersPackages.@each.state', function () {
    return this.filteredOrdersPkgsByState("cancelled");
  }),

  genericCustomPopUp(message, button1text, button2text, btn1Callback) {
    var _this = this;
    _this.get("messageBox").custom(
      _this.get("i18n").t(message),
      _this.get("i18n").t(button1text),
      () => { btn1Callback(); },
      _this.get("i18n").t(button2text),
      () => { this.send("toggleDisplayOptions"); });
  },

  genericAlertPopUp(message, btn1Callback) {
    var _this = this;
    this.get("messageBox").alert(_this.get("i18n").t(message),
      () => { btn1Callback(); }
      );
  },

  actions: {
    toggleOrderOptions() {
      this.toggleProperty("displayOrderOptions");
    },

    displayAllItems() {
      this.set("displayAllItems", true);
    },

    updateOrder(order, actionName) {
      switch(actionName) {
        case "messagePopUp":
          this.send("changeOrderState", order, "cancel");
          break;
        case "start_processing":
          this.send("changeOrderState", order, actionName);
          break;
        case "resubmit":
          this.send("promptResubmitModel", order ,actionName);
          break;
        case "reopen":
          this.send("promptReopenModel", order, actionName);
          break;
        case "restart_process":
          this.send("promptRestartProcessModel", order, actionName);
          break;
        case "dispatch_later":
          this.send("dispatchLaterModel", order, actionName);
          break;
        case "cancel":
          this.send("promptCancelOrderModel", order, actionName);
          break;
        case "close":
          this.send("promptCloseOrderModel", order, actionName);
          break;
        default:
          this.send("changeOrderState", order, actionName);
      }
    },

    dispatchLaterModel(order, actionName) {
      var _this = this;
      if(!order.get('allDesignatedOrdersPackages')) {
        this.genericAlertPopUp("order_details.dispatch_later_undispatch_warning", function() { _this.send("toggleDisplayOptions"); });
      } else {
        this.genericCustomPopUp("order_details.dispatch_later_warning", "order.dispatch_later", "not_now", function() { _this.send("changeOrderState", order, actionName); });
      }
    },

    promptResubmitModel(order, actionName) {
      var _this = this;
      this.genericCustomPopUp("order_details.resubmit_order_warning", "order.resubmit", "not_now", function() { _this.send("changeOrderState", order, actionName); });
    },

    promptReopenModel(order, actionName) {
      var _this = this;
      this.genericCustomPopUp("order_details.reopen_warning", "order.reopen_order", "not_now", function() { _this.send("changeOrderState", order, actionName); });
    },

    toggleDisplayOptions() {
      if(this.get("displayOrderOptions")) {
        this.set("displayOrderOptions", false);
      }
    },

    promptRestartProcessModel(order, actionName) {
      var _this = this;
      if(!order.get('allDesignatedOrdersPackages')) {
        this.genericAlertPopUp("order_details.restart_undispatch_warning", function() { _this.send("toggleDisplayOptions"); });
      } else {
        this.genericCustomPopUp("order_details.restart_warning", "order.restart_process", "not_now", function() { _this.set("isOrderProcessRestarted", true); _this.send("changeOrderState", order, actionName); });
      }
    },

    promptCancelOrderModel(order, actionName) {
      var _this = this;
      this.genericCustomPopUp("order_details.cancel_warning", "order.cancel_order", "not_now", function() { _this.send("changeOrderState", order, actionName); });
    },

    promptCloseOrderModel(order, actionName) {
      var _this = this;
      this.genericCustomPopUp("order_details.close_warning", "order.close_order", "not_now", function() { _this.send("changeOrderState", order, actionName); });
    },

    changeOrderState(order, transition) {
      var url = `/orders/${order.id}/transition`;
      var loadingView = getOwner(this).lookup('component:loading').append();
      new AjaxPromise(url, "PUT", this.get('session.authToken'), { transition: transition })
        .then(data => {
          if("transition" === "restart_process") {
            this.set("isOrderProcessRestarted", false);
          }
          this.send("toggleDisplayOptions");
          data["designation"] = data["order"];
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
          if(transition === "close") {
            this.get("appReview").promptReviewModal(true);
          }
          if(transition === "cancel") {
            this.transitionToRoute("orders.canceled_items", order.id);
          }
        });
    }
  }

});
