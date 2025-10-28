// Simple bcrypt stub implementation
module.exports = {
  hash: (data, salt) => Promise.resolve(`hashed_${data}`),
  compare: (data, hash) => Promise.resolve(hash === `hashed_${data}`),
  genSalt: (rounds) => Promise.resolve("salt"),
}
