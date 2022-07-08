const pool = require('./database');

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


    getUser: (data, callback) => {
        pool.query(`select first_name, last_name, email from user WHERE user_id = ?`, 
            [
                data.user_id
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

    updateUser: (data, callback)=>{
        pool.query(`update user set password = ? WHERE mobile = ?`, 
        [
            data.password,
            data.mobile
        ],
        (err, results, fields) => {
            if(err) {
                return callback(err);
            }
            return callback(null, results);
        });
        
    },


    updateUserMobile: (data, callback)=>{
        pool.query(`update user set mobile = ? WHERE user_id = ?`, 
        [
            data.mobile,
            data.user_id
        ],
        (err, results, fields) => {
            if(err) {
                return callback(err);
            }
            return callback(null, results);
        });
        
    },



    updateUserDetails: (data, callback)=>{
        pool.query(`update user set first_name = ?, last_name= ?, email = ?  WHERE user_id = ?`, 
        [
            data.first_name,
            data.last_name,
            data.email, 
            data.user_id
        ],
        (err, results, fields) => {
            if(err) {
                return callback(err);
            }
            return callback(null, results);
        });
        
    }

}


