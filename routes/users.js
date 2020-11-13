const dotenv = require('dotenv');
dotenv.config( { path: './.env'} );

const express = require('express');

const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');

const db = require('../database');
const bcrypt = require('bcryptjs');
const path = require('path');

const router = express.Router();

router.use(express.json());

/********************************ROUTES**********************************/
//LOGIN PAGE
router.get('/login', (req, res) => {
    res.render('login');
})//localhost:3003/users/login

//REGISTER PAGE
router.get('/register', (req, res) => {
    res.render('register');
 })//localhost:3003/users/register

//LOGOUT PAGE
router.get('/logout', (req, res) => {
    req.logout();
    //ending the session
    req.session.destroy();
    res.redirect('/');
    req.flash('succes', 'User is logged out.');
})//localhost:3003/users/logout

module.exports = router;

//********************************HANDLES WHEN FORM IS SUBMITTED**********************************/
// REGISTER HANDLE
router.post('/register', (req, res) =>{
    const { name, email, password, passwordRepeat } = req.body;
    const regexPass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    const regexEmail = /\S+@\S+\.\S+/;
    let errors = [];

    //1. Zijn alle velden ingevuld?
    if(!name || !email || !password || !passwordRepeat){
        req.flash('error', 'Please enter all fields.');
        errors.push('Please enter all fields.');
        return res.render('register');
    }

    //2. Voldoet email aan alle eisen?
    if (!regexEmail.test(email.trim())){
        req.flash('error', 'Email is not valid.');
        errors.push('Email is not valid.');
        return res.render('register');
    }

    //3. Voldoet password aan alle eisen?
    if(!regexPass.test(password.trim())){
        req.flash('error', 'Password must contain minimum six characters and at least one letter and one number.');
        errors.push('Password must contain minimum six characters and at least one letter and one number.');
        return res.render('register');
    }

    //4. Zijn password en passwordRepeat gelijk?
    if (password !== passwordRepeat){
        req.flash('error', 'Passwords are not the same.');
        errors.push('Passwords are not the same.');
        return res.render('register');
    }

    //5. Zijn er geen errors?
    if (errors.length === 0 ){ // JA, controleer eerst of user al bekend is in de database
        
        db.query('SELECT email FROM usersinfo WHERE email = ?', [email], async (error, results) => {
            
            try{

                if(results.length > 0){  //geeft result of een row of een array terug uit de database, dan bestaat email
                    req.flash('error', 'That email already exists.');
                    return res.render('register');

                }else{
                    // Is niet bekend in de database? Dan registeren! 
                    // Hash password
                    let hashedPassword = await bcrypt.hash(password, 10); //duurt even tot wachtwoord is gehasht
                    // Add to database
                    let data = { name: name, email: email, password: hashedPassword };
                    
                    db.query('INSERT INTO usersinfo SET ?', data, (error, results) => {
                        if(error){
                            console.log(error);
                        }else{
                            req.flash('succes', 'User is registered.');
                            return res.render('login');
                        }
                    })  

                }

            }catch(error){
                console.log(error);
            }

        })
    }
})


// LOGIN HANDLE
router.post('/login', (req, res) =>{
    const { email, password } = req.body;
    const regexEmail = /\S+@\S+\.\S+/;
    let errors = [];

    //1. Zijn alle velden ingevuld?
    if(!email || !password ){
        req.flash('error', 'Please enter all fields.');
        errors.push('Please enter all fields.');
        return res.render('login');
    }

    //2. Voldoet email aan alle eisen?
    if (!regexEmail.test(email.trim())){
        req.flash('error', 'Email is not valid.');
        errors.push('Email is not valid.');
        return res.render('login');
    }

    //3. Zijn er geen errors?
    if (errors.length === 0 ){ // Er zijn geen errors

        //4. Klopt emailadres en het paswoord die daarbij hoort?
        db.query('SELECT * FROM usersinfo WHERE email = ?', [email], async (error, results) => {
            
            if(results.length > 0){// email komt voor in de database

                const match = await bcrypt.compare(password, results[0].password);

               if(!match){ //paswoord is niet hetzelfde als paswoord in de database
                    
                    req.flash('error', 'E-mail or password is not correct.');
                   return res.render('login');

                }else{ //paswoord komt wel overeen met hetgeen in de database

                    const userId = results[0].id;//only get id

                    req.login(userId, (err) =>{
                        req.flash('succes', 'User is logged in.');
                        res.redirect('/');
                    });

                }


            }else{ // als email niet voorkomt in de database

                req.flash('error', 'E-mail or password is not correct.');
                return res.render('login');

           }
        })       
    }
})


//writing in the session
passport.serializeUser((userId, done)=>{
    done(null, userId);
})

//retrieve from the session
passport.deserializeUser((userId, done)=>{
    done(null, userId);
})