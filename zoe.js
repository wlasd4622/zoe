let HouseController = require('./HouseController.js');
(async () => {
  let house = new HouseController();
  // await house.getList();
  // await house.getPhone();
  house.exportExcel();
  console.log('END');
})();
