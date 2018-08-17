import detail from './detail';

export default detail.extend({
  setupController(controller, model) {
    if(model) {
      this._super(controller, model);
      this.transitionTo("orders.active_items", model.id);
    }
  }
});
