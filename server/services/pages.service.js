const rp = require('request-promise');

const fetchLanding = (landingId) => {
  return rp({
    uri: `https://api.studykik.com/api/v1/landingPages/${landingId}/fetchLanding`,
    json: true,
  });
};

module.exports = {
  fetchLanding,
};
