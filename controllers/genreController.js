var Genre = require('../models/genre');
var Book = require('../models/book');

var async = require('async');

// Display list of all Genre
exports.genre_list = function(req, res, next) {
    Genre.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_genres) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('genre_list', { title: 'Genres List', genre_list: list_genres });
    });
};

// Display detail page for a specific Genre
exports.genre_detail = function(req, res, next) {
    async.parallel({
      genre: function(callback) {
        Genre.findById(req.params.id).exec(callback);
      },

      genre_books: function(callback) {
        Book.find({ 'genre': req.params.id }).exec(callback);
      },

    }, function(err, results) {
      if(err) return next(err);
      //Successful, so render
      res.render('genre_detail', {title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books });
    });
};

// Display Genre create form on GET
exports.genre_create_get = function(req, res, next) {
    res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST
exports.genre_create_post = function(req, res, next) {
    //Check if name field is empty
    req.checkBody('name', 'Genre name required').notEmpty();

    //Trim and escape the name field
    req.sanitize('name').escape();
    req.sanitize('name').trim();

    //Run the validators
    var errors = req.validationErrors();

    //Create a genre object with escaped and trimmed data
    var genre = new Genre({name: req.body.name });

    if(errors) {
      //If there are errors render the form again, passing the previously entered values and errors
        res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors});
        return;
    } else {
      //Data from form is valid
      //Check if genre with the same name already exists
      Genre.findOne({'name': req.body.name})
      .exec(function(err, found_genre) {
        console.log('found_genre: ' + found_genre);
        if (err) return next(err);
        if (found_genre) {
          //genre already exists, redirect to its detail page
          res.redirect(found_genre.url);
        } else {
          genre.save(function (err) {
            if(err) return next(err);
            //Genre saved, redirect to genre detail page
            res.redirect(genre.url);
          });
        }
      });
    }
};

// Display Genre delete form on GET
exports.genre_delete_get = function(req, res, next) {
    async.parallel({
    genre: function(callback) {
      Genre.findById(req.params.id).exec(callback);
    },
    genre_books: function(callback) {
      Book.find({ 'genre': req.params.id }).exec(callback);
    },
  }, function (err, results){
    if(err) return next(err);
    res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
  });
};

// Handle Genre delete on POST
exports.genre_delete_post = function(req, res, next) {
    req.checkBody('genreid', 'Genre Id must exist').notEmpty();

  async.parallel({
    genre: function(callback) {
      Genre.findById(req.body.authorid).exec(callback);
    },
    genre_books: function(callback) {
      Book.find({ 'genre': req.params.id }, 'title summary').exec(callback);
    },
  }, function(err, results) {
    if(err) return next(err);
    if(results.genre_books.length > 0) {
      //Author has books. Render in same way as for GET route.
      res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
      return;
    } else {
      //Author has no books. Delete object and redirect to the list.
      Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err){
        if(err) return next(err);
        //Success, redirect to list
        res.redirect('/catalog/genres');
      });
    }
  });
};

// Display Genre update form on GET
exports.genre_update_get = function(req, res, next) {
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  Genre.findById(req.params.id).exec(function (err, genre){
      if (err) return next(err);
      res.render('genre_form', { title: 'Update Genre', genre: genre });
    });
};

// Handle Genre update on POST
exports.genre_update_post = function(req, res, next) {
    //Sanitize id passed in. 
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    
    //Check other data
    req.checkBody('name', 'Name must not be empty.').notEmpty();

    req.sanitize('name').escape();
    req.sanitize('name').trim();

    var genre = new Genre({
        name: req.body.name,
        _id: req.params.id
    });

    var errors = req.validationErrors();

    if(errors) {
        Genre.findById(req.params.id).exec(function (err, genre){
            if(err) return next(err);
            res.render('genre_form', { title: 'Update Genre', genre: genre, errors: errors });
        });
    } else {
        //Data from form is valid. Update the record
        Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, thegenre) {
            if(err) return next(err);
            res.redirect(thegenre.url);
        });
    }
};