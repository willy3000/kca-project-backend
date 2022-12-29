const express = require('express');

const app = express();

app.use(express.json())

var cors = require('cors')

app.use(cors())


//Authentication
app.use('/api/auth', require('./routes/api/auth'))



//Projects Api
app.use('/api/projects', require('./routes/api/projects'))


// //products Api
// app.use('/api/products', require('./routes/api/products'))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started  on port ${PORT}`))