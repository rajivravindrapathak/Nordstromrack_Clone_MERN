const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { connection } = require("./config/db")
const { UserModel } = require("./models/UserModel")
require("dotenv").config()

const app = express()
app.use(express.json())
app.get('/', (req, res) => {
    res.send("nordstromrack home page")
})

// build signup api
app.post('/signup', async (req, res) => {
    const {fname, lname, email, password} = req.body
    const isUser = await UserModel.findOne({email})
    if(isUser) {
        res.send("user already exit please login again") 
    }
    bcrypt.hash(password, 4, async function(err, hash) {
        if(err) {
            console.log("something went wrong, please try again")
        }
        else {
             const new_user = new UserModel({
                fname,
                lname,
                email,
                password: hash
             })
             try {
                await new_user.save()
                res.send('signup successful')
             } catch (err) {
                res.send('something went wrong')
             }
        }
    })
})

// build login api
app.post('/login', async (req, res) => {
    const {email, password} = req.body
    const user = await UserModel.findOne({email})
    const hashed_password = user.password
    const user_id = user._id
    console.log(user)
    console.log(user_id)
    bcrypt.compare(password, hashed_password, function(err, result) {
        if(err) {
            res.send("something went wrong, please try again later")
        }
        if(result) {
            const token = jwt.sign({user_id}, process.env.SECRET_KEY)
            res.send({message : "login successful", token})
        } else {
            res.send("login failed")
        }
    });
})

// listining on port and connected db
const PORT = 8001
app.listen(PORT, async (req, res) => {
    try {
        await connection
        console.log("connected to db")
    } catch (err) {
        console.log("error connected to db")
    }
    console.log(`listining on port ${PORT}`)
})