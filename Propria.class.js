function Propria () {

    this.gerarGlcPropria = function(glc) {

        glc = this.eliminarEpsilon(glc);
        console.log(glc)
        glc = this.eliminarProdSimples(glc);
        console.log(glc)
        glc = this.eliminarSimbolosInuteis(glc);
        return glc

    }

    this.eliminarSimbolosInuteis = function(glc) {
        glc = this.eliminarInferteis(glc);
        console.log(glc)
        return this.eliminarInalcancaveis(glc);
    }

    // gera um array com todas as combinacoes possiveis dos caracteres do str
    function combinations(str) {
        var fn = function(active, rest, a) {
            if (!active && !rest)
                return;
            if (!rest) {
                a.push(active);
            } else {
                fn(active + rest[0], rest.slice(1), a);
                fn(active, rest.slice(1), a);
            }
            return a;
        }
        return fn("", str, []);
    }

    this.eliminarEpsilon = function(glc) {

        var contemEpsilon =  false;
        //Construa Ne = {A | A pertence Vn e A =>* &}.
        var ne = []
        var mudou = true;
        while (mudou) {
            mudou = false;
            for ( var producaoIndex in glc.p ) {
                producao = glc.p[producaoIndex];
                for (var umaProducao in producao) {
                    var umaProducao = producao[umaProducao];
                    if (umaProducao.match(/[&]/g)){
                        if (!_.contains(ne, producaoIndex)) {
                            contemEpsilon = true;
                            ne.push(producaoIndex);
                            mudou = true;
                        }
                    } else if (_.intersection(glc.p[producaoIndex], ne).length > 0) {
                        if (!_.contains(ne, producaoIndex)) {
                            ne.push(producaoIndex);
                            mudou = true;
                        }
                    };
                };
            }
        }
        ne = _.uniq(ne);

        //2 – Construa P’ como segue:
        var pLinha = {};
        //a) Inclua em P’ todas as produções de P, com exceção daquelas da forma A =>* &.
        for ( var producaoIndex in glc.p ) {
            var producao = glc.p[producaoIndex];
            for (var i = 0; i < producao.length; i++) {
                if (producao[i].indexOf('&') > 0) continue;
                if (!pLinha[producaoIndex]) pLinha[producaoIndex] = [];
                pLinha[producaoIndex].push(producao[i])

            }
        }

        //b) 
        for ( var producaoIndex in glc.p ) {  
            var producao = glc.p[producaoIndex];

             for (var i = 0; i < producao.length; i++) {
                if (_.intersection(ne, producao[i].split(' ')).length < 1) continue;
                if (!pLinha[producaoIndex]) pLinha[producaoIndex] = [];
                var pertencentesNe = _.intersection(ne, producao[i].split(' '));

                // cria um array das combinacoes do terminais que pertencem a Ne.
                var combinacoes = combinations(pertencentesNe.join(''))

                // percorre todas as combinacoes
                for (var j = 0; j < combinacoes.length; j++) {
                    var combinacao = combinacoes[j];
                    var arrayChars = combinacao.split('');
                    var novaProducao = producao[i]+'';

                    // retira cada letra da combinacao
                    for(var k = 0; k < arrayChars.length; k++) {

                        var index = producao[i].indexOf(arrayChars[k]);
                        novaProducao = novaProducao.slice(index, 1);
                    }

                    pLinha[producaoIndex].push(novaProducao)
                }
            }
        }

        var vnLinha = glc.vn;
        var vtLinha = glc.vt;
        var sLinha;

        // c) Se S pertence a Ne, adicione a P’ as seguintes produções:
        // S’ -> S e S’ -> & incluindo S’ em Vn’ (Vn’ = Vn U {S’})
        if (_.contains(ne, Object.keys(glc.s)[0])) {
             pLinha['S\''] = pLinha[Object.keys(glc.s)[0]];
             plinha['S\''].push('&');
             vnLinha.push('S\'');
             sLinha = "S'";
        } else {
            sLinha = Object.keys(glc.p)[0];
        }

        // 3 – Faça G’ = (Vn, Vt, P’, S).
        return {
            vn: vnLinha,
            vt: vtLinha,
            p: pLinha,
            s: sLinha,
        }

    };

    this.eliminarProdSimples = function(glc) {
        var chain = {}
        // 1 – Para todo A pertence a Vn, construa NA = {B | A ->*  B}
        for (var i = 0; i < glc.vn.length; i++) {
            var nTerminal = glc.vn[i];
            chain[nTerminal] = [];
        }

        buscaRecursiva(glc.vn[0]);

        function buscaRecursiva(nTerminal) {
            for (var i = 0; i < glc.p[nTerminal].length; i++) {
                var producao = glc.p[nTerminal][i].trim();
                var prodSimples = producao.trim().match(/^[A-Z]$/g)
                if (prodSimples) {
                    if (!_.contains(chain[nTerminal], producao)) {
                        chain[nTerminal].push(producao);
                        buscaRecursiva(producao);
                    }
                }
            }
        }

        // 2- Construa P’ como segue:
        // se B -> a, pertence a P e não é uma produção simples, 
        // então adicione a P’ as produções da forma:
        // A -> a, para todo A | B pertencente a NA
        var pLinha = {}
        for ( var producaoIndex in glc.p ) {  
            var producao = glc.p[producaoIndex];
            pLinha[producaoIndex] = [];
             for (var i = 0; i < producao.length; i++) {
                if (!producao[i].trim().match(/^[A-Z]$/g)) {
                    pLinha[producaoIndex].push(producao[i]);
                }
            }
        }

        for ( var producaoIndex in glc.p ) {  
            var producao = glc.p[producaoIndex];
            for (var producoesIndiretas in chain[producaoIndex]) {
                producoesIndiretas = chain[producaoIndex][producoesIndiretas]
                console.log('producoesIndiretas',producoesIndiretas)
                for ( var producao2 in glc.p[producoesIndiretas] ) {  
                    producao2 = glc.p[producoesIndiretas][producao2]
                    if (!producao2.trim().match(/^[A-Z]$/g)) {
                        if (!_.contains(pLinha[producaoIndex], producao2)) {
                            pLinha[producaoIndex].push(producao2);
                        }
                    }
                }
            }
        }

        // 3 – Faça G’ = (Vn, Vt, P’, S).
        return {
            vn: glc.vn,
            vt: glc.vt,
            p: pLinha,
            s: glc.s,
        }

    };

    this.eliminarInalcancaveis = function(glc) {

        var alcancaveis = []
        function recursaoAlcancaveis(producaoIndex) {
            var producao = glc.p[producaoIndex];
            for (var i = 0; i < producao.length; i++) {
                if (producao[i].trim().match(/[A-Z]/g)) {
                    var nTerminais = producao[i].trim().match(/[A-Z]/g);
                    for (var j = 0; j < nTerminais.length; j++) {
                        if (!_.contains(alcancaveis, nTerminais[j])) {
                            alcancaveis.push(nTerminais[j]);
                            recursaoAlcancaveis(nTerminais[j]);
                        }
                    }
                }
            }
        }
        alcancaveis.push(glc.s);
        recursaoAlcancaveis(glc.s)

        //Remover produções inalcancaveis
        var inalcancaveis = _.difference(glc.vn, alcancaveis);
        for (var i = 0; i < inalcancaveis.length; i++) {
            var simbolo = inalcancaveis[i];
            var index = glc.vn.indexOf(simbolo);
            glc.vn.splice(index,1);
            delete glc.p[simbolo];

            for ( var producaoIndex in glc.p ) {  
                var producao = glc.p[producaoIndex];

                for (var i = 0; i < producao.length; i++) {
                    if (_.intersection(producao[i].split(""), inalcancaveis).length > 0 ) {
                        glc.p[producaoIndex].splice(i, 1)                      
                    }
                }
            }
        }

        return {
            vn: glc.vn,
            vt: glc.vt,
            p: glc.p,
            s: glc.s,
        }

    };


    this.eliminarInferteis = function(glc) {

        var ferteis = [];
        for ( var producaoIndex in glc.p ) {  
            var producao = glc.p[producaoIndex];
            for (var i = 0; i < producao.length; i++) {
                if (producao[i].trim().match(/^[a-z]+$/g)) {
                    ferteis.push(producaoIndex);
                }
            }
        }


        ferteis = _.uniq(ferteis);
        var mudou = true;
        while (mudou) {
            mudou = false;
            for ( var producaoIndex in glc.p ) {
                producao = glc.p[producaoIndex];
                for (var umaProducao in producao) {
                    var umaProducao = producao[umaProducao];
                    var vDaProducao = umaProducao.trim().match(/[A-Z]/g);
                    pertence = true;
                    if (vDaProducao) {
                        for (var j = 0; j < vDaProducao.length; j++) {
                            console.log(vDaProducao[j])
                            if (!_.contains(ferteis, vDaProducao[j])) {
                                pertence = false;
                                break;
                            }
                        }
                    }

                    if (pertence) {
                        if (!_.contains(ferteis, producaoIndex)) {
                            mudou = true;
                            ferteis.push(producaoIndex)
                        }
                    }
                };
            }
        }
        ferteis = _.uniq(ferteis);
        console.log(ferteis)

        //Remover produções que não geram terminais
        var nFerteis = _.difference(glc.vn, ferteis);
        for (var i = 0; i < nFerteis.length; i++) {
            var simbolo = nFerteis[i];
            var index = glc.vn.indexOf(simbolo);
            glc.vn.splice(index,1);
            delete glc.p[simbolo];

            for ( var producaoIndex in glc.p ) {  
                var producao = glc.p[producaoIndex];

                for (var i = 0; i < producao.length; i++) {
                    if (_.intersection(producao[i].split(""), nFerteis).length > 0 ) {
                        glc.p[producaoIndex].splice(i, 1)                      
                    }
                }
            }
        }

        return {
            vn: glc.vn,
            vt: glc.vt,
            p: glc.p,
            s: glc.s,
        }

    }

};
	