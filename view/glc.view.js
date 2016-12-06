
var GlcView = Backbone.View.extend({
  el: '.js-glc-panel',

  events : {
    "click .js-salvar" : "abrirModalSalvar",
    "change .js-glc-inputfile" : "carregarGlc",
    "click .js-propria" : "transformarPropria",
    "click .js-salvar-glc" : "salvarGlc",
    "click .js-first" : "gerarFirstFollow",
    "click .js-gerarTabela" : "gerarTabela",
    "click .js-verificar" : "analisarSentenca",
    "click .js-detalhamento" : "mostrarDetalhamento",
  },
  
  initialize: function(options) {

    this.GLC = new Glc();
    this.Propria = new Propria();
    this.producoes = false;
    this.terminais = false;
    this.naoTerminais = false;
    this.first = false;
    this.tabela = false;
    this.ll1 = false;

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

    this.first = firstFollow.gerarFirst(this.GLC.glc);
    console.log('first', this.first)
    var stringFirst = firstFollow.gerarString(this.first);
    this.$('.js-container-first')[0].innerHTML = stringFirst;

    this.follow = firstFollow.gerarFollow(this.GLC.glc, this.first);
    console.log('follow', this.follow)
    var stringFollow = firstFollow.gerarString(this.follow)
    this.$('.js-container-follow')[0].innerHTML = stringFollow;

    this.firstNt = firstFollow.gerarFirstNt(this.GLC.glc);
    var stringFirstNt = firstFollow.gerarString(this.firstNt)
    this.$('.js-container-firstnt')[0].innerHTML = stringFirstNt;
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

  gerarTabela: function() {

    if (this.verificarFatorcaoRecursao()){
      this.montarTabela();
    }

  },

  verificarFatorcaoRecursao: function() {
    this.verificarGlc();
    if (!this.first) {
      alert('É necessário gerar o first e o follow!')
      return;
    }
    var fatoracaoRecursao = new FatoracaoRecursao();
    var fatorada = fatoracaoRecursao.verificarFatoracao(this.GLC.glc, this.first);
    this.$('.js-resposta-fatorada')[0].innerHTML = fatorada;

    var recursao = fatoracaoRecursao.verificarRecursao(this.GLC.glc, this.firstNt);
    this.$('.js-resposta-recursao')[0].innerHTML = recursao;

    return (fatorada && !recursao);
    
  },

  montarTabela: function() {
    this.ll1 = new LL1();
    this.tabela = this.ll1.construirTabelaParsing(this.GLC.glc, this.first, this.follow);
    console.log(this.tabela)
    this.renderTabela();
  },

  renderTabela: function() {
    var linhas = [];
    for ( var vn in this.tabela) {
      var linha = '<tr><th class="coluna-inicio" >'+ "-" +'</th>';
      var colunas = '';
      for (var vt in this.tabela[vn]) {
        colunas += '<th>'+vt+'</th>';
      }
      linha += colunas+'</tr>';
      linhas.push(linha);
      break;
    }

    for ( var vn in this.tabela) {
      var linha = '<tr><td class="coluna-inicio">'+ vn +'</td>';
      var colunas = '';
      for (var vt in this.tabela[vn]) {
        colunas += '<td>'+this.tabela[vn][vt]+'</td>';
      }
      linha += colunas+'</tr>';
      linhas.push(linha);
    }

    this.$('.js-tabela')[0].innerHTML = '<table class="tabela-automato">'+linhas.join('\n')+'</table>';
  },

  analisarSentenca: function() {
    if (!this.ll1) {
      alert('É necessário primeiro, gerar a tabela');
      return;
    }
    var sentenca = this.$('.js-sentenca').val();
    var resposta = this.ll1.analisadorSentenca(this.tabela, sentenca+' $', this.GLC.glc.s);
    console.log(resposta)
    if (resposta) {
      this.$('.js-validador')[0].innerHTML = 'aceita';
      this.$('.js-validador').removeClass('text-danger').addClass('text-success');
    } else {
      this.$('.js-validador')[0].innerHTML = 'não aceita';
      this.$('.js-validador').addClass('text-danger').removeClass('text-success');
    }
  },

  mostrarDetalhamento: function(event) {
    this.$el.append($('#detalhamentoPropria').modal('show'));
    var stringSemEpsilon = this.GLC.montarString(this.Propria.glcEpsilonLivre);
    $('#js-sem-epsilon').val(stringSemEpsilon);
    var stringSemProdSimples = this.GLC.montarString(this.Propria.glcSemProdSimples);
    $('#js-sem-prod-simples').val(stringSemEpsilon);
    var stringSemInuteis = this.GLC.montarString(this.Propria.glcSemSimbolosInuteis);
    $('#js-sem-inuteis').val(stringSemInuteis);
  },

});


