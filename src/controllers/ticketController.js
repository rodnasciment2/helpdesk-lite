export const statuses = ['Aberto', 'Em atendimento', 'Resolvido'];
export function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const {titulo, descricao, categoria, prioridade, status = 'Aberto'} = body;
  if (typeof titulo !== 'string' || titulo.trim().length < 3 || titulo.trim().length > 120) return null;
  if (typeof descricao !== 'string' || descricao.trim().length < 5 || descricao.trim().length > 2000) return null;
  if (!['Rede','Hardware','Software','Impressora','Acesso','Outros'].includes(categoria)) return null;
  if (!['Baixa','Média','Alta','Crítica'].includes(prioridade) || !statuses.includes(status)) return null;
  return [titulo.trim(),descricao.trim(),categoria,prioridade,status];
}
export function ticketController(db) {
  return {
    async list(req,res) {
      const busca=req.query.busca ?? '', status=req.query.status ?? '';
      if (typeof busca !== 'string' || busca.length>120 || typeof status !== 'string' || (status && !statuses.includes(status))) return res.status(400).json({erro:'Filtros inválidos.'});
      const result=await db.query("SELECT * FROM tickets WHERE ($1 = '' OR titulo ILIKE $2) AND ($3 = '' OR status = $3) ORDER BY id DESC",[busca,`%${busca}%`,status]);
      res.json(result.rows);
    },
    async get(req,res) {
      const result=await db.query('SELECT * FROM tickets WHERE id=$1',[req.params.id]);
      if (!result.rows.length) return res.status(404).json({erro:'Chamado não encontrado.'});
      res.json(result.rows[0]);
    },
    async create(req,res) {
      const values=validate(req.body);
      if (!values) return res.status(400).json({erro:'Verifique título (3–120), descrição (5–2000), categoria, prioridade e status.'});
      // Dados são enviados como parâmetros, separados do SQL.
      const result=await db.query('INSERT INTO tickets (titulo,descricao,categoria,prioridade,status) VALUES ($1,$2,$3,$4,$5) RETURNING *',values);
      res.status(201).location(`/tickets/${result.rows[0].id}`).json(result.rows[0]);
    },
    async update(req,res) {
      const values=validate(req.body);
      if (!values) return res.status(400).json({erro:'Dados inválidos.'});
      const result=await db.query('UPDATE tickets SET titulo=$1,descricao=$2,categoria=$3,prioridade=$4,status=$5 WHERE id=$6 RETURNING *',[...values,req.params.id]);
      if (!result.rows.length) return res.status(404).json({erro:'Chamado não encontrado.'});
      res.json(result.rows[0]);
    },
    async remove(req,res) {
      const result=await db.query('DELETE FROM tickets WHERE id=$1 RETURNING id',[req.params.id]);
      if (!result.rows.length) return res.status(404).json({erro:'Chamado não encontrado.'});
      res.status(204).end();
    }
  };
}
