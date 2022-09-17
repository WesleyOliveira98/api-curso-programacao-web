const fields = {
    text: ['id','nome','sobrenome','email','endereco','bairro','cidade','estado'],
    number: ['idade','ddd','telefone','cep'],
    date: ['data_nascimento']
};

const functions = {
    criacao: function(body) {
        this.compareArrays([...fields.text,...fields.number,...fields.date],Object.keys(body),true);
        fields.text.forEach(key => {
            if (typeof body[key] !== 'string') throw new Error(`O campo '${key}' está com o tipo incorreto! Espera-se um string.`);
            else if (body[key].length === 0) throw new Error(`O campo '${key}' está vazio.`);

            if(key === 'estado' && body[key].length > 2) throw new Error(`O campo '${key}' deve ser preenchido com a sigla. Exemplo: 'SP'.`);
        });
        fields.number.forEach(key => {
            if (typeof body[key] !== 'number') throw new Error(`O campo '${key}' está com o tipo incorreto! Espera-se um number.`);
            
            if(key === 'ddd' && body[key].length > 2) throw new Error(`O campo '${key}' deve ter 2 digitos.`);

            if(key === 'telefone' && body[key].length > 9) throw new Error(`O campo '${key}' deve ter no máximo 9 digitos.`);
            else if(key === 'telefone' && body[key].length < 8) throw new Error(`O campo '${key}' deve ter no minimo 8 digitos.`);

            if(key === 'cep' && body[key].length > 9) throw new Error(`O campo '${key}' deve ter 8 digitos.`);
        });
        fields.date.forEach(key => {
            if (typeof body[key] !== 'string') throw new Error(`O campo '${key}' está com o tipo incorreto! Espera-se uma data em string.`);
            else if (body[key].length === 0) throw new Error(`O campo '${key}' está vazio.`);

            let dateSplit = body[key].split("-");
            if (dateSplit.length !== 3 ||
                dateSplit[0].length !== 4 ||
                dateSplit[1].length !== 2 ||
                dateSplit[2].length !== 2) throw new Error(`O campo '${key}' está no fomato incorreto! Espera-se o formato AAAA-MM-DD.`);
        });
    },
    edicao: function(body) {
        const bodyKeys = Object.keys(body);
        this.compareArrays([...fields.text,...fields.number,...fields.date],bodyKeys,false);
        fields.text.forEach(key => {
            if (bodyKeys.find(bodyKey => bodyKey === key)) {
                if (typeof body[key] !== 'string') throw new Error(`O campo '${key}' está com o tipo incorreto! Espera-se um string.`);
                else if (body[key].length === 0) throw new Error(`O campo '${key}' está vazio.`);

                if(key === 'estado' && body[key].length > 2) throw new Error(`O campo '${key}' deve ser preenchido com a sigla. Exemplo: 'SP'.`);
            }
        });
        fields.number.forEach(key => {
            if (bodyKeys.find(bodyKey => bodyKey === key)) {
                if (typeof body[key] !== 'number') throw new Error(`O campo '${key}' está com o tipo incorreto! Espera-se um number.`);
            }
        });
        fields.date.forEach(key => {
            if (bodyKeys.find(bodyKey => bodyKey === key)) {
                if (typeof body[key] !== 'string') throw new Error(`O campo '${key}' está com o tipo incorreto! Espera-se uma data em string.`);
                else if (body[key].length === 0) throw new Error(`O campo '${key}' está vazio.`);

                let dateSplit = body[key].split("-");
                if (dateSplit.length !== 3 ||
                    dateSplit[0].length !== 4 ||
                    dateSplit[1].length !== 2 ||
                    dateSplit[2].length !== 2) throw new Error(`O campo '${key}' está no fomato incorreto! Espera-se o formato AAAA-MM-DD.`);
            }
        });
    },
    compareArrays: (fields, keys, missing) => {
        if (missing) fields.forEach(field => { if (keys.indexOf(field) == -1) throw new Error(`Campo ausente: '${field}'`) });
        keys.forEach(key => { if (fields.indexOf(key) == -1) throw new Error(`Campo desconhecido: '${key}'`) });
    }
};

export default functions;