import express from 'express';

const app = express();

app.get('/users', (req, res)=>{
  return res.json({
    'nome':'Jhonatas',
    'sobrenome':'Farias',
    'carrier':'Front-end',
    'age':30,
  });
})

app.listen(3333);