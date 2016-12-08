/*
S -> A C | C e B | B a
A -> a A | B C
C -> c C | &
B -> b B | A B | &

P -> B O
O -> ; B O | &
B -> K V C 
K -> c K | &
V -> v K | &
C -> b Z | X
X -> com X | &
Z -> K V ; C e X | C e X
*/

function FirstFollow () {

    this.glc = false;

    /**
     * @author: Guilherme Nakayama
     * Método que retorna o conjunto first formado pelos símbolos de determinada produção,
     * tanto a produção quanto o conjunto de todos os first são passados por parâmetro.
     **/
    this.pegarFirst = function(producao, first) {
        var firstProducao = []
        for (var i = 0; i < producao.length; i++ ) {
            simbolo = producao[i];
            
            firstProducao.push( _.difference(first[simbolo], ['&']));

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

        firstProducao = _.flatten(firstProducao);
        firstProducao = _.uniq(firstProducao);
        return firstProducao;
    }

    /**
     * @author: Giovanni Rotta
     * Método responsável por gerar todos os conjuntos de first, dos símbolos da gramática.
     * Utiliza os 3 passos aprendidos em classe. Recebe uma GLC como parâmetro e retorna o
     * conjunto first de todos os símbolos. 
     **/
    this.gerarFirst = function(glc) {
        var first = {}

        for (var i = 0; i < glc.vn.length; i++) {
            var nTerminal = glc.vn[i];
            first[nTerminal] = [];
        }

        // 1 - regra
        for (var i = 0; i < glc.vt.length; i++) {
            var terminal = glc.vt[i];
            first[terminal] = [terminal];
        }

        // 2 - regra
        for (var ladoEsq in glc.p) {
            var producao = glc.p[ladoEsq];
            for (var i = 0; i < producao.length; i++) {
                var regra = producao[i];
                if (regra[0].match(/[a-z()*+-/;=:,0-9$]+/g) || regra[0].match(/[&]/g)) {
                    if (!_.contains(first[ladoEsq], regra[0])) {
                        first[ladoEsq].push(regra[0]);
                    }
                } 
            }
        }


        // 3 - regra
        var mudou = true;
        while(mudou) {
            var mudou = false;
            for (var ladoEsq in glc.p) {
                var producao = glc.p[ladoEsq];
                for (var i = 0; i < producao.length; i++) {
                    var regra = producao[i];

                    var firstProducao = this.pegarFirst(regra, first);

                    if (_.intersection(first[ladoEsq], firstProducao).length != firstProducao.length) {
                        first[ladoEsq].push(firstProducao)
                        first[ladoEsq] = _.flatten(first[ladoEsq]);
                        first[ladoEsq] = _.uniq(first[ladoEsq]);
                        var mudou = true;
                    }
                        
                        first[ladoEsq] = _.uniq(first[ladoEsq]);
                }
            }
        }
        
        return first;
    };

    /**
     * @author: Giovanni Rotta
     * Método responsável por gerar todos os conjuntos de follow  dos símbolos da gramática.
     * Utiliza os 3 passos aprendidos em classe.
     * Recebe uma GLC como parâmetro e retorna o conjunto follow de todos os símbolos.
     **/
    this.gerarFollow = function(glc, first) {
        var follow = {}

        for (var i = 0; i < glc.vn.length; i++) {
            var nTerminal = glc.vn[i];
            follow[nTerminal] = [];
        }

        // 1 - regra
        follow[glc.s].push('$');

        // 2 - regra
        for (var ladoEsq in glc.p) {
            var producao = glc.p[ladoEsq];
            for (var i = 0; i < producao.length; i++) {
                var regra = producao[i];
                for (var j = 0; j < regra.length; j++) {
                    
                    if (regra[j].match(/[A-Z]+/g)) {

                        var k = j + 1;
                        if (regra[k] && regra[k].match(/[a-z()*+-/;=:,0-9$]+/g)) {
                            var semEpsilon = _.difference(first[regra[k]], ['&']);
                            follow[regra[j]].push(_.uniq(semEpsilon));
                            follow[regra[j]] = _.flatten(follow[regra[j]]);
                        }

                        while(regra[k]) {
                            if (regra[k] && regra[k].match(/[A-Z]+/g)) {
                                var semEpsilon = _.difference(first[regra[k]], ['&']);
                                follow[regra[j]].push(_.uniq(semEpsilon));
                                follow[regra[j]] = _.flatten(follow[regra[j]]);
                            }
                            if (!_.contains(first[regra[k]], '&')) break;
                            k++;
                        }    
                    }
                }
            }
        }

        // // 3 - regra
        // var mudou = true;
        // while(mudou) {
        //     mudou = false;
        //     for (var ladoEsq in glc.p) {
        //         var producao = glc.p[ladoEsq];
        //         for (var i = 0; i < producao.length; i++) {
        //             var regra = producao[i];
        //             for (var j = 0; j < regra.length; j++) {
        //                 if (regra[j].match(/[A-Z]/g)) {    
                            
        //                     if (regra[j+1] == undefined || _.contains(first[regra[j+1]], '&')) {
                               
        //                         if(_.intersection(follow[regra[j]], _.uniq(follow[ladoEsq])).length != _.uniq(follow[ladoEsq]).length) {
        //                             follow[regra[j]].push(_.uniq(follow[ladoEsq]));
        //                             follow[regra[j]] = _.flatten(follow[regra[j]]);
        //                             follow[regra[j]] = _.uniq(follow[regra[j]]);
        //                             mudou = true;
        //                         }
        //                     }    
        //                 }
        //             }
        //         }
        //     }
        // }

        // 3 - regra
        var mudou = true;
        while(mudou) {
            mudou = false;
            for (var ladoEsq in glc.p) {
                var producao = glc.p[ladoEsq];
                for (var i = 0; i < producao.length; i++) {
                    var regra = producao[i];
                    for (var j = regra.length - 1; j >= 0; j--) {
                        if (regra[j].match(/[A-Z]/g)) {    
                            
                            if(_.intersection(_.uniq(follow[regra[j]]), _.uniq(follow[ladoEsq])).length != _.uniq(follow[ladoEsq]).length) {
                                follow[regra[j]].push(_.uniq(follow[ladoEsq]));
                                follow[regra[j]] = _.flatten(follow[regra[j]]);
                                follow[regra[j]] = _.uniq(follow[regra[j]]);
                                mudou = true;
                            }

                            if (regra[j-1] && regra[j-1].match(/[A-Z]/g) && _.contains(first[regra[j]], '&')) {
                               continue;
                            } else {
                                break;
                            }
                        }
                    }
                }
            }
        }

        return follow;
    }

    /**
     * @author: Giovanni Rotta
     * Análogo ao gerarFirst com a exceção de verificar não terminais ao invés de terminais.
     * Recebe uma GLC como parâmetro e retorna o conjunto first-NT de todos os símbolos não terminais.
     **/
    this.gerarFirstNt = function(glc) {
        var first = {}

        for (var i = 0; i < glc.vn.length; i++) {
            var nTerminal = glc.vn[i];
            first[nTerminal] = [];
        }

        // 2 - regra
        for (var ladoEsq in glc.p) {
            var producao = glc.p[ladoEsq];
            for (var i = 0; i < producao.length; i++) {
                var regra = producao[i];
                if (regra[0].match(/[A-Z]+/g)  || regra[0].match(/[&]/g)) {
                    if (!_.contains(first[ladoEsq], regra[0])) {
                        first[ladoEsq].push(regra[0]);
                    }
                } 
            }
        }

              // 3 - regra
        // 3 - regra
        var mudou = true;
        while(mudou) {
            var mudou = false;
            for (var ladoEsq in glc.p) {
                var producao = glc.p[ladoEsq];
                for (var i = 0; i < producao.length; i++) {
                    var regra = producao[i];

                    var firstProducao = this.pegarFirst(regra, first);

                    if (_.intersection(first[ladoEsq], firstProducao).length != firstProducao.length) {
                        first[ladoEsq].push(firstProducao)
                        first[ladoEsq] = _.flatten(first[ladoEsq]);
                        first[ladoEsq] = _.uniq(first[ladoEsq]);
                        var mudou = true;
                    }
                        
                        first[ladoEsq] = _.uniq(first[ladoEsq]);
                }
            }
        }
        
        return first;
    };
    
     /**
     * @author: Giovanni Rotta
     * Transforma os conjuntos, recebido por parâmetro,
     * em um texto, explicitando os conjuntos e de fácil leitura para o usuário.
     **/
    this.gerarString = function(dicionario) {
        var string = '';

        for ( var index in dicionario ) {  
            var conjunto = dicionario[index];
            string += index+': { ';

            for (var i = 0; i < conjunto.length; i++) {
                if (i != conjunto.length - 1) {
                    string += conjunto[i]+', ';
                } else {
                    string += conjunto[i]+' }';
                }
            }
            if (conjunto.length == 0) string += ' }';
            string += '<br>';
        }

        return string;

    }

};
    