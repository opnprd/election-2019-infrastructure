async function enrich(event, context) {
  console.log(event);
  console.log(context);
}

module.exports = {
  enrich,
};
