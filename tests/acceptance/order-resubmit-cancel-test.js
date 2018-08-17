import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import '../factories/orders_package';
import '../factories/designation';
import '../factories/item';
import '../factories/location';
import FactoryGuy from 'ember-data-factory-guy';
import { mockFindAll } from 'ember-data-factory-guy';

var App, order6, order7, item, item1,
    orders_package, orders_package1, orders_package2, orders_package3,
    item2, item3;

module('Acceptance: Order resubmit', {
  beforeEach: function() {
    App = startApp({}, 2);
    order6 = FactoryGuy.make("designation", { state: "cancelled", detailType: "GoodCity", code: "GC-00005" });
    order7 = FactoryGuy.make("designation", { state: "submitted", detailType: "GoodCity", code: "GC-00005" });
    var location = FactoryGuy.make("location");
    item = FactoryGuy.make("item", { state: "submitted" , quantity: 1, designation: order6});
    item1 = FactoryGuy.make("item", { state: "submitted", quantity: 1 , designation: order6});
    item2 = FactoryGuy.make("item", { state: "submitted" , quantity: 1, designation: order7});
    item3 = FactoryGuy.make("item", { state: "submitted", quantity: 1 , designation: order7});
    orders_package = FactoryGuy.make("cancelled_orders_package", { item: item, designation: order6 });
    orders_package1 = FactoryGuy.make("cancelled_orders_package", { item: item1, designation: order6 });
    orders_package2 = FactoryGuy.make("cancelled_orders_package", { item: item2, designation: order7 });
    orders_package3 = FactoryGuy.make("cancelled_orders_package", { item: item3, designation: order7 });
    var data = {"user_profile": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111", "user_role_ids": [1]}], "users": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111"}], "roles": [{"id": 4, "name": "Supervisor"}], "user_roles": [{"id": 1, "user_id": 2, "role_id": 4}]};

    $.mockjax({url:"/api/v1/auth/current_user_profil*",
      responseText: data });

    visit("/");

    andThen(function() {
      visit("/orders/");
    });

    mockFindAll('location').returns({json: {locations: [location.toJSON({includeId: true})]}});
    mockFindAll('designation').returns({ json: {designations: [order6.toJSON({includeId: true})],
      items: [item.toJSON({includeId: true}), item1.toJSON({includeId: true}), item2.toJSON({includeId: true}), item3.toJSON({includeId: true})],
      orders_packages: [orders_package.toJSON({includeId: true}), orders_package1.toJSON({includeId: true}), orders_package2.toJSON({includeId: true}), orders_package3.toJSON({includeId: true})], meta: {search: order6.get('code').toString()}}});
    mockFindAll('orders_package').returns({ json: {orders_packages: [orders_package.toJSON({includeId: true}), orders_package1.toJSON({includeId: true}), orders_package2.toJSON({includeId: true}), orders_package3.toJSON({includeId: true})]}});
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test("Clicking on resubmit order changes order state to submitted", function(assert) {
  assert.expect(2);
  $.mockjax({url: "/api/v1/designations/*", type: 'GET', status: 200,responseText: {
    designations: [order6.toJSON({includeId: true})],
    orders_packages: [orders_package.toJSON({includeId: true}), orders_package1.toJSON({includeId: true})]
  }});
  $.mockjax({url: '/api/v1/orders/' + order6.id + '/transitio*', type: 'PUT', status: 200,responseText: {
    designations: [order7.toJSON({includeId: true})],
    orders_packages: [orders_package2.toJSON({includeId: true}), orders_package3.toJSON({includeId: true})]
  }});
  visit("/orders/" + order6.id + "/active_items");

  andThen(function() {
    assert.equal(currentPath(), "orders.active_items");
    click($('.order-option-ellipsis'));
  });

  andThen(function() {
    assert.equal(currentPath(), "orders.active_items");
  });
});
