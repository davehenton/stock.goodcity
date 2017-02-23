import Ember from "ember";

export default Ember.Controller.extend({
  item: null,
  isZeroQuantity: false,
  packagesLocationQty: Ember.computed.localStorage(),
  totalQty: Ember.computed.localStorage(),
  originalQty: null,

  actions: {
    move_partial_qty(item) {
      var totalQty = 0;
      var allPackagesLocations = item.get('packagesLocationsList');
      var elementIds  = allPackagesLocations.getEach('id');
      var packagesLocationQty = [];
      var record = {};
      elementIds.forEach(packages_location_id => {
        var value = parseInt(Ember.$(`#${packages_location_id}`)[0].value);
        var packages_location = this.get('store').peekRecord('packages_location', packages_location_id);
        record["packages_location_id"] = packages_location_id;
        record["location_id"] = packages_location.get('locationId');
        record["package_id"] = packages_location.get('packageId');
        record["new_qty"] = value;
        totalQty += value;
        packagesLocationQty.push(record);
        record = {};
      });
      this.set("packagesLocationQty", packagesLocationQty);
      this.set("totalQty", totalQty);
      if(this.get('totalQty') === 0){
        this.set("isZeroQuantity", true);
      }else{
        this.transitionToRoute('items.search_location', item.id, { queryParams: { isPartialMove: true }});
      }
    }
  }
});