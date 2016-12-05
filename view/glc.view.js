
var GlcView = Backbone.View.extend({
  el: '.js-glc-panel',

  events : {
    "click .js-salvar" : "abrirModalSalvar",
    "change .js-glc-inputfile" : "carregarGlc",
    "click .js-propria" : "transformarPropria",
    "click .js-salvar-glc" : "salvarGlc",
    "click .js-first" : "gerarFirstFollow"
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
    this.GLC.glc = this.Propria.gerarGlcPropria(this.GLC.glc)
    var novaString = this.GLC.montarString();
    $('#glc-holder').val(novaString);
  },

  verificarGlc: function() {
    var value = $('#glc-holder').val();
    this.GLC.montarGlc(value);
    console.log(this.GLC.glc)
  },

  abrirModalSalvar: function(event) {
    console.log('este')
    this.$el.append($('#saveModal').modal('show'));
  },

  salvarGlc: function(event) {
    // serialize JSON directly to a file
    if (!this.GLC.glc) {
      this.verificarGlc();
    }
    var name = $('.js-nome').val();
    this.download(name+'.glc.json', JSON.stringify(this.GLC.glc));
    $(document.body).append(this.$('#saveModal').modal('hide'));
  },

  gerarFirstFollow: function() {
    this.verificarGlc();
    var firstFollow = new FirstFollow();
    var first = firstFollow.gerarFirst(this.GLC.glc);
    var stringFirst = firstFollow.gerarString(first)
    this.$('.js-container-first').append(stringFirst)
    var follow = firstFollow.gerarFollow(this.GLC.glc, first);
    var stringFollow = firstFollow.gerarString(follow)
    this.$('.js-container-follow').append(stringFollow)
    console.log(follow);
  },

  download: function(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
  },

  carregarGlc: function(event) {
    $in = $(event.currentTarget);
    var fileData;

    var reader = new FileReader();
    reader.onload = function(){
      var text = reader.result;
      try {
        fileData = JSON.parse(text);
        this.GLC.glc = fileData;
        var novaString = this.GLC.montarString();
        $('#glc-holder').val(novaString);
        this.trigger("new", {});
      } catch(e) {
        console.log(e)
        alert('Arquivo escolhido não se encontra no formato válido.')
      }  
    }.bind(this);
    reader.readAsText($in[0].files[0]);
  },

});


