import {createApp} from './app.js';
import {pool} from './database/connection.js';
if(!process.env.DATABASE_URL) throw new Error('Defina DATABASE_URL no .env.');
await pool.query('SELECT 1');
const server=createApp(pool).listen(process.env.PORT || 3000,()=>console.log('HelpDesk Lite na porta',process.env.PORT || 3000));
function shutdown(){
  server.close(async()=>{await pool.end();process.exit(0);});
  setTimeout(()=>process.exit(1),10000).unref();
}
process.on('SIGTERM',shutdown);
process.on('SIGINT',shutdown);
