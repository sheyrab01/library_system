const db = require('../config/db');

exports.findByEmail = email => db.oneOrNone('SELECT * FROM students WHERE lower(email)=lower($1)', [email]);
exports.findById = id => db.oneOrNone('SELECT id,name,student_id,email,role FROM students WHERE id=$1', [id]);
exports.create = ({ name, student_id, email, password_hash, role = 'student' }) =>
  db.one(`INSERT INTO students(name,student_id,email,password_hash,role)
          VALUES($1,$2,$3,$4,$5) RETURNING id,name,student_id,email,role`, [name, student_id, email, password_hash, role]);
