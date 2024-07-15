require( 'dotenv' ).config()
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const YandexStrategy = require('passport-yandex').Strategy;

const app = express();

 
app.set('view engine', 'ejs');
 
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
 
passport.use(new YandexStrategy({
    clientID: process.env.YANDEX_CLIENT_ID,
    clientSecret: process.env.YANDEX_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/login/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));
 
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Главная страница
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

// Страница профиля
app.get('/profile', ensureAuthenticated, (req, res) => {
  res.render('profile', { user: req.user });
});

// Аутентификация с помощью Яндекс
app.get('/login',
  passport.authenticate('yandex'));

app.get('/login/callback', 
  passport.authenticate('yandex', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  });

// Выход из системы
app.get('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });
  

app.post('/participate', ensureAuthenticated, (req, res) => {
    req.user.participating = !req.user.participating;
    res.redirect('/profile');
  });

// Middleware для проверки аутентификации
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

// Запуск сервера
app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});