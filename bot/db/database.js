const mysql = require('mysql');
const DB_CONFIG = require('../config/database');

class Database {

  constructor() {
    this.connection = mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database,
    });

    this.connection.connect(function (err, data) {
      if (err) {
        throw new Error('Error connecting: ' + err.stack);
      }

      console.log(`Connected to Database. Server status ${data.serverStatus}`);
    });
  }

  ///////////
  // USERS //
  ///////////

  getUser(chatId) {
    return new Promise((resolve, reject) => {
      this.connection.query(`SELECT * FROM users WHERE chat_id = ${chatId}`, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    })
  }

  getAllUsers() {
    return new Promise((resolve, reject) => {
      this.connection.query('SELECT * FROM users', (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    })
  }

  saveUser(chatId, username, refCode) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO users (chat_id, username, ref_code) VALUES ("${chatId}", "${username}", "${refCode}") ON DUPLICATE KEY UPDATE chat_id=chat_id;`;
      this.connection.query(sql, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  changeUserQuota(userId, shouldIncrease) {
    return new Promise((resolve, reject) => {
      const change = shouldIncrease ? 1 : -1;
      const sql = `UPDATE users SET quota = quota + ${change} WHERE chat_id = ${userId}`;
      this.connection.query(sql, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  getUserQuota(userId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT quota FROM users WHERE chat_id = "${userId}"`;
      this.connection.query(sql, (error, results) => {
        if (error) return reject(error);
        if (results.length === 0) return reject(new Error('User does not exist'));
        resolve(results[0].quota);
      });
    });
  }

  //////////////////
  // REDIRECTIONS //
  //////////////////
  
  getRedirections(userId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM redirections WHERE owner = "${userId}"`;
      this.connection.query(sql, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  saveRedirection(owner, source, destination, srcTitle, destTitle) {
    return new Promise((resolve, reject) => {
      let sql = 'INSERT INTO redirections (owner, source, destination, source_title, destination_title) ';
      sql += `VALUES("${owner}", "${source}", "${destination}", "${srcTitle}", "${destTitle}"); `;
      this.connection.query(sql, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  removeRedirection(redirectionId) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM redirections WHERE id = "${redirectionId}";`;
      this.connection.query(sql, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  activateRedirection(redirectionId) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE redirections SET active = 1 WHERE id = "${redirectionId}";`;
      this.connection.query(sql, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  deactivateRedirection(redirectionId) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE redirections SET active = 0 WHERE id = "${redirectionId}";`;
      this.connection.query(sql, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  /////////////
  // FILTERS //
  /////////////

  /**
   * @param {Number} redirectionId 
   * @param {String} filterName One of specific filter names
   * @param {Boolean} data filter state or filter keywords
   */
  saveFilter(redirectionId, filterName, data) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO filters (id, ${filterName}) VALUES (${redirectionId}, "${data}") ON DUPLICATE KEY UPDATE ${filterName} = "${data}";`
      this.connection.query(sql, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  getFilter(redirectionId) {
    return new Promise((resolve, reject) => {
      this.connection.query(`SELECT * FROM filters WHERE id = "${redirectionId}"`, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }
}

const db = new Database();

module.exports = db;

if (require.main === module) {
  db.getFilter('362')
    .then(x => console.log(x))
}
