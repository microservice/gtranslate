#!/usr/bin/env node

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { Translate } = require('@google-cloud/translate').v2
const fs = require('fs')

app.use(bodyParser.json())

const { GOOGLE_APPLICATION_CREDENTIALS, PORT = 8080, PROJECT_ID } = process.env

// @TODO: Clean this up? What's the best way to deal w/ `GOOGLE_APPLICATION_CREDENTIALS` & OMS/Containers?
const encodedCredentials = Buffer.from(GOOGLE_APPLICATION_CREDENTIALS, 'base64')
const decodedCredentials = encodedCredentials.toString('ascii')
fs.writeFileSync('/tmp/credentials.json', decodedCredentials)
process.env.GOOGLE_APPLICATION_CREDENTIALS = '/tmp/credentials.json'

// Instantiates a client
const translate = new Translate({ projectId: PROJECT_ID })

app.post('/translate', async (req, res) => {
  const { text = 'hello', target = 'es' } = req.body

  translate
    .translate(text, target)
    .then(data => {
      const translation = data[0]
      res.json({ translation })
    })
    .catch(er => {
      res.status(500).json({ message: er.message })
    })
})

app.post('/detect', async (req, res) => {
  const { text = 'hello' } = req.body

  translate
    .detect(text)
    .then(data => {
      const { language } = data[0]
      res.json({ language })
    })
    .catch(er => {
      res.status(500).json({ message: er.message })
    })
})

app.get('/health', (req, res) => res.send('OK'))

app.listen(PORT, () =>
  console.log(`Listening on localhost: http://localhost:${PORT}`)
)
