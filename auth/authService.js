const pool = require('../database');

module.exports = {
    //login via mobile
    
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

}