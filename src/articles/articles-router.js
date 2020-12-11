const path = require('path')
const express = require('express')
const xss = require('xss')
const ArticlesService = require('./articles-service')

const articlesRouter = express.Router()
const jsonParser = express.json()

articlesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        ArticlesService.getAllArticles(knexInstance)
        .then(articles => {
            res.json(articles)
        })
        .catch(next) // pass errors to error handler middleware
    })
    .post(jsonParser, (req, res, next) => {
        const { title, content, style } = req.body
        const newArticle = { title, content, style }

        for (const [key, value] of Object.entries(newArticle) ) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        
        ArticlesService.insertArticle(
            req.app.get('db'),
            newArticle
        )

        .then(article => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl,`/${article.id}`))
                .json(article)
        })
        .catch(next)
    })

articlesRouter
    .route('/:article_id')
    .all((req, res, next) => {
        ArticlesService.getById(
            req.app.get('db'),
            req.params.article_id
        )
        .then(article => {
            if(!article){
                return res.status(404).json({
                    error: { message: `Article doesn't exist` }
                })
            }
            res.article = article // save the article for the next middleware
            next() // move to next middleware
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.article.id,
            style: res.article.style,
            title: xss(res.article.title), // sanitize title
            content:xss(res.article.content), // sanitize content
            date_published: res.article.date_published
        }) 
    })
    .delete((req, res, next) => {
        ArticlesService.deleteArticle(
            req.app.get('db'),
            req.params.article_id
        )
        .then(() => {
            res
                .status(204)
                .end() // used to quickly end the response without any data
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {title, content, style} = req.body
        const articleToUpdate = {title, content, style}

        // check if the article to update has any values that aren't null or undefined (are truthy). If there are no truthy values then we error out.
        // what is .filter(Boolean) doing ❓
        const numberOfValues = Object.values(articleToUpdate).filter(Boolean).length
        if (numberOfValues === 0){
            return res.status(400).json({
                error: { message: `Request body must contain either 'title', 'style', or 'content'`}
            })
        }

        ArticlesService.updateArticle(
            req.app.get('db'),
            req.params.article_id,
            articleToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = articlesRouter