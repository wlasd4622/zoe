let House = require('../db/House.js')
async function aa() {
  let a = await new House().Run(`update house set phone='66666' WHERE key='5d112bbc737011fbe5314162d6bf3bc8'`)
  console.log(a);
}
aa()
