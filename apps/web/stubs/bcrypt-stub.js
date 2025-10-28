// bcrypt stub
exports.hash = (data, salt) => Promise.resolve("hashed_" + data)
exports.compare = (data, hash) => Promise.resolve(hash === "hashed_" + data)
exports.genSalt = (rounds) => Promise.resolve("salt")
