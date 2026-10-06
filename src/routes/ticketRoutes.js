import {Router} from 'express';
import {ticketController} from '../controllers/ticketController.js';
export function ticketRoutes(db) {
  const router=Router(), controller=ticketController(db);
  router.param('id',(req,res,next,id)=>{
    if (!/^[1-9]\d*$/.test(id) || Number(id)>2147483647) return res.status(400).json({erro:'ID inválido.'});
    next();
  });
  router.get('/',controller.list);
  router.get('/:id',controller.get);
  router.post('/',controller.create);
  router.put('/:id',controller.update);
  router.delete('/:id',controller.remove);
  return router;
}
