const BaseUrl = 'http://192.168.1.7:5000';

const jwt_secret = 'Equality@123';

const trustedOrigins = ['http://192.168.1.50:3000', "http://192.168.1.55:3000", "http://192.168.1.199:3000","http://192.168.1.9:3000","http://192.168.1.7:3000", "http://192.168.5.143:3000", "http://192.168.1.6:3000", "http://192.168.1.5:3000"];

module.exports = {
  BaseUrl,
  jwt_secret,
  trustedOrigins
}
