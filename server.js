'use strict';
const express = require('express');
const server = express();
require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');
server.use(cors());

const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;

server.set('view engine', 'ejs')
server.use(express.static('public'));
server.use(express.urlencoded({extended:true}));

server.get('/', getAllBooks);
server.get('/add', addBooks);
// server.post('/add', processAdd);
// server.get()

server.post('/searches', (req, res) => {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.select}+${req.body.input}`;
    superagent.get(url)
        .then(data => {
            let jsaonData = data.body.items;
            let book = jsaonData.map(data => new Book(data));
            res.render('pages/searches/show', {books:book});
        })
})
function Book(data) {
    this.title = data.volumeInfo.title? data.volumeInfo.title: "No Title Available";
    this.imgUrl = (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail) ? data.volumeInfo.imageLinks.thumbnail:"https://i.imgur.com/J5LVHEL.jpg";
    this.authors = data.volumeInfo.authors? data.volumeInfo.authors: "No Authors";
    this.desc = data.volumeInfo.description? data.volumeInfo.description:"No description available";
}
// function getAllBooks(req,res){
//     let SQL = `SELECT * FROM book;`;
//     client.query(SQL)
//     .then(data=>{
//         res.render('index', {booksList: data.rows})
//     })//.catch(err =>handleError(err));
// }
// function addBooks(req, res){
//     res.render('add');
// }
// function addBooks(req, res){
//     let {title, description, category, contact, status} = req.body;
//     let SQL = "INSERT INTO book (title, description, contact,  category, status) VALUES ($1, $2, $3, $4, $5);";
//     let values = [title, description, contact,  category, status]
//     client.query(SQL, values)
//     .then(()=>{
//         res.redirect('/');
//      })//.catch(err=>handleError(err));
// }

server.get('*',(req,res)=>{
 res.status(404).send('Sorry This Route Dose Not Exist')
})

// function handleError(error, response){
//     response.render('pages/error',{error:error});
// }
function startServer (){
    server.listen(PORT, () => console.log('its work'));
}
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err=> console.log(err));
client.connect()
    .then(startServer)
    .catch(err=>handleError(err));
