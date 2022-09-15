import service from '/firebase/firebase.js';
import admin from 'firebase-admin';
import validacao from '../../../src/validacao';

export default async function users(req, res) {
    if (req.headers.authorization !== process.env.AUTH) {
        res.status(401).json({error: 'Não autorizado!'});
        return;
    }
    
    if(!admin.apps[0]) admin.initializeApp({
        credential: admin.credential.cert(service),
        databaseURL: process.env.DATABASE_URL
    });

    const db = admin.database();
    const id = req.query.id;
    if (!id) {
        res.status(400).json({ error: 'O ID não foi enviado!' });
        return;
    }

    console.log(req)

    switch (req.method) {
        case 'GET':
            try {
                var dados = {};

                await db.ref('/usuarios/'+id).once("value", snapshot => {
                    dados = snapshot.val();
                });

                if (!dados) res.status(404).json({ error: 'ID não encontrado!' });
                else res.status(200).json(dados);
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

                const ref = db.ref("/usuarios/"+id);
                
                var dados = null;
                await ref.once("value", snapshot => {
                    dados = snapshot.val();
                });
                if (!dados) {
                    res.status(404).json({ error: 'ID não encontrado!' });
                    return;
                }

                validacao.edicao(body);

                await ref.update(body, error => {
                    if (error) throw new Error(error);
                });
                res.status(204).end();
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }

            break;

        case 'DELETE':
            try {
                const ref = db.ref("/usuarios/"+id);
                
                var dados = null;
                await ref.once("value", snapshot => {
                    dados = snapshot.val();
                });
                if (!dados) {
                    res.status(404).json({ error: 'ID não encontrado!' });
                    return;
                }

                await ref.remove(error => {
                    if (error) throw new Error(error);
                    else res.status(204).end();
                });
            }
            catch (error) {
                res.status(400).json({ error: error });
            }

            break;

        default:
            res.status(405).json({ error: 'Method is not allowed' });
    }

}