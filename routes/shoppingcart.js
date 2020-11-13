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

// SHOPPINGCART
router.get('/shoppingcart', (req, res) => {

  res.render('shoppingcart');

});
 
router.post('/shoppingcart', (req, res) => {

  console.log(req.body)

  const { quantity, id, name, price, img } = req.body; 

  if(req.body.quantity > 0){

    res.cookie(`product=id=${id}&quantity=${quantity}&price=${price}&img=${img}&name=${name}`);
    return res.render('shoppingcart');

  }else{

    return res.redirect(`/${name}`);

  }

})

// EXPORT
module.exports = router;