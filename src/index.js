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

app.post('/', async (req, res) => {
  const { text = 'hello', target = 'es' } = req.body

  // Translates some `text` into the `target` language
  const [translation] = await translate.translate(text, target)

  res.json({ translation })
})

app.get('/health', (req, res) => res.send('OK'))

app.listen(PORT, () =>
  console.log(`Listening on localhost: http://localhost:${PORT}`)
)
