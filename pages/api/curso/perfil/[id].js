import service from '/firebase/firebase.js';
import admin from 'firebase-admin';
import NextCors from 'nextjs-cors';

export default async function users(req, res) {
    await NextCors(req, res, {
        methods: ['GET', 'PUT'],
        origin: '*',
        optionsSuccessStatus: 200,
    });
    
    if (req.headers.authorization !== process.env.AUTH) {
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
        case 'GET':
            try {
                const ref = db.ref('/perfil/'+uid);

                let dados = null;
                await ref.once("value", snapshot => dados= snapshot.val())

                if (dados) res.status(200).json(dados);
                else res.status(404).json({ error: "Perfil não existe" });
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }

            break;

        case 'PUT':
            try {
                const reqBody = req.body;
                if (!reqBody || Object.keys(reqBody).length === 0) throw new Error("Os dados não foram enviados!");
                const body = typeof reqBody === 'object' ? reqBody : JSON.parse(reqBody);

                //validar body
                const campos = ['nome','email','photoURL'];
                const payload = {};

                campos.forEach(campo => {
                    if (!body[campo]) throw new Error(`Campo '${campo}' ausente`);
                    else if (body[campo] == "") throw new Error(`Campo '${campo}' está vazio`);
                    else payload[campo] = body[campo];
                });

                const ref = db.ref('/perfil/'+uid);

                let dados = null
                await ref.once("value", snapshot => dados = snapshot.val())

                if (!dados) res.status(404).json({ error: "Perfil não existe" });
                else await ref.set({...payload, progresso: dados.progresso, uid: uid});

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