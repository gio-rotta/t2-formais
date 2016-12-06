/*
E -> T I
I -> m T I | &
T -> F Y
Y -> a F Y | &
F -> c E x | id
*/

function LL1 () {

    this.numeroProducao = {};
    this.producaoNumero = {};

    /**
     * @author: Guilherme Nakayama
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
     * @author: Guilherme Nakayama
     * Utilizando o algoritmo ensinado em sala, recebendo por parâmetro a GLC, os conjuntos de first e o conjunto de follow, o método utiliza os 3 passos do algoritmo para gerar uma tabela de parsing.
     * Retorna um objeto bidimensional que representa a tabela de parsing.
     **/
    this.construirTabelaParsing = function(glc, first, follow) {
        this.numeroProducao = {}
        var tabela = {}
        var newVt = glc.vt.slice();
        newVt.push('$')

        for (var i = 0; i < glc.vn.length; i++) {
            tabela[glc.vn[i]] = {};
            /*for (var j = 0; j < newVt.length; j++) {
                tabela[glc.vn[i]][newVt[j]];
            }*/
        }

        // numerar produções
        var counter = 1;
        for (var index in glc.p) {
            vn = glc.p[index]
            for (var k = 0; k < vn.length; k++) {
                regra = vn[k]
                this.producaoNumero[counter] = regra;
                this.numeroProducao[index+''+regra.join('')] = counter++;
            }
        }

        // 1 - Para cada produção A -> alpha pertencente a P, execute os passos 2 e 3.
        for (var ladoEsq in glc.p) {
            var producao = glc.p[ladoEsq];
            for (var i = 0; i < producao.length; i++) {
                //2. Para todo a E First(alpha), exceto &, coloque o número da produção A -> alpha em M(A, a).
                var firsts = this.pegarFirst(producao[i], first)  
                for (var j = 0; j < newVt.length; j++) {
                    if (_.contains(firsts, newVt[j])) {
                        tabela[ladoEsq][newVt[j]] = this.numeroProducao[ladoEsq+''+producao[i].join('')];
                    } else {
                        if (!tabela[ladoEsq][newVt[j]] || tabela[ladoEsq][newVt[j]] == undefined) {
                            tabela[ladoEsq][newVt[j]] = '-';
                        }
                    }
                }

                //3. Se & E First(a), coloque o número da produção A -> a em M(A, b), para todo b E Follow(A).
                if (producao[i].join('').match(/[&]+/g) || _.contains(this.pegarFirst(producao[i], first), '&')) {
                    for (var k = 0; k < follow[ladoEsq].length; k++) {
                        var vt = follow[ladoEsq][k];
                        tabela[ladoEsq][vt] = this.numeroProducao[ladoEsq+''+producao[i].join('')];
                    }                    
                }
            }
        }

        return tabela
    }

    /**
     * @author: Guilherme Nakayama
     * Este método utiliza  algoritmo de análise visto em aula, para reconhecer símbolos da sentença,
     * e validando ou não de acordo com o topo da pilha e o topo da sentença.
     * Retorna false para o caso da sentença não ser válida e true para o caso contrário. 
     * Recebe por parâmetro a tabela, a sentença a ser avaliada e o símbolo inicial da GLC.
     **/
    this.analisadorSentenca = function(tabela, sentenca, inicial) {
        sentenca = sentenca.match(/[a-z()*+-0-9$]+/g);
        var pilha = [];
        pilha.unshift('$')
        pilha.unshift(inicial)

        while( pilha[0] != '$') {
            if (pilha[0].match(/[a-z()*+-0-9$]+/g)) {
                if (pilha[0] = sentenca[0]) {
                    pilha.shift();
                    sentenca.shift();
                }  else {
                    return false;
                }
            } else {
                var producao = this.producaoNumero[tabela[pilha[0]][sentenca[0]]];
                if (producao instanceof Array) {
                    pilha.shift();
                    for (var i = producao.length - 1; i >= 0; i--) {
                        if (producao[i] == "&") {
                            break;
                        }
                        pilha.unshift(producao[i]);
                    }
                } else {
                    return false;
                }
            }
        }
        return true;
    }

};
	