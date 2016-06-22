import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({
  model(params) {
    return this.store.findRecord("designation", params.order_id);
  },

  setupController(controller, model){
    this._super(controller, model);
    controller.set('displayAllItems', model.get('items.length') <= 3);
  }
});