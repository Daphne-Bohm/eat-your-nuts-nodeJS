const dotenv = require('dotenv');
dotenv.config( { path: './.env'} );

const express = require('express');
const flash = require('express-flash');
const session = require('express-session');
const checkAuth = require('../middelware/check-auth');

const db = require('../database');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const router = express.Router();

/****************************************************ROUTE*****************************************************/

router.get('/profile', checkAuth(), (req, res ) => {// WHEN USER GOES TO PROFILE WEBPAGE -> 1. Show users info and 2. show the actual webpage

    // SHOW USERS INFORMATION
    const userID = req.session.passport.user;

   db.query(`SELECT * FROM usersinfo WHERE id = ${userID}`, userID, (error, results) => {
        
        const userEmail = results[0].email;
        const userName = results[0].name;
        const userAddress = results[0].address;
        const userHousenumber = results[0].housenumber;
        const userZipcode = results[0].zipcode;
        
        if(results.length > 0){
            // IF ALL INFORMATION IS KNOWN
            if(userName || userEmail || userAddress || userHousenumber || userZipcode){
               res.render('profile', { name: userName, email: userEmail, address: userAddress, housenumber: userHousenumber, zipcode: userZipcode });

            }else{
                 //IF NOT ALL INFORMATION IS KNOWN
                res.render('profile', { email: userEmail });

            }
        }else{
            console.log(error);
        }

    })

})//localhost:3003/profile/profile

router.get('/password-reset', checkAuth(), (req, res ) => {// WHEN USER GOES TO PROFILE WEBPAGE -> 1. Show users info and 2. show the actual webpage
    res.render('password-reset');
})//localhost:3003/profile/profile

/**************************************************WHEN FORM IS SUBMITTED***************************************************/

//PROFILE
router.post('/profile', (req, res) =>{

    const { name, email, password, address, housenumber,  zipcode } = req.body;
    let errors = [];

    //1. ALL FIELDS FILLED? 
    // NO 
    if(!name || !email || !password || !address || !housenumber || !zipcode){
        req.flash('error', 'Please enter all fields.');
        errors.push('Please enter all fields.');
        return res.render('profile');

    }else if(errors.length === 0) {//YES

        // LOOK IN THE DATABASE: SELECT ROW THAT CONTAINS THE FILLED IN EMAIL BY USER
        db.query('SELECT * FROM usersinfo WHERE email = ?', [email], async (error, results) => {         

            if(error){
                console.log(error);
            
            }else if(results.length > 0) { // IS IN DATABASE

                // COMPARE inputted password and database password
                const match = await bcrypt.compare(password, results[0].password);

                //Get the users id from database
                const userID = results[0].id;

                // Password is correct
                if(match){

                    let data = { email: email, name: name, address: address, housenumber: housenumber, zipcode: zipcode };

                    // Add new data to database
                    db.query(`UPDATE usersinfo SET ? WHERE id = ${userID}`, data, (error, results) => {
                                
                        if(error){
                            console.log(error);
                            
                        }else{
                            // show message: succesful
                            req.flash('succes', 'Your information is registered.');

                            //render profile webpage
                            return res.render('profile');
                        }
                    })

                // Password is not correct
                }else{
            
                    req.flash('error', 'Password is not correct. Please enter the correct password.');
                    return res.render('profile');
            
                }
            }
        });
    }
})



//PASSWORD-RESET
router.post('/password-reset', (req, res) =>{

    const { oldPassword, newPassword, newPasswordRepeat } = req.body;
    const regexPass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    const errors = [];

    // ALL FIELDS FILLED? 
    if(!oldPassword || !newPassword || !newPasswordRepeat){
        req.flash('error', 'Please enter all fields.');
        errors.push('Please enter all fields.');
        return res.render('password-reset');
    }

    // YES, NEW PASSWORD THE SAME AS NEWPASSWORDREPEAT?
    if (newPassword !== newPasswordRepeat){
        req.flash('error', 'Passwords are not the same.');
        errors.push('Passwords are not the same.');
        return res.render('password-reset');
    }

    // YES, REQUIREMENTS?
    if(!regexPass.test(newPassword.trim())){
        req.flash('error', 'Password must contain minimum six characters and at least one letter and one number.');
        errors.push('Password must contain minimum six characters and at least one letter and one number.');
        return res.render('password-reset');
    }

    // YES, NO ERRORS?

    if(errors.length === 0){
    
    // YES, OLD PASSWORD CORRECT?
    const userID = req.session.passport.user;

       db.query(`SELECT * FROM usersinfo WHERE id = ${userID}`, userID, async (error, results) => {

            const passwordDB = results[0].password;

            const matchOldDB = await bcrypt.compare(oldPassword, passwordDB);

           if(matchOldDB){// compare old password inputted and password from db

                // OLDPASSWORD DB SAME AS NEWPASSWORD?

                const matchNewDB = await bcrypt.compare(newPassword, passwordDB);

                if(matchNewDB){// compare new password inputted and password from db
                    //YES, SHOW ERROR
                   req.flash('error', 'The new password is the same as the old password. Please give a new password.');
                   return res.render('password-reset');
                }else{ 
                    // NO, REGISTER NEW PASSWORD
                    //first hashing
                    let newHashedPassword = await bcrypt.hash(newPassword, 10);

                    //then add
                    let data = { password: newHashedPassword };
                    db.query(`UPDATE usersinfo SET ? WHERE id = ${userID}`, data, (error, results) => {
                                
                        if(error){
                            console.log(error);
                            
                        }else{
                            return res.render('profile');
                        }
                    })
                }
            }else{
                //console.log(error);
           }
        })
   } 
})


module.exports = router;