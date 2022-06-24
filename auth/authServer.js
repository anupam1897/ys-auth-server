const pool = require('../database');

module.exports = {
    //login via mobile
    userWithMobile: (mobile, callback)=>{
        pool.query(`select password from user where mobile = ?`,
        [mobile],
        (err, results, fields)=>{
            if(err){
                return callback(err);
            }
            return callback(null, results[0]);
        })
    },
    
    getUserByUserMobile: (mobile, callback) => {
        pool.query(`select * from user where mobile = ?`, 
        [
            mobile
        ], 
        (err, results, fields) =>{
            if(err) {
                return callback(err);
            }
            return callback(null, results[0]);
        })
    },

    
    getUserData: (mobile, callback) => {
        pool.query(`select user_id, mobile, password from user WHERE mobile = ?`, 
            [
                mobile
            ], 
            (err, results, fields) =>{
                if(err) {
                    return callback(err);
                }
                return callback(null, results[0]);
            })
    },


    create: (data, callback) => {
        pool.query(`insert into user (mobile, password ) values (?,?)`,
        [
            data.mobile,
            data.password 
        ], 
        (err, results, fields) => {
            if(err) {
                return callback(err);
            }
            return callback(null, results);
        });
    },

}


