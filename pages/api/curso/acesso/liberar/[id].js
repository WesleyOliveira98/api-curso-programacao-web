import service from '/firebase/firebase.js';
import admin from 'firebase-admin';
import NextCors from 'nextjs-cors';

export default async function users(req, res) {
    await NextCors(req, res, {
        methods: ['POST'],
        origin: '*',
        optionsSuccessStatus: 200,
    });
    
    if (req.headers.authorization !== process.env.AUTH_SUPERUSER) {
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
                if (!body.aprovado) throw new Error(`Campo 'aprovado' ausente ou falso`);

                const ref = db.ref('/acesso/'+uid);

                let dados = null;
                await ref.once("value", snapshot => dados = snapshot.val());
                
                if (!dados) {
                    res.status(404).end();
                    return;
                }

                await ref.update({aprovado: true});

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