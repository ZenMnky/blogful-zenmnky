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
            res.json({
                  id: article.id,
                  style: article.style,
                  title: xss(article.title), // sanitize title
                  content: xss(article.content), // sanitize content
                  date_published: article.date_published
                })
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
                .location(`/articles/${article.id}`)
                .json(article)
        })
        .catch(next)
    })

articlesRouter
    .route('/:article_id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        ArticlesService.getById(knexInstance, req.params.article_id)
        .then(article => {
            if(!article){
                return res
                    .status(404)
                    .json({ message: `Article does not exist `})
            }
            res.json(article)
        })
        .catch(next)
    })


module.exports = articlesRouter