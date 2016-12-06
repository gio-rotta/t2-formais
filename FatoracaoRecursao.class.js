/*
S -> A C | C e B | B a
A -> a A | B C
C -> c C | &
B -> b B | A B | &
*/

function FatoracaoRecursao () {


    this.pegarFirst = function(producao, first) {
        var firstProducao = []
        for (var i = 0; i < producao.length; i++ ) {
            simbolo = producao[i];
            firstProducao.push(first[simbolo]);
            firstProducao = _.flatten(first[simbolo]);
            firstProducao = _.uniq(first[simbolo]);
            firstProducao = _.difference(firstProducao, ['&']);
            if (_.contains(first[simbolo],'&')) {
                if (i == producao.length - 1) {
                    firstProducao.push('&');
                    break;
                }
                continue;
            } else {
                break;
            }
        }
        return firstProducao;
    }

	this.verificarFatoracao = function(glc, first) {
        var fatorada = true;
        for ( var producaoIndex in glc.p ) {  
            var producao = glc.p[producaoIndex];

            for (var i = 0; i < producao.length; i++) {
                var regra = producao[i];
                
                if (producao[i + 1] != undefined) {
                    if (_.intersection(this.pegarFirst(producao[i], first), this.pegarFirst(producao[i + 1], first)).length == 0) {
                        continue;
                    } else {
                        var fatorada = false;
                        break;
                    }
                }
                               
            }
            
        }

        return fatorada;

    }

    this.verificarRecursao = function(glc, first) {
        var recursao = false;
        for ( var vt in first ) {  
            var arraySimb = first[vt];

            for (var i = 0; i < arraySimb.length; i++) {
                var simbolo = arraySimb[i];
                
                if (simbolo === vt) {
                    recursao = true;
                }
                               
            }
            
        }

        return recursao;
    
    }

};
	