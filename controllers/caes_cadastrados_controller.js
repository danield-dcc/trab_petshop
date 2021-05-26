
const knex = require("../database/dbConfig")

//trabalhando como class
module.exports = {

    //index: listagem
    //store/create: inclusão
    //update: alteração
    //show: retornar 1 arquivo
    //destroy: exclusão

    async index(req, res) {
        // const caes = await knex("caes_cadastrados").orderBy("id", "desc");
        //trazer a descrição do relacioanamento e não somente o seu id

        const caes = await knex
            .select("c.id", "c.nome", "r.nome as raca", "c.idade", "c.foto")
            .from("caes_cadastrados as c")
            .leftJoin("raca_cachorro as r", "c.raca_cachorro_id", "r.id")
            .orderBy("c.id", "desc")

        res.status(200).json(caes);
    },



    async store(req, res) {
        // faz a desestruturação do objeto req.body
        const { nome, idade, raca_cachorro_id, foto } = req.body;

        // validação para os campos
        // if (!nome || !idade || !raca_cachorro_id || !foto) {
        //     res.status(400).json({ erro: "Enviar nome, raca_cachorro_id, idade e foto" });
        //     return;
        // }

        try {
            const novo = await knex("caes_cadastrados").insert({ nome, idade, raca_cachorro_id, foto});
            res.status(201).json({ id: novo[0] });
        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    },


    //mostar destaque
    async index2(req, res) {
        // const id = req.params.id
        // const { nome, raca_cachorro_id, idade, foto, destaque } = req.body;

        try {
            const destaques = await knex("caes_cadastrados").where({ destaque: true })
            res.status(200).json({ destaques });
        } catch (error) {
            res.status(400).json({ error: error.message })
        }

    },

    //destacar
    //alteração por id
    async update(req, res) {
        const id = req.params.id
        const { destaque } = req.body;


        try {
            const existeId = await knex("caes_cadastrados").where({ id }).select("caes_cadastrados.id") //verificar se há o id
            if (existeId.find(e => e.id == id)) {

                const destaqueStatus = await knex("caes_cadastrados").where({ id }).select("caes_cadastrados.destaque")
                if (destaqueStatus.find(e => e.destaque == true)) {   //se verdadeiro passa para falso
                    await knex("caes_cadastrados").update({ destaque: false }).where({ id })
                    res.status(200).json({ msg: "Atualizado para não destacar" });
                } else if (destaqueStatus.find(e => e.destaque == false)) {
                    await knex("caes_cadastrados").update({ destaque: true }).where({ id })
                    res.status(200).json({ msg: "Atualizado para destacar" });
                }
            } else {
                res.status(400).json({ msg: "Erro. Id não encontrado" })
                return
            }
        } catch (error) {
            res.status(400).json({ error: error.message })
        }

    },


    //filtro
    async show(req, res, next) {
        const { palavra } = req.params
        try {
            const caes = await knex('caes_cadastrados').where('nome', 'like', `%${palavra}%`)

            const usuaios = await knex('usuarios').where('nome', 'like', `%${palavra}%`)

            const clientes = await knex('clientes').where('nome', 'like', `%${palavra}%`)
                .orWhere('endereco', 'like', `%${palavra}%`)
                .orWhere('CPF', 'like', `%${palavra}%`)
                .orWhere('telefone', 'like', `%${palavra}%`)

            const raca = await knex('raca_cachorro').where('nome', 'like', `%${palavra}%`)

            if (caes.length == 0 && usuaios.length == 0 && clientes.length == 0 && raca.length == 0) {

                res.status(400).json({ msg: "Nenhum item com este nome encontrado" })
            } else {
                res.status(200).json({ caes, usuaios, clientes, raca })
            }
        } catch (error) {
            res.status(400).json({ msg: error.message })
        }

    },


    //estatistica
    async indexDados(req, res) {

        try {
            const dados_caes = await knex("caes_cadastrados")
                .count({ total: "*" })
                .min({ menorIdade: "idade" })
                .max({ maiorIdade: "idade" })
                .sum({ qtdDestaques: "destaque" })
                .avg({ mediaIdade: "idade" })

            const { total, menorIdade, maiorIdade, qtdDestaques, mediaIdade } = dados_caes[0];
            res.status(200).json({ total, menorIdade, maiorIdade, qtdDestaques, mediaIdade: Number(mediaIdade).toFixed(2) })

        } catch (error) {
            res.status(400).json({ msg: error.message })
        }
    },



}