import express from 'express';
import {fileURLToPath} from 'node:url';
import {ticketRoutes} from './routes/ticketRoutes.js';
export function createApp(db) {
  const app=express();
  app.disable('x-powered-by');
  app.use(express.json({limit:'16kb'}));
  app.get('/health',async(req,res)=>{await db.query('SELECT 1');res.json({status:'ok'});});
  app.use('/tickets',ticketRoutes(db));
  app.use(express.static(fileURLToPath(new URL('../public',import.meta.url))));
  app.use((req,res)=>res.status(404).json({erro:'Rota não encontrada.'}));
  app.use((error,req,res,next)=>{
    if(error.type==='entity.parse.failed') return res.status(400).json({erro:'JSON inválido.'});
    if(error.type==='entity.too.large') return res.status(413).json({erro:'Conteúdo muito grande.'});
    console.error(error.message);
    res.status(500).json({erro:'Não foi possível concluir a operação.'});
  });
  return app;
}
