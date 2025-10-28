// libpq stub
module.exports = {
  connect: () => ({ success: true }),
  query: () => ({ rows: [] }),
  end: () => {},
}
