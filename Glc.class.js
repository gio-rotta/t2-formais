function Glc () {

    this.glc = false;

	this.montarGlc = function(gramatica) {

        var terminais = [];
        var nTerminais = [];
        var arrayP = {};

        var arrayProducoes = gramatica.split("\n");
        for (var i = 0; i < arrayProducoes.length; i++ ) {
            var producao = arrayProducoes[i];

            ladoEsquerdo = producao.match(/.*?(?=->|$)/i)[0];
            ladoDireito = producao.match(/(->).*/i)[0];
            ladoDireito = ladoDireito.slice(2,ladoDireito.length);

            var arrayladoDireito = ladoDireito.split("|");

            for (var j = 0; j < arrayladoDireito.length; j++ ) {
                var terminal = arrayladoDireito[j].match(/[a-z]+/g);
                if (terminal) {
                    for (var k = 0; k < terminal.length; k++ ) {
                        if (terminal[k]) {
                            terminais.push(terminal[k])
                        }
                    }
                }

            }
            nTerminais.push(ladoEsquerdo.trim());
            arrayP[ladoEsquerdo.trim()] = ladoDireito.split("|");

        }

        this.glc = {
            vn: nTerminais,
            vt: terminais,
            p: arrayP,
            s: Object.keys(arrayP)[0],
        }

	};

    this.montarString = function() {
        var string = '';
        var glc = this.glc;

        for ( var producaoIndex in glc.p ) {  
            var producao = glc.p[producaoIndex];
            string += producaoIndex+' -> ';

            for (var i = 0; i < producao.length; i++) {
                if (i == producao.length - 1) {
                    string += producao[i];
                } else {
                    string += producao[i]+' | ';
                }
            }
            string += '\n';
        }
        return string;
    }
};
	