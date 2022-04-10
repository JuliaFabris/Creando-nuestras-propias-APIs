const db = require('../../database/models');
const fetch = require('node-fetch');
const axios = require('axios');

module.exports = {

    list: (req, res) => {
        /* 1er endpoint */
        db.Genre.findAll()
        .then((genres) => { /* si encontró generos aqui pueden ir las validaciones */
            res.json({ /* dentro del res.json creamos el objeto */
                meta: {
                    status: 200,
                    total: genres.length,
                    url: '/api/genres'
                },
                data: genres
            })
        })
    },
    detail: (req, res) => {
        db. Genre.findByPk(req.params.id)
        .then((genre) => {
            res.json({ 
                meta: {
                    status: 200,
                    url: `/api/genres/${req.params.id}`
                },
                data: genre
            })
        }) 
    },
    /* fetch */
    fetch: (req, res) => { /* consumirá toda la información de los paises-datos de otra pagina no de nuestra base de dstos */
        fetch('https://restcountries.com/v3.1/all') 
        .then(response => response.json())  /* El fetch me devuleve la promesa y lo capturamos con el primer then y la transformaremos en json*/
        .then(countries => { /* Este segundo then ya consume los datos */
            res.render('countries', {countries})
        })
    },
    /* axios */
    fetch2: (req, res) => {  /* axios me permite hacer lo mismo pero quizas con menos código, si necesta el método http(get, post, etc) */
        axios.get('http://localhost:3001/api/genres')
        .then(result => { /* la informacion que pediremos estará dentro de una propiedad que se llama data */
            res.render('genresList', {
                genres: result.data.data /* el pimer data es el de axios que siempre necesitaremos el segundo es el que creamos */
            })
        })

         /* API interna */
      /*fetch2:(req, res) => {  Podemos crear apis propias para nuestro carrito de compras
            fetch('http://localhost:3001/api/genres')
                .then(response => response.json())
                .then(genres => {
                    res.render('genresList', {
                         genres : genres.data
                })
            }) 
        }*/

    }
}