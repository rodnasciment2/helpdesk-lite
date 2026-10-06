const form=document.querySelector('#ticket-form');
const filters=document.querySelector('#filters');
const container=document.querySelector('#tickets');
const message=document.querySelector('#message');
let editingId=null, tickets=[], requestNumber=0;
function notice(text,error=false){message.textContent=text;message.classList.toggle('error',error);}
async function api(path,options={}){
  const response=await fetch(path,{...options,headers:{'Content-Type':'application/json'}});
  const data=response.status===204?null:await response.json();
  if(!response.ok) throw new Error(data.erro || 'Falha ao acessar o servidor.');
  return data;
}
// textContent evita interpretar conteúdo do usuário como HTML.
function element(tag,text,className){
  const node=document.createElement(tag);node.textContent=text;
  if(className) node.className=className;
  return node;
}
function resetForm(){
  editingId=null;form.reset();
  document.querySelector('#form-title').textContent='Novo chamado';
  document.querySelector('#submit').textContent='Criar chamado';
  document.querySelector('#cancel').hidden=true;
}
function render(){
  container.replaceChildren();
  document.querySelector('#count').textContent=`${tickets.length} chamado(s)`;
  if(!tickets.length) container.append(element('div','Nenhum chamado encontrado. Crie um ou ajuste os filtros.','empty'));
  for(const ticket of tickets){
    const card=element('article','','ticket'), top=element('div','','ticket-top');
    top.append(element('small',`#${String(ticket.id).padStart(4,'0')} · ${ticket.categoria}`));
    const badges=element('div','','badges');
    badges.append(element('span',ticket.prioridade,`badge ${['Alta','Crítica'].includes(ticket.prioridade)?'urgent':''}`),element('span',ticket.status,`badge ${ticket.status==='Resolvido'?'resolved':'status'}`));
    top.append(badges);
    const bottom=element('div','','ticket-bottom');
    bottom.append(element('small',`Criado em ${new Date(ticket.criado_em).toLocaleString('pt-BR')}`));
    const actions=element('div','','actions'),edit=element('button','Editar','secondary'),remove=element('button','Excluir','danger');
    edit.onclick=()=>{
      editingId=ticket.id;
      for(const name of ['titulo','descricao','categoria','prioridade','status']) form.elements[name].value=ticket[name];
      document.querySelector('#form-title').textContent=`Editar chamado #${ticket.id}`;
      document.querySelector('#submit').textContent='Salvar alterações';
      document.querySelector('#cancel').hidden=false;form.elements.titulo.focus();
    };
    remove.onclick=async()=>{
      if(!confirm(`Excluir o chamado #${ticket.id}? Esta ação não pode ser desfeita.`)) return;
      remove.disabled=true;
      try{await api(`/tickets/${ticket.id}`,{method:'DELETE'});if(editingId===ticket.id)resetForm();await load();notice('Chamado excluído.');}
      catch(error){notice(error.message,true);}finally{remove.disabled=false;}
    };
    actions.append(edit,remove);bottom.append(actions);
    card.append(top,element('h3',ticket.titulo),element('p',ticket.descricao),bottom);container.append(card);
  }
}
async function load(){
  const current=++requestNumber;
  const query=new URLSearchParams(new FormData(filters));
  const data=await api(`/tickets?${query}`);
  if(current!==requestNumber)return;
  tickets=data;render();
}
form.onsubmit=async event=>{
  event.preventDefault();const button=document.querySelector('#submit');button.disabled=true;
  try{
    await api(editingId?`/tickets/${editingId}`:'/tickets',{method:editingId?'PUT':'POST',body:JSON.stringify(Object.fromEntries(new FormData(form)))});
    resetForm();await load();notice('Chamado salvo.');
  }catch(error){notice(error.message,true);}finally{button.disabled=false;}
};
filters.onsubmit=async event=>{event.preventDefault();try{await load();notice('');}catch(error){notice(error.message,true);}};
document.querySelector('#cancel').onclick=resetForm;
load().catch(()=>notice('Não foi possível carregar os chamados. Verifique se a API e o banco estão ativos.',true));
