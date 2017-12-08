const express = require('express');
const Festival = require('../models/festival');
const Answer = require('../models/answer');
const catchErrors = require('../lib/async-error');

const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

/* GET festivals listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const festivals = await Festival.paginate(query, {
    sort: {createdAt: -1},
    populate: 'author',
    page: page, limit: limit
  });
  res.render('festivals/index', {festivals: festivals, term: term});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('festivals/new', {festival: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const festival = await Festival.findById(req.params.id);
  res.render('festivals/edit', {festival: festival});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const festival = await Festival.findById(req.params.id).populate('author');
  const answers = await Answer.find({festival: festival.id}).populate('author');
  festival.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

  await festival.save();
  res.render('festivals/show', {festival: festival, answers: answers});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const festival = await Festival.findById(req.params.id);

  if (!festival) {
    req.flash('danger', 'Not exist festival');
    return res.redirect('back');
  }
  festival.title = req.body.title;
  festival.content = req.body.content;
  festival.tags = req.body.tags.split(" ").map(e => e.trim());

  await festival.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/festivals');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Festival.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/festivals');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  var festival = new Festival({
    title: req.body.title,
    author: user._id,
    content: req.body.content,
    tags: req.body.tags.split(" ").map(e => e.trim()),
  });
  await festival.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/festivals');
}));

router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const festival = await Festival.findById(req.params.id);

  if (!festival) {
    req.flash('danger', 'Not exist festival');
    return res.redirect('back');
  }

  var answer = new Answer({
    author: user._id,
    festival: festival._id,
    content: req.body.content
  });
  await answer.save();
  festival.numAnswers++;
  await festival.save();

  req.flash('success', 'Successfully answered');
  res.redirect(`/festivals/${req.params.id}`);
}));



module.exports = router;
