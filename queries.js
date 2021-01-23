const Pool = require('pg').Pool
const redis = require("redis");
const subscriber = redis.createClient();
const publisher = redis.createClient();
const client = redis.createClient();
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Orders',
    password: '1234',
    port: 5432,
})
const BST = require('./BST');
const tree = new BST();

const getOrders = (request, response) => {
    pool.query('SELECT * FROM orders ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}
const getOrderById = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM orders WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}
const getOrderByPrice = (request, response) => {
    const price = parseInt(request.params.price)

    pool.query('SELECT * FROM orders WHERE price = $1', [price], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const createOrder = (request, response) => {
    const { side, price } = request.body

    pool.query('INSERT INTO orders (side, price) VALUES ($1, $2)', [side, price], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Order added to database`)
    })
}
const deleteOrder = (request, response) => {
    const price = parseInt(request.params.id)

    pool.query('DELETE FROM orders WHERE price = $1', [price], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Order deleted with price: ${price}`)
    })
}
function deleteOrderTree(price) {
    pool.query('DELETE FROM orders WHERE price = $1', [price], (error, results) => {
        if (error) {
            throw error
        }
    })
}

const createTree = (request, response) => {
    const { side, price } = request.body

    if (price === tree.getByKey(price) && side === tree.get(price)) {
        tree.remove(price)
        deleteOrderTree(price)
    }
    else {
        tree.insert(price, side)
    }
    response.status(201).send(`${JSON.stringify(tree, null, 2)}\n`)
}


const redisChannel = (request, response) => {
    subscriber.subscribe("a channel");
    const {side, price} = request.body
    subscriber.on("subscribe", function (channel, count) {
        publisher.publish('a channel', price);
        console.log('REDIS CHANNEL COMPLETE')
    });
    if (price === client.keys(price)) {
        if (side === client.hget(price)) {
            client.hdel(price, price)
        }
    } else {
        client.hset(price, price, side);
    }
    console.log(client.keys);
    
    
}
subscriber.on("message", function (channel, key) {
    console.log("Subscriber received on channel:'" + channel + "' with key:" + key);
   
    // subscriber.unsubscribe();
    // subscriber.quit();
    // publisher.quit();
});


module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    deleteOrder,
    createTree,
    getOrderByPrice,
    redisChannel
}