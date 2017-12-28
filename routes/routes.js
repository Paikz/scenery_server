
var express   = require('express');
var mongoose  = require('mongoose');
var fs        = require('fs');
var jwt       = require('jsonwebtoken');
var bcrypt    = require('bcryptjs');
var multer    = require('multer');
var path      = require('path');
const crypto  = require('crypto');
var router    = express.Router();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './content')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname));
    });
  }
});
var upload = multer({ storage: storage });

//Models
var User = require('../models/user.model')
var UserModel = mongoose.model('User')
var Post = require('../models/post.model')
var PostModel = mongoose.model('Post')

router.use((req, res, next) => {
    console.log("Incoming " + req.method + " req to: " + req.path);
    next();
});

router.route("/api/users")
    .post(function(req, res) {
        var newUser = new UserModel({ username: req.body.username, email: req.body.email, password: req.body.password});
        var salt = bcrypt.genSaltSync(10);
        newUser.password = bcrypt.hashSync(req.body.password, salt);

        newUser.save(function (err) {
            if (err && err.code === 11000) {
                return res.status(400).send({ message: 'Duplicate email.' });
            }
            if (err) return res.send(err);
            res.send("User created.");
        });
    })

router.route("/api/authenticate")
    .post(function(req, res) {
        UserModel.findOne({
            username: req.body.username
        }, "+password", function(err, user) {
            if (err) return res.send(err);
            if (!user) {
                return res.status(401).send({ success: false, message: 'Authentication failed.' });
            } else if (user) {
                if (!user.comparePassword(req.body.password)) {
                    return res.status(401).send({ success: false, message: 'Authentication failed.' });
                } else {
                    let payload = {
                        username: user.username,
                        email: user.email,
                        img: user.img
                    }
                    var token = jwt.sign(payload, "TOKENAUTHENTICATION", {
                        expiresIn: '24h'
                    });

                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                }
            }
        })
    })

router.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'].split(' ')[1];
  if (token) {
    jwt.verify(token, "TOKENAUTHENTICATION", function(err, decoded) {
      if (err) {
        return res.send({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });
  }
});

router.get("/", (req, res) => {
    res.json({ message: 'The Restful API is up and running...' });
});

router.route("/api/users")
    .get(function(req, res) {
        UserModel.find(function (err, users) {
          if (err) return res.send(err);
          res.json(users);
        })
    })

    .delete(function(req, res) {
        UserModel.remove({}, function(err) {
          if (err) return res.send(err);
          res.json({message: 'Successfully deleted all entries.'});
        })
    });

router.route("/api/users/:username")
    .get(function(req, res) {
      UserModel.findOne({ 'username': req.params.username }, function (err, user) {
          if (err) return res.send(err);
          res.json(user);
      })
    })

    .put(function(req, res) {
      UserModel.findById(req.params.user_id, function(err, user) {
          if (err) return res.send(err);

          user.username = req.body.username;
          user.email = req.body.email;

          user.save(function(err) {
              if (err) res.send(err);
              res.json({ message: 'User updated.' });
          });

      });
    })

    .delete(function(req, res) {
        UserModel.remove({
          _id: req.params.user_id
        }, function(err, user) {
          if (err) return res.send(err);
          res.json({message: 'Successfully deleted entry.'});
        })
    });

router.route("/api/content/:path")
    .get(function(req, res) {
        res.sendFile(path.resolve('content/' + req.params.path),
        function(err) {
            if (err) return res.send(err);
        });
    })

router.route("/api/upload/avatar")
    .patch(upload.single('avatar'), function(req, res) {
        console.log(req.file)
        UserModel.findOneAndUpdate({ 'username': req.body.username },
        { $set:
            {
                "img": req.file.filename
             }
        },
        function (err, user) {
            if (err) return res.send(err);
            user.save(function (err, a) {
                if (err) return res.send(err);
                res.json({message: 'saved img to mongo'});
            })
        })
    });

router.route('/api/upload/post')
    .post(upload.single('post'), function(req, res) {
        console.log(req.file)
        var newPost = new PostModel({ username: req.body.username, description: req.body.description, img: req.file.filename});

        newPost.save(function (err) {
            if (err) return res.send(err);
            res.json({message: 'Post created.'});
        });
    })

router.route('/api/posts/:username')
    .get(function(req, res) {
        console.log(req.params.username)
        PostModel.find({username: req.params.username}, function (err, posts) {
          if (err) return res.send(err);
          res.json(posts);
        })
    })

router.route('/api/posts')
    .delete(function(req, res) {
        PostModel.remove({}, function(err) {
          if (err) return res.send(err);
          res.json({message: 'Successfully deleted all entries.'});
        })
    });

module.exports = router;
