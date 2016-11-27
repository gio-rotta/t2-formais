var TrabalhoView = Backbone.View.extend({
  el: '.trabalho',
  events : {
    "click .js-tab" : "mudarPanel",
  },

  initialize: function(options) {
    this.glcView = new GlcView();
  },  

});