const BaseUrl = 'http://192.168.1.195:5001';

const jwt_secret = 'Equality@123';

const trustedOrigins = ['http://192.168.1.50:3000', "http://192.168.1.55:3000", "http://192.168.1.195:3000","http://192.168.1.9:3000", "http://192.168.5.143:3000", "http://192.168.5.144:3000", "http://192.168.5.145:3000"];

module.exports = {
  BaseUrl,
  jwt_secret,
  trustedOrigins
}
