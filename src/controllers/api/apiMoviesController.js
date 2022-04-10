const db = require('../../database/models');
/* Cuando queramos pasar el endpoint pasamos esta funcion getUrl y le pasamos el objeto req */
const getUrl = (req) => `${req.protocol}://${req.get('host')}${req.originalUrl}`

module.exports = {
   
    getAll: (req, res) => {
        db.Movie.findAll({
            include: [
                {association: 'genre'},
                {association: 'actors'}
            ]
        })
        .then((movies) => {
            return res.status(200).json({
                meta: {  /* propiedad meta, ahi guardaremos el endpoint */
                    endpoint: getUrl(req),
                    status: 200, /* En el caso de que venga todo bien un 200 */
                    total: movies.length
                },
                data: movies
            })
        })
        .catch((error) => {
            if(error.name === 'SequelizeConnectionRefusedError'){ /* si ese es el error, envia ese mensaje, en donde podemos poner una vista */
                res.status(500).json({ msg: "Tenemos un error, disculpe"}) /* o .send('Tenemos un error, disculpe') */
            }
        })     
    },
    getOne: (req, res) => {
        if(req.params.id % 1 !== 0 || req.params.id < 0){
            return res.status(400).json({ /* 400 esta haciendo mal la peticiom */
                meta: {
                    status: 400,
                    msg: 'Wrong ID'
                }
            })
        }else{
            db.Movie.findOne({
                where: {
                    id: req.params.id
                },
                include: [
                    {association: 'genres'},
                    {association: 'actors'}
                ]
            })
            .then((movie) => {
                if(movie){
                    return res.status(200).json({
                        meta: {
                            endpoint:getUrl(req),
                            status: 200,
                        },
                        data: movie
                    })
                }else{
                    return res.status(400).json({
                        meta: {
                            status: 400,
                            msg: 'ID not found'
                        }
                    })
                }
            }) /*  ruta en postman es por get http://localhost:3001/apis/movies/10 (ej) */
            .catch((error) => res.status(500).send(error))
        }
    },
    add: (req, res) => {
        const { title, rating, awards, release_date, length, genre_id } = req.body
        db.Movie.create({
            title,
            rating,
            awards,
            release_date,
            length,
            genre_id
        })
        .then((movie) => { 
            res.status(201).json({
                meta: {
                    endpoint: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
                    msg: 'Movie added successfully',
                },
                data: movie
            })
        })
        .catch((error) => {
            switch(error.name) {
                case 'SequelizeValidationError': 
                    let errorsMsg = []; 
                    let notNullErrors = [];
                    let validationsErrors = [];
                    error.errors.forEach((error) => {
                        errorsMsg.push(error.message); 
                        if(error.type == 'Validation error'){ 
                            validationsErrors.push(error.message);
                        }
                        if(error.type == 'notNull Violation'){ 
                            notNullErrors.push(error.message)
                        }
                    });
                    let response = {
                        status: 400,
                        message: 'missing or wrong data',
                        errors: {
                            quantity: errorsMsg.length,
                            msg: errorsMsg,
                            notNull: notNullErrors,
                            validations: validationsErrors,
                        }
                    }
                    return res.status(400).json(response);
                default:
                    return res.status(500).json(error)
            }
        })
    },
    update: (req, res) => {
        const { title, rating, awards, release_date, length, genre_id } = req.body

        db.Movie.update({
            title,
            rating,
            awards,
            release_date,
            length,
            genre_id
        },{
            where: {
                id: req.params.id
            }
        })
        .then((result) => {
            if(result){
                return res.status(201).json({
                    msg: 'Movie updated seccessfully'
                });
            }else{
                return res.status(200).json({
                    msg: 'no changes'
                })
            }
        })
        .catch((error) => res.status(500).send(error))
    },
    delete: (req, res) => {
        let actorUpdate = db.Actor.update({
            favorite_movie_id: null,
        },
        {
            where: {
                favorite_movie_id: req.params.id
            }
        });     //se usa tabla intermedia (pivot)
        let actorMovieUpdate = db.ActorMovie.destroy({ 
            where: {
                movie_id: req.params.id
            },
        });
        Promise.all([actorUpdate, actorMovieUpdate]).then(  
            db.Movie.destroy({ /* Dos promesas */
               where: {
                   id: req.params.id
               },
            })
            .then(result => {
                if(result){
                    return res.status(200).json({
                        msg: 'Movie deleted successfully'
                    })
                }else{
                    return res.status(200).json({
                        msg: 'no changes'
                    })
                }
            })
            .catch((error) => res.status(500).send(error))
        )
    }
}

