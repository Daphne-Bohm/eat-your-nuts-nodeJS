/*module.exports = (req, res, next) =>{

  return (req, res, next) => {
		//console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	    if (req.isAuthenticated()) return next();
      res.redirect('/users/login')
      //checks if user is logged in
	}
}*/
