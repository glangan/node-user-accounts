const profileRedirect = (req, res, next) => {
  if (req.session.user) {
    res.redirect('/users/profile');
  } else {
    next();
  }
};

const loginRedirect = (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/users/login');
  } else {
    next();
  }
};

const getUserSession = (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
};

module.exports = { profileRedirect, loginRedirect, getUserSession };
