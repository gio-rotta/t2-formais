/*
S -> A C A
A -> a A a | B | C
B -> b B | b
C -> c C | &

A -> a A | a | B
B -> b B | b | c

S -> a A | B b | C X
Y -> D e
A -> D B
B -> D D
D -> d
X -> C D
C -> c X
*/

function Glc () {

    this.glc = false;

    /**
     * @author: Giovanni Rotta
     * A partir do texto escrito no ‘text area’, da interface do usuário, o método separa
     * as produções, símbolos terminais e não terminas e também símbolo inicial,
     * construindo o objeto GLC, que possuí estes mesmos atributos.
     **/
	this.montarGlc = function(gramatica) {

        var terminais = [];
        var nTerminais = [];
        var hashP = {};

        var arrayProducoes = gramatica.split("\n");
        for (var i = 0; i < arrayProducoes.length; i++ ) {
            var producao = arrayProducoes[i];

            ladoEsquerdo = producao.match(/.*?(?=->|$)/i)[0];
            ladoDireito = producao.match(/(->).*/i)[0];
            ladoDireito = ladoDireito.slice(2,ladoDireito.length);

            var arrayladoDireito = ladoDireito.split("|");

            for (var j = 0; j < arrayladoDireito.length; j++ ) {
                var terminal = arrayladoDireito[j].match(/[a-z()*+-0-9]+/g);
                if (terminal) {
                    for (var k = 0; k < terminal.length; k++ ) {
                        if (terminal[k]) {
                            terminais.push(terminal[k])
                        }
                    }
                }

            }

            hashP[ladoEsquerdo.trim()] = [];

            for (var j = 0; j < arrayladoDireito.length; j++ ) {
                var arraySimbolos = arrayladoDireito[j].trim().split(' ')
                if (arraySimbolos) {
                    hashP[ladoEsquerdo.trim()].push(arraySimbolos)
                }
            }

            nTerminais.push(ladoEsquerdo.trim());

        }

        this.glc = {
            vn: nTerminais,
            vt: terminais,
            p: hashP,
            s: Object.keys(hashP)[0],
        }

	};

    /**
     * @author: Giovanni Rotta
     * Dado o objeto glc, atributo desta classe, este método é responsável por agrupar
     * novamente as produções da maneira correta para ser exibida.
     **/
    this.montarString = function(glc) {
        var string = '';
        if (!glc || glc == undefined) {
            var glc = this.glc;
        }

        for ( var producaoIndex in glc.p ) {  
            var producao = glc.p[producaoIndex];
            string += producaoIndex+' -> ';

            for (var i = 0; i < producao.length; i++) {
                string += producao[i].join(' ')+' ';
                if (i != producao.length - 1) {
                    string += '| ';
                }
            }
            string += '\n';
        }
        string = string.slice(0, -2);
        return string;
    }
};
	