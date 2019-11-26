'use strict';

const crypto = require('crypto');

const s3 = require('./lib/s3');
const logger = require('../logger/logger')('[set-lock] ');
const { checkString } = require('./lib/check-params');

module.exports = function setlock({ name, who, desc }) {
  logger.info(`setLock(${name}, ${who}, ${desc})`);

  checkString(name, 'name');
  checkString(who, 'who');
  checkString(desc, 'desc');

  const oldMetadata = s3.getMetaData(name);

  if (oldMetadata.key) {
    logger.error(`Пресет уже заблокирован:\ndate: ${oldMetadata.date}\nwho: ${oldMetadata.who}\ndesc: ${oldMetadata.desc}`);
    process.exit(1);
  }

  const key = crypto.randomBytes(4).toString('hex');
  const date = (new Date()).toISOString();

  const newMetadata = {
    key,
    date,
    who,
    desc,
  };

  s3.setMetaData(name, newMetadata);

  logger.info(`Пресет ${name} заблокирован, запомните ключ: "${key}", он будет нужен для разблокировки`);
};