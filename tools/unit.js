/* 给排水专业智能组价系统 - 单元测试
 * 运行：node tools/unit.js
 */
global.window = {};
require('../data/prices.js');
var A = require('../js/app.js');

// 历史用例按通用给排水口径（不套消防清单）验证；消防管道专项用例在各自块内显式指定
A.setFirePipeSystem('plumb');

var pass = 0, fail = 0;
function ck(name, got, want) {
  var ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; }
  else { fail++; console.log('  ✗ ' + name + '  期望=' + JSON.stringify(want) + '  实际=' + JSON.stringify(got)); }
}
function pr(n, qty) {
  var rows = A.parseRows([[1, n, qty === undefined ? 10 : qty]], '2026-10', 'guanglianda');
  return rows[0];
}
function code(n) { return pr(n).quotaCode; }

console.log('\n== 1. 名称解析 ==');
ck('DN大写', A.parseDN('铸铁管 DN100'), 100);
ck('DN小写', A.parseDN('排水铸铁管dn75'), 75);
ck('De', A.parseDN('铸铁管 De110'), 110);
ck('φ', A.parseDN('承插铸铁给水管φ150'), 150);
ck('数字+mm', A.parseDN('铸铁排水管 200mm'), 200);
ck('无管径', A.parseDN('铸铁管'), null);
ck('排水识别', A.parseMedium('机制离心排水铸铁管 DN100'), 'drain');
ck('给水识别', A.parseMedium('球墨铸铁给水管 DN200'), 'water');
ck('默认给水', A.parseMedium('铸铁管 DN100'), 'water');
ck('室外识别', A.parseLoc('室外承插铸铁给水管 DN150'), 'out');
ck('室内识别', A.parseLoc('室内排水铸铁管 DN100'), 'in');
ck('默认室内', A.parseLoc('铸铁管 DN100'), 'in');
ck('青铅', A.parseJoint('承插铸铁给水管 青铅接口'), 'lead');
ck('膨胀水泥', A.parseJoint('铸铁给水管 膨胀水泥接口'), 'expand');
ck('石棉水泥', A.parseJoint('排水铸铁管 石棉水泥接口'), 'asbestos');
ck('胶圈', A.parseJoint('铸铁给水管 胶圈接口'), 'rubber');
ck('柔性接口', A.parseJoint('柔性接口机制排水铸铁管'), 'rubber');
ck('水泥接口', A.parseJoint('排水铸铁管 水泥接口'), 'cement');

console.log('\n== 2. 清单编码 ==');
ck('铸铁管清单码', pr('室内排水铸铁管 DN100').listCode, '031001001');

console.log('\n== 3. 室外给水 青铅接口 8-90~8-99 ==');
[[75, '8-90'], [100, '8-91'], [150, '8-92'], [200, '8-93'], [250, '8-94'],
 [300, '8-95'], [350, '8-96'], [400, '8-97'], [450, '8-98'], [500, '8-99']].forEach(function (p) {
  ck('室外给水青铅DN' + p[0], code('室外承插铸铁给水管 青铅接口 DN' + p[0]), p[1]);
});

console.log('\n== 4. 室外给水 膨胀水泥 8-100~8-109 ==');
[[75, '8-100'], [150, '8-102'], [500, '8-109']].forEach(function (p) {
  ck('室外给水膨胀DN' + p[0], code('室外铸铁给水管 膨胀水泥接口 DN' + p[0]), p[1]);
});

console.log('\n== 5. 室外给水 石棉水泥 8-110~8-119 ==');
[[75, '8-110'], [200, '8-113'], [500, '8-119']].forEach(function (p) {
  ck('室外给水石棉DN' + p[0], code('室外铸铁给水管 石棉水泥接口 DN' + p[0]), p[1]);
});

console.log('\n== 6. 室外给水 胶圈 8-120~8-128（无DN75） ==');
[[100, '8-120'], [150, '8-121'], [300, '8-124'], [500, '8-128']].forEach(function (p) {
  ck('室外给水胶圈DN' + p[0], code('室外铸铁给水管 胶圈接口 DN' + p[0]), p[1]);
});
ck('胶圈DN75→DN100档8-120', code('室外铸铁给水管 胶圈接口 DN75'), '8-120');
ck('胶圈DN75标推', pr('室外铸铁给水管 胶圈接口 DN75').codeInferred, true);

console.log('\n== 7. 室外排水 石棉水泥 8-129~8-134 / 水泥 8-135~8-140 ==');
[[50, '8-129'], [75, '8-130'], [100, '8-131'], [125, '8-132'], [150, '8-133'], [200, '8-134']].forEach(function (p) {
  ck('室外排水石棉DN' + p[0], code('室外排水铸铁管 石棉水泥接口 DN' + p[0]), p[1]);
});
[[50, '8-135'], [100, '8-137'], [200, '8-140']].forEach(function (p) {
  ck('室外排水水泥DN' + p[0], code('室外排水铸铁管 水泥接口 DN' + p[0]), p[1]);
});

console.log('\n== 8. 室内给水 青铅 8-336~8-341 ==');
[[75, '8-336'], [100, '8-337'], [150, '8-338'], [200, '8-339'], [250, '8-340'], [300, '8-341']].forEach(function (p) {
  ck('室内给水青铅DN' + p[0], code('室内承插铸铁给水管 青铅接口 DN' + p[0]), p[1]);
});

console.log('\n== 9. 室内给水 膨胀水泥 8-342~8-347 / 石棉水泥 8-348~8-353 ==');
[[75, '8-342'], [300, '8-347']].forEach(function (p) {
  ck('室内给水膨胀DN' + p[0], code('室内铸铁给水管 膨胀水泥接口 DN' + p[0]), p[1]);
});
[[75, '8-348'], [100, '8-349'], [300, '8-353']].forEach(function (p) {
  ck('室内给水石棉DN' + p[0], code('室内铸铁给水管 石棉水泥接口 DN' + p[0]), p[1]);
});

console.log('\n== 10. 室内排水 石棉水泥 8-354~8-359 / 水泥 8-360~8-365 ==');
[[50, '8-354'], [75, '8-355'], [100, '8-356'], [150, '8-357'], [200, '8-358'], [250, '8-359']].forEach(function (p) {
  ck('室内排水石棉DN' + p[0], code('室内排水铸铁管 石棉水泥接口 DN' + p[0]), p[1]);
});
[[50, '8-360'], [100, '8-362'], [250, '8-365']].forEach(function (p) {
  ck('室内排水水泥DN' + p[0], code('室内排水铸铁管 水泥接口 DN' + p[0]), p[1]);
});

console.log('\n== 11. 用户关键词识别 ==');
ck('机制离心排水铸铁管', pr('机制离心排水铸铁管 DN100').category, 'castIron');
ck('机制离心排水铸铁管→排水', pr('机制离心排水铸铁管 DN100').medium, 'drain');
ck('离心浇筑灰口铁直管', pr('离心浇筑灰口铁直管 DN150').category, 'castIron');
ck('柔性接口机制排水铸铁管', pr('柔性接口机制排水铸铁管 DN150').category, 'castIron');
ck('柔性接口→排水', pr('柔性接口机制排水铸铁管 DN150').medium, 'drain');
ck('球墨铸铁给水管', pr('球墨铸铁给水管 DN200').category, 'castIron');

console.log('\n== 12. 非整档与超档 ==');
ck('DN80→100档8-91', code('室外铸铁给水管 青铅接口 DN80'), '8-91');
ck('DN80标推', pr('室外铸铁给水管 青铅接口 DN80').codeInferred, true);
ck('DN110→150档', code('室外铸铁给水管 青铅接口 DN110'), '8-92');
ck('DN600→500档8-99', code('室外铸铁给水管 青铅接口 DN600'), '8-99');
ck('DN600标推', pr('室外铸铁给水管 青铅接口 DN600').codeInferred, true);
ck('DN400室内给水超最大300档→8-341', code('室内铸铁给水管 青铅接口 DN400'), '8-341');

console.log('\n== 13. 接口回退 ==');
ck('室内给水胶圈→石棉8-348', code('室内铸铁给水管 胶圈接口 DN75'), '8-348');
ck('室内给水胶圈有回退提示', /无胶圈接口子目/.test(pr('室内铸铁给水管 胶圈接口 DN75').warn), true);
ck('排水青铅→石棉8-355', code('室内排水铸铁管 青铅接口 DN75'), '8-355');
ck('柔性接口排水→石棉', code('柔性接口机制排水铸铁管 DN100'), '8-356');
ck('室外排水膨胀水泥→石棉8-131', code('室外排水铸铁管 膨胀水泥接口 DN100'), '8-131');

console.log('\n== 14. 主材价 ==');
ck('给水DN100=72', pr('室内铸铁给水管 石棉水泥接口 DN100').price, 72);
ck('排水DN100=62', pr('室内排水铸铁管 石棉水泥接口 DN100').price, 62);
ck('给水DN80→100档72', pr('室内铸铁给水管 石棉水泥接口 DN80').price, 72);
ck('排水DN110→125档82', pr('室内排水铸铁管 石棉水泥接口 DN110').price, 82);
ck('价格来源市场价', pr('室内排水铸铁管 石棉水泥接口 DN100').priceSource, 'market');
ck('价格含依据', /铸铁排水管 DN100/.test(pr('室内排水铸铁管 石棉水泥接口 DN100').priceBasis), true);
ck('无管径→待询价', pr('铸铁管').priceSource, 'pending');
ck('无管径有提示', /未识别公称直径/.test(pr('铸铁管').warn), true);

console.log('\n== 15. 材质分类 ==');
ck('薄壁不锈钢管→stainless', pr('薄壁不锈钢管DN80').category, 'stainless');
ck('不锈钢定额8-268', pr('薄壁不锈钢管DN80').quotaCode, '8-268');
ck('不锈钢计价', pr('薄壁不锈钢管DN80').priceSource, 'market');
ck('PPR管→plastic', pr('PPR给水管 DN25').category, 'plastic');
ck('镀锌钢管→galv', pr('镀锌钢管 DN50').category, 'galv');
ck('焊接钢管→welded', pr('焊接钢管 DN50').category, 'welded');
ck('无缝钢管→seamless', pr('无缝钢管 DN50').category, 'seamless');
ck('铜管→copper', pr('铜管 DN54').category, 'copper');
ck('铝塑复合管→composite', pr('铝塑复合管 De32').category, 'composite');
ck('镀锌无缝钢管→seamless', pr('内外壁热浸镀锌无缝钢管 DN50').category, 'seamless');

console.log('\n== 16. 整表解析 ==');
var rows = A.parseRows([
  ['序号', '项目名称', '长度'],
  [1, '室内排水铸铁管 DN100 石棉水泥接口', 120],
  [2, '室外承插铸铁给水管 青铅接口 DN200', 85.5],
  [3, '薄壁不锈钢管DN80', 60],
  [4, '室内铸铁给水管 石棉水泥接口 DN50', ''],
  ['', '柔性接口机制排水铸铁管 DN150', 30]
], '2026-10', 'guanglianda');
ck('解析条数（含自动补支架）', rows.length, 6);
ck('末行为自动补管道支架', rows[5].category, 'bracket');
ck('支架估算重量 335.7kg', rows[5].quantity, 335.7);
ck('支架清单031301005', rows[5].listCode, '031301005');
ck('支架定额7-138/100kg', rows[5].quotaCode + '/' + rows[5].quotaFactor, '7-138/100');
ck('支架型钢信息价4.2', rows[5].price, 4.2);
ck('序号保留', rows[0].index, '1');
ck('空序号自动编号', rows[4].index, '5');
ck('工程量小数', rows[1].quantity, 85.5);
ck('工程量缺失按1', rows[3].quantity, 1);
ck('工程量缺失提示', /工程量缺失/.test(rows[3].warn), true);
ck('第1行定额', rows[0].quotaCode, '8-356');
ck('第2行定额', rows[1].quotaCode, '8-93');
ck('第3行薄壁不锈钢DN80', rows[2].quotaCode, '8-268');
ck('第4行DN50室内给水', rows[3].quotaCode, '8-348');
ck('第5行柔性排水DN150→8-357', rows[4].quotaCode, '8-357');
ck('主材费合计（管道）', Number(rows.filter(function (d) { return d.category !== 'bracket'; }).reduce(function (s, d) { return s + (d.price === null ? 0 : d.price * d.quantity); }, 0).toFixed(2)), 120 * 62 + 85.5 * 152 + 60 * 128 + 1 * 58 + 30 * 105);

console.log('\n== 17. 项目特征 ==');
ck('特征含安装部位', /安装部位:室内/.test(rows[0].features), true);
ck('特征含接口材料', /接口材料:石棉水泥接口/.test(rows[0].features), true);
ck('特征含连接形式', /连接形式:承插/.test(rows[0].features), true);
ck('排水特征含通球', /通球试验/.test(rows[0].features), true);
ck('给水特征含水压', /水压试验/.test(rows[1].features), true);

console.log('\n== 18. 接口选项联动 ==');
function ci(loc, medium) { return { category: 'castIron', loc: loc, medium: medium, joint: null }; }
ck('室外给水可选接口', A.jointsOf(ci('out', 'water')), ['asbestos', 'lead', 'expand', 'rubber']);
ck('室内给水可选接口', A.jointsOf(ci('in', 'water')), ['asbestos', 'lead', 'expand']);
ck('室外排水可选接口', A.jointsOf(ci('out', 'drain')), ['asbestos', 'cement']);
ck('室内排水可选接口', A.jointsOf(ci('in', 'drain')), ['asbestos', 'cement']);
ck('默认接口石棉水泥', A.defaultJoint(ci('out', 'water')), 'asbestos');

// ============================================================
// 19. 定额单位与换算
// ============================================================
(function () {
  var PK = A.getPeriods()[0].period;
  var it = A.parseRows([[1, '室内排水铸铁管 DN100', 120]], PK, 'gld')[0];
  ck('定额单位10m', it.quotaUnit, '10m');
  ck('换算系数10', it.quotaFactor, 10);
  ck('清单单位m', it.unit, 'm');
  ck('清单工程量保留', it.quantity, 120);
})();

// ============================================================
// 20. 镀锌钢管（031001002 / 第八册 8-1~8-11、8-173~8-183、8-1128~8-1131、8-1132~8-1140）
// ============================================================
(function () {
  var PK = A.getPeriods()[0].period;
  function mk(name) { return A.buildItem(name); }
  function q(name) { var it = mk(name); return { it: it, q: A.matchQuota(it) }; }

  // 清单编码与材质
  ck('镀锌钢管清单编码', mk('镀锌钢管DN50').listCode, '031001002');
  ck('镀锌钢管清单名称', mk('镀锌钢管DN50').listName, '镀锌钢管');
  ck('内外壁热浸镀锌识别', mk('内外壁热浸镀锌焊接普通钢管DN100').material, '镀锌钢');
  ck('热镀锌识别', mk('热镀锌钢管DN25').material, '镀锌钢');
  ck('镀锌钢默认普通螺纹', mk('镀锌钢管DN50').joint, 'thread');
  ck('燃气自动预选', mk('室内燃气镀锌钢管DN50').joint, 'gas_thread');
  ck('天然气自动预选', mk('室外天然气镀锌钢管DN32').joint, 'gas_thread');
  ck('镀锌材质类别', mk('镀锌钢管DN50').category, 'galv');

  // 室外给水 8-1~8-11
  var outDn = [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150];
  outDn.forEach(function (dn, i) {
    ck('室外镀锌DN' + dn, q('室外给水镀锌钢管DN' + dn).q.code, '8-' + (1 + i));
  });
  ck('室外镀锌名称', q('室外镀锌钢管DN100').q.name, '室外管道 镀锌钢管(螺纹连接) 公称直径100mm以内');

  // 室内给水 8-173~8-183
  outDn.forEach(function (dn, i) {
    ck('室内镀锌DN' + dn, q('室内给水镀锌钢管DN' + dn).q.code, '8-' + (173 + i));
  });
  ck('室内镀锌默认室内', q('镀锌钢管DN80').it.loc, 'in');

  // 室外燃气 8-1128~8-1131（DN25/32/40/50）
  [25, 32, 40, 50].forEach(function (dn, i) {
    ck('室外燃气DN' + dn, q('室外燃气镀锌钢管DN' + dn).q.code, '8-' + (1128 + i));
  });
  // 室内燃气 8-1132~8-1140（DN15~100）
  [15, 20, 25, 32, 40, 50, 65, 80, 100].forEach(function (dn, i) {
    ck('室内燃气DN' + dn, q('室内燃气镀锌钢管DN' + dn).q.code, '8-' + (1132 + i));
  });

  // 档位回退与超档
  var g1 = q('室外燃气镀锌钢管DN20');
  ck('室外燃气DN20→DN25档', g1.q.code, '8-1128');
  ck('室外燃气DN20标推算', g1.q.inferred, true);
  var g2 = q('室内燃气镀锌钢管DN125');
  ck('室内燃气DN125→DN100档', g2.q.code, '8-1140');
  ck('室内燃气超档提示', /超出范围/.test(g2.it.warn) || /超/.test(A.buildWarn(g2.it, g2.q)), true);
  var g3 = q('镀锌钢管DN200');
  ck('镀锌DN200→150档', g3.q.code, '8-183');
  ck('镀锌DN200标推算', g3.q.inferred, true);
  var g4 = q('镀锌钢管DN70');
  ck('镀锌DN70→DN80档', g4.q.code, '8-180');

  // 连接方式可选项
  var gItem = mk('镀锌钢管DN50');
  ck('镀锌连接方式选项', A.jointsOf(gItem), ['thread', 'gas_thread']);
  ck('镀锌默认连接', A.defaultJoint(gItem), 'thread');
  ck('燃气连接中文', A.JOINT_CN.gas_thread, '螺纹连接（燃气）');

  // 主材价
  var p50 = A.lookupGalvPrice(PK, mk('镀锌钢管DN50'));
  ck('镀锌DN50主材价', p50.price, 24.5);
  var p70 = A.lookupGalvPrice(PK, mk('镀锌钢管DN70'));
  ck('镀锌DN70取80档价', p70.price, 39.5);
  var p200 = A.lookupGalvPrice(PK, mk('镀锌钢管DN200'));
  ck('镀锌DN200超档价', p200.price, 126);
  ck('镀锌价格来源', p50.source, 'market');

  // 定额单位
  var row = A.parseRows([[1, '室内燃气镀锌钢管 DN65', 120]], PK, 'gld')[0];
  ck('镀锌定额单位10m', row.quotaUnit, '10m');
  ck('镀锌换算系数', row.quotaFactor, 10);
  ck('镀锌清单单位m', row.unit, 'm');
  ck('镀锌工程量保留', row.quantity, 120);
  ck('燃气特征含气压试验', /气压试验/.test(row.features), true);
  ck('燃气特征含连接形式', /连接形式:螺纹连接/.test(row.features), true);

  // 整表混合
  var mix = A.parseRows([
    [1, '内外壁热浸镀锌焊接普通钢管DN100', 120],
    [2, '室外燃气镀锌钢管DN40', 30],
    [3, '机制离心排水铸铁管DN150', 80]
  ], PK, 'gld');
  ck('混合表条数（含自动补支架）', mix.length, 4);
  ck('混合表末行支架', mix[3].category, 'bracket');
  ck('混合表镀锌1', mix[0].quotaCode, '8-181');
  ck('混合表镀锌燃气', mix[1].quotaCode, '8-1130');
  ck('混合表铸铁', mix[2].quotaCode, '8-357');
  ck('混合表主材合计（管道）', Number(mix.filter(function (d) { return d.category !== 'bracket'; }).reduce(function (s, d) { return s + (d.price === null ? 0 : d.price * d.quantity); }, 0).toFixed(2)), 120 * 52 + 30 * 20 + 80 * 105);
  ck('混合表支架 241.5kg', mix[3].quantity, 241.5);
})();


console.log('\n== 19. 无缝钢管 / 焊接钢管 ==');
ck('无缝清单码', pr('无缝钢管 DN100').listCode, '031001003');
ck('无缝室内焊接DN32', code('无缝钢管 DN32 焊接'), '8-195');
ck('无缝室内焊接DN100', code('无缝钢管 DN100 焊接'), '8-200');
ck('无缝室内焊接DN300', code('无缝钢管 DN300 焊接'), '8-205');
ck('无缝室外焊接DN32', code('无缝钢管 DN32 焊接 室外'), '8-23');
ck('无缝室外焊接DN400', code('无缝钢管 DN400 焊接 室外'), '8-35');
ck('无缝沟槽DN65', code('无缝钢管 DN65 沟槽连接'), '8-206');
ck('无缝沟槽DN250', code('无缝钢管 DN250 沟槽连接'), '8-212');
ck('镀锌无缝归无缝', pr('内外壁热浸镀锌无缝钢管 DN50').listCode, '031001003');
ck('焊接钢管清单码', pr('焊接钢管 DN100').listCode, '031001004');
ck('焊接钢管室内DN200', code('焊接钢管 DN200'), '8-203');
ck('焊接钢管室外DN200', code('焊接钢管 DN200 焊接 室外'), '8-31');
ck('焊接钢管沟槽DN200', code('焊接钢管 DN200 沟槽连接'), '8-211');
ck('无缝单位m', pr('无缝钢管 DN100').unit, 'm');
ck('无缝定额单位10m', pr('无缝钢管 DN100').quotaUnit, '10m');
ck('无缝换算系数', pr('无缝钢管 DN100').quotaFactor, 10);
ck('无缝DN32主材价', pr('无缝钢管 DN32').price, 19);
ck('无缝DN100主材价', pr('无缝钢管 DN100').price, 60);
ck('无缝DN400主材价', pr('无缝钢管 DN400').price, 300);
ck('焊接DN200主材价', pr('焊接钢管 DN200').price, 100);
ck('无缝价格来源', pr('无缝钢管 DN100').priceSource, 'market');
ck('无缝特征连接形式', /连接形式:焊接/.test(pr('无缝钢管 DN100').features), true);
ck('沟槽特征管件另计', /沟槽管件另计/.test(pr('无缝钢管 DN100 沟槽连接').features), true);

console.log('\n== 20. 铜管 ==');
ck('铜管清单码', pr('铜管 DN54').listCode, '031001005');
ck('铜管默认卡压', code('铜管 DN54'), '8-314');
ck('铜管卡压DN18', code('铜管 DN18 卡压连接'), '8-309');
ck('铜管卡压DN108', code('铜管 DN108 卡压连接'), '8-317');
ck('铜管氧乙炔DN54', code('铜管 DN54 氧乙炔焊'), '8-323');
ck('铜管氧乙炔DN108', code('铜管 DN108 氧乙炔焊'), '8-326');
ck('铜管钎焊DN54', code('铜管 DN54 钎焊'), '8-332');
ck('铜管钎焊DN108', code('铜管 DN108 钎焊'), '8-335');
ck('铜管DN54主材价', pr('铜管 DN54').price, 155);
ck('铜管DN108主材价', pr('铜管 DN108').price, 430);
ck('铜管连接形式', /连接形式:钎焊/.test(pr('铜管 DN54 钎焊').features), true);
ck('铜管焊材', /焊条\/焊丝/.test(pr('铜管 DN54 钎焊').features), true);

console.log('\n== 21. 不锈钢管 ==');
ck('不锈钢清单码', pr('不锈钢管 DN25').listCode, '031001006');
ck('不锈钢卡压DN15', code('不锈钢管 DN15 卡压连接'), '8-261');
ck('不锈钢卡压DN100', code('不锈钢管 DN100 卡压连接'), '8-269');
ck('不锈钢卡套DN15', code('不锈钢管 DN15 卡套连接'), '8-270');
ck('不锈钢氩弧DN100', code('不锈钢管 DN100 承插氩弧焊'), '8-287');
ck('不锈钢螺纹DN50', code('不锈钢管 DN50 螺纹连接'), '8-293');
ck('不锈钢电弧DN200', code('不锈钢管 DN200 对接电弧焊'), '8-308');
ck('燃气不锈钢氩弧DN25', code('室内燃气不锈钢管 DN25 承插氩弧焊'), '8-1141');
ck('燃气不锈钢卡套DN15', code('室内燃气不锈钢管 DN15 卡套连接'), '8-1148');
ck('燃气不锈钢卡压DN50', code('燃气不锈钢管 DN50 卡压连接'), '8-1159');
ck('燃气介质识别', pr('室内燃气不锈钢管 DN25').medium, 'gas');
ck('不锈钢DN100主材价', pr('不锈钢管 DN100').price, 168);
ck('不锈钢DN200主材价', pr('不锈钢管 DN200').price, 400);
ck('燃气特征气压试验', /气压试验/.test(pr('室内燃气不锈钢管 DN25').features), true);

console.log('\n== 22. 复合管 ==');
ck('复合管清单码', pr('铝塑复合管 De32').listCode, '031001007');
ck('室外钢骨架De32', code('钢骨架塑料复合管 De32 电熔连接 室外'), '8-81');
ck('室外钢骨架De160', code('钢骨架塑料复合管 De160 电熔连接 室外'), '8-89');
ck('室内钢骨架De20', code('室内钢骨架塑料复合管 De20 电熔连接'), '8-250');
ck('室内钢骨架De160', code('室内钢骨架塑料复合管 De160 电熔连接'), '8-260');
ck('铝塑卡压De20', code('铝塑复合管 De20 卡压连接'), '8-227');
ck('铝塑卡套De32', code('铝塑复合管 De32 卡套连接'), '8-235');
ck('铝塑热熔De160', code('铝塑复合管 De160 热熔连接'), '8-249');
ck('铝塑De32主材价', pr('铝塑复合管 De32').price, 16);
ck('钢骨架De110主材价', pr('钢骨架塑料复合管 De110').price, 105);
ck('复合管规格De', A.parseRows([[1, '铝塑复合管 De32', 5]], '2026-10', 'gld')[0].dn, 32);

console.log('\n== 23. 塑料管 ==');
ck('塑料清单码', pr('PPR给水管 De32').listCode, '031001008');
ck('室外给水热熔De32', code('室外塑料给水管 De32 热熔连接'), '8-36');
ck('室外给水热熔De315', code('室外塑料给水管 De315 热熔连接'), '8-47');
ck('室外给水电熔De110', code('室外塑料给水管 De110 电熔连接'), '8-54');
ck('室外给水粘接De110', code('室外塑料给水管 De110 粘接'), '8-66');
ck('室内给水热熔De20', code('室内塑料给水管 De20 热熔连接'), '8-410');
ck('室内给水电熔De25', code('室内塑料给水管 De25 电熔连接'), '8-422');
ck('室内给水粘接De160', code('室内塑料给水管 De160 粘接'), '8-442');
ck('室内排水粘接De50', code('室内塑料排水管 De50 粘接'), '8-377');
ck('室内排水粘接De160', code('室内塑料排水管 De160 粘接'), '8-380');
ck('室内排水热熔De250', code('室内塑料排水管 De250 热熔连接'), '8-388');
ck('室内雨水粘接De75', code('室内塑料雨水管 De75 粘接'), '8-405');
ck('室内雨水粘接De250', code('室内塑料雨水管 De250 粘接'), '8-409');
ck('PPR De32主材价', pr('PPR给水管 De32').price, 14.5);
ck('PVC排水De110主材价', pr('PVC-U排水管 De110').price, 35);
ck('排水介质识别', pr('PVC-U排水管 De110').medium, 'drain');
ck('排水特征通球', /通球试验/.test(pr('PVC-U排水管 De110').features), true);
ck('钢管特征规格DN', /型号规格:DN100/.test(pr('无缝钢管 DN100').features), true);
ck('铜管特征规格De', /型号规格:De54/.test(pr('铜管 DN54').features), true);
ck('复合管特征规格De', /型号规格:De32/.test(pr('铝塑复合管 De32').features), true);
ck('塑料管特征规格De', /型号规格:De25/.test(pr('PPR给水管 De25').features), true);

console.log('\n== 24. 附加定额（消毒冲洗 / 沟槽管件） ==');
var g1 = pr('无缝钢管 DN100', 100);
ck('消毒冲洗挂出', g1.extras.length, 1);
ck('消毒冲洗DN100→8-491', g1.extras[0].code, '8-491');
ck('消毒冲洗单位100m', g1.extras[0].unit, '100m');
ck('消毒冲洗系数100', g1.extras[0].factor, 100);
ck('消毒冲洗数量=管长', g1.extras[0].qty, 100);
ck('消毒冲洗换算量', Number((g1.extras[0].qty / g1.extras[0].factor).toFixed(4)), 1);
ck('消毒冲洗DN50→8-490', pr('无缝钢管 DN50', 100).extras[0].code, '8-490');
ck('消毒冲洗DN400→8-494', pr('无缝钢管 DN400 焊接 室外', 100).extras[0].code, '8-494');
var g3 = pr('无缝钢管 DN65 沟槽连接', 100);
ck('沟槽附加两项', g3.extras.length, 2);
ck('沟槽管件8-220', g3.extras[0].code, '8-220');
ck('沟槽管件单位10个', g3.extras[0].unit, '10个');
ck('沟槽管件系数10', g3.extras[0].factor, 10);
ck('沟槽管件数量按6m', g3.extras[0].qty, 17);
ck('沟槽管件换算量', Number((g3.extras[0].qty / 10).toFixed(2)), 1.7);
ck('沟槽DN80管件8-221', pr('无缝钢管 DN80 沟槽连接').extras[0].code, '8-221');
ck('沟槽DN250管件8-226', pr('无缝钢管 DN250 沟槽连接').extras[0].code, '8-226');
ck('管件角色', g3.extras[0].role, 'fitting');
ck('冲洗角色', g3.extras[1].role, 'flush');
ck('燃气也挂消毒冲洗', pr('室内燃气不锈钢管 DN25').extras.length, 1);
ck('燃气提示不计取', /一般不计取/.test(pr('室内燃气不锈钢管 DN25').warn), true);
ck('排水提示不计取', /一般不计取/.test(pr('室内塑料排水管 De110 粘接').warn), true);
ck('沟槽提示管件', /沟槽连接已附加管件定额/.test(pr('无缝钢管 DN100 沟槽连接').warn), true);

console.log('\n== 25. 导出多定额行 ==');
var capG = null, capJ = null;
global.XLSX = {
  utils: {
    aoa_to_sheet: function (d) { return d; },
    book_new: function () { return {}; },
    book_append_sheet: function (wb, ws) { wb.__rows = ws; }
  },
  writeFile: function (wb, name) { if (/建经/.test(name)) capJ = wb.__rows; else capG = wb.__rows; }
};
A.exportGLD([pr('无缝钢管 DN65 沟槽连接', 100)]);
ck('广联达总行数', capG.length, 8);
ck('广联达表头15列', capG[0].length, 15);
ck('清单行项目编码', capG[1][8], '031001003001');
ck('清单行类型', capG[1][9], '清单行');
ck('清单行单位m', capG[1][12], 'm');
ck('清单行工程量', capG[1][13], 100);
ck('主定额行号', capG[2][0], '1.1');
ck('主定额编码', capG[2][8], '8-206');
ck('主定额单位10m', capG[2][12], '10m');
ck('主定额工程量÷10', capG[2][13], 10);
// 主材行紧跟主定额行，附加定额（管件8-220、冲洗8-491）排在其后，避免被误判挂到冲洗定额下
ck('设备行紧跟主定额', capG[3][9], '子目下设备');
ck('设备行行号1.2', capG[3][0], '1.2');
ck('设备行编码', capG[3][8], 'Z00741-001');
ck('设备行单价', capG[3][14], 37);
ck('管件定额行号', capG[4][0], '1.3');
ck('管件定额编码', capG[4][8], '8-220');
ck('管件定额单位10个', capG[4][12], '10个');
ck('管件定额工程量', capG[4][13], 1.7);
ck('冲洗定额行号', capG[5][0], '1.4');
ck('冲洗定额编码', capG[5][8], '8-491');
ck('冲洗定额单位100m', capG[5][12], '100m');
ck('冲洗定额工程量', capG[5][13], 1);
ck('冲洗行无主材单价', capG[5][14], '');
ck('合计行', capG[7][0], '合计');
A.exportJianjing([pr('无缝钢管 DN65 沟槽连接', 100)]);
ck('建经总行数', capJ.length, 6);
ck('建经表头8列', capJ[0].length, 8);
ck('建经主定额', capJ[1][3], '8-206');
ck('建经管件另起一行', capJ[2][3], '8-220');
ck('建经管件数量说明', /数量1\.7 10个/.test(capJ[2][4]), true);
ck('建经冲洗行', capJ[3][3], '8-491');
ck('建经合计', capJ[5][0], '合计');
delete global.XLSX;

console.log('\n== 26. 阀门及管道附件（031002001~031002305，与暖通站同口径） ==');
var v1 = pr('闸阀 DN100', 4);
ck('闸阀分类', v1.category, 'waterValve');
ck('闸阀清单031002001', v1.listCode, '031002001');
ck('闸阀DN100定额8-622', v1.quotaCode, '8-622');
ck('闸阀信息价290', v1.price, 290);
ck('闸阀信息价不标品牌', v1.priceBrand, '');
ck('闸阀单位个', v1.unit, '个');
var v2 = pr('Y型过滤器 DN150', 2);
ck('过滤器DN150定额8-624', v2.quotaCode, '8-624');
ck('过滤器信息价500', v2.price, 500);
var v3 = pr('橡胶软接头 DN200', 2);
ck('软接头市场价', v3.priceSource, 'market');
ck('软接头标品牌', /冠龙/.test(v3.priceBrand || ''), true);
var v4 = pr('波纹补偿器 DN300', 1);
ck('补偿器DN300定额8-627', v4.quotaCode, '8-627');
var v5 = pr('闸阀 DN32', 2);
ck('DN32螺纹8-582', v5.quotaCode, '8-582');
ck('DN32闸阀信息价95', v5.price, 95);
var v6 = pr('闸阀 DN500', 1);
ck('DN500取8-629', v6.quotaCode, '8-629');
ck('DN500超档提示', /超本类最大档/.test(v6.warn), true);
var v7 = pr('自动排气阀 DN25', 6);
ck('自动排气阀031002303', v7.listCode, '031002303');
ck('自动排气阀8-682', v7.quotaCode, '8-682');
ck('自动排气阀信息价95', v7.price, 95);
var v8 = pr('散热器温控阀 DN25', 2);
ck('温控阀031002306', v8.listCode, '031002306');
ck('温控阀8-686', v8.quotaCode, '8-686');
ck('温控阀市场价260', v8.price, 260);
var v9 = pr('浮球阀 DN100', 2);
ck('浮球阀031002301', v9.listCode, '031002301');
ck('浮球阀8-615', v9.quotaCode, '8-615');
ck('浮球阀市场价480', v9.price, 480);
var v10 = pr('液压水位控制阀 DN150', 1);
ck('水位控制阀031002302', v10.listCode, '031002302');
ck('水位控制阀8-648', v10.quotaCode, '8-648');
ck('水位控制阀市场价1900', v10.price, 1900);
var v11 = pr('口部冲洗阀', 2);
ck('口部冲洗阀031002304', v11.listCode, '031002304');
ck('口部冲洗阀8-1260', v11.quotaCode, '8-1260');
ck('口部冲洗阀单位套', v11.unit, '套');
ck('口部冲洗阀480', v11.price, 480);
ck('口部冲洗阀标品牌', /人防/.test(v11.priceBrand || ''), true);
var v12 = pr('电磁阀 DN25', 3);
ck('电磁阀031002305', v12.listCode, '031002305');
ck('电磁阀DN25螺纹8-605', v12.quotaCode, '8-605');
ck('电磁阀DN25市场价230', v12.price, 230);
var v13 = pr('电磁阀 DN100', 3);
ck('电磁阀DN100法兰8-635', v13.quotaCode, '8-635');
ck('电磁阀DN100市场价820', v13.price, 820);
var v14 = pr('电磁阀 DN500', 1);
ck('电磁阀DN500法兰8-644', v14.quotaCode, '8-644');
ck('电磁阀DN500市场价6500', v14.price, 6500);
ck('阀门不影响管道识别', A.buildItem('球墨铸铁给水管 DN200').category, 'castIron');
ck('阀门特征含类型', /类型:金属阀门/.test(v1.features), true);
ck('阀门无部位下拉', A.isValveCat(v1.category), true);

console.log('\n== 27. 管道支架 / 保温绝热（与暖通站同口径） ==');
ck('橡塑识别', A.buildItem('橡塑保温 DN100').category, 'insulRubber');
ck('橡塑保温壳识别', A.buildItem('橡塑保温壳').category, 'insulRubber');
ck('玻璃棉识别', A.buildItem('离心玻璃棉 40mm').category, 'insulGlass');
ck('玻璃棉简写识别', A.buildItem('玻璃棉').category, 'insulGlass');
ck('管道支架识别', A.buildItem('管道支架').category, 'bracket');
ck('支吊架识别', A.buildItem('管道支吊架制安').category, 'bracket');
var ir = A.buildItem('橡塑保温 DN100');
ck('橡塑清单031208002', ir.listCode, '031208002');
ck('橡塑定额11-582', A.matchQuota(ir).code, '11-582');
ck('橡塑单位m³', ir.unit, 'm³');
ck('橡塑厚度30', ir.insulThk, 30);
ck('橡塑市场价1000', A.auxPrice(ir).price, 1000);
ck('橡塑标品牌', /华美/.test(A.auxPrice(ir).brand || ''), true);
var ig = A.buildItem('离心玻璃棉');
ck('玻璃棉定额11-647', A.matchQuota(ig).code, '11-647');
ck('玻璃棉厚度40', ig.insulThk, 40);
ck('玻璃棉市场价450', A.auxPrice(ig).price, 450);
var bk = A.buildItem('管道支架');
ck('支架定额7-138', A.matchQuota(bk).code, '7-138');
ck('支架定额单位100kg', A.matchQuota(bk).unit, '100kg');
ck('支架单位kg', bk.unit, 'kg');
ck('支架型钢信息价4.2', A.auxPrice(bk).price, 4.2);
ck('支架信息价来源', A.auxPrice(bk).source, 'info');
ck('含量DN50', A.bracketWeightPerM(50), 0.45);
ck('含量DN100', A.bracketWeightPerM(100), 0.9);
ck('含量DN200', A.bracketWeightPerM(200), 1.5);
ck('含量DN400', A.bracketWeightPerM(400), 2.4);
ck('含量DN500', A.bracketWeightPerM(500), 3.2);
ck('无管径0.6', A.bracketWeightPerM(null), 0.6);

// 自动补支架 + 已有支架不重复
var d1 = A.parseRows([[1, '球墨铸铁给水管 DN200', 80], [2, '镀锌钢管 DN50', 60]], '2026-10', 'glodon');
ck('自动补支架行数', d1.length, 3);
ck('支架 147kg', d1[2].quantity, 147);
ck('支架不附消毒冲洗', (d1[2].extras || []).length, 0);
var d2 = A.parseRows([[1, '球墨铸铁给水管 DN200', 80], [2, '管道支架', 200]], '2026-10', 'glodon');
ck('已带支架不重复补', d2.length, 2);
ck('已带支架工程量保留', d2[1].quantity, 200);
var d3 = A.parseRows([[1, '闸阀 DN100', 4]], '2026-10', 'glodon');
ck('仅阀门不补支架', d3.length, 1);

// 保温单位折算
var d4 = A.parseRows([[1, '橡塑保温 DN100', 20, 'm²']], '2026-10', 'glodon');
ck('橡塑m²折算m³', d4[0].quantity, 0.6);
var d5 = A.parseRows([[1, '离心玻璃棉 DN200', 10, 'm']], '2026-10', 'glodon');
ck('玻璃棉m折算m³', d5[0].quantity, Math.round(Math.PI * (0.2 + 0.04) * 0.04 * 10 * 1000) / 1000);
var d6 = A.parseRows([[1, '橡塑保温 DN100', 5, 'm³']], '2026-10', 'glodon');
ck('橡塑m³原样', d6[0].quantity, 5);
ck('保温特征含厚度', /厚度30mm/.test(A.buildItem('橡塑保温 DN100').features || A.featureText(A.buildItem('橡塑保温 DN100'))), true);


// ============================================================
// 消防专业（030904001~030904018 / 030901001~030901013 / 030909001）
// ============================================================
function pq(n, qty) { return pr(n, qty === undefined ? 10 : qty).quotaCode; }
function pl(n) { return pr(n).listCode; }
function pc(n) { return pr(n).category; }
function pp(n) { return pr(n).price; }
function psrc(n) { return pr(n).priceSource; }

console.log('\n== 28. 消防电清单编码（030904001~030904018） ==');
ck('点型探测器', pl('点型感烟探测器（总线制）'), '030904001');
ck('线型探测器', pl('线型感温探测器（缆式）'), '030904002');
ck('按钮', pl('手动报警按钮'), '030904003');
ck('声光报警器', pl('声光报警器'), '030904004');
ck('消防电话', pl('消防电话插孔'), '030904005');
ck('消防广播', pl('消防广播吸顶式扬声器'), '030904006');
ck('消防模块', pl('消防模块 单输出'), '030904007');
ck('模块箱', pl('消防模块箱（端子箱） 户外'), '030904008');
ck('区域报警控制器', pl('区域报警控制器 总线制 壁挂式 200点'), '030904009');
ck('楼层显示器', pl('楼层火灾显示器 总线制'), '030904010');
ck('远程控制器', pl('远程控制器 5路'), '030904011');
ck('火灾报警主机', pl('火灾报警控制主机'), '030904012');
ck('联动控制主机', pl('联动控制主机 总线制 落地式 500点'), '030904013');
ck('广播对讲主机', pl('消防广播及对讲电话主机 250W功放'), '030904014');
ck('控制微机', pl('火灾报警控制微机'), '030904015');
ck('备用电源', pl('备用电源及电池主机'), '030904016');
ck('报警联动一体机', pl('报警联动一体机 壁挂式 1000点'), '030904017');
ck('机柜', pl('机柜 落地式'), '030904018');

console.log('\n== 29. 点型探测器 7-139~7-148（多线制/总线制 × 5类） ==');
[[ '点型感烟探测器（多线制）','7-139'], ['点型感烟探测器（总线制）','7-144'],
 [ '点型感温探测器（多线制）','7-140'], ['点型感温探测器（总线制）','7-145'],
 [ '红外光束感烟探测器 多线制','7-141'], ['红外光束感烟探测器 总线制','7-146'],
 [ '火焰探测器 多线制','7-142'], ['火焰探测器 总线制','7-147'],
 [ '可燃气体探测器 多线制','7-143'], ['可燃气体探测器 总线制','7-148']].forEach(function (p) {
  ck(p[0], pq(p[0]), p[1]);
});
ck('探测器单位 只', pr('点型感烟探测器（总线制）').unit, '只');
ck('探测器未注走线默认总线', pq('点型感烟探测器'), '7-144');
ck('探测器主材 感烟95', pp('点型感烟探测器（总线制）'), 95);
ck('探测器主材 感温90', pp('点型感温探测器（总线制）'), 90);
ck('探测器主材 红外850', pp('红外光束感烟探测器 总线制'), 850);
ck('探测器主材 火焰1100', pp('火焰探测器 总线制'), 1100);
ck('探测器主材 可燃气体220', pp('可燃气体探测器 总线制'), 220);
ck('探测器主材为市场价', psrc('点型感烟探测器（总线制）'), 'market');

console.log('\n== 30. 线型/按钮/声光/电话/广播/模块 7-149~7-204 ==');
ck('线型探测器 7-149', pq('线型感温探测器（缆式）'), '7-149');
ck('线型单位 10m', pr('线型感温探测器（缆式）').quotaFactor, 10);
ck('按钮 7-150', pq('手动报警按钮'), '7-150');
ck('消火栓按钮 7-150', pq('消火栓按钮'), '7-150');
ck('声光报警 7-188', pq('声光报警器'), '7-188');
ck('警铃 7-189', pq('火灾警铃'), '7-189');
ck('电话插孔 7-203', pq('消防电话插孔'), '7-203');
ck('电话分机 7-202', pq('消防电话分机'), '7-202');
ck('吸顶扬声器 7-196', pq('消防广播吸顶式扬声器'), '7-196');
ck('壁挂音箱 7-197', pq('消防广播壁挂式音箱'), '7-197');
ck('模块单输出 7-151', pq('消防模块 单输出'), '7-151');
ck('模块多输出 7-152', pq('消防模块 多输出'), '7-152');
ck('报警模块 7-153', pq('消防模块 报警模块'), '7-153');
ck('模块箱户外 2-368', pq('消防模块箱（端子箱） 户外'), '2-368');
ck('模块箱户内 2-369', pq('消防模块箱（端子箱） 户内'), '2-369');
ck('楼层显示器多线 7-186', pq('楼层火灾显示器 多线制'), '7-186');
ck('楼层显示器总线 7-187', pq('楼层火灾显示器 总线制'), '7-187');
ck('远程控制器3路 7-190', pq('远程控制器 3路'), '7-190');
ck('远程控制器5路 7-191', pq('远程控制器 5路'), '7-191');
ck('备用电源 7-204', pq('备用电源及电池主机'), '7-204');
ck('控制微机 10-455', pq('火灾报警控制微机'), '10-455');
ck('机柜落地 12-8', pq('机柜 落地式'), '12-8');
ck('机柜墙挂 12-9', pq('机柜 墙挂式'), '12-9');

console.log('\n== 31. 区域报警控制器 7-154~7-165（走线×安装×点数） ==');
[[ '区域报警控制器 多线制 壁挂式 32点','7-154'], ['区域报警控制器 多线制 壁挂式 64点','7-155'],
 [ '区域报警控制器 多线制 落地式 32点','7-156'], ['区域报警控制器 多线制 落地式 64点','7-157'],
 [ '区域报警控制器 总线制 壁挂式 200点','7-158'], ['区域报警控制器 总线制 壁挂式 500点','7-159'],
 [ '区域报警控制器 总线制 壁挂式 1000点','7-160'], ['区域报警控制器 总线制 壁挂式 1500点','7-161'],
 [ '区域报警控制器 总线制 落地式 200点','7-162'], ['区域报警控制器 总线制 落地式 500点','7-163'],
 [ '区域报警控制器 总线制 落地式 1000点','7-164'], ['区域报警控制器 总线制 落地式 1500点','7-165']].forEach(function (p) {
  ck(p[0], pq(p[0]), p[1]);
});
ck('控制器无点数需手选', pr('区域报警控制器 总线制 壁挂式').quotaCode, '');
ck('控制器无点数提示', /点数/.test(pr('区域报警控制器 总线制 壁挂式').warn), true);
ck('控制器主材 200点8600', pp('区域报警控制器 总线制 壁挂式 200点'), 8600);
ck('控制器主材 32点3800', pp('区域报警控制器 多线制 壁挂式 32点'), 3800);

console.log('\n== 32. 联动控制器 7-166~7-177 / 一体机 7-178~7-185 ==');
[[ '联动控制主机 多线制 壁挂式 100点','7-166'], ['联动控制主机 多线制 壁挂式 200点','7-167'],
 [ '联动控制主机 多线制 落地式 100点','7-168'], ['联动控制主机 多线制 落地式 200点','7-169'],
 [ '联动控制主机 总线制 壁挂式 100点','7-170'], ['联动控制主机 总线制 壁挂式 200点','7-171'],
 [ '联动控制主机 总线制 壁挂式 500点','7-172'], ['联动控制主机 总线制 壁挂式 800点','7-173'],
 [ '联动控制主机 总线制 落地式 100点','7-174'], ['联动控制主机 总线制 落地式 200点','7-175'],
 [ '联动控制主机 总线制 落地式 500点','7-176'], ['联动控制主机 总线制 落地式 800点','7-177']].forEach(function (p) {
  ck(p[0], pq(p[0]), p[1]);
});
ck('联动主机主材按市场价', psrc('联动控制主机 总线制 落地式 500点'), 'market');
ck('联动主机主材20000', pp('联动控制主机 总线制 落地式 500点'), 20000);
[[ '报警联动一体机 壁挂式 500点','7-178'], ['报警联动一体机 壁挂式 1000点','7-179'],
 [ '报警联动一体机 壁挂式 2000点','7-180'], ['报警联动一体机 壁挂式 3000点','7-181'],
 [ '报警联动一体机 落地式 500点','7-182'], ['报警联动一体机 落地式 1000点','7-183'],
 [ '报警联动一体机 落地式 2000点','7-184'], ['报警联动一体机 落地式 3000点','7-185']].forEach(function (p) {
  ck(p[0], pq(p[0]), p[1]);
});
ck('一体机主材 1000点18000', pp('报警联动一体机 壁挂式 1000点'), 18000);

console.log('\n== 33. 广播/对讲/电话主机 7-192~7-201 ==');
ck('125W功放 7-192', pq('消防广播及对讲电话主机 125W功放'), '7-192');
ck('250W功放 7-193', pq('消防广播及对讲电话主机 250W功放'), '7-193');
ck('录音机 7-194', pq('消防广播及对讲电话主机 录音机'), '7-194');
ck('广播控制柜 7-195', pq('消防广播及对讲电话主机 广播控制柜'), '7-195');
ck('广播分配器 7-198', pq('消防广播及对讲电话主机 广播分配器'), '7-198');
ck('电话交换机20门 7-199', pq('消防广播及对讲电话主机 电话交换机 20门'), '7-199');
ck('电话交换机40门 7-200', pq('消防广播及对讲电话主机 电话交换机 40门'), '7-200');
ck('电话交换机60门 7-201', pq('消防广播及对讲电话主机 电话交换机 60门'), '7-201');
ck('电话交换机40门主材6800', pp('消防广播及对讲电话主机 电话交换机 40门'), 6800);
ck('250W功放主材4200', pp('消防广播及对讲电话主机 250W功放'), 4200);

console.log('\n== 34. 火灾报警控制主机（补充定额 + 35000元/台） ==');
ck('主机补充定额', pq('火灾报警控制主机'), '补充定额');
ck('主机主材按市场价', psrc('火灾报警控制主机'), 'market');
ck('主机主材35000', pp('火灾报警控制主机'), 35000);
ck('主机提示', /补充定额/.test(pr('火灾报警控制主机').warn), true);
// 其他类型主机兜底：按 030904012 + 火灾报警主机市场价计列
ck('电气火灾监控主机清单', pl('电气火灾监控主机'), '030904012');
ck('电气火灾监控主机定额', pq('电气火灾监控主机'), '补充定额');
ck('电气火灾监控主机主材', pp('电气火灾监控主机'), 35000);
ck('其他主机提示', /其他类型主机|核对清单编码/.test(pr('电气火灾监控主机').warn), true);
ck('电源监控主机清单', pl('消防设备电源监控主机'), '030904012');
ck('防火门监控主机清单', pl('防火门监控主机'), '030904012');
ck('可燃气体报警主机清单', pl('可燃气体报警主机'), '030904012');
ck('标准主机不误标', /其他类型主机/.test(pr('火灾报警控制主机').warn), false);

console.log('\n== 35. 消防水特殊项（030901003~030901013） ==');
ck('喷头清单', pl('水喷头 DN15 有吊顶'), '030901003');
ck('喷头有吊顶 7-11', pq('水喷头 DN15 有吊顶'), '7-11');
ck('喷头无吊顶 7-10', pq('水喷头 DN15 无吊顶'), '7-10');
ck('喷头默认有吊顶', pq('水喷头'), '7-11');
ck('喷头单位 10个', pr('水喷头 DN15').quotaFactor, 10);
ck('喷头主材12', pp('水喷头 DN15'), 12);
ck('水流指示器清单', pl('水流指示器 DN100'), '030901006');
[[50,'7-22'],[65,'7-23'],[80,'7-24'],[100,'7-25']].forEach(function (p) {
  ck('水流指示器螺纹DN' + p[0], pq('水流指示器 DN' + p[0] + ' 螺纹'), p[1]);
});
[[50,'7-26'],[80,'7-27'],[100,'7-28'],[150,'7-29'],[200,'7-30']].forEach(function (p) {
  ck('水流指示器法兰DN' + p[0], pq('水流指示器 DN' + p[0] + ' 法兰'), p[1]);
});
ck('水流指示器主材DN100 380', pp('水流指示器 DN100 螺纹'), 380);
ck('减压孔板清单', pl('减压孔板 DN100'), '030901007');
[[50,'7-31'],[80,'7-32'],[100,'7-33'],[125,'7-34'],[150,'7-35']].forEach(function (p) {
  ck('减压孔板DN' + p[0], pq('减压孔板 DN' + p[0]), p[1]);
});
ck('室内消火栓清单', pl('室内消火栓 单栓 DN65'), '030901010');
ck('室内消火栓单栓 7-53', pq('室内消火栓 单栓 DN65'), '7-53');
ck('室内消火栓双栓 7-54', pq('室内消火栓 双栓 DN65'), '7-54');
ck('消火栓单栓主材560', pp('室内消火栓 单栓 DN65'), 560);
ck('消火栓双栓主材980', pp('室内消火栓 双栓 DN65'), 980);
ck('室外消火栓清单', pl('室外消火栓 地下式'), '030901011');
ck('室外消火栓 7-39', pq('室外消火栓 地下式'), '7-39');
ck('室外消火栓主材1200', pp('室外消火栓 地下式'), 1200);
ck('末端试水清单', pl('末端试水装置 DN25'), '030901008');
ck('末端试水 7-36', pq('末端试水装置 DN25'), '7-36');
ck('末端试水32 7-37', pq('末端试水装置 DN32'), '7-37');
ck('末端试水主材320', pp('末端试水装置 DN25'), 320);
ck('接合器清单', pl('消防水泵接合器 地下式 DN100'), '030901012');
ck('接合器地下100 7-55', pq('消防水泵接合器 地下式 DN100'), '7-55');
ck('接合器地下150 7-56', pq('消防水泵接合器 地下式 DN150'), '7-56');
ck('接合器地上100 7-57', pq('消防水泵接合器 地上式 DN100'), '7-57');
ck('接合器地上150 7-58', pq('消防水泵接合器 地上式 DN150'), '7-58');
ck('接合器墙壁100 7-59', pq('消防水泵接合器 墙壁式 DN100'), '7-59');
ck('接合器墙壁150 7-60', pq('消防水泵接合器 墙壁式 DN150'), '7-60');
ck('接合器默认地下式', pq('消防水泵接合器 DN100'), '7-55');
ck('水炮清单', pl('消防水炮 进口口径80mm'), '030901013');
ck('水炮50 7-66', pq('消防水炮 进口口径50mm'), '7-66');
ck('水炮80 7-67', pq('消防水炮 进口口径80mm'), '7-67');
ck('水炮100 7-68', pq('消防水炮 进口口径100mm'), '7-68');
ck('水炮无尺寸固定7-66', pq('消防水炮'), '7-66');
ck('水炮主材9500', pp('消防水炮 进口口径80mm'), 9500);

console.log('\n== 36. 配管 / 配线 / 桥架（第二册，与电气站同口径） ==');
ck('配管清单', pl('配管 SC25 暗配'), '030411001');
ck('SC25 暗配 2-1152', pq('配管 SC25 暗配'), '2-1152');
ck('SC25 明配 2-1141', pq('配管 SC25 明配'), '2-1141');
ck('SC50 暗配 2-1155', pq('配管 SC50 暗配'), '2-1155');
ck('JDG20 暗配 2-1124', pq('配管 JDG20 暗配'), '2-1124');
ck('JDG20 明配 2-1118', pq('配管 JDG20 明配'), '2-1118');
ck('配管单位 100m', pr('配管 SC25 暗配').quotaFactor, 100);
ck('SC25 信息价 9.57', pp('配管 SC25 暗配'), 9.57);
ck('配管信息价来源', psrc('配管 SC25 暗配'), 'official');
ck('配线清单', pl('配线 BV-2.5'), '030411004');
ck('BV1.5 照明 2-1318', pq('配线 BV-1.5'), '2-1318');
ck('BV2.5 照明 2-1319', pq('配线 BV-2.5'), '2-1319');
ck('BV4 照明 2-1320', pq('配线 BV-4'), '2-1320');
ck('BV6 动力 2-1344', pq('配线 BV-6'), '2-1344');
ck('BV2.5 信息价 2.46', pp('配线 BV-2.5'), 2.46);
ck('RVS 软线 2-1359', pq('配线 RVS-2×1.5'), '2-1359');
ck('RVS 软线名称含二芯', /二芯/.test(pr('配线 RVS-2×1.5').quotaName), true);
ck('桥架清单', pl('消防桥架 300×100'), '030411003');
ck('桥架300 2-638', pq('消防桥架 300×100'), '2-638');
ck('桥架150 2-637', pq('消防桥架 150×100'), '2-637');
ck('桥架单位 10m', pr('消防桥架 300×100').quotaFactor, 10);
ck('桥架300×100 信息价 138.76', pp('消防桥架 300×100'), 138.76);

console.log('\n== 37. 消防水管道默认连接方式（DN≥50 沟槽 / DN<50 螺纹） ==');
ck('消防DN100 沟槽 8-208', pq('消防镀锌钢管 DN100'), '8-208');
ck('消防DN150 沟槽 8-210', pq('喷淋镀锌钢管 DN150'), '8-210');
ck('消防DN65 沟槽 8-206', pq('消防镀锌钢管 DN65'), '8-206');
ck('消防DN40 螺纹 8-177', pq('消防镀锌钢管 DN40'), '8-177');
ck('消防DN25 螺纹 8-175', pq('消防镀锌钢管 DN25'), '8-175');
ck('消防DN100 连接=groove', pr('消防镀锌钢管 DN100').joint, 'groove');
ck('消防DN40 连接=thread', pr('消防镀锌钢管 DN40').joint, 'thread');
ck('消防DN100 附加沟槽管件', (pr('消防镀锌钢管 DN100').extras || []).map(function (x) { return x.code; })[0], '8-222');
ck('非消防DN100 仍螺纹', pq('镀锌钢管 DN100'), '8-181');

console.log('\n== 38. 三项水灭火系统调试自动补项（030909001） ==');
var f1 = A.parseRows([[1, '室内消火栓 单栓 DN65', 40], [2, '水流指示器 DN100 螺纹', 6], [3, '消防水炮 进口口径80mm', 3]], '2026-10', 'guanglianda');
ck('补项后总行数', f1.length, 6);
ck('调试1 清单', f1[3].listCode, '030909001');
ck('调试1 7-215', f1[3].quotaCode, '7-215');
ck('调试1 数量=消火栓40', f1[3].quantity, 40);
ck('调试2 7-216', f1[4].quotaCode, '7-216');
ck('调试2 数量=水流指示器6', f1[4].quantity, 6);
ck('调试3 7-217', f1[5].quotaCode, '7-217');
ck('调试3 数量=水炮3', f1[5].quantity, 3);
ck('调试不计主材', f1[3].priceSource, 'na');
ck('调试主材为空', f1[3].price, null);
var f2 = A.parseRows([[1, '水喷头 DN15 有吊顶', 300]], '2026-10', 'guanglianda');
ck('仅喷头补7-216', f2[1].quotaCode, '7-216');
ck('仅喷头按1系统', f2[1].quantity, 1);
var f3 = A.parseRows([[1, '点型感烟探测器（总线制）', 100]], '2026-10', 'guanglianda');
ck('纯消防电不补调试', f3.length, 1);
var f4 = A.parseRows([[1, '室内消火栓 单栓 DN65', 20], [2, '水灭火控制装置调试 消火栓灭火系统', 20]], '2026-10', 'guanglianda');
ck('已有调试不重复补', f4.length, 2);

console.log('\n== 39. 消防水管道支架自动补项 ==');
var g1 = A.parseRows([[1, '消防镀锌钢管 DN100', 120], [2, '点型感烟探测器（总线制）', 100]], '2026-10', 'guanglianda');
ck('仅按管道补支架', g1.length, 3);
ck('支架紧跟管道（不在末尾）', g1[1].category, 'bracket');
ck('支架清单 031301005', g1[1].listCode, '031301005');
ck('支架定额 7-138', g1[1].quotaCode, '7-138');
ck('支架按120m DN100 = 108kg', g1[1].quantity, 108);

console.log('\n== 40. 渲染与导出 ==');
ck('类型列 消防电', A.itTypeOf(A.buildItem('点型感烟探测器（总线制）')), '点型探测器');
ck('类型列 消防水', A.itTypeOf(A.buildItem('水喷头 DN15')), '喷头');
ck('材质列 消防水管道', A.itMaterialOf(A.buildItem('消防镀锌钢管 DN100')), '镀锌钢（消防水）');
ck('规格列 探测器', A.fireSpecText(A.buildItem('红外光束感烟探测器')), '红外光束');
ck('规格列 喷头', A.fireSpecText(A.buildItem('水喷头 DN15 无吊顶')), 'DN15 无吊顶');
ck('规格列 桥架', A.fireSpecText(A.buildItem('消防桥架 300×100')), '300×100');
ck('规格列 配线', A.fireSpecText(A.buildItem('配线 BV-2.5')), '2.5mm²');

console.log('\n== 41. 消防分类不误伤管道/阀门 ==');
ck('消火栓管道走管道', pc('消火栓管道 DN100'), 'other');
ck('喷淋管道走管道', pc('喷淋镀锌钢管 DN100'), 'galv');
ck('消防管道支架走支架', pc('消防管道支架'), 'bracket');
ck('水流指示器非阀门', pc('水流指示器 DN100'), 'flowIndicator');
ck('末端试水阀非阀门', pc('末端试水阀 DN25'), 'testDevice');
ck('消防泵未识别', pc('消防水泵'), 'other');

console.log('\n== 41. 消防水钢管：喷淋管道 / 消火栓管道 ==');
function fp(name, qty, sys) {
  return A.parseRows([[1, name, qty]], '2026-10', 'guanglianda', sys)[0];
}
// 喷淋管道 DN100（≥DN65：沟槽 8-206~8-212 + 管件×3 + 喷淋冲洗 7-70~7-75）
var sp100 = fp('镀锌钢管 DN100', 120, 'sprinkler');
ck('喷淋清单030901001', sp100.listCode, '030901001');
ck('喷淋清单名水喷淋钢管', sp100.listName, '水喷淋钢管');
ck('喷淋DN100定额8-208', sp100.quotaCode, '8-208');
ck('喷淋DN100定额单位10m', sp100.quotaUnit, '10m');
ck('喷淋DN100附加4项', sp100.extras.length, 4);
ck('喷淋管件重复三次', sp100.extras.filter(function (e) { return e.code === '8-222'; }).length, 3);
ck('喷淋管件量=ceil(120/6)', sp100.extras[0].qty, 20);
ck('喷淋冲洗7-73', sp100.extras[3].code, '7-73');
ck('喷淋冲洗单位100m', sp100.extras[3].unit, '100m');
// 喷淋管道 DN50（<DN65：7-1~7-4 螺纹 + 仅喷淋冲洗）
var sp50 = fp('镀锌钢管 DN50', 60, 'sprinkler');
ck('喷淋DN50清单030901001', sp50.listCode, '030901001');
ck('喷淋DN50定额7-4', sp50.quotaCode, '7-4');
ck('喷淋DN50定额单位10m', sp50.quotaUnit, '10m');
ck('喷淋DN50仅1项附加', sp50.extras.length, 1);
ck('喷淋DN50冲洗7-70', sp50.extras[0].code, '7-70');
// 喷淋管道 DN200（冲洗档 7-75）
var sp200 = fp('无缝钢管 DN200', 60, 'sprinkler');
ck('喷淋DN200定额8-211', sp200.quotaCode, '8-211');
ck('喷淋DN200冲洗7-75', sp200.extras[3].code, '7-75');
// 消火栓管道 DN100（一律沟槽 + 管件×3 + 消火栓冲洗 8-490~8-495）
var hd100 = fp('无缝钢管 DN100', 120, 'hydrant');
ck('消火栓清单030901002', hd100.listCode, '030901002');
ck('消火栓清单名消火栓钢管', hd100.listName, '消火栓钢管');
ck('消火栓DN100定额8-208', hd100.quotaCode, '8-208');
ck('消火栓DN100附加4项', hd100.extras.length, 4);
ck('消火栓冲洗8-491', hd100.extras[3].code, '8-491');
// 消火栓管道 DN50（就近套 DN65 沟槽子目）
var hd50 = fp('镀锌钢管 DN50', 60, 'hydrant');
ck('消火栓DN50就近DN65沟槽8-206', hd50.quotaCode, '8-206');
ck('消火栓DN50管件8-220', hd50.extras[0].code, '8-220');
ck('消火栓DN50附加4项', hd50.extras.length, 4);
// 导出：一项消火栓管道清单 = 1 管道定额 + 3 管件定额 + 1 冲洗定额 = 5 个定额
var capF = null;
global.XLSX = {
  utils: {
    aoa_to_sheet: function (d) { return d; },
    book_new: function () { return {}; },
    book_append_sheet: function (wb, ws) { wb.__rows = ws; }
  },
  writeFile: function (wb, name) { capF = wb.__rows; }
};
A.exportGLD([hd100]);
ck('消防管道导出总行数', capF.length, 10);
ck('消防管道导出定额行5个', capF.filter(function (r) { return r[9] === '定额行'; }).length, 5);
ck('定额行号1.1/1.3~1.6（1.2为主材）', capF.filter(function (r) { return r[9] === '定额行'; }).map(function (r) { return r[0]; }).join(','), '1.1,1.3,1.4,1.5,1.6');
ck('主材行紧跟管道定额', capF[3][9], '子目下设备');
ck('管件三行编码一致', capF.filter(function (r) { return r[8] === '8-222'; }).length, 3);
delete global.XLSX;
// 排除：燃气/给水/室外管道仍按给排水口径
ck('燃气仍给排水口径', fp('室内燃气镀锌钢管 DN50', 10, 'hydrant').listCode, '031001002');
ck('给水仍给排水口径', fp('室内给水镀锌钢管 DN80', 10, 'hydrant').listCode, '031001002');
ck('室外仍给排水口径', fp('室外镀锌钢管 DN100', 10, 'hydrant').listCode, '031001002');
A.setFirePipeSystem('plumb');

console.log('\n== 12位清单编码（同码递增、异码各自001）==');
global.XLSX = {
  utils: {
    aoa_to_sheet: function (d) { return d; },
    book_new: function () { return {}; },
    book_append_sheet: function (wb, ws) { wb.__rows = ws; }
  },
  writeFile: function (wb, name) { if (/建经/.test(name)) capJ = wb.__rows; else capG = wb.__rows; }
};
var capG = null, capJ = null;
var c12 = A.parseRows([
  [1, '室内镀锌钢管 DN50 螺纹连接', 100],
  [2, '室内镀锌钢管 DN50 螺纹连接', 50]
], '2026-10', 'glodon');
A.exportGLD(c12);
var lc12 = capG.filter(function (r) { return r[9] === '清单行'; }).map(function (r) { return r[8]; });
ck('编码均为12位', lc12.every(function (c) { return /^\d{12}$/.test(c); }), true);
var g12 = {};
lc12.forEach(function (c) { var p = c.slice(0, 9); (g12[p] = g12[p] || []).push(c.slice(9)); });
var dup12 = Object.keys(g12).filter(function (k) { return g12[k].length > 1; });
ck('存在同码重复项', dup12.length > 0, true);
ck('同码后缀001/002', dup12.length ? g12[dup12[0]].join(',') : '', '001,002');
ck('首条后缀001', lc12[0].slice(9), '001');

console.log('\n== 补充码也补足12位 ==');
var sp12 = [{ listCode: '03B001' }, { listCode: '03B001' }, { listCode: '031001003' }, { listCode: '' }];
A.annotateListCode12(sp12);
ck('补充码补足12位', sp12[0].listCode12, '03B001000001');
ck('补充码同码递增', sp12[1].listCode12, '03B001000002');
ck('标准码不受影响', sp12[2].listCode12, '031001003001');
ck('空编码保持空', sp12[3].listCode12, '');
ck('长度统一12位', [sp12[0], sp12[1], sp12[2]].every(function (x) { return x.listCode12.length === 12; }), true);

console.log('\n== 概算模式（?mode=gs）：不套清单编码与项目特征 ==');
var capGG = null, capJG = null;
global.XLSX = {
  utils: {
    aoa_to_sheet: function (d) { return d; },
    book_new: function () { return {}; },
    book_append_sheet: function (wb, ws) { wb.__rows = ws; }
  },
  writeFile: function (wb, name) { if (/建经/.test(name)) capJG = wb.__rows; else capGG = wb.__rows; }
};
var gsRows = A.parseRows([[1, '球墨铸铁给水管 DN200', 80], [2, '室内排水铸铁管 DN100', 120]], '2026-10', 'glodon');
A.exportGLDGs(gsRows);
ck('概算广联达表头14列', capGG[0].length, 14);
ck('概算广联达无项目特征列', capGG[0].indexOf('项目特征'), -1);
ck('概算广联达无清单行', capGG.filter(function (r) { return r[9] === '清单行'; }).length, 0);
ck('概算广联达有定额行', capGG.filter(function (r) { return r[9] === '定额行'; }).length > 0, true);
ck('概算广联达行宽统一', capGG.filter(function (r) { return r.length && r.length !== 14; }).length, 0);
ck('概算广联达首行是定额行', capGG[1][9], '定额行');
ck('概算广联达首行项目名称', capGG[1][1], gsRows[0].name);
ck('概算广联达首行定额编码', capGG[1][8], gsRows[0].quotaCode);

A.exportJianjingGs(gsRows);
ck('概算建经表头6列', capJG[0].length, 6);
ck('概算建经无清单编码列', capJG[0].indexOf('清单编码'), -1);
ck('概算建经无项目特征列', capJG[0].indexOf('项目特征'), -1);
ck('概算建经行宽统一', capJG.filter(function (r) { return r.length && r.length !== 6; }).length, 0);
ck('概算建经保留定额编码', capJG[1][2], gsRows[0].quotaCode);

delete require.cache[require.resolve('../js/app.js')];
global.location = { search: '?mode=gs' };
var A2 = require('../js/app.js');
var capG2 = null;
global.XLSX.writeFile = function (wb, name) { if (/建经/.test(name)) capJG = wb.__rows; else capG2 = wb.__rows; };
A2.exportGLD(A2.parseRows([[1, '球墨铸铁给水管 DN200', 80]], '2026-10', 'glodon'));
ck('mode=gs 自动走概算导出', capG2[0].indexOf('项目特征'), -1);
delete global.location;

console.log('\n' + pass + ' 通过, ' + fail + ' 失败');
if (fail) process.exit(1);
