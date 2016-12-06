function Propria () {

    this.glcEpsilonLivre;
    this.glcSemProdSimples;
    this.glcSemSimbolosInuteis;

    this.gerarGlcPropria = function(glc) {

        this.glcEpsilonLivre = this.eliminarEpsilon(glc);
        console.log('epsilon livre', this.glcEpsilonLivre)
        this.glcSemProdSimples = this.eliminarProdSimples(this.glcEpsilonLivre);
        console.log('sem prod simples', this.glcSemProdSimples)
        this.glcSemSimbolosInuteis = this.eliminarSimbolosInuteis(this.glcSemProdSimples);
        console.log('sem simbolos inuteis', this.glcSemSimbolosInuteis)
        return this.glcSemSimbolosInuteis;

    }

    this.eliminarSimbolosInuteis = function(glc) {
        glc = this.eliminarInferteis(glc);
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
                    for (var i = 0; i < umaProducao.length; i++) {
                        var simbolo = umaProducao[i];
                        if (simbolo == '&') {
                            if (!_.contains(ne, producaoIndex)) {
                                contemEpsilon = true;
                                ne.push(producaoIndex);
                                mudou = true;
                            }
                        } 
                    } 
                    if (_.intersection(umaProducao, ne).length > 0) {
                        if (!_.contains(ne, producaoIndex)) {
                            ne.push(producaoIndex);
                            mudou = true;
                        }
                    };
                };
            }
        }
        ne = _.uniq(ne);

        console.log(ne)
        //2 – Construa P’ como segue:
        var pLinha = {};
        //a) Inclua em P’ todas as produções de P, com exceção daquelas da forma A =>* &.
        for ( var producaoIndex in glc.p ) {
            var producao = glc.p[producaoIndex];
            for (var i = 0; i < producao.length; i++) {
                for (var j = 0; j < producao[i].length; j++) {
                    var simbolo = producao[i][j];
                    if (simbolo === '&') continue;
                    if (!pLinha[producaoIndex]) pLinha[producaoIndex] = [];
                    if (!pLinha[producaoIndex][i]) pLinha[producaoIndex][i] = [];
                    pLinha[producaoIndex][i].push(simbolo)
                }
            }
        }

        //b) combinacoes de n terminais
        for ( var producaoIndex in glc.p ) {  
            var producao = glc.p[producaoIndex];

             for (var i = 0; i < producao.length; i++) {
                if (_.intersection(ne, producao[i]).length < 1) continue;

                if (!pLinha[producaoIndex]) pLinha[producaoIndex] = [];
                if (!pLinha[producaoIndex][i]) pLinha[producaoIndex][i] = [];

                var pertencentesNe = producao[i];

                var numeroDeTerminais = producao[i].join('').match(/[a-z()*+-0-9]/g);
                numeroDeTerminais = (numeroDeTerminais)? numeroDeTerminais.length : 0;

                // cria um array das combinacoes do terminais que pertencem a Ne.
                var combinacoes = combinations(pertencentesNe.join(''));
                var combinacoesCorretas = [];

                for (var l = 0; l < combinacoes.length; l++) {
                    var numeroDeTerminaisC = combinacoes[l].match(/[a-z()*+-0-9]/g);
                    numeroDeTerminaisC = (numeroDeTerminaisC)? numeroDeTerminaisC.length : 0;
                    if (numeroDeTerminais == numeroDeTerminaisC) {
                        combinacoesCorretas.push(combinacoes[l])
                    }
                }

                for (var k = 0; k < combinacoesCorretas.length; k++) {
                    var arrayChar = combinacoesCorretas[k].split('');
                    var contem = false;
                    for (var m = 0; m < pLinha[producaoIndex].length; m++) {
                        var palavra = pLinha[producaoIndex][m].join('');
                        if (palavra == combinacoesCorretas[k]) {
                            contem = true;
                        }
                    }
                    if (!contem) {
                        pLinha[producaoIndex].push(arrayChar)
                    }
                }
            }
        }

        var vnLinha = glc.vn;
        var vtLinha = glc.vt;
        var sLinha;

        // c) Se S pertence a Ne, adicione a P’ as seguintes produções:
        // S’ -> S e S’ -> & incluindo S’ em Vn’ (Vn’ = Vn U {S’})
        if (_.contains(ne, glc.s)) {
            pLinha['S\''] = [];
             pLinha['S\''].push([glc.s]);
             pLinha['S\''].push(['&']);
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
        console.log(glc)
        buscaRecursiva(glc.s);

        function buscaRecursiva(nTerminal) {
            console.log(nTerminal)
            console.log(glc.p[nTerminal])
            for (var i = 0; i < glc.p[nTerminal].length; i++) {
                var producao = glc.p[nTerminal][i];
                for (var j = 0; j < producao.length; j++) {
                    var prodSimples = producao[j].match(/^[A-Z]$/g)
                    if (prodSimples) {
                        if (!_.contains(chain[nTerminal], producao[j])) {
                            chain[nTerminal].push(producao[j]);
                            buscaRecursiva(producao[j]);
                        }
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
                if (!producao[i].join('').match(/^[A-Z]$/g)) {
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
                    if (!producao2.join('').match(/^[A-Z]$/g)) {
                        var contem = false;
                        for (var m = 0; m < pLinha[producaoIndex].length; m++) {
                            var palavra = pLinha[producaoIndex][m].join('');
                            console.log(palavra, producao2)
                            if (palavra == producao2.join('')) {
                                contem = true;
                            }
                        }
                        if (!contem) {
                            pLinha[producaoIndex].push(producao2)
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
                if (producao[i].join('').match(/[A-Z]/g)) {
                    var nTerminais = producao[i].join('').match(/[A-Z]/g);
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
                    if (_.intersection(producao[i], inalcancaveis).length > 0 ) {
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
                if (producao[i].join('').match(/^[a-z]+$/g)) {
                    console.log(producao[i].join(''), producaoIndex)
                    ferteis.push(producaoIndex);
                }
            }
        }
        console.log(ferteis)

        ferteis = _.uniq(ferteis);
        var mudou = true;
        while (mudou) {
            mudou = false;
            for ( var producaoIndex in glc.p ) {
                producao = glc.p[producaoIndex];
                for (var umaProducao in producao) {
                    var umaProducao = producao[umaProducao];
                    var vDaProducao = umaProducao.join('').match(/[A-Z]/g);
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

        //Remover produções que não geram terminais
        var nFerteis = _.difference(glc.vn, ferteis);
        console.log(nFerteis)
        for (var i = 0; i < nFerteis.length; i++) {
            var simbolo = nFerteis[i];
            var index = glc.vn.indexOf(simbolo);
            glc.vn.splice(index,1);
            delete glc.p[simbolo];

            for ( var producaoIndex in glc.p ) {  
                var producao = glc.p[producaoIndex];

                for (var j = 0; j < producao.length; j++) {
                    if (_.intersection(producao[j], nFerteis).length > 0 ) {
                        glc.p[producaoIndex].splice(j, 1);
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
	