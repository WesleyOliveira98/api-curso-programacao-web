import service from '/firebase/firebase.js';
import admin from 'firebase-admin';
import NextCors from 'nextjs-cors';

export default async function users(req, res) {
    await NextCors(req, res, {
        methods: ['PUT'],
        origin: '*',
        optionsSuccessStatus: 200,
    });
    
    if (req.headers.authorization !== process.env.AUTH_ADMIN) {
        res.status(401).json({error: 'Não autorizado!'});
        return;
    }
    
    if(!admin.apps[0]) admin.initializeApp({
        credential: admin.credential.cert(service),
        databaseURL: process.env.DATABASE_URL
    });

    const db = admin.database();
    const uid = req.query.id;
    if (!uid) {
        res.status(400).json({ error: 'O uid não foi enviado!' });
        return;
    }

    switch (req.method) {
        case 'PUT':
            try {
                const reqBody = req.body;
                if (!reqBody || Object.keys(reqBody).length === 0) throw new Error("Os dados não foram enviados!");
                const body = typeof reqBody === 'object' ? reqBody : JSON.parse(reqBody);

                //validar body
                if (!body.indice || !body.progresso) throw new Error("Payload Inválido!")
                if (body.indice.aula === undefined || body.indice.parte === undefined ) throw new Error("Indice Inválido!")
                if (body.progresso.finalizado === undefined  || body.progresso.tempo === undefined  ) throw new Error("Progresso Inválido!")

                const ref = db.ref('/perfil/'+uid);

                let dados = null
                await ref.once("value", snapshot => dados = snapshot.val())
                
                if (!dados) {
                    res.status(404).end();
                    return;
                }

                let newProgresso = [...dados.progresso]
                newProgresso[Number(body.indice.aula)][Number(body.indice.parte)] = body.progresso;
                dados.progresso = newProgresso;

                await ref.set(dados);

                res.status(204).end();
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }

            break;

        default:
            res.status(405).json({ error: 'Method is not allowed' });
    }

}