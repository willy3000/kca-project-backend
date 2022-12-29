const express = require('express')
const router = express.Router()
const { 
    v1: uuidv1,
    v4: uuidv4,
  } = require('uuid')
const db = require('monk')('mongodb://localhost:27017/kca')
const studentData = db.get('students')
const supervisorData = db.get('supervisors')

let userAccounts = []

const supervisorAccounts = []




//Sign Up #mongodb
router.post('/signUp', (req, res) => {
    const userDetails = {
        id: uuidv4(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
    }

    studentData.find({}).then((doc) => {
        userAccounts = [...doc]
        const emailExists = userAccounts.some(el => el.email === userDetails.email)

        if(emailExists){
            res.json({success: false, message: 'Email Already in Use', user: null})
        }else{
            studentData.insert({...userDetails}).then(()  => {
                db.close()
            })
            res.json({success: true, message: 'Sign Up Successful', user: userDetails})
        }
    })

})


//Log In #mongodb
router.post('/logIn', (req, res) => {
    const userDetails = {
        email: req.body.email,
        password: req.body.password,
    }

    studentData.find({email: userDetails.email}).then((doc) => {
        const account = doc[0]
        if(account){
            if(userDetails.password === account.password){
                res.json({success: true, message: 'Log In Successful', user: account})
            }else{
                res.json({success: false, message: 'Invalid Password', user: null})
            }
        }else{
            res.json({success: false, message: 'Email does not exist', user: null})
        }
})

})


//Sign Up Supervisor #mongodb
router.post('/signUpSupervisor', (req, res) => {
    const userDetails = {
        id: uuidv4(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
    }

    supervisorData.find({}).then((doc) => {
        userAccounts = [...doc]
        const emailExists = userAccounts.some(el => el.email === userDetails.email)

        if(emailExists){
            res.json({success: false, message: 'Email Already in Use', user: null})
        }else{
            supervisorData.insert({...userDetails}).then(()  => {
                db.close()
            })
            res.json({success: true, message: 'Sign Up Successful', user: userDetails})
        }
    })

})

//Log In Supervisor #mongodb
router.post('/logInSupervisor', (req, res) => {
    const userDetails = {
        email: req.body.email,
        password: req.body.password,
    }

    supervisorData.find({email: userDetails.email}).then((doc) => {
        const account = doc[0]
        if(account){
            if(userDetails.password === account.password){
                res.json({success: true, message: 'Log In Successful', user: account})
            }else{
                res.json({success: false, message: 'Invalid Password', user: null})
            }
        }else{
            res.json({success: false, message: 'Email does not exist', user: null})
        }
})

})


//Get Supervosrs #mongodb
router.get('/getSupervisors', (req, res) => {

    supervisorData.find({}).then((doc) => {
        res.json({success: true, message: 'Project added successfully', supervisors: [...doc]})
    })



})






exports.supervisorAccounts = supervisorAccounts

module.exports = router
