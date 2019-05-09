let HouseController = require('./HouseController.js');
var arguments = process.argv.splice(2);
(async () => {
  let house = new HouseController();
  if (arguments[0] === 'getList') {
    await house.getList();
  } else if (arguments[0] === 'getPhone') {
    await house.getPhone();
  } else if (arguments[0] === 'exportExcel') {
    await house.exportExcel();
  }
  console.log('END');
})();
