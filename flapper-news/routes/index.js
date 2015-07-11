var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model("Comment");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET JSON of all posts */
router.get('/posts', function (req, res, next) {
    Post.find(function (err, posts) {
        if (err) { return next(err); }
        
        res.json(posts);
    });
});

/* POST new post object */
router.post('/posts', function (req, res, next) {
    var post = new Post(req.body);
    
    post.save(function (err, post) {
        if (err) { return next(err); }
        
        res.json(post);
    });
});

/* Get object id from parameters */
/* Anytime a route uses :post, this parameter function will be called prior to that route's callback */
router.param('post', function (req, res, next, id) {
    var query = Post.findById(id);
    
    query.exec(function (err, post) {
        if (err) { return next(err); }
        if (!post) { return next(new Error('can\'t find post')); }
        req.post = post;
        return next();
    });
});

/* Get COMMENT from parameters */
router.param('comment', function (req, res, next, id) {
    var query = Comment.findById(id);
    
    query.exec(function (err, comment) {
        if (err) { return next(err); }
        if (!comment) { return next(new Error('can\'t find comment')); }
        req.comment = comment;
        return next();
    });
});

/* GET a single post */
/* Prior to this function, the router.param will be called to put 'post' into the req object */
router.get('/posts/:post', function (req, res) {
    req.post.populate('comments', function (err, post) {
        if (err) { return next(err); }
        
        res.json(req.post);
    });
});

/* PUT increment an upvote on posts */
router.put('/posts/:post/upvote', function (req, res, next) {
    req.post.upvote(function (err, post) {
        if (err) { return next(err); }
        
        res.json(post);
    });
});

/* PUT increment an upvote on comments */
router.put('/posts/:post/comments/:comment/upvote', function (req, res, next) {
    req.comment.upvote(function (err, comment) {
        if (err) { return next(err); }
        
        res.json(comment);
    });
});

/* GET comments for a single post */
router.post('/posts/:post/comments', function (req, res, next) {
    var comment = new Comment(req.body);
    comment.post = req.post;
    
    comment.save(function (err, comment) {
        if (err) { return next(err); }
        
        req.post.comments.push(comment);
        req.post.save(function (err, post) {
            if (err) { return next(err); }
            
            res.json(comment);
        });
    });
});

module.exports = router;