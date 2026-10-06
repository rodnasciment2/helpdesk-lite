import pg from 'pg';
export const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:5000});
pool.on('error',error=>console.error('Erro no banco:',error.message));
