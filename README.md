
[![Build Status](https://travis-ci.org/Paikz/scenery_server.svg?branch=master)](https://travis-ci.org/Paikz/scenery_server)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Paikz/scenery_server/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Paikz/scenery_server/?branch=master)

# Scenery_Server

The server side of Scenery, a social media application where users can share their scenery with each other.

## Requirements

node  
npm  
mongodb  

## Installation

Clone the repository  
`npm install`  
`npm start`  or `npm run start-docker`

## Docker

Start up an express server with Docker & MongoDb:  
`npm run start-docker`  

Start up an express server with Docker:  
```
npm run node6
npm run node7
npm run node8
npm run node9
```  

Stop docker containers:  
`npm run stop-docker`  

Run tests for different node versions:  
```
npm run test-node6
npm run test-node7
npm run test-node8
npm run test-node9
```  

## MongoDb

This server uses mongodb. To run `npm start` you need to manually start your own instance of mongodb.  

It is recommended to use `npm run docker-start` to run both express and mongodb in docker containers for a smoother experience.

## Environment Variables

PORT  
DBWEBB_DSN
