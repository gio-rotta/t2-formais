/*
S -> A C | C e B | B a
A -> a A | B C
C -> c C | &
B -> b B | A B | &
*/

function FirstFollow () {

    this.glc = false;

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
                if (regra[0].match(/[a-z()*+-0-9]+/g) || regra[0].match(/[&]/g)) {
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
                    if (regra[0].match(/[A-Z]+/g)) {
                        if (_.intersection(first[ladoEsq], first[regra[0]]).length != first[regra[0]].length) {
                            first[ladoEsq].push(first[regra[0]])
                            first[ladoEsq] = _.flatten(first[ladoEsq]);
                            var mudou = true;
                        }
                        var j = 1;
                        while(regra[j]) {
                            if (_.contains(first[regra[j-1]], '&')) {
                                if (_.intersection(first[ladoEsq], first[regra[j]]).length != first[regra[j]].length) {
                                    first[ladoEsq].push(_.uniq(first[regra[j]]));
                                    first[ladoEsq] = _.flatten(first[ladoEsq]);
                                    first[ladoEsq] = _.uniq(first[ladoEsq]);
                                    var mudou = true;
                                }
                            } else {
                                break;
                            }
                            j++;
                        }
                         first[ladoEsq] = _.uniq(first[ladoEsq]);
                    }
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
                        if (regra[j+1]) {
                            if (!regra[j+1].match(/[&]+/g)) {
                                var semEpsilon = _.difference(first[regra[j+1]], ['&']);
                                follow[regra[j]].push(_.uniq(semEpsilon));
                                follow[regra[j]] = _.flatten(follow[regra[j]]);
                            }
                        }    
                    }
                }
            }
        }

        // 3 - regra
        var mudou = true;
        while(mudou) {
            mudou = false;
            for (var ladoEsq in glc.p) {
                var producao = glc.p[ladoEsq];
                for (var i = 0; i < producao.length; i++) {
                    var regra = producao[i];
                    for (var j = 0; j < regra.length; j++) {
                        if (regra[j].match(/[A-Z]/g)) {    
                            
                            if (regra[j+1] == undefined || _.contains(first[regra[j+1]], '&')) {
                               
                                if(_.intersection(follow[regra[j]], _.uniq(follow[ladoEsq])).length != _.uniq(follow[ladoEsq]).length) {
                                    follow[regra[j]].push(_.uniq(follow[ladoEsq]));
                                    follow[regra[j]] = _.flatten(follow[regra[j]]);
                                    follow[regra[j]] = _.uniq(follow[regra[j]]);
                                    mudou = true;
                                }
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
        var mudou = true;
        while(mudou) {
            var mudou = false;
            for (var ladoEsq in glc.p) {
                var producao = glc.p[ladoEsq];
                for (var i = 0; i < producao.length; i++) {
                    var regra = producao[i];
                    if (regra[0].match(/[A-Z]+/g)) {
                        if (_.intersection(first[ladoEsq], first[regra[0]]).length != first[regra[0]].length) {
                            first[ladoEsq].push(first[regra[0]])
                            first[ladoEsq] = _.flatten(first[ladoEsq]);
                            var mudou = true;
                        }
                        var j = 1;
                        while(regra[j] && first[regra[j]]) {
                            if (_.contains(first[regra[j-1]], '&')) {
                                if (_.intersection(first[ladoEsq], first[regra[j]]).length != first[regra[j]].length) {
                                    first[ladoEsq].push(_.uniq(first[regra[j]]));
                                    first[ladoEsq] = _.flatten(first[ladoEsq]);
                                    first[ladoEsq] = _.uniq(first[ladoEsq]);
                                    var mudou = true;
                                }
                            } else {
                                break;
                            }
                            j++;
                        }
                         first[ladoEsq] = _.uniq(first[ladoEsq]);
                    }
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
    