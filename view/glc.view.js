
var GlcView = Backbone.View.extend({
  el: '.js-glc-panel',

  events : {
    "click .js-salvar" : "abrirModalSalvar",
    "click .js-carregar" : "carregarGlc",
    "click .js-propria" : "transformarPropria",
  },
  
  initialize: function(options) {

    this.GLC = new Glc();
    this.Propria = new Propria();
    this.producoes = false;
    this.terminais = false;
    this.naoTerminais = false;

    this.on('glcValida', this.habilitarBotoes);
  },  

  transformarPropria: function() {
    this.verificarGlc();
  },

  verificarGlc: function() {
    var value = $('#glc-holder').val();
    this.GLC.montarGlc(value);
    console.log(this.GLC.glc)
    this.GLC.glc = this.Propria.gerarGlcPropria(this.GLC.glc)
    var novaString = this.GLC.montarString();
    $('#glc-holder').val(novaString);
  },

});


