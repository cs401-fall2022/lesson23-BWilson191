var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose()
const path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      //Query if the table exists if not lets create it on the fly!
      db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='posts'`,
        (err, rows) => {
          if (rows.length === 1) {
            console.log("Table exists!");
            db.all(` select blog_id, blog_username , blog_txt from posts`, (err, rows) => {
              //console.log("returning " + rows.length + " records");
              res.render('index', { title: 'Baleys blog', data: rows });
            });
          } else {
            console.log("Table does not exist, inserting data");
            db.exec(`create table posts (
                     blog_id INTEGER PRIMARY KEY AUTOINCREMENT,
                     blog_username text NOT NULL UNIQUE,
                     blog_txt text NOT NULL);
                      insert into posts (blog_username, blog_txt)
                      values ('test' , 'this is a blog post');`,
              () => {
                db.all(` select blog_username, blog_txt from posts`, (err, rows) => {
                  res.render('index', { title: 'Express', data: rows });
                });
              });
          }
        });
    });
});

router.get('/photoblog', (req, res, next) => {
  console.log("Navigating to photoposts");
  var db = new sqlite3.Database('photos.sqlite3', 
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      console.log("Getting error " + err);
      exit(1);
    }

    

  )
})


router.get('/editpost', (req, res, next) => {
  console.log("edit working");

    var db = new sqlite3.Database('mydb.sqlite3',
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err){
          console.log("Getting error " + err);
          exit(1);
        }
        
          console.log("editing post ID: " + req.query.blog_id);
          db.all(` select blog_id, blog_txt from posts where blog_id = ${req.query.blog_id}`, (err, rows) => {
            res.render('editpost', { title: 'Edit Post', data: rows },);  
          });
      }
    )
});

router.post('/edit', (req, res, next) => {
  console.log("editing post contents");
  var db = new sqlite3.Database('mydb.sqlite3',
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.log("Getting error " + err);
      exit(1);
    }
    console.log("Updating post: " + req.body.blog_id  + " New Content: " + req.body.content);
    db.exec(`update posts set blog_txt = '${req.body.content}' where blog_id=${req.body.blog_id}`)
    //redirect to homepage
    res.redirect('/');
  }
);
})


router.post('/add', (req, res, next) => {
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      console.log("Inserting Post - Username: " + req.body.username  + " Post: " + req.body.content);
      //NOTE: This is dangerous! you need to sanitize input from the user
      //this is ripe for a exploit! DO NOT use this in production :)
      //Try and figure out how why this is unsafe and how to fix it.
      //HINT: the answer is in the XKCD comic on the home page little bobby tables :)
      db.exec(`insert into posts ( blog_username, blog_txt)
                values ('${req.body.username}', '${req.body.content}');`)
      //redirect to homepage
      res.redirect('/');
    }
  );
})

router.post('/addPhoto', (req, res, next) => {
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      console.log("Uploading image from: " + req.body.username + " Description: " + req.body.imagedescription + " Photo: " + req.body.image )

      db.exec(`insert into photoposts (photo_username, photo_description, photo_image)
               values ('${req.body.username}', '${req.body.imagedescription}, ${req.body.image}');`)
    }
  )
})

router.post('/delete', (req, res, next) => {
  console.log("Delete working");
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err){
        console.log("Getting error " + err);
        exit(1);
      }
      db.exec(`delete from posts where blog_id='${req.body.blog_id}';`);
      res.redirect('/');
    }
  )

})

module.exports = router;
