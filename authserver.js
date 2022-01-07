require('dotenv').config()
const { getUserByUserMobile }= require('./auth/authService');
const { compareSync} = require('bcryptjs');
const {sign} = require('jsonwebtoken');
const express = require('express')
const app = express()
// const loginRouter = require('./auth/authRouter');
const jwt = require('jsonwebtoken')


app.use(express.json())

let refreshTokens = []

app.get('/api', authenticateToken, (req, res) => {
    res.json({
        success: 1,
        message: 'Auth Server Working, make login request!'
    })
})

// app.use('/api', loginRouter);


// app.post('/login', (req, res)=>{
//     //authentication user
    
//     const username =  req.body.username
//     const user = {name: username}
//     const accessToken = generateAccessToken(user)
//     const refreshToken = jwt.sign(user, process.env.REFRESH_SECRET)
//     refreshTokens.push(refreshToken)
//     res.json({accessToken: accessToken, refreshToken : refreshToken})

// })
app.post('/login', (req, res)=>{
    const body = req.body;
    getUserByUserMobile(body.mobile, (error, results)=>{
        if(error){
            console.log(error);
        }
        if(!results){ 
            return res.json({ 
                success: 0,
                data: "Invalid Phone number"
            });
        }
        
        const result = compareSync(body.password, results.password);
            if(result){
                results.password = undefined;
                const accessToken = sign(
                    {result: results}, 
                    process.env.ACCESS_SECRET,
                    { expiresIn : "1h"} 
                );
                const refreshToken = sign(
                    {result: results}, 
                    process.env.REFRESH_SECRET,
                    { expiresIn : "1h"} 
                );
                refreshTokens.push(refreshToken);
                return res.json({ 
                    success: 1,
                    message: "Login successful",
                    accessToken: accessToken, 
                    refreshToken: refreshToken
                });
            }
            else{
              return res.json({
                  success: 0,
                  data: "Invalid Password"
              });
        }
    });
} 
);


// module.exports = {
//     //login with mobile 
//     login: (req, res)=>{
//         const body = req.body;
//         getUserByUserMobile(body.mobile, (error, results)=>{
//             if(error){
//                 console.log(error);
//             }
//             if(!results){ 
//                 return res.json({ 
//                     success: 0,
//                     data: "Invalid Phone number"
//                 });
//             }
            
//             const result = compareSync(body.password, results.password);
//                 if(result){
//                     results.password = undefined;
//                     const accessToken = sign(
//                         {result: results}, 
//                         process.env.ACCESS_SECRET,
//                         { expiresIn : "1h"} 
//                     );
//                     const refreshToken = sign(
//                         {result: results}, 
//                         process.env.REFRESH_SECRET,
//                         { expiresIn : "1h"} 
//                     );
//                     return res.json({ 
//                         success: 1,
//                         message: "Login successful",
//                         accessToken: accessToken, 
//                         refreshToken: refreshToken
//                     });
//                 }
//                 else{
//                   return res.json({
//                       success: 0,
//                       data: "Invalid Password"
//                   });
//             }
//         });
//     }

// }


app.post('/token', (req, res)=>{
    const refreshToken = req.body.token
    
    if(refreshToken==null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.status(403).json({
        message: 'Refresh token not received'
    })
    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user)=> {
        if(err) return res.status(403).json({
            message: 'Refresh token not valid',
        })
        const accessToken = generateAccessToken({name : user.name})
        res.json({accessToken:accessToken})
    })
})


//delete the refresh token in the frontend from the preference storage!
//to logout
// app.delete('/logout', (req, res)=> {
//     refreshTokens = refreshTokens.filter(token => token !== req.body.token)
//     res.sendStatus(204)
//     console.log('Logged out');
// })



function authenticateToken(req, res,  next) {
    const authHeader = req.headers['authorization']
    const token =  authHeader && authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_SECRET, (err, user) =>{

        if(err) return res.sendStatus(403)
        next()
    })
}

function generateAccessToken(user){
   return jwt.sign(user, process.env.ACCESS_SECRET, {expiresIn: '3600s'}) 
   
}




app.listen(process.env.PORT || process.env.AUTH_SERVER_PORT, ()=> {
    console.log(`listening on port: ${process.env.AUTH_SERVER_PORT}`);
})
   
