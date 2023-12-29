const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'

const endpointsFiles = ['./app.js']

const doc = {
    info: {
        title: 'web API RESTful',
        description: 'API Badminton Reservation',
    },
    host: 'localhost:3030',
    schemes: ['http'],
};

swaggerAutogen(outputFile, endpointsFiles, doc)
