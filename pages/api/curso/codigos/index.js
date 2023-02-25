import service from '/firebase/firebase.js';
import admin from 'firebase-admin';
import NextCors from 'nextjs-cors';
import axios from 'axios';

export default async function users(req, res) {
    await NextCors(req, res, {
        methods: ['POST'],
        origin: '*',
        optionsSuccessStatus: 200,
    });
    
    if (req.headers.authorization !== process.env.AUTH_ADMIN) {
        res.status(401).json({error: 'Não autorizado!'});
        return;
    }

    if (req.method == 'POST') {
            try {
                const reqBody = req.body;
                if (!reqBody || Object.keys(reqBody).length === 0) throw new Error("Os dados não foram enviados!");
                const body = typeof reqBody === 'object' ? reqBody : JSON.parse(reqBody);

                const response = await axios.get(body.gist);

                if (response.data) res.status(200).json(response.data);
                else res.status(404).end();
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
            
    }
    else res.status(405).json({ error: 'Method is not allowed' });

}