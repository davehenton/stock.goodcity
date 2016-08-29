import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import Ember from "ember";
import cloudinaryUrl from './cloudinary_url';

export default cloudinaryUrl.extend({

  imageUrl: Ember.computed.alias("image.imageUrl"),

  thumbImageUrl: Ember.computed('favouriteImage.{angle,cloudinaryId}', function(){
    return this.get("favouriteImage.thumbImageUrl") || this.generateUrl(120, 120, true);
  }),

  favouriteImage: Ember.computed('images.@each.favourite', function(){
    return this.get("images").filterBy("favourite", true).get("firstObject");
  }),

  notes:           attr('string'),
  grade:           attr('string'),
  inventoryNumber: attr('string'),
  caseNumber:      attr('string'),
  quantity:        attr('number'),

  length:          attr('number'),
  width:           attr('number'),
  height:          attr('number'),

  sentOn:          attr('date'),
  isSet:           attr('boolean'),
  hasBoxPallet:    attr('boolean'),
  itemId:          attr('number'),
  allowWebPublish: attr('boolean'),

  designation: belongsTo('designation', { async: false }),
  location:    belongsTo('location', { async: false }),
  code:        belongsTo('code', { async: false }),
  donorCondition: belongsTo('donor_condition', { async: false }),
  setItem:        belongsTo('set_item', { async: false }),

  images:       hasMany('image', { async: false }),

  isDispatched: Ember.computed.bool('sentOn'),
  isDesignated: Ember.computed.bool('designation'),
  orderCode: Ember.computed.alias('designation.code'),
  updatedAt: attr("date"),

  setImages: Ember.computed('setItem.@each.items.@each.imageUrl', function() {
    var setItemImages = [];
    this.get("setItem.items").forEach((item) => setItemImages.pushObject(item.get("imageUrl")));
    return setItemImages.uniq();
  })
});
