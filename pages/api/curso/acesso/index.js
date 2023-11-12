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

    switch (req.method) {
        case 'GET':
            if (req.headers.authorization !== process.env.AUTH_SUPERUSER) {
                res.status(401).json({error: 'Não autorizado!'});
                break;
            }

            try {
                const ref = db.ref('/acesso/');

                let dados = null;
                await ref.once("value", snapshot => dados= snapshot.val())

                if (dados) res.status(200).json(dados);
                else res.status(404).json({ error: "Nenhuma solicitação de acesso foi localizada" });
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
                const texts = ['uid','nome','sobrenome','email','data_nascimento','github','experiencia_logica','experiencia_javascript','data_submissao'];
                const numbers = ['ddd','telefone'];
                const booleans = ['confirmacao_repositorio','confirmacao_perfil'];
                const campos = [...texts,...numbers,...booleans];
                const payload = { aprovado: false };

                campos.forEach(campo => {
                    if (!body[campo]) throw new Error(`Campo '${campo}' ausente`);
                });

                texts.forEach(campo => {
                    if (body[campo] == "") throw new Error(`Campo '${campo}' está vazio`);
                    else if (typeof body[campo] !== "string") throw new Error(`Campo '${campo}' com formato incorreto`);
                    else payload[campo] = body[campo];
                })

                numbers.forEach(campo => {
                    if (body[campo] === 0) throw new Error(`Campo '${campo}' está vazio`);
                    else if (typeof body[campo] !== "number") throw new Error(`Campo '${campo}' com formato incorreto`);
                    else payload[campo] = body[campo];
                })

                booleans.forEach(campo => {
                    if (typeof body[campo] !== "boolean") throw new Error(`Campo '${campo}' com formato incorreto`);
                    else payload[campo] = body[campo];
                })

                //valida confirmações
                if (!body.confirmacao_repositorio || !body.confirmacao_perfil) {
                    throw new Error(`Os campos 'confirmacao_repositorio' e 'confirmacao_perfil' precisam estar confirmados`);
                }

                const ref = db.ref('/acesso/'+body.uid);

                let dados = null
                await ref.once("value", snapshot => dados = snapshot.val())

                if (dados) throw new Error("Solicitação já feita para esse e-mail");
                else await ref.set(payload);

                res.status(201).end();
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }

            break;

        default:
            res.status(405).json({ error: 'Method is not allowed' });
    }

}