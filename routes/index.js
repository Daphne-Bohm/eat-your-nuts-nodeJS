const express = require('express');
const items = require('../api/items.json');
const fs = require('fs');

const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');

const db = require('../database');
const bcrypt = require('bcryptjs');
const path = require('path');

const router = express.Router();

// HOMEPAGE
router.get('/', (req, res) => {
   
   console.log(req.user);//comes with passport
   console.log(req.isAuthenticated());//comes with passport

   res.render('index', {
      items: items
   });

})

// ABOUT-US
router.get('/about-us', (req, res) => {
   res.render('about-us');
})

// CONTACT
router.get('/contact', (req, res) => {
   res.render('contact');
})

// TERMS & CONDITIONS
router.get('/terms-and-conditions', (req, res) => {
   res.render('terms-and-conditions');
})

// THE ITEMS PAGES
// dynamic routing
router.get('/:name', (req, res) => {

   let id, name, price, img;

   items.forEach( item => {

      let array = Object.entries(item);
      let string = array.join('');
      let includes =  string.includes(req.params.name);
      if(includes){
         id = item.id
         name = item.name
         price = item.price
         img =  item.img
      }
   })
   res.render('item', {
      name: req.params.name,
      id: id,
      price: price,
      img: img
   })
})

// EXPORT
module.exports = router;