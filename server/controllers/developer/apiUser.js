const db = require('../../../db/db-config.js');
const encrypt = require('../../helpers/encryption.js');
const Promise = require('bluebird');

exports.addUser = (req, res) => {
  exports.findByEmail(req.body.email, (err, userRef, userData) => {
    if (userRef) {
      res.send({error: `An account with email: ${req.body.email} already exists`});
    } else {
      encrypt.createHash(req.body.password)
      .then((hashed) => {
        db.collection('apiUsers').add({
          email: req.body.email,
          password: hashed,
          appName: req.body.appName
        })
        .then(ref => {
          exports.generateNewClientSecret(ref.id)
          .then((secret) => {
            res.send({id: ref.id, secret: secret});
          });
        })
        .catch(err => console.log(err));
      });
    }
  });
};

exports.findByEmail = (email, callback) => {
  db.collection('apiUsers').where('email', '==', email).get()
  .then(users => {
    if (users.docs.length) {
      for (let i = 0; i < users.docs.length; i++) {
        const userRef = users.docs[i];
        const userData = userRef.data();
        return callback(null, userRef, userData);
      }
    }
    return callback(`no account found for ${email}`)
  })
  .catch(err => callback(err));
};

exports.findByClientId = (clientId, callback) => {
  db.collection('apiUsers').doc(clientId).get()
  .then(clientRef => {
    const clientData = clientRef.data();
    callback(null, clientRef, clientData);
  })
  .catch(err => {
    callback('No clients found for ID: ' + clientId);
  });
};

exports.generateNewClientSecret = (req, res) => {
  const secret = encrypt.generateSecret(24);
    encrypt.createHash(secret)
    .then(hashed => {
      db.collection('apiUsers').doc(req.user.id).update({
        clientSecret: hashed
      })
      .then(() => {
       res.send(secret);
      })
      .catch(err => res.status(400).send(err));
    });
};

exports.getNewClientSecret = (req, res) => {
  exports.generateNewClientSecret(req.user.id)
  .then(secret => res.json({clientSecret: secret}))
};

exports.getClientData = (req, res) => {
  const {appName, email } = req.user.data();
  const clientId = req.user.id;
  res.json({appName, clientId, email});
};