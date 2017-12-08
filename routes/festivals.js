const express = require('express');
const Festival = require('../models/festival');
const Attend = require('../models/attend');
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
  const attends = await Attend.find({festival: festival.id}).populate('author');
  festival.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

  await festival.save();
  res.render('festivals/show', {festival: festival, attends: attends});
}));

router.post('/:id', catchErrors(async (req, res, next) => {
  const festival = await Festival.findById(req.params.id);

  if (!festival) {
    req.flash('danger', 'Not exist festival');
    return res.redirect('back');
  }
  festival.title = req.body.title;
  festival.location = req.body.location;
  festival.starts = req.body.starts;
  festival.startTime = req.body.startTime;
  festival.ends = req.body.ends;
  festival.endTime = req.body.endTime;
  festival.desc = req.body.desc;
  festival.festType = req.body.festType;
  festival.festTopic = req.body.festTopic;
  festival.orgname = req.body.orgname;
  festival.orgdesc = req.body.orgdesc;
  festival.price = req.body.price;
  festival.numLikes = req.body.numLikes;
  festival.numReads = req.body.numReads;
  festival.createdAt = req.body.createdAt;

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
    author: user._id,
    title: req.body.title,
    location: req.body.location,
    starts: req.body.starts,
    startTime: req.body.startTime,
    ends: req.body.ends,
    endTime: req.body.endTime,
    desc: req.body.desc,
    festType: req.body.festType,
    festTopic: req.body.festTopic,
    orgname: req.body.orgname,
    orgdesc: req.body.orgdesc,
    price: req.body.price,
    numLikes: req.body.numLikes,
    numReads: req.body.numReads,
    createdAt: req.body.createdAt
  });
  await festival.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/festivals');
}));

router.post('/:id/attends', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const festival = await Festival.findById(req.params.id);

  if (!festival) {
    req.flash('danger', 'Not exist festival');
    return res.redirect('back');
  }

  var attend = new Attend({
    author: user._id,
    festival: festival._id,
    content: req.body.content
  });
  await attend.save();
  festival.numAttends++;
  await festival.save();

  req.flash('success', 'Successfully attended');
  res.redirect(`/festivals/${req.params.id}`);
}));



module.exports = router;
