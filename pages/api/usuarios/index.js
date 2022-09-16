import service from '/firebase/firebase.js';
import admin from 'firebase-admin';
import validacao from '../../../src/validacao';
import NextCors from 'nextjs-cors';

export default async function usuarios(req, res){;
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
    if (req.method === 'GET'){
        try{
            var dados = {};

            await db.ref('/usuarios').once("value", snapshot => {
                dados = snapshot.val();
            });

            const response = [];
            const keys = dados ? Object.keys(dados) : [];

            keys.forEach(key => response.push(dados[key]));

            res.status(200).json(response);
        }
        catch(error){
            res.status(400).json({error: error.message});
        }
    }
    else if (req.method === 'POST') {
        try{
            const reqBody = req.body;
            if (!reqBody || Object.keys(reqBody).length === 0) throw new Error("Os dados não foram enviados!");
            const body = typeof reqBody === 'object' ? reqBody : JSON.parse(reqBody);
            const dateNow = new Date().toLocaleString("pt-br").split(" ");
            const id = dateNow[0].split("/").reverse().join("") + dateNow[1].split(":").join("");
            const usuario = {
                ...body,
                id: id
            };

            validacao.criacao(usuario);

            const ref = db.ref("/usuarios/"+id);

            await ref.set(usuario, error => {
                if (error) throw new Error(error);
                else res.status(201).json(usuario);
            });

        }
        catch(error){
            res.status(400).json({error: error.message});
        }
    }
    else {
        res.status(405).json({error: 'Method is not allowed'});
    }
};