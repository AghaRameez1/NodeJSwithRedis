var express = require('express')
const bodyParser = require('body-parser')

let messageCount = 0;
var app = express()
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
  

const db = require('./queries')



app.get('/orders', db.getOrders)
app.get('/orders/:id', db.getOrderById)
app.post('/orders', db.createOrder)
app.get('/orders/:price', db.getOrderByPrice)

app.post('/orderTree',db.createTree)

app.post('/redisChannel',db.redisChannel)

//////////////////////////////////////////////////////////////////


  




///Testing Server
app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
  })
const port = '3000'

app.listen(port,()=>{
    console.log('server started at port: '+port)
})