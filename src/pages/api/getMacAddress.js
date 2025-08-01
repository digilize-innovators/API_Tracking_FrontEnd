const os = require('os');

function getMacAddresses() {
  const networkInterfaces = os.networkInterfaces();
  const macAddresses = [];

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];

    for (const netInterface of interfaces) {
      if (netInterface.mac && netInterface.mac !== '00:00:00:00:00:00') {
        macAddresses.push({
          interface: interfaceName,
          mac: netInterface.mac,
        });
      }
    }
  }

  return macAddresses;
}

export default async function getMacAddress(req, res) {
    try {
      const result =await Promise.resolve(getMacAddresses())
      res.status(200).json({ message: "Got mac address sucessfully", data: result })
    } catch (err) {
      console.log('error while fetch mac address',err)
      res.status(500).json({ error: 'Fail to get address' })
    }
  }
