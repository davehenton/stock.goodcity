import Ember from 'ember';
import AjaxPromise from '../utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Mixin.create({
  i18n: Ember.inject.service(),
  store: Ember.inject.service(),
  messageBox: Ember.inject.service(),

  canDispatchItems(designation) {
    return designation && (designation.get("isDraft") || designation.get("isSubmitted") || designation.get("isProcessing"));
  },

  canDispatchOrder(designation) {
    return designation && !designation.get("isDispatching") && designation.get("allDesignatedOrdersPackages");
  },

  genericCustomPopUp(message, button1text, button2text, btn1CallBack) {
    var _this = this;
    _this.get("messageBox").custom(
      _this.get("i18n").t(message),
      _this.get("i18n").t(button1text),
      () => { btn1CallBack(); },
      _this.get("i18n").t(button2text),
      () => {
        if(Ember.$(".receive-options")[0]) {
          this.set("hidden", true);
        }
      });
  },

  actions: {
    dispatchOrdersPackagePopUp(item) {
      if(!item.get("isSingletonItem")) { return false; }
      var _this = this;
      var designation = item.get("ordersPackages").filterBy("state", "designated").get("firstObject").get("designation");
      //Cannot Dispatch warning for non dispatchable states(draft, submitted, processing)
      if(this.canDispatchItems(designation)) {
        _this.get("messageBox").alert(
          _this.get("i18n").t("order_details.complete_process_warning"),
          () => {
            if(Ember.$(".receive-options")[0]) {
              this.set("hidden", true);
            }
            return false;
          });
      } else if(this.canDispatchOrder(designation)) {
        //Change state of order to Dispatching if first item dispatched and order is in awaiting dispatch state
        this.genericCustomPopUp("order_details.first_item_dispatch_warning", "item.cap_dispatch", "not_now", function() { _this.send("apiRequests", item, designation); });
      } else {
        //If order is in dispatching state and one item is already dispatched then show dispatch confirmation pop-up
        this.genericCustomPopUp("item.dispatch_message", "item.cap_dispatch", "not_now", function() { _this.send("apiRequests", item, designation); });
      }
    },

    apiRequests(item, designation) {
      this.send("dispatchItem", item, designation);
      if(designation.get("isAwaitingDispatch")) {
        this.send("updateOrderState", designation, "start_dispatching");
      }
    },

    dispatchItem(item, designation) {
      var _this = this;
      var pkgLocation = item.get("packagesLocations.firstObject");
      var packagesLocationQty = [];
      var record = {};
      record["packages_location_id"] = pkgLocation.get("id");
      record["qty_to_deduct"] = pkgLocation.get("quantity");
      packagesLocationQty.push(record);

      var  properties = {
        order_package_id: item.get('ordersPackages.firstObject.id'),
        package_id: item.get("id")
      };

      var url = `/items/${item.get('id')}/dispatch_stockit_item`;
      var loadingView = getOwner(this).lookup('component:loading').append();
      //Need to send exact these params => { package: properties, packages_location_and_qty: packagesLocationQty }
      new AjaxPromise(url, "PUT", this.get('session.authToken'), { package: properties, packages_location_and_qty: packagesLocationQty })
        .then(data => {
          _this.get("store").pushPayload(data);
        })
        .finally(
          () => { loadingView.destroy();
            if(Ember.$(".receive-options")[0]) {
              _this.set("hidden", true);
            }
            //Check if all Items are dispatched then show close order pop-up
            if(designation.get("allDispatchedOrdersPackages") && designation.get("isDispatching")) {
              this.send("closeOrderPoUp", designation, "close");
            }
          });
    },

    closeOrderPoUp(designation) {
      var _this = this;
      this.genericCustomPopUp("order_details.close_order_popup", "order.close_order", "not_now", function() { _this.send("updateOrderState", designation, "close"); });
    },

    updateOrderState(order, transition) {
      var _this = this;
      var url = `/orders/${order.get('id')}/transition`;
      //Conditional loader because one loader gets appended on another while dispatching an Item
      if(transition === "close") {
        var loadingView = getOwner(this).lookup('component:loading').append();
      }
      new AjaxPromise(url, "PUT", this.get('session.authToken'), { transition: transition })
        .then(data => {
          data["designation"] = data["order"];
          _this.get("store").pushPayload(data);
        })
        .finally(
          () => {
            if(transition === "close") {
              loadingView.destroy();
            }
            if(Ember.$(".receive-options")[0]) {
              _this.set("hidden", true);
            }
          });
    },
  }

});
