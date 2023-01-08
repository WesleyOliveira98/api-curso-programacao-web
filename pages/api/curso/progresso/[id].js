import service from '/firebase/firebase.js';
import admin from 'firebase-admin';
import NextCors from 'nextjs-cors';

export default async function users(req, res) {
    await NextCors(req, res, {
        methods: ['GET', 'POST'],
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
    const email = req.query.id;
    if (!email) {
        res.status(400).json({ error: 'O email não foi enviado!' });
        return;
    }

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
            try {
                var dados = null;
                const ref = db.ref('/progresso/');

                await ref.once("value", snapshot => {
                    let snap = snapshot.val();
                    if (snap) {
                        let users = Object.keys(snap);
                        users.forEach(user => {
                            if (snap[user].email == email) dados = snap[user]
                        })
                    }
                });

                if (!dados) {
                    let dateNow = new Date().toLocaleString("pt-br").split(" ");
                    let id = dateNow[0].split("/").reverse().join("") + dateNow[1].split(":").join("");
                    await db.ref('/progresso/'+id).update({email: email, progresso: aulas}, error => {
                        if (error) throw new Error(error);
                    });
                    res.status(200).json({email: email, progresso: aulas});
                }
                else res.status(200).json(dados);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }

            break;

        case 'POST':
            try {
                const reqBody = req.body;
                if (!reqBody || Object.keys(reqBody).length === 0) throw new Error("Os dados não foram enviados!");
                const body = typeof reqBody === 'object' ? reqBody : JSON.parse(reqBody);

                const ref = db.ref('/progresso/');

                var dados = null;
                await ref.once("value", snapshot => {
                    let snap = snapshot.val();
                    if (snap) {
                        let users = Object.keys(snap);
                        users.forEach(user => {
                            if (snap[user].email == email) dados = {...snap[user], id: user}
                        })
                    }
                });

                //validar body
                if (!body.indice || !body.progresso) throw new Error("Payload Inválido!")
                if (body.indice.aula === undefined || body.indice.parte === undefined ) throw new Error("Indice Inválido!")
                if (body.progresso.finalizado === undefined  || body.progresso.tempo === undefined  ) throw new Error("Progresso Inválido!")

                if (!dados) {
                    let dateNow = new Date().toLocaleString("pt-br").split(" ");
                    let id = dateNow[0].split("/").reverse().join("") + dateNow[1].split(":").join("");
                    let newProgresso = [...aulas]
                    newProgresso[Number(body.indice.aula)][Number(body.indice.parte)] = body.progresso;
                    await db.ref('/progresso/'+id).update({email: email, progresso: newProgresso}, error => {
                        if (error) throw new Error(error);
                    });
                    res.status(200).json({email: email, progresso: body});
                } else {
                    let newProgresso = [...dados.progresso]
                    newProgresso[Number(body.indice.aula)][Number(body.indice.parte)] = body.progresso;
                    await db.ref('/progresso/'+dados.id).update({email: email, progresso: newProgresso}, error => {
                        if (error) throw new Error(error);
                    });
                }
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