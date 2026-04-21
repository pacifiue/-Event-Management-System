const express=require("express")
const app=express()
const db=require("./connection")
const bcrypt=require('bcrypt')
const session = require("express-session")
const port=8888


app.use(express.json())
// registration
app.post('/api/auth/register',async(req,res)=>{
      const {full_name,email,phone,password,}=req.body
      try {
        if(!full_name || !email || !phone || !password){
            return res.status(400).send({Message:"All fields required "})
        }
        const [check_email]= await db.query('SELECT * FROM users WHERE email = ?',[email])
        if( check_email.length >0){
            return res.status(409).send({Message:"The email already exits"})
        }
        if(isNaN(phone)){
             return res.status(400).send({Message:"Phone number must be numbers"})
        }
        if(phone.length <10){
            return res.status(400).send({Message:"The phone number must at least 10 digits"})
        }
        if(password.length <6 || password.length>8){
            return res.status(400).send({Message:'The password must be at list 6-8 charcternode'})
        }
        const hash= await bcrypt.hash(password,10)
        const sql="INSERT INTO users (name,email,phone,password) VALUES (?,?,?,?)"
        const insert= await db.query(sql,[full_name,email,phone,hash])
        if (!insert) {
          return  res.status(500).send({Message:"Server error "})
        }
                  
        res.status(201).send({Message:"The user created successfully"})
        
      } catch (error) {
        console.error("Registration erro:", error)
        res.status(500).send({Message:"Internal server error"})
        
      }

})

// login
 
app.post('/api/auth/login', async(req,res)=>{



    try {
        const {email,password}=req.body
        if( !email || !password){
            return res.status(400).send({Message:"All fields required "})
        }
        if(password.length <6 || password.length>8){
            return res.status(400).send({Message:'The password must be at list 6-8 charcternode'})
        }
        const [user]= await db.query('SELECT * FROM users WHERE email = ?',[email])
        
        if (user.length === 0){
          return  res.status(404).send({Message:'The user email not found'})
        }
        const result=user[0]
        const pass= await bcrypt.compare(password,result.password)
        if(!pass){
          return res.status(400).send({Message:"Incorrect password"})
        }
        res.status(200).send({Message:"Loin sucessfully"})
    } catch (error) {
        console.error("Login error:",error)
        res.status(500).send({Message:"Internal server error"})
    }
})





















app.listen(port,()=>{
    console.log(`the server running http://localhost:${port}`)
})