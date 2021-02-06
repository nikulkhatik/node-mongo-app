const express = require('express')
const { ensureAuth } = require('../middleware/auth')
const App = require('../models/App')
const router = express.Router()

// @desc    show add page
// @route   GET /apps/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('apps/add')
})

// @desc    process add form
// @route   POST /apps
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await App.create(req.body)
        res.redirect('dashboard')
    } catch (err) {
        console.log(err)
        res.render('error/500')
    }
})

// @desc    show all apps
// @route   GET /apps
router.get('/', ensureAuth, async (req, res) => {
    try {
        const apps = await App.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()

        res.render('apps/index', {
            apps
        })
    } catch (err) {
        console.log(err)
        res.render('error/500')
    }
})

// @desc    show single app
// @route   GET /apps/:id
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let app = await App.findById(req.params.id)
        .populate('user')
            .lean()

        if (!app) {
            return res.render('error/404')
        }

        res.render('apps/show',{
            app
        })
    } catch (err) {
        console.log(err)
        res.render('error/500')
    }
})

// @desc    show edit app
// @route   GET /apps/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const apps = await App.findOne({
            _id: req.params.id
        })
            .lean()

        if (!apps) {
            return res.render('error/404')
        }

        if (apps.user != req.user.id) {
            res.redirect('apps')
        } else {
            res.render('apps/edit', {
                apps
            })
        }
    } catch (err) {
        console.log(err)
        res.render('error/500')
    }
})

// @desc    update app
// @route   GET /apps/edit/:id
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let apps = await App.findById({
            _id: req.params.id
        })
            .lean()

        if (!apps) {
            return res.render('error/404')
        }

        if (apps.user != req.user.id) {
            res.redirect('apps')
        } else {
            apps = await App.findByIdAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true
            })
            res.redirect('/dashboard')
        }
    } catch (err) {
        console.log(err)
        res.render('error/500')
    }
})

// @desc    delete apps
// @route   GET /apps/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await App.remove({_id: req.params.id})
        res.redirect('/dashboard')
    } catch (err) {
        console.log(err)
        res.render('error/500')
    }
})

// @desc    user apps
// @route   GET /apps/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const apps = await App.find({
            user: req.params.userId,
            status: 'public'
        })
        .populate('user')
        .lean()

        res.render('apps/index',{
            apps
        })
    } catch (err) {
        console.log(err)
        res.render('error/500')
    }
})

module.exports = router