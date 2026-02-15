const axios = require("axios");

async function getCoordinates(locationText) {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: locationText,
        format: "json",
        limit: 1,
      },
      headers: {
        "User-Agent": "wanderlust-app",
      },
    }
  );

  if (response.data.length === 0) {
    return null;
  }

  const longitude = parseFloat(response.data[0].lon);
  const latitude = parseFloat(response.data[0].lat);

  return {
    name: locationText,
    type: "Point",
    coordinates: [longitude, latitude],
  };
}

module.exports = getCoordinates;


