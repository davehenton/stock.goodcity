import FactoryGuy from 'ember-data-factory-guy';
import './designation';

FactoryGuy.define('item', {
  sequences: {
    id: function(num) {
      return num;
    },
    inventoryNumber: function (num) {
      var inventory = 24400 + num;
      return "C" + inventory;
    },
    itemId: function (num) {
      return num;
    }
  },
  default: {
    id:               FactoryGuy.generate('id'),
    inventoryNumber:  "C4234",
    quantity:         1,
    createdAt:        '12/01/2016',
    updatedAt:        '12/01/2016',
    state:            'submitted',
    notes:             "Example",
    length:            10,
    width:             10,
    height:            10,
    allow_web_publish: false,
    receivedQuantity: 1,
    itemId:            FactoryGuy.generate('itemId'),
    package_type:      FactoryGuy.belongsTo('package_type'),
    orders_packages:   FactoryGuy.hasMany('orders_package'),
    packages_locations:FactoryGuy.hasMany('packages_location'),
    designation:       FactoryGuy.belongsTo('designation')
  }
});

export default {};
