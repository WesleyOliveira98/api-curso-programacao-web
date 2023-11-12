import service from '/firebase/firebase.js';
import admin from 'firebase-admin';
import NextCors from 'nextjs-cors';

export default async function users(req, res) {
    await NextCors(req, res, {
        methods: ['GET','POST'],
        origin: '*',
        optionsSuccessStatus: 200,
    });
    
    if(!admin.apps[0]) admin.initializeApp({
        credential: admin.credential.cert(service),
        databaseURL: process.env.DATABASE_URL
    });

    const db = admin.database();

    const aulas = [
        [
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ],
        [
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
            {
                "finalizado": false,
                "tempo": 0
            },
        ]
    ]

    switch (req.method) {
        case 'GET':
            if (req.headers.authorization !== process.env.AUTH_SUPERUSER) {
                res.status(401).json({error: 'Não autorizado!'});
                return;
            }

            try {
                const ref = db.ref('/perfil/');

                let dados = null;
                await ref.once("value", snapshot => dados = snapshot.val());

                if (dados) res.status(200).json(dados);
                else res.status(404).end();
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }

            break;

        case 'POST':
            if (req.headers.authorization !== process.env.AUTH_ADMIN) {
                res.status(401).json({error: 'Não autorizado!'});
                return;
            }

            try {
                const reqBody = req.body;
                if (!reqBody || Object.keys(reqBody).length === 0) throw new Error("Os dados não foram enviados!");
                const body = typeof reqBody === 'object' ? reqBody : JSON.parse(reqBody);

                //validar body
                const campos = ['uid','nome','email','photoURL'];
                campos.forEach(campo => {
                    if (!body[campo]) throw new Error(`Campo '${campo}' ausente`);
                    else if (body[campo] == "") throw new Error(`Campo '${campo}' está vazio`);
                });

                const ref = db.ref('/perfil/'+body.uid);

                let dados = null;
                await ref.once("value", snapshot => dados = snapshot.val())
                
                if (dados) throw new Error("Perfil já existe");
                else await ref.set({...body, progresso: aulas});

                res.status(201).json({...body, progresso: aulas});
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }

            break;

        default:
            res.status(405).json({ error: 'Method is not allowed' });
    }

}