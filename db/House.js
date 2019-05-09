var sqlite3 = require('sqlite3').verbose();
let dbName = './db/house';
var db = new sqlite3.Database(dbName);

db.serialize(() => {
  let sql = `CREATE TABLE IF NOT EXISTS house
         (id integer primary key,
          title,
          key,
          rooms,
          area,
          orientation,
          floor,
          address,
          host,
          price,
          unit_price,
          phone,
          link)`;
  db.run(sql);
});


class House {

  constructor() {

  }

  all(cb) {
    db.all(`SELECT * FROM house`, cb);
  }

  find(params, cb) {
    db.get(`SELECT * FROM house WHERE ${params[0]} = ? `, params[1], cb);
  }

  create(data, cb) {
    const sql = `INSERT INTO house (title,
                                    key,
                                    rooms,
                                    area,
                                    orientation,
                                    floor,
                                    address,
                                    host,
                                    price,
                                    unit_price,
                                    phone,
                                    link) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) `;
    db.run(sql,
      data.title,
      data.key,
      data.rooms,
      data.area,
      data.orientation,
      data.floor,
      data.address,
      data.host,
      data.price,
      data.unit_price,
      data.phone,
      data.link, cb);
  }

  delete(id, cb) {
    if (!id) return cb(new Error('请输入id'));
    db.run(`DELETE FROM house WHERE id = ?`, id, cb);
  }

  Insert(data) {
    return new Promise((resolve, reject) => {
      this.create(data, (err, data) => {
        if (!err) {
          resolve(data)
        } else {
          reject(err)
        }
      });
    })
  }
  SelectedAll() {
    return new Promise((resolve, reject) => {
      this.all((err, data) => {
        if (!err) {
          resolve(data)
        } else {
          reject(err)
        }
      });
    })
  }
  Select(params) {
    return new Promise((resolve, reject) => {
      this.find(params, (err, data) => {
        if (!err) {
          resolve(data)
        } else {
          reject(err)
        }
      });
    })
  }
  Selete() {
    return new Promise((resolve, reject) => {
      this.delete(2, (err, data) => {
        if (!err) {
          resolve(data)
        } else {
          reject(err)
        }
      });
    })
  }
  Run(sql) {
    return new Promise((resolve, reject) => {
      db.all(sql, function (err, data) {
        if (!err) {
          resolve(data)
        } else {
          reject(err)
        }
      })
    })
  }

}
module.exports = House;
