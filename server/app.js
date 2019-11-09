const express= require('express'),
    Session = require('express-session'),
    bodyParse = require('body-parser'),
    mongoose = require('mongoose'),
    middleware = require('connect-ensure-login'),
    FileStore = require('session-file-store')(Session),
    flash = require('connect-flash')
    path = require('path')

const passport = require('./auth/passport');
 
const config = require('./config/default')

const node_media_server = require('./media_server')

const thumbnail_generator = require('./cron/thumbnails');

const port = 3000

const app = express()

mongoose.connect('mongodb://127.0.0.1:27017/nodeStream',{
    useNewUrlParser: true 
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static('public'));
app.use('/thumbnails', express.static('server/thumbnails'));
app.use(flash())


app.use(require('cookie-parser')());
app.use(bodyParse.urlencoded({extended: true}));
app.use(bodyParse.json({extended: true}));



var FSStore = require('connect-fs2')(Session)

app.use(Session({
    store: new FSStore,
    secret: config.server.secret,
    maxAge : Date().now + (60 * 1000 * 30),
    resave : true,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());



//Routes

app.use('/login', require('./routes/login'));
app.use('/register', require('./routes/register'));
app.use('/streams',require('./routes/streams'));
app.use('/settings', require('./routes/settings'));
app.use('/user', require('./routes/user'));


app.get('/logout', (req, res) => {
    req.logout();
    return res.redirect('/login');
});

app.get('*', middleware.ensureLoggedIn(), (req, res) => {
    res.render('index');
});






app.listen(port, () => console.log(`App listening on ${port}!`));

node_media_server.run();
thumbnail_generator.start()


