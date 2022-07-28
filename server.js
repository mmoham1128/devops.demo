const express = require('express')
const app = express()
const path = require('path')

// include and initialize the rollbar library with your access token
const Rollbar = require('rollbar')
const rollbar = new Rollbar({
  accessToken: 'c04059a2bc9e4334a6786769f71f4884',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

// record a generic message and send it to Rollbar
rollbar.log('Hello world!')

app.use(express.json())

const students = ['Jimmy', 'Timothy', 'Jimothy']

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/students', (req, res) => {
    rollbar.info("Students was requested", students)
    res.status(200).send(students)
})

app.post('/api/students', (req, res) => {
   let {name} = req.body

   const index = students.findIndex(student => {
       return student === name
   })

   try {
       if (index === -1 && name !== '') {

        rollbar.info("A new student was created", name)

           students.push(name)
           res.status(200).send(students)
       } else if (name === ""){
        rollbar.error("A student was created without a name")

           res.status(400).send('You must enter a name.')
       } else {
        rollbar.critical("A student that already exists was posted", name)
           res.status(400).send('That student already exists.')
       }
   } catch (err) {
       console.log(err)
   }
})

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    students.splice(targetIndex, 1)
    res.status(200).send(students)
})

const port = process.env.PORT || 5051

app.use(rollbar.errorHandler())

app.listen(port, () => console.log(`Server listening on ${port}`))
