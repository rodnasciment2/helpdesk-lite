import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {newDb,DataType} from 'pg-mem';
import {createApp} from '../src/app.js';

test('API: CRUD, filtros, validação e erros HTTP',async t=>{
  const memory=newDb();
  memory.public.registerFunction({name:'trim',args:[DataType.text],returns:DataType.text,implementation:value=>value.trim()});
  memory.public.registerFunction({name:'char_length',args:[DataType.text],returns:DataType.integer,implementation:value=>value.length});
  memory.public.none(await readFile(new URL('../database/init.sql',import.meta.url),'utf8'));
  const {Pool}=memory.adapters.createPg();
  const pool=new Pool();
  const server=createApp(pool).listen(0,'127.0.0.1');
  await new Promise(resolve=>server.on('listening',resolve));
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));await pool.end();});
  const base=`http://127.0.0.1:${server.address().port}`;
  async function request(path,method='GET',body){
    const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
    return {status:response.status,data:response.status===204?null:await response.json()};
  }
  const input={titulo:'Impressora não imprime',descricao:'Responde ao ping mas não imprime.',categoria:'Impressora',prioridade:'Alta'};
  assert.equal((await request('/health')).status,200);
  assert.equal((await request('/tickets','POST',{...input,titulo:'a'})).status,400);
  assert.equal((await request('/tickets','POST',{...input,prioridade:'Urgentíssima'})).status,400);
  const created=await request('/tickets','POST',input);
  assert.equal(created.status,201);assert.equal(created.data.status,'Aberto');
  const id=created.data.id;
  assert.equal((await request(`/tickets/${id}`)).data.titulo,input.titulo);
  assert.equal((await request('/tickets?busca=impressora&status=Aberto')).data.length,1);
  assert.equal((await request('/tickets?busca=inexistente')).data.length,0);
  assert.equal((await request('/tickets?status=invalido')).status,400);
  assert.equal((await request('/tickets/abc')).status,400);
  assert.equal((await request('/tickets/999')).status,404);
  const updated=await request(`/tickets/${id}`,'PUT',{...input,status:'Resolvido'});
  assert.equal(updated.data.status,'Resolvido');
  assert.equal((await request('/tickets?status=Aberto')).data.length,0);
  assert.equal((await request('/tickets?status=Resolvido')).data.length,1);
  assert.equal((await request(`/tickets/${id}`,'DELETE')).status,204);
  assert.equal((await request(`/tickets/${id}`)).status,404);
  const malformed=await fetch(base+'/tickets',{method:'POST',headers:{'Content-Type':'application/json'},body:'{bad'});
  assert.equal(malformed.status,400);
  assert.equal((await request('/nao-existe')).status,404);
});
