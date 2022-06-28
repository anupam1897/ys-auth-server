require('dotenv').config();
const { getUserByUserMobile, getUserData, create, userWithMobile, updateUser }= require('./auth.service');
const { hashSync , genSaltSync, compareSync} = require('bcryptjs');
const { sign} = require('jsonwebtoken');
const express = require('express');

//redis service
const { createClient } = require('redis');


const client = createClient({
    url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`

  });

client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();
const EXPIRES_IN = 600 ;
const app = express()
// const loginRouter = require('./auth/authRouter');
const jwt = require('jsonwebtoken');
const { verify } = require('jsonwebtoken');
const { application } = require('express');

app.use(express.json())

let refreshTokens = []


//Server ------------------------------//
app.listen(process.env.PORT || process.env.AUTH_SERVER_PORT, ()=> {
    console.log(`listening on port: ${process.env.AUTH_SERVER_PORT}`);
})


//Check Api
app.get('/api', (req, res) => {
    res.json({
        success: 1,
        message: 'Auth Server Working, make login request!',
    })
})

//send otp
app.post('/sendOTP', async (req, res)=>{
    const mobile = req.body.mobile.toString();
    if(await client.exists(key = mobile) == 1){
        const existingOTP = await client.get(key = mobile);
        client.setEx(
            key = mobile, 
            seconds = EXPIRES_IN, 
            value = existingOTP);
        const otpRead = await client.get(mobile);
        
        return res.status(200).json({  
                success: 1,
                message : `Your OTP for ${mobile} is ${otpRead}`
            })
    }else {
        const otp = createOTP().toString();
        
        client.setEx(
            key = mobile, 
            seconds = EXPIRES_IN, 
            value = otp);
        otpRead = await client.get(mobile);
        return res.status(200).json({  
                success: 1,
                message : `Your OTP for ${mobile} is ${otpRead}`
            })
    }
    }
)
//get otp
app.get('/:mobile', async (req, res)=>{
    const mobile = req.params.mobile.toString();
    if(await client.exists(key = mobile) == 1){
        const existingOTP = await client.get(key = mobile);
        client.setEx(
            key = mobile, 
            seconds = EXPIRES_IN, 
            value = existingOTP);
        const otpRead = await client.get(mobile);
        
        return res.status(200).json({  
                success: 1,
                message : `Your OTP for ${mobile} is ${otpRead}`
            })
    }else {
        const otp = createOTP().toString();
        
        client.setEx(
            key = mobile, 
            seconds = EXPIRES_IN, 
            value = otp);
        otpRead = await client.get(mobile);
        return res.status(200).json({  
                success: 1,
                message : `Your OTP for ${mobile} is ${otpRead}`
            })
    }
    }
)


//forgot password
app.post('/forgotPassword', verifyOTP, (req, res)=>{
    const body = req.body;
    body.password = hashSync(body.password, genSaltSync(10));
    updateUser(body, (err, results)=>{
        if (err){ 
            console.log(err);
            return res.status(500).json({ 
                success: 0,
                message: "Database Connection Error"
            });
        }
        if(results.affectedRows == 0){
            return res.status(500).json({ 
                success: 0,
                message: "No user found with mobile number"
            });
        } else{
            
            return res.status(200).json({
                success: 1,
                message: "User password updated"
                
            })   
        }
    })

});

//User login
app.post('/login',  (req, res)=>{
    const body = req.body;
    userWithMobile(body.mobile, (error, results)=>{
        if(error){
            console.log(error);
        }
        if(!results){ 
            return res.json({ 
                success: 0,
                data: "Invalid Phone number",                
            });
        }       
        const result = compareSync(body.password, results.password);
        
            if(result){
                results.password = undefined;
                const accessToken = sign(
                    {result: results}, 
                    process.env.ACCESS_SECRET,
                    { expiresIn : "10h"} 
                );
                const refreshToken = sign(
                    {result: results}, 
                    process.env.REFRESH_SECRET,
                    { expiresIn : "24h"} 
                );
                refreshTokens.push(refreshToken);

                getUserData(body.mobile, (error, results)=>{
                    if(error){
                        console.log(error);
                    }
                    if(!results){
                        return res.json({
                            success: 0,
                            data: "Couldn't find user data"
                        });
                    }
                    return res.json({
                        success: 1,
                        userId : results.user_id,
                        mobile: results.mobile,
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    })
                })
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

//register new user
app.post('/register',verifyOTP, (req, res)=>{
    const body = req.body;
    body.password = hashSync(body.password, genSaltSync(10));
    create(body,(error, results)=>{
        if (error){ 
            console.log(error);
                return res.status(500).json({ 
                    success: 0,
                    message: "Database Connection Error"
                });
            }
            else{

                getUserData(body.mobile, (error, results)=>{
                    if(error){
                        console.log(error);
                    }
                    if(!results){
                        return res.json({
                            success: 0,
                            data: "Couldn't find user data"
                        });
                    }
                    const accessToken = sign(
                    {result: results}, 
                    process.env.ACCESS_SECRET,
                    { expiresIn : "10h"} 
                );
                const refreshToken = sign(
                    {result: results}, 
                    process.env.REFRESH_SECRET,
                    { expiresIn : "24h"} 
                );

                    return res.json({
                        success: 1,
                        userId : results.user_id,
                        mobile: results.mobile,
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    })
                })
            }
    });
});

//Generate New Access Token
app.post('/token', (req, res)=>{
    const refreshToken = req.body.token
    
    if(refreshToken==null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.status(403).json({
        success: 0,
        message: 'Refresh token not received'
    })
    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user)=> {
        if(err) return res.status(403).json({
            success: 0,
            message: 'Refresh token not valid',
        })
        const accessToken = generateAccessToken({name : user.name})
        res.json({            
            success: 1,
            accessToken:accessToken
        })
    })
});


//----------------Functions-------------------//


//Authenticate Token: Header BearerToken
function authenticateToken(req, res,  next) {
    const authHeader = req.headers['authorization']
    const token =  authHeader && authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_SECRET, (err, user) =>{

        if(err) return res.sendStatus(403)
        next()
    })
};

//Supporting Function: Authenticate Token
function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_SECRET, {expiresIn: '36000s'}) 
}

//Creates 6 digit otp string
async function verifyOTP(req, res, next){
    // req.body.otp == null ? 
    // res.json({
    //     success: 0,
    //     message : "Invalid Phone Number"
    // }) : otp = req.body.otp.toString()
    // ;
    // req.body.mobile == null ? 
    // res.json({
    //     success: 0,
    //     message : "Invalid Phone Number"
    // }) : mobile = req.body.mobile.toString()
    // ;

    const mobile = req.body.mobile.toString();
    const otp = req.body.otp.toString();
    
    if(await client.exists(key = mobile  ) == 1){
        if (await client.get(key = mobile) == otp) {
            next();
        } else {
            res.json({
                success: 0,
                message : "Invalid OTP"
            }) 
        }
    }else{
        res.json({
            success: 0,
            message : "Invalid Phone Number"
        })
    }
}


function createOTP(){
    return otp = Math.floor(Math.random()*1e6+ 100000).toString().slice(0, 6);
}