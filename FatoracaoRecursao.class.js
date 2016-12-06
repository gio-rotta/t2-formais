/*
S -> A C | C e B | B a
A -> a A | B C
C -> c C | &
B -> b B | A B | &
*/

function FatoracaoRecursao () {


    /**
     * @author: Giovanni Rotta
     * Método que retorna o conjunto first formado pelos símbolos de determinada produção,
     * tanto a produção quanto o conjunto de todos os first são passados por parâmetro. 
     **/
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

    /**
     * @author: Giovanni Rotta
     * A partir dos firsts, verifica a intersecção de todas as produções do lado direito de uma produção, se o resultado não for vazio, significa que não está fatorada.
     * Recebe a gramática e o conjunto de firsts como parâmetro e retorna true para fatorada e false para não fatorada.
     **/
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

    /**
     * @author: Giovanni Rotta
     * A partir dos firsts-Nt, verifica se um símbolo não terminal possui ele próprio como first-NT, caso positivo, retorna true, que significa que existe recursão, no caso negativo retorna false,
     * não possui recursão. Recebe como parâmetro a GLC e o  conjunto de first-NT.
     **/
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
	