import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import '../factories/orders_package';
import '../factories/designation';
import '../factories/item';
import '../factories/gc_organisation';
import '../factories/user';
import '../factories/location';
import '../factories/organisations_user';
import FactoryGuy from 'ember-data-factory-guy';
import { mockFindAll } from 'ember-data-factory-guy';

var App, designation, item1, orders_package1, gc_organisation, user, organisation_user;

module('Acceptance: Order summary', {
  beforeEach: function() {
    App = startApp({}, 2);
    user = FactoryGuy.make("user", { mobile: "123456", email: "abc@xyz" });
    var location = FactoryGuy.make("location");
    gc_organisation = FactoryGuy.make("gc_organisation");
    organisation_user = FactoryGuy.make("organisationsUser", { gcOrganisation: gc_organisation, user: user });
    designation = FactoryGuy.make("designation", { state: "submitted", detailType: "GoodCity", gcOrganisation: gc_organisation, submittedBy: user });
    item1 = FactoryGuy.make("item", { state: "submitted", quantity: 0 , designation: designation});
    orders_package1 = FactoryGuy.make("orders_package", { state: "dispatched", quantity: 1, item: item1, designation: designation });
    var data = {"user_profile": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111", "user_role_ids": [1]}], "users": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111"}], "roles": [{"id": 4, "name": "Supervisor"}], "user_roles": [{"id": 1, "user_id": 2, "role_id": 4}]};

    $.mockjax({url:"/api/v1/auth/current_user_profil*",
      responseText: data });
    $.mockjax({url: "/api/v1/designations/*", type: 'GET', status: 200,responseText: {
      designations: [designation.toJSON({includeId: true})],
      orders_packages: [orders_package1.toJSON({includeId: true})]
    }});

    visit("/");

    andThen(function() {
      visit("/orders/");
    });

    andThen(function(){
      visit("/orders/" + designation.id + "/summary");
    });

    mockFindAll('location').returns({json: {locations: [location.toJSON({includeId: true})]}});
    mockFindAll('designation').returns({ json: {designations: [designation.toJSON({includeId: true})], items: [item1.toJSON({includeId: true})], orders_packages: [orders_package1.toJSON({includeId: true})], meta: {search: designation.get('code').toString()}}});
    mockFindAll('orders_package').returns({ json: {orders_packages: [orders_package1.toJSON({includeId: true})]}});
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test("Organisation Detail for Order summary page", function(assert) {
  assert.expect(2);
  assert.equal(currentPath(), "orders.summary");
  assert.equal($('.organisation_name').text().trim(), gc_organisation.get("nameEn"));
});

test("Contact Details for Order detail page", function(assert) {
  assert.expect(6);

  assert.equal(currentPath(), "orders.summary");
  assert.equal($(".main_details div:eq(5)").text().trim(), user.get("fullName"));
  click($('.icons:eq(0)'));

  andThen(function() {
    assert.equal(currentPath(), "orders.contact");
    assert.equal($('.name').text().trim(), user.get("fullName"));
    assert.equal($('.mobile').text().trim(), user.get("mobile"));
    assert.equal($('.email').text().trim(), user.get("email"));
  });
});

