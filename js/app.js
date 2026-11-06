/* ============================================================
 * 给排水专业智能组价系统 - 核心逻辑
 * 依据：天津市安装工程工程量清单计价指引（2025版，2025-10-01施行）
 *       配套 天津市安装工程预算基价 第八册 给排水、采暖、燃气工程 DBD29-308-2020
 *
 * 已实现：铸铁管（031001001）、镀锌钢管（031001002）
 *   第八册 第一章 给排水、采暖管道安装
 *   一、室外管道
 *     7. 承插铸铁给水管（青铅接口）      8-90 ~ 8-99   DN75~500
 *     8. 承插铸铁给水管（膨胀水泥接口）  8-100 ~ 8-109 DN75~500
 *     9. 承插铸铁给水管（石棉水泥接口）  8-110 ~ 8-119 DN75~500
 *    10. 承插铸铁给水管（胶圈接口）      8-120 ~ 8-128 DN100~500（无DN75）
 *    11. 承插铸铁排水管（石棉水泥接口）  8-129 ~ 8-134 DN50~200（50/75/100/125/150/200）
 *    12. 承插铸铁排水管（水泥接口）      8-135 ~ 8-140 DN50~200
 *   二、室内管道
 *     9. 承插铸铁给水管（青铅接口）      8-336 ~ 8-341 DN75~300
 *    10. 承插铸铁给水管（膨胀水泥接口）  8-342 ~ 8-347 DN75~300
 *    11. 承插铸铁给水管（石棉水泥接口）  8-348 ~ 8-353 DN75~300
 *    12. 承插铸铁排水管（石棉水泥接口）  8-354 ~ 8-359 DN50~250（50/75/100/150/200/250）
 *    13. 承插铸铁排水管（水泥接口）      8-360 ~ 8-365 DN50~250
 *   注：室内给水无胶圈接口子目；排水只有石棉水泥/水泥两种接口子目。
 *
 * 镀锌钢管（清单 031001002 镀锌钢管，单位 10m）
 *     室外管道 镀锌钢管(螺纹连接)        8-1    ~ 8-11   DN15~150（15/20/25/32/40/50/65/80/100/125/150）
 *     室内管道 镀锌钢管(螺纹连接)        8-173  ~ 8-183  DN15~150（同上11档）
 *     室外燃气镀锌钢管(螺纹连接)         8-1128 ~ 8-1131 DN25/32/40/50
 *     室内燃气镀锌钢管(螺纹连接)         8-1132 ~ 8-1140 DN15/20/25/32/40/50/65/80/100
 *
 * 价格库见 data/prices.js
 * ============================================================ */

(function () {
  'use strict';

  // ---------- 清单编码 ----------
  var LIST = {
    castIron: { code: '031001001', name: '铸铁管' },
    galv: { code: '031001002', name: '镀锌钢管' },
    seamless: { code: '031001003', name: '无缝钢管' },
    welded: { code: '031001004', name: '焊接钢管' },
    copper: { code: '031001005', name: '铜管' },
    stainless: { code: '031001006', name: '不锈钢管' },
    composite: { code: '031001007', name: '复合管' },
    plastic: { code: '031001008', name: '塑料管' },
    preInsul: { code: '031001009', name: '直埋保温管' }
  };


  // ============================================================
  // 消防专业清单编码（消防电 030904001~030904018 / 消防水 030901001~030901013 / 调试 030909001）
  // ============================================================
  var F_LIST = {
    detPoint: { code: '030904001', name: '点型探测器' },
    detLinear: { code: '030904002', name: '线型探测器' },
    btn: { code: '030904003', name: '按钮' },
    soundLight: { code: '030904004', name: '声光报警器' },
    firePhone: { code: '030904005', name: '消防报警电话插孔（电话）' },
    fireBroadcast: { code: '030904006', name: '消防广播（扬声器）' },
    fireModule: { code: '030904007', name: '消防模块' },
    moduleBox: { code: '030904008', name: '消防模块箱（端子箱、手报箱）' },
    zoneCtrl: { code: '030904009', name: '区域报警控制器' },
    floorDisp: { code: '030904010', name: '楼层火灾显示器' },
    remoteCtrl: { code: '030904011', name: '远程控制器' },
    fireHost: { code: '030904012', name: '火灾报警系统控制主机' },
    linkageHost: { code: '030904013', name: '联动控制主机' },
    broadcastHost: { code: '030904014', name: '消防广播及对讲电话主机' },
    microComputer: { code: '030904015', name: '火灾报警控制微机' },
    backupPower: { code: '030904016', name: '备用电源及电池主机' },
    integrated: { code: '030904017', name: '报警联动一体机' },
    cabinet: { code: '030904018', name: '机柜' },
    sprinkler: { code: '030901003', name: '水喷淋（雾）喷头' },
    flowIndicator: { code: '030901006', name: '水流指示器' },
    orifice: { code: '030901007', name: '减压孔板' },
    hydrantIn: { code: '030901010', name: '室内消火栓' },
    hydrantOut: { code: '030901011', name: '室外消火栓' },
    testDevice: { code: '030901008', name: '末端试水装置' },
    siamese: { code: '030901012', name: '消防水泵接合器' },
    monitor: { code: '030901013', name: '消防水炮' },
    fireDebug: { code: '030909001', name: '水灭火控制装置调试' },
    conduit: { code: '030411001', name: '配管' },
    wiring: { code: '030411004', name: '配线' },
    bridge: { code: '030411003', name: '桥架' }
  };
  var F_LABEL = {
    detPoint: '点型探测器', detLinear: '线型探测器', btn: '按钮', soundLight: '声光报警器',
    firePhone: '消防电话', fireBroadcast: '消防广播', fireModule: '消防模块', moduleBox: '模块箱',
    zoneCtrl: '区域报警控制器', floorDisp: '楼层显示器', remoteCtrl: '远程控制器',
    fireHost: '火灾报警主机', linkageHost: '联动控制主机', broadcastHost: '广播/对讲主机',
    microComputer: '控制微机', backupPower: '备用电源', integrated: '报警联动一体机', cabinet: '机柜',
    sprinkler: '喷头', flowIndicator: '水流指示器', orifice: '减压孔板', hydrantIn: '室内消火栓',
    hydrantOut: '室外消火栓', testDevice: '末端试水装置', siamese: '水泵接合器', monitor: '消防水炮',
    fireDebug: '水灭火系统调试', conduit: '配管', wiring: '配线', bridge: '桥架'
  };
  var F_WORK = {
    detPoint: '探测器本体安装、底座固定、接线、编码、调试',
    detLinear: '探测器敷设、固定、接线、调试',
    btn: '按钮安装、接线、编码、调试',
    soundLight: '警报装置安装、接线、调试',
    firePhone: '电话分机/插孔安装、接线、调试',
    fireBroadcast: '扬声器安装、接线、调试',
    fireModule: '模块安装、接线、编码、调试',
    moduleBox: '箱体安装、固定、接线',
    zoneCtrl: '控制器安装、固定、接线、调试',
    floorDisp: '显示器安装、接线、调试',
    remoteCtrl: '远程控制器安装、接线、调试',
    fireHost: '主机安装、接线、系统调试（补充定额，需人工确认）',
    linkageHost: '联动控制器安装、接线、调试',
    broadcastHost: '广播/对讲设备安装、接线、调试',
    microComputer: '计算机及台柜安装、接线、调试',
    backupPower: '备用电源安装、接线、调试',
    integrated: '一体机安装、接线、调试',
    cabinet: '机柜安装、固定、接地',
    sprinkler: '喷头安装、试压、调试',
    flowIndicator: '水流指示器安装、接线、调试',
    orifice: '减压孔板安装',
    hydrantIn: '消火栓箱（含栓口、水枪、水带）安装、试压',
    hydrantOut: '室外消火栓安装、试压',
    testDevice: '末端试水装置安装、试压',
    siamese: '水泵接合器安装、试压',
    monitor: '消防水炮安装、接线、调试',
    fireDebug: '系统调试（不计主材）',
    conduit: '管路敷设、固定、接地连接',
    wiring: '管内穿线、接线',
    bridge: '桥架安装、固定、接地'
  };

  // ---------- 消防电定额常量 ----------
  // 点型探测器：多线制 7-139~7-143；总线制 7-144~7-148（单位 只）
  var DET_KINDS = [
    { key: 'beam', re: /红外光束|光束|线型光束/, name: '红外光束', multi: '7-141', bus: '7-146' },
    { key: 'flame', re: /火焰|紫外|红紫外/, name: '火焰', multi: '7-142', bus: '7-147' },
    { key: 'gasDet', re: /可燃气体|燃气探测|气体探测/, name: '可燃气体', multi: '7-143', bus: '7-148' },
    { key: 'heat', re: /感温|定温|差温|温感/, name: '感温', multi: '7-140', bus: '7-145' },
    { key: 'smoke', re: /感烟|光电|离子/, name: '感烟', multi: '7-139', bus: '7-144' }
  ];
  function detKindOf(key) {
    for (var i = 0; i < DET_KINDS.length; i++) if (DET_KINDS[i].key === key) return DET_KINDS[i];
    for (var j = 0; j < DET_KINDS.length; j++) if (DET_KINDS[j].key === 'smoke') return DET_KINDS[j];
    return DET_KINDS[0];
  }
  // 区域报警控制器 7-154~7-165
  var ZONE_TIERS = {
    multi_wall: [{ max: 32, code: '7-154' }, { max: 64, code: '7-155' }],
    multi_floor: [{ max: 32, code: '7-156' }, { max: 64, code: '7-157' }],
    bus_wall: [{ max: 200, code: '7-158' }, { max: 500, code: '7-159' }, { max: 1000, code: '7-160' }, { max: 99999, code: '7-161' }],
    bus_floor: [{ max: 200, code: '7-162' }, { max: 500, code: '7-163' }, { max: 1000, code: '7-164' }, { max: 99999, code: '7-165' }]
  };
  // 联动控制器 7-166~7-177
  var LINK_TIERS = {
    multi_wall: [{ max: 100, code: '7-166' }, { max: 99999, code: '7-167' }],
    multi_floor: [{ max: 100, code: '7-168' }, { max: 99999, code: '7-169' }],
    bus_wall: [{ max: 100, code: '7-170' }, { max: 200, code: '7-171' }, { max: 500, code: '7-172' }, { max: 99999, code: '7-173' }],
    bus_floor: [{ max: 100, code: '7-174' }, { max: 200, code: '7-175' }, { max: 500, code: '7-176' }, { max: 99999, code: '7-177' }]
  };
  // 报警联动一体机 7-178~7-185
  var INTEG_TIERS = {
    wall: [{ max: 500, code: '7-178' }, { max: 1000, code: '7-179' }, { max: 2000, code: '7-180' }, { max: 99999, code: '7-181' }],
    floor: [{ max: 500, code: '7-182' }, { max: 1000, code: '7-183' }, { max: 2000, code: '7-184' }, { max: 99999, code: '7-185' }]
  };
  // 广播及对讲电话主机 7-192~7-201
  var BCAST_TYPES = [
    { key: 'amp125', re: /125\s*W|125w/i, code: '7-192', name: '火灾事故广播安装 125W功放', unit: '台' },
    { key: 'amp250', re: /250\s*W|250w/i, code: '7-193', name: '火灾事故广播安装 250W功放', unit: '台' },
    { key: 'recorder', re: /录音机|录放机/, code: '7-194', name: '火灾事故广播安装 录音机', unit: '台' },
    { key: 'broadcastCab', re: /广播控制柜|广播柜/, code: '7-195', name: '火灾事故广播安装 消防广播控制柜', unit: '台' },
    { key: 'speaker', re: /吸顶/, code: '7-196', name: '火灾事故广播安装 吸顶式扬声器', unit: '个' },
    { key: 'wallSpeaker', re: /壁挂|音箱/, code: '7-197', name: '火灾事故广播安装 壁挂式音箱', unit: '个' },
    { key: 'distributor', re: /分配器/, code: '7-198', name: '火灾事故广播安装 广播分配器', unit: '台' },
    { key: 'phoneSwitch', re: /电话交换机|电话总机|交换机/, code: '7-199', name: '消防通信、报警备用电源安装 电话交换机 20门', unit: '台' }
  ];

  // ---------- 消防水定额常量 ----------
  var SPRINKLER_Q = {
    ceiling: { code: '7-11', name: '水喷头安装 公称直径15mm以内 有吊顶' },
    open: { code: '7-10', name: '水喷头安装 公称直径15mm以内 无吊顶' }
  };
  var FLOW_THREAD = [{ max: 50, code: '7-22' }, { max: 65, code: '7-23' }, { max: 80, code: '7-24' }, { max: 100, code: '7-25' }];
  var FLOW_FLANGE = [{ max: 50, code: '7-26' }, { max: 80, code: '7-27' }, { max: 100, code: '7-28' }, { max: 150, code: '7-29' }, { max: 200, code: '7-30' }];
  var ORIFICE_TIERS = [{ max: 50, code: '7-31' }, { max: 80, code: '7-32' }, { max: 100, code: '7-33' }, { max: 125, code: '7-34' }, { max: 150, code: '7-35' }];
  var HYDRANT_IN_Q = {
    single: { code: '7-53', name: '室内消火栓安装 公称直径65mm以内 单栓' },
    dual: { code: '7-54', name: '室内消火栓安装 公称直径65mm以内 双栓' }
  };
  var HYDRANT_OUT_Q = {
    under1: { code: '7-39', name: '室外地下式消火栓安装 1.0MPa 浅型' },
    under2: { code: '7-40', name: '室外地下式消火栓安装 1.0MPa 深Ⅰ型' },
    under3: { code: '7-41', name: '室外地下式消火栓安装 1.0MPa 深Ⅱ型' },
    above1: { code: '7-42', name: '室外地上式消火栓安装 1.6MPa 浅型' },
    above2: { code: '7-43', name: '室外地上式消火栓安装 1.6MPa 深Ⅰ型' },
    above3: { code: '7-44', name: '室外地上式消火栓安装 1.6MPa 深Ⅱ型' }
  };
  var TEST_DEVICE_TIERS = [{ max: 25, code: '7-36', name: '末端试水装置安装 公称直径25mm以内' }, { max: 32, code: '7-37', name: '末端试水装置安装 公称直径32mm以内' }];
  var SIAMESE_Q = {
    under: { max: 100, code: '7-55', name: '消防水泵接合器 地下式 100' },
    under150: { code: '7-56', name: '消防水泵接合器 地下式 150' },
    above: { max: 100, code: '7-57', name: '消防水泵接合器 地上式 100' },
    above150: { code: '7-58', name: '消防水泵接合器 地上式 150' },
    wall: { max: 100, code: '7-59', name: '消防水泵接合器 墙壁式 100' },
    wall150: { code: '7-60', name: '消防水泵接合器 墙壁式 150' }
  };
  var MONITOR_TIERS = [{ max: 50, code: '7-66', name: '电控式消防水炮安装 进口口径50mm以内' }, { max: 80, code: '7-67', name: '电控式消防水炮安装 进口口径80mm以内' }, { max: 100, code: '7-68', name: '电控式消防水炮安装 进口口径100mm以内' }];
  var FIRE_DEBUG_Q = {
    hydrant: { code: '7-215', name: '水灭火控制装置调试 消火栓灭火系统' },
    sprinkler: { code: '7-216', name: '水灭火控制装置调试 自动喷水灭火系统' },
    monitor: { code: '7-217', name: '水灭火控制装置调试 消防水炮控制装置调试' }
  };

  // ---------- 配管 / 配线 / 桥架定额常量（与电气站同口径，第二册）----------
  var STEEL_DN = [15, 20, 25, 32, 40, 50, 70, 80, 100, 125, 150];
  var STEEL_CODE = { surface: 1139, concealed: 1150 };
  var TUBE_DN = [15, 20, 25, 32, 40, 50];
  var TUBE_CODE = { surface: 1117, concealed: 1123 };
  var LIGHT_SEC = [1.5, 2.5, 4];
  var LIGHT_CODE0 = 1318;
  var POWER_WIRE_SEC = [0.2, 0.3, 0.4, 0.5, 0.75, 1.0, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
  var POWER_WIRE_CODE0 = 1335;
  var SOFT_CORES = [2, 4, 6, 8, 10, 12, 14, 16];
  var SOFT_CODE0 = 1359;
  var SOFT_SEC = [0.5, 0.75, 1.0, 1.5];
  var CN_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六'];
  function cnNum(n) { return CN_NUM[n] || String(n); }
  var BRIDGE_W = [150, 300, 400, 500, 600, 800, 1500];
  var BRIDGE_CODE0 = 637;

  function isFireCat(c) { return !!F_LIST[c]; }
  function isFireElecCat(c) {
    return ['detPoint', 'detLinear', 'btn', 'soundLight', 'firePhone', 'fireBroadcast', 'fireModule',
      'moduleBox', 'zoneCtrl', 'floorDisp', 'remoteCtrl', 'fireHost', 'linkageHost', 'broadcastHost',
      'microComputer', 'backupPower', 'integrated', 'cabinet'].indexOf(c) >= 0;
  }
  function isFireWaterCat(c) {
    return ['sprinkler', 'flowIndicator', 'orifice', 'hydrantIn', 'hydrantOut', 'testDevice',
      'siamese', 'monitor', 'fireDebug'].indexOf(c) >= 0;
  }
  function isElecCat(c) { return c === 'conduit' || c === 'wiring' || c === 'bridge'; }

  // 消防水（湿式/干式/雨淋/水幕/消火栓/喷淋/水炮）——用于管道默认连接方式
  function isFireWaterName(name) {
    return /消防|喷淋|消火栓|水炮|湿式|干式|雨淋|水幕|预作用/.test(String(name || ''));
  }

  // 配管 / 配线 / 桥架识别（与电气站同口径）
  function elecCatOf(name) {
    var n = String(name || '');
    if (!n) return null;
    if (/桥架|线槽|槽式|梯式|托盘|托盘式/.test(n) && !/支架/.test(n)) return 'bridge';
    if (/配管|穿线管|电线管|钢管|金属软管|可挠|刚性阻燃|半硬质/.test(n) &&
        /(?:SC|RC|JDG|KBG|PC|FPC|MT|CP)\s*[-]?\s*\d{2,3}|配管|穿线管|电线管|刚性阻燃|可挠|金属软管/.test(n) &&
        !/管道|水管|给水|排水|消防水|喷淋管/.test(n)) return 'conduit';
    if (/配线|穿线|电线|导线|绝缘线|双绞线|控制线|广播线|电话线|信号线|总线(?!制)/.test(n) &&
        !/电缆桥架|桥架|线槽/.test(n)) return 'wiring';
    if (/(?:^|[^A-Za-z])(?:BV|BVR|BYJ|RVS|RVB|NH|ZR|WDZ)/i.test(n) && !/管道/.test(n)) return 'wiring';
    return null;
  }

  // 消防专业分类（顺序敏感：特殊设备优先于通用阀门/管道）
  function fireCatOf(name) {
    var n = String(name || '');
    if (!n) return null;
    // ---- 配管 / 配线 / 桥架 ----
    var e = elecCatOf(n);
    if (e) return e;
    // 明确为"管道/水管"的（如消火栓管道、喷淋管道）交给管道逻辑
    if (/(管道|水管)/.test(n)) return null;
    // ---- 消防电 ----
    if (/线型(感温|感烟|探测器)|缆式|光纤感温|感温光纤|分布式光纤/.test(n)) return 'detLinear';
    if (/点型|感烟|感温|红外光束|光束感烟|火焰探测|可燃气体探测|气体探测|探测器/.test(n)) return 'detPoint';
    if (/声光报警|声光警报/.test(n)) return 'soundLight';
    if (/警铃/.test(n)) return 'soundLight';
    if (/广播.*主机|功放|广播分配器|广播控制柜|电话交换机|对讲主机|消防广播及对讲|广播及对讲/.test(n)) return 'broadcastHost';
    if (/电话插孔|消防电话|电话分机|对讲电话|电话主机/.test(n)) return 'firePhone';
    if (/消防广播|扬声器|吸顶喇叭|广播喇叭|音箱/.test(n)) return 'fireBroadcast';
    if (/模块箱|端子箱|手报箱|接线箱/.test(n)) return 'moduleBox';
    if (/消防模块|控制模块|监视模块|报警模块|输入模块|输出模块|接口模块|模块/.test(n)) return 'fireModule';
    if (/楼层.*显示|重复显示/.test(n)) return 'floorDisp';
    if (/远程控制器/.test(n)) return 'remoteCtrl';
    if (/区域报警控制器|火灾报警控制器|报警控制器/.test(n)) return 'zoneCtrl';
    if (/火灾报警.*(控制主机|主机)|报警控制主机|火灾报警主机/.test(n)) return 'fireHost';
    if (/联动控制(主机|器)/.test(n)) return 'linkageHost';
    if (/控制微机|图形显示装置|上位机|计算机/.test(n)) return 'microComputer';
    if (/备用电源|电池主机|蓄电池|UPS/i.test(n)) return 'backupPower';
    if (/报警联动一体机|联动一体机|一体机/.test(n)) return 'integrated';
    if (/机柜|机架/.test(n)) return 'cabinet';
    // 其他类型主机兜底（电气火灾监控主机、消防电源监控主机、防火门监控主机、可燃气体报警主机等）
    // 按火灾报警系统控制主机 030904012 口径 + 市场价计列，结果表提示核对清单编码
    if (/主机|监控器|控制盘/.test(n)) return 'fireHost';
    if (/按钮|手报/.test(n)) return 'btn';
    // ---- 消防水 ----
    if (/水灭火控制装置调试|灭火系统调试|系统调试/.test(n)) return 'fireDebug';
    if (/喷头/.test(n)) return 'sprinkler';
    if (/水流指示器|指示器/.test(n)) return 'flowIndicator';
    if (/减压孔板|孔板/.test(n)) return 'orifice';
    if (/室外消火栓/.test(n)) return 'hydrantOut';
    if (/室内消火栓|消火栓/.test(n)) return 'hydrantIn';
    if (/末端试水/.test(n)) return 'testDevice';
    if (/水泵接合器|接合器/.test(n)) return 'siamese';
    if (/消防水炮|水炮|自动射流/.test(n)) return 'monitor';
    return null;
  }

  // ---------- 阀门及管道附件（与暖通站同口径）----------
  var V_LIST = {
    waterValve: { code: '031002001', name: '金属阀门' },
    autoAir: { code: '031002303', name: '自动排气阀' },
    tempValve: { code: '031002306', name: '散热器温控阀' },
    floatValve: { code: '031002301', name: '法兰浮球阀' },
    levelValve: { code: '031002302', name: '液压水位控制阀' },
    flushValve: { code: '031002304', name: '口部冲洗阀' },
    solenoidValve: { code: '031002305', name: '电磁阀' }
  };
  var V_LABEL = {
    waterValve: '金属阀门', autoAir: '自动排气阀', tempValve: '散热器温控阀',
    floatValve: '法兰浮球阀', levelValve: '液压水位控制阀', flushValve: '口部冲洗阀', solenoidValve: '电磁阀'
  };
  var V_WORK = {
    waterValve: '阀体安装、螺纹/法兰连接、试压、调试',
    autoAir: '阀体安装、螺纹连接、试压、调试',
    tempValve: '温控阀及传感器安装、连接、调试',
    floatValve: '阀体安装、法兰连接、试压、调试',
    levelValve: '阀体安装、法兰连接、试压、调试',
    flushValve: '壁龛（地坑）门框及扇（盖）制作安装、阀安装、刷油、水压试验',
    solenoidValve: '阀体安装、螺纹/法兰连接、接线、试压、调试'
  };
  function TT(max, code, label) { return { max: max, code: code, label: label }; }
  var V_WTHREAD = [TT(15, '8-579', '15mm以内'), TT(20, '8-580', '20mm以内'), TT(25, '8-581', '25mm以内'),
    TT(32, '8-582', '32mm以内'), TT(40, '8-583', '40mm以内'), TT(50, '8-584', '50mm以内')];
  var V_WFLANGE = [TT(65, '8-620', '65mm以内'), TT(80, '8-621', '80mm以内'), TT(100, '8-622', '100mm以内'),
    TT(125, '8-623', '125mm以内'), TT(150, '8-624', '150mm以内'), TT(200, '8-625', '200mm以内'),
    TT(250, '8-626', '250mm以内'), TT(300, '8-627', '300mm以内'), TT(350, '8-628', '350mm以内'),
    TT(400, '8-629', '400mm以内')];
  var V_FLOAT = [TT(32, '8-612', '32mm以内'), TT(50, '8-613', '50mm以内'), TT(80, '8-614', '80mm以内'),
    TT(100, '8-615', '100mm以内'), TT(150, '8-616', '150mm以内')];
  var V_LEVEL = [TT(50, '8-645', '50mm以内'), TT(80, '8-646', '80mm以内'), TT(100, '8-647', '100mm以内'),
    TT(150, '8-648', '150mm以内'), TT(200, '8-649', '200mm以内')];
  var V_STHREAD = [TT(15, '8-603', '15mm以内'), TT(20, '8-604', '20mm以内'), TT(25, '8-605', '25mm以内'),
    TT(32, '8-606', '32mm以内'), TT(40, '8-607', '40mm以内'), TT(50, '8-608', '50mm以内')];
  var V_SFLANGE = [TT(32, '8-630', '32mm以内'), TT(40, '8-631', '40mm以内'), TT(50, '8-632', '50mm以内'),
    TT(65, '8-633', '65mm以内'), TT(80, '8-634', '80mm以内'), TT(100, '8-635', '100mm以内'),
    TT(125, '8-636', '125mm以内'), TT(150, '8-637', '150mm以内'), TT(200, '8-638', '200mm以内'),
    TT(250, '8-639', '250mm以内'), TT(300, '8-640', '300mm以内'), TT(350, '8-641', '350mm以内'),
    TT(400, '8-642', '400mm以内'), TT(450, '8-643', '450mm以内'), TT(500, '8-644', '500mm以内')];

  function valveCfg() {
    return (typeof window !== 'undefined' && window.PIPE_VALVE_PRICES) || {};
  }
  function isValveCat(c) { return !!V_LIST[c]; }
  // 国标公称直径系列（用于「阀门-300」这类只给数字的写法校验）
  var DN_STD = [15,20,25,32,40,50,65,80,100,125,150,200,250,300,350,400,450,500,600,700,800,900,1000,1200,1400,1600,1800,2000];
  function parseVDn(name) {
    var s2 = String(name || '');
    var m = s2.match(/(?:DN|dn|De|de|D|Φ|φ|Ø)\s*[-－]?\s*(\d{2,4})/);
    if (m) return parseInt(m[1], 10);
    m = s2.match(/(\d{2,4})\s*(?:mm|MM|毫米)/);
    if (m) return parseInt(m[1], 10);
    // 水阀「阀门-300」写法：-300 即 DN300（与暖通站圆形风道阀门同口径）
    // 只认国标 DN 系列，避免 -16(压力) / -220(电压) 之类被误判为公称直径
    m = s2.match(/[-－—–_]\s*(\d{2,4})\s*(MPa|Mpa|mpa|PN|℃|°C|V|伏|公斤|元|个|台|套|片)?\s*$/);
    if (m) {
      var dv = parseInt(m[1], 10);
      var isPress = /MPa|Mpa|mpa|PN|公斤|压力/.test(s2);
      var isVolt = /电动|电磁/.test(s2) && [12, 24, 36, 110, 220, 380].indexOf(dv) >= 0;
      if (!m[2] && !isPress && !isVolt && DN_STD.indexOf(dv) >= 0) return dv;
    }
    return null;
  }
  function valveKindOf(name) {
    var s2 = String(name || '');
    if (/闸阀/.test(s2)) return 'gate';
    if (/截止阀/.test(s2)) return 'globe';
    if (/蝶阀/.test(s2)) return 'butterfly';
    if (/止回阀|逆止阀/.test(s2)) return 'check';
    if (/Y型过滤器|y型过滤器|过滤器/.test(s2)) return 'strainer';
    if (/球阀/.test(s2)) return 'ball';
    return 'market';
  }
  // 阀门识别（给排水站无风阀，含"阀"且带 DN 即可判为水阀）
  function valveCatOf(name) {
    var n = String(name || '');
    if (/口部冲洗/.test(n)) return 'flushValve';
    if (/电磁阀/.test(n)) return 'solenoidValve';
    if (/自动排气阀|放风阀/.test(n)) return 'autoAir';
    if (/温控阀/.test(n)) return 'tempValve';
    if (/浮球阀/.test(n)) return 'floatValve';
    if (/水位控制阀/.test(n)) return 'levelValve';
    if (/闸阀|截止阀|蝶阀|球阀|止回阀|逆止阀|Y型过滤器|y型过滤器|过滤器|软接头|橡胶软接头|补偿器|波纹补偿器|平衡阀|减压阀|水阀/.test(n)) return 'waterValve';
    if (/阀/.test(n) && parseVDn(n) && !/阀门井|阀室|阀门套/.test(n)) return 'waterValve';
    return null;
  }
  function buildValveItem(name, cat) {
    var it = {};
    it.name = name;
    it.category = cat;
    it.isValve = true;
    it.listCode = V_LIST[cat].code;
    it.listName = V_LIST[cat].name;
    it.material = V_LABEL[cat];
    it.dn = parseVDn(name);
    it.unit = (cat === 'flushValve') ? '套' : '个';
    it.valveKind = valveKindOf(name);
    var vc = valveCfg();
    if (cat === 'waterValve') {
      var inf = (vc.info || {})[it.valveKind];
      it.brand = inf ? '' : (vc.brand || '');
    } else if (cat === 'solenoidValve') {
      it.brand = (vc.solenoid || {}).brand || '';
    } else if (cat === 'flushValve') {
      it.brand = ((vc.special || {}).flush || {}).brand || '';
    } else {
      var key = { autoAir: 'autoAir', tempValve: 'temp', floatValve: 'float', levelValve: 'level' }[cat];
      var sp = (vc.special || {})[key] || {};
      it.brand = (sp.source === 'info') ? '' : (sp.brand || vc.brand || '');
    }
    return it;
  }
  function nearIdxV(arr, v) {
    if (!(v > 0)) return 0;
    for (var i = 0; i < arr.length; i++) if (v <= arr[i]) return i;
    return arr.length - 1;
  }
  function tierIdxV(tiers, dn) {
    for (var i = 0; i < tiers.length; i++) if (dn <= tiers[i].max) return i;
    return tiers.length - 1;
  }

  // ---------- 管道支架 / 保温绝热（与暖通站同口径）----------
  var AUX_LIST = {
    bracket: { code: '031301005', name: '支/吊架、基础型钢' },
    insulRubber: { code: '031208002', name: '其他管道绝热' },
    insulGlass: { code: '031208002', name: '其他管道绝热' }
  };
  var AUX_LABEL = { bracket: '管道支架', insulRubber: '橡塑保温', insulGlass: '离心玻璃棉' };
  function auxCfg() {
    return (typeof window !== 'undefined' && window.PIPE_AUX_PRICES) || {};
  }
  function isAuxCat(c) { return !!AUX_LIST[c]; }
  // 保温/支架优先于管道识别（"橡塑保温管""管道支架"都含"管"）
  function auxCatOf(name) {
    var n = String(name || '');
    if (/橡塑/.test(n)) return 'insulRubber';
    if (/玻璃棉/.test(n)) return 'insulGlass';
    if (/管道支架|支吊架|支架制作|支架安装|支架制安/.test(n)) return 'bracket';
    return null;
  }
  function buildAuxItem(name, cat) {
    var it = {};
    it.name = name;
    it.category = cat;
    it.isAux = true;
    it.listCode = AUX_LIST[cat].code;
    it.listName = AUX_LIST[cat].name;
    it.material = AUX_LABEL[cat];
    it.dn = parseDN(name);
    it.unit = (cat === 'bracket') ? 'kg' : 'm³';
    var cfg = auxCfg();
    if (cat === 'insulRubber') it.insulThk = (cfg.insul && cfg.insul.rubber.thk) || 30;
    if (cat === 'insulGlass') it.insulThk = (cfg.insul && cfg.insul.glass.thk) || 40;
    return it;
  }
  function matchAuxQuota(it) {
    var c = it.category;
    if (c === 'bracket') return { code: '7-138', name: '管道支吊架制作、安装 管道支吊架', inferred: false, unit: '100kg', factor: 100 };
    if (c === 'insulRubber') return { code: '11-582', name: '管道橡塑保温壳安装（管道） D133以内', inferred: false, unit: 'm³', factor: 1 };
    if (c === 'insulGlass') return { code: '11-647', name: '带铝箔离心玻璃棉安装 通风管道 厚度40mm', inferred: false, unit: 'm³', factor: 1 };
    return { code: '', name: '', inferred: false };
  }
  function auxPrice(it) {
    var cfg = auxCfg();
    if (it.category === 'bracket') {
      var b = cfg.bracket || { steel: 4.2 };
      return { price: b.steel, source: 'info', basis: '信息价：型钢（角钢、槽钢）' + b.steel + '元/kg' };
    }
    var k = it.category === 'insulRubber' ? 'rubber' : 'glass';
    var m = (cfg.insul || {})[k] || { price: 0, brand: '', name: '' };
    return {
      price: m.price, source: 'market', brand: m.brand,
      basis: '市场价（' + m.brand + '）：' + m.name + ' ' + m.price + '元/m³'
    };
  }
  function bracketWeightPerM(dn) {
    var t = (auxCfg().bracket || {}).weightPerM || [{ max: 9999, w: 0.6 }];
    if (!(dn > 0)) return 0.60;
    for (var i = 0; i < t.length; i++) if (dn <= t[i].max) return t[i].w;
    return t[t.length - 1].w;
  }
  // 管道清单全部套完后自动补「管道支架」一行；原表已含支架则不重复
  function withBracket(items) {
    var totalM = 0, kg = 0, hasPipe = false, hasBracket = false;
    items.forEach(function (it) {
      if (it.category === 'bracket') hasBracket = true;
      if (isAuxCat(it.category) || isValveCat(it.category)) return;
      // 仅按管道（含消防水管道）长度估算支架；消防设备、配管配线桥架不计
      var isPipeRow = it.category === 'galv' || it.category === 'castIron' || !!PIPE_GROUPS[it.category];
      if (!isPipeRow) return;
      if (!(it.quantity > 0)) return;
      hasPipe = true;
      totalM += it.quantity;
      kg += it.quantity * bracketWeightPerM(it.dn);
    });
    if (!hasPipe || hasBracket) return items;
    kg = Math.round(kg * 10) / 10;
    if (!(kg > 0)) return items;
    var it = buildAuxItem('管道支架', 'bracket');
    it.index = String(items.length + 1);
    it.quantity = kg;
    it.loc = null; it.joint = null;
    var q = matchAuxQuota(it);
    it.quotaCode = q.code; it.quotaName = q.name; it.quotaUnit = q.unit; it.quotaFactor = q.factor;
    it.codeInferred = false; it.extras = [];
    var pr = auxPrice(it);
    it.price = pr.price; it.priceSource = pr.source; it.priceBasis = pr.basis; it.priceBrand = pr.brand || '';
    it.warn = '管道支架为自动补项：按管道总长 ' + Math.round(totalM) + 'm 与管径分档含量估算约 ' + kg +
      'kg（0.45~3.2kg/m），定额 7-138 计量单位为 100kg，请按图纸支架实际重量调整';
    it.features = featureText(it);
    items.push(it);
    return items;
  }

  // ---------- 其他管材定额组（2026-11-02 补充）----------
  // 每组：loc 室内/室外；joint 连接方式；medium 介质（water/gas/drain/rain，默认 water）
  //       start 首个子目号；dns 依次对应的管径档；name 子目名称
  var GROOVE_FITTING = { start: 220, dns: [65, 80, 100, 125, 150, 200, 250], name: '室内管道 钢管沟槽连接管件', unit: '10个', factor: 10 };
  var PIPE_FLUSH = { start: 490, dns: [50, 100, 200, 300, 400, 500], name: '管道消毒冲洗', unit: '100m', factor: 100 };
  var PLASTIC_OUT_DNS = [32, 40, 50, 63, 75, 90, 110, 125, 160, 200, 250, 315];
  var PLASTIC_IN_DNS = [20, 25, 32, 40, 50, 63, 75, 90, 110, 125, 160];
  var PLASTIC_DRAIN_DNS = [50, 75, 110, 160, 200, 250];
  var PIPE_GROUPS = {
    seamless: [
      { loc: 'out', joint: 'weld', start: 23, dns: [32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300, 350, 400], name: '室外管道 钢管(焊接)' },
      { loc: 'in', joint: 'weld', start: 195, dns: [32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300], name: '室内管道 钢管(焊接)' },
      { loc: 'in', joint: 'groove', start: 206, dns: [65, 80, 100, 125, 150, 200, 250], name: '室内管道 钢管(沟槽连接)' }
    ],
    welded: [
      { loc: 'out', joint: 'weld', start: 23, dns: [32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300, 350, 400], name: '室外管道 钢管(焊接)' },
      { loc: 'in', joint: 'weld', start: 195, dns: [32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300], name: '室内管道 钢管(焊接)' },
      { loc: 'in', joint: 'groove', start: 206, dns: [65, 80, 100, 125, 150, 200, 250], name: '室内管道 钢管(沟槽连接)' }
    ],
    copper: [
      { loc: 'in', joint: 'press', start: 309, dns: [18, 22, 28, 35, 42, 54, 76, 89, 108], name: '室内管道 铜管(卡压连接)' },
      { loc: 'in', joint: 'oxy', start: 318, dns: [18, 22, 28, 35, 42, 54, 76, 89, 108], name: '室内管道 铜管(氧乙炔焊)' },
      { loc: 'in', joint: 'braze', start: 327, dns: [18, 22, 28, 35, 42, 54, 76, 89, 108], name: '室内管道 铜管(钎焊)' }
    ],
    stainless: [
      { loc: 'in', joint: 'press', start: 261, dns: [15, 20, 25, 32, 40, 50, 65, 80, 100], name: '室内管道 薄壁不锈钢管(卡压连接)' },
      { loc: 'in', joint: 'sleeve', start: 270, dns: [15, 20, 25, 32, 40, 50, 65, 80, 100], name: '室内管道 薄壁不锈钢管(卡套连接)' },
      { loc: 'in', joint: 'argon', start: 279, dns: [15, 20, 25, 32, 40, 50, 65, 80, 100], name: '室内管道 薄壁不锈钢管(承插氩弧焊)' },
      { loc: 'in', joint: 'thread', start: 288, dns: [15, 20, 25, 32, 40, 50, 65, 80, 100], name: '室内管道 不锈钢管(螺纹连接)' },
      { loc: 'in', joint: 'arc', start: 297, dns: [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200], name: '室内管道 不锈钢管(对接电弧焊)' },
      { loc: 'in', joint: 'argon', medium: 'gas', start: 1141, dns: [25, 32, 40, 50, 65, 80, 100], name: '室内燃气不锈钢管(承插氩弧焊)' },
      { loc: 'in', joint: 'sleeve', medium: 'gas', start: 1148, dns: [15, 20, 25, 32, 40, 50], name: '室内燃气不锈钢管(卡套连接)' },
      { loc: 'in', joint: 'press', medium: 'gas', start: 1154, dns: [15, 20, 25, 32, 40, 50], name: '室内燃气不锈钢管(卡压连接)' }
    ],
    composite: [
      { loc: 'out', joint: 'electro', start: 81, dns: [32, 40, 50, 63, 75, 90, 110, 125, 160], name: '室外管道 钢骨架塑料复合管(电熔连接)' },
      { loc: 'in', joint: 'press', start: 227, dns: [20, 25, 32, 40, 50, 63], name: '室内管道 铝塑复合管(卡压连接)' },
      { loc: 'in', joint: 'sleeve', start: 233, dns: [20, 25, 32, 40, 50, 63], name: '室内管道 铝塑复合管(卡套连接)' },
      { loc: 'in', joint: 'fusion', start: 239, dns: [20, 25, 32, 40, 50, 63, 75, 90, 110, 125, 160], name: '室内管道 铝塑复合管(热熔连接)' },
      { loc: 'in', joint: 'electro', start: 250, dns: [20, 25, 32, 40, 50, 63, 75, 90, 110, 125, 160], name: '室内管道 钢骨架塑料复合管(电熔连接)' }
    ],
    plastic: [
      { loc: 'out', joint: 'fusion', start: 36, dns: PLASTIC_OUT_DNS, name: '室外管道 塑料给水管(热熔连接)' },
      { loc: 'out', joint: 'electro', start: 48, dns: PLASTIC_OUT_DNS, name: '室外管道 塑料给水管(电熔连接)' },
      { loc: 'out', joint: 'glue', start: 60, dns: PLASTIC_OUT_DNS, name: '室外管道 塑料给水管(粘接)' },
      { loc: 'in', joint: 'fusion', start: 410, dns: PLASTIC_IN_DNS, name: '室内管道 塑料给水管(热熔连接)' },
      { loc: 'in', joint: 'electro', start: 421, dns: PLASTIC_IN_DNS, name: '室内管道 塑料给水管(电熔连接)' },
      { loc: 'in', joint: 'glue', start: 432, dns: PLASTIC_IN_DNS, name: '室内管道 塑料给水管(粘接)' },
      { loc: 'in', joint: 'glue', medium: 'drain', start: 377, dns: PLASTIC_DRAIN_DNS, name: '室内管道 塑料排水管(粘接)' },
      { loc: 'in', joint: 'fusion', medium: 'drain', start: 383, dns: PLASTIC_DRAIN_DNS, name: '室内管道 塑料排水管(热熔连接)' },
      { loc: 'in', joint: 'glue', medium: 'rain', start: 405, dns: [75, 110, 160, 200, 250], name: '室内管道 塑料雨水管(粘接)' }
    ]
  };
  var JOINT_CN2 = {
    weld: '焊接', groove: '沟槽连接（卡箍）', press: '卡压连接', sleeve: '卡套连接',
    argon: '承插氩弧焊', thread: '螺纹连接', arc: '对接电弧焊', oxy: '氧乙炔焊',
    braze: '钎焊', fusion: '热熔连接', electro: '电熔连接', glue: '粘接'
  };

  // ---------- 铸铁管定额矩阵 ----------
  // start：该接口形式第一个子目号；dns：依次对应的公称直径档
  var CAST_IRON = {
    out_water: {
      lead: { start: 90, dns: [75, 100, 150, 200, 250, 300, 350, 400, 450, 500], name: '室外管道 承插铸铁给水管(青铅接口)' },
      expand: { start: 100, dns: [75, 100, 150, 200, 250, 300, 350, 400, 450, 500], name: '室外管道 承插铸铁给水管(膨胀水泥接口)' },
      asbestos: { start: 110, dns: [75, 100, 150, 200, 250, 300, 350, 400, 450, 500], name: '室外管道 承插铸铁给水管(石棉水泥接口)' },
      rubber: { start: 120, dns: [100, 150, 200, 250, 300, 350, 400, 450, 500], name: '室外管道 承插铸铁给水管(胶圈接口)' }
    },
    out_drain: {
      asbestos: { start: 129, dns: [50, 75, 100, 125, 150, 200], name: '室外管道 承插铸铁排水管(石棉水泥接口)' },
      cement: { start: 135, dns: [50, 75, 100, 125, 150, 200], name: '室外管道 承插铸铁排水管(水泥接口)' }
    },
    in_water: {
      lead: { start: 336, dns: [75, 100, 150, 200, 250, 300], name: '室内管道 承插铸铁给水管(青铅接口)' },
      expand: { start: 342, dns: [75, 100, 150, 200, 250, 300], name: '室内管道 承插铸铁给水管(膨胀水泥接口)' },
      asbestos: { start: 348, dns: [75, 100, 150, 200, 250, 300], name: '室内管道 承插铸铁给水管(石棉水泥接口)' }
    },
    in_drain: {
      asbestos: { start: 354, dns: [50, 75, 100, 150, 200, 250], name: '室内管道 承插铸铁排水管(石棉水泥接口)' },
      cement: { start: 360, dns: [50, 75, 100, 150, 200, 250], name: '室内管道 承插铸铁排水管(水泥接口)' }
    }
  };

  // ---------- 镀锌钢管定额矩阵 ----------
  var GALV = {
    out_water: { thread: { start: 1, dns: [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150], name: '室外管道 镀锌钢管(螺纹连接)' } },
    in_water: {
      thread: { start: 173, dns: [15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150], name: '室内管道 镀锌钢管(螺纹连接)' },
      groove: { start: 206, dns: [65, 80, 100, 125, 150, 200, 250], name: '室内管道 钢管(沟槽连接)' }
    },
    out_gas: { thread: { start: 1128, dns: [25, 32, 40, 50], name: '室外燃气镀锌钢管(螺纹连接)' } },
    in_gas: { thread: { start: 1132, dns: [15, 20, 25, 32, 40, 50, 65, 80, 100], name: '室内燃气镀锌钢管(螺纹连接)' } }
  };

  var JOINT_CN = { lead: '青铅接口', expand: '膨胀水泥接口', asbestos: '石棉水泥接口', rubber: '胶圈接口', cement: '水泥接口', thread: '螺纹连接', gas_thread: '螺纹连接（燃气）' };
  var JOINT_ORDER = ['asbestos', 'cement', 'lead', 'expand', 'rubber'];
  var JOINT_ORDER_GALV = ['thread', 'gas_thread'];
  var LOC_CN = { in: '室内', out: '室外' };
  var MEDIUM_CN = { water: '给水', drain: '排水', gas: '燃气' };

  function ruleTable(it) { return it && it.category === 'galv' ? GALV : CAST_IRON; }
  // 定额分组键：铸铁 → 室内外+给排水；镀锌 → 室内外+给水/燃气（按所选连接方式区分燃气）
  function pipeKey(it) {
    var loc = it.loc === 'out' ? 'out_' : 'in_';
    if (it.category === 'galv') return loc + (it.joint === 'gas_thread' ? 'gas' : 'water');
    return loc + (it.medium === 'drain' ? 'drain' : 'water');
  }
  var JOINT_PREFER = ['weld', 'groove', 'press', 'fusion', 'electro', 'glue', 'argon', 'arc', 'sleeve', 'thread', 'oxy', 'braze'];
  function jointsOf(it) {
    // 镀锌钢管：室外/室内均有普通与燃气两组螺纹连接子目，故两种连接方式始终可选
    if (it && it.category === 'galv') {
      if (it.isFireWater && it.loc !== 'out') return ['groove', 'thread'];
      return ['thread', 'gas_thread'];
    }
    if (it && PIPE_GROUPS[it.category]) {
      var gs = PIPE_GROUPS[it.category];
      var mk = mediumKeyOf(it);
      var out = [];
      gs.forEach(function (g) {
        if (g.loc !== it.loc) return;
        if ((g.medium || 'water') !== mk) return;
        if (out.indexOf(g.joint) < 0) out.push(g.joint);
      });
      if (!out.length) {
        // 介质无对应子目（如塑料雨水管无热熔子目）：回退到同部位给水/排水组
        gs.forEach(function (g) {
          if (g.loc !== it.loc) return;
          var m = g.medium || 'water';
          if (m === 'gas') return;
          if (out.indexOf(g.joint) < 0) out.push(g.joint);
        });
      }
      out.sort(function (a, b) { return JOINT_PREFER.indexOf(a) - JOINT_PREFER.indexOf(b); });
      return out;
    }
    var tbl = ruleTable(it)[pipeKey(it)] || {};
    var order = it && it.category === 'galv' ? JOINT_ORDER_GALV : JOINT_ORDER;
    return order.filter(function (j) { return !!tbl[j]; });
  }
  function defaultJoint(it) {
    var list = jointsOf(it);
    if (it && it.category === 'galv') return list.indexOf('thread') >= 0 ? 'thread' : (list[0] || 'thread');
    if (it && PIPE_GROUPS[it.category]) {
      // 优先名称中已注明的连接方式
      var pj = parsePipeJoint(it.name || '');
      if (pj && list.indexOf(pj) >= 0) return pj;
      return list[0] || '';
    }
    return list.indexOf('asbestos') >= 0 ? 'asbestos' : (list[0] || 'asbestos');
  }

  // ---------- 消防水系统调试自动补项（030909001）----------
  function withDebug(items) {
    var hyd = 0, flow = 0, spr = 0, mon = 0, hasDbg = false;
    items.forEach(function (it) {
      if (it.category === 'fireDebug') hasDbg = true;
      else if (it.category === 'hydrantIn') hyd += it.quantity;
      else if (it.category === 'flowIndicator') flow += it.quantity;
      else if (it.category === 'sprinkler') spr += it.quantity;
      else if (it.category === 'monitor') mon += it.quantity;
    });
    if (hasDbg) return items;
    if (!(hyd > 0) && !(flow > 0) && !(spr > 0) && !(mon > 0)) return items;
    var out = items;
    function add(kind, qty, note) {
      var it = buildFireItem(FIRE_DEBUG_Q[kind].name, 'fireDebug');
      it.debugKind = kind;
      it.quantity = qty;
      it.unit = '点';
      it.autoAdded = true;
      it.index = String(out.length + 1);
      var q = matchFireQuota(it);
      it.quotaCode = q.code; it.quotaName = q.name; it.quotaUnit = q.unit; it.quotaFactor = q.factor;
      it.codeInferred = false; it.extras = [];
      it.price = null; it.priceSource = 'na'; it.priceBasis = '系统调试不计主材价'; it.priceBrand = '';
      it.warn = '系统调试为自动补项：' + note + '，不计主材价，请核对';
      it.features = featureText(it);
      out.push(it);
    }
    if (hyd > 0) add('hydrant', hyd, '按室内消火栓 ' + round4(hyd) + ' 套计');
    if (flow > 0) add('sprinkler', flow, '按水流指示器 ' + round4(flow) + ' 个计');
    else if (spr > 0) add('sprinkler', 1, '无水流指示器，按 1 个报警阀组（系统）计');
    if (mon > 0) add('monitor', mon, '按消防水炮 ' + round4(mon) + ' 台计');
    return out;
  }

  // ---------- 名称解析 ----------
  function isCastIron(name) {
    return /铸铁|离心浇筑灰口铁|机制离心|球墨铸铁|灰口铁/.test(name || '');
  }

  function parseDN(name) {
    var s = String(name || '').replace(/[（(]/g, ' ').replace(/[）)]/g, ' ');
    var m = s.match(/(?:DN|dn|De|de|D|Φ|φ|Ø)\s*[-－]?\s*(\d{2,4})/);
    if (m) return parseInt(m[1], 10);
    m = s.match(/(\d{2,4})\s*(?:mm|MM|毫米)/);
    if (m) return parseInt(m[1], 10);
    m = s.match(/[×xX*]\s*(\d{2,3})\b/); // 极少见写法
    if (m) return parseInt(m[1], 10);
    return null;
  }

  function parseMedium(name) {
    var s = name || '';
    if (/燃气|煤气|天然气|液化气|气源|瓦斯/.test(s)) return 'gas';
    if (/排水|污水|废水|雨水|冷凝水|冷凝|通气管|透气|地漏|潜污/.test(s)) return 'drain';
    if (/给水|生活给水|生产给水|消防|消火栓|喷淋|中水/.test(s)) return 'water';
    if (/排水/.test(s)) return 'drain';
    return 'water';
  }

  function parseLoc(name) {
    var s = name || '';
    if (/室外|户外|室外埋地|埋地|外网|庭院|厂区|小区|室外管网/.test(s)) return 'out';
    if (/室内|楼内|管井|地库|地下车库|卫生间|厨房|设备间|管道井/.test(s)) return 'in';
    return 'in';
  }

  function parseJoint(name) {
    var s = name || '';
    if (/青铅/.test(s)) return 'lead';
    if (/膨胀水泥/.test(s)) return 'expand';
    if (/石棉水泥|石棉/.test(s)) return 'asbestos';
    if (/胶圈|橡胶圈|柔性接口|卡箍|机械接口|法兰接口/.test(s)) return 'rubber';
    if (/水泥接口|水泥捻口|水泥/.test(s)) return 'cement';
    return null;
  }

  // 材质归类
  function materialOf(name) {
    var s = name || '';
    if (isCastIron(s)) return '铸铁';
    if (/不锈钢/.test(s)) return '不锈钢';
    if (/无缝/.test(s)) return '无缝钢';       // 含"内外壁热浸镀锌无缝钢管"
    if (/镀锌钢管|热浸镀锌|热镀锌|镀锌焊接钢管|内外壁热浸镀锌|镀锌管/.test(s)) return '镀锌钢';
    if (/复合管|钢塑|铝塑|衬塑|涂塑/.test(s)) return '复合';
    if (/铜管|紫铜|黄铜管/.test(s)) return '铜';
    if (/PPR|PP-R|PE管|HDPE|PVC|UPVC|U-PVC|PB管|PEX|塑料管|塑料给水|塑料排水|塑料雨水/.test(s)) return '塑料';
    if (/焊接钢管|钢管/.test(s)) return '焊接钢';
    return '其他';
  }

  // 连接方式解析（其他管材）
  function parsePipeJoint(name) {
    var s = name || '';
    if (/沟槽|卡箍|卡环|机械卡箍/.test(s)) return 'groove';
    if (/卡压|卡凸/.test(s)) return 'press';
    if (/卡套/.test(s)) return 'sleeve';
    if (/承插氩弧焊|氩弧焊|氩电联焊/.test(s)) return 'argon';
    if (/对接电弧焊|电弧焊|手工电弧焊/.test(s)) return 'arc';
    if (/氧乙炔焊|气焊/.test(s)) return 'oxy';
    if (/钎焊|银钎焊/.test(s)) return 'braze';
    if (/电熔/.test(s)) return 'electro';
    if (/热熔/.test(s)) return 'fusion';
    if (/粘接|胶粘|承插粘接/.test(s)) return 'glue';
    if (/螺纹|丝扣|丝接/.test(s)) return 'thread';
    if (/焊接|焊口/.test(s)) return 'weld';
    return null;
  }

  // 其他管材的介质键（water/gas/drain/rain）
  function mediumKeyOf(it) {
    if (it.medium === 'gas') return 'gas';
    if (it.medium === 'drain') return it.isRain ? 'rain' : 'drain';
    return 'water';
  }

  var MAT_CAT = { '无缝钢': 'seamless', '焊接钢': 'welded', '铜': 'copper', '不锈钢': 'stainless', '复合': 'composite', '塑料': 'plastic' };

  // ---------- 消防 / 配管配线桥架：解析辅助 ----------
  function parsePoints(name) {
    var s = String(name || '');
    var m = s.match(/(\d{2,5})\s*点/);
    if (m) return parseInt(m[1], 10);
    m = s.match(/点\s*(\d{2,5})/);
    if (m) return parseInt(m[1], 10);
    return null;
  }
  function parseRoutes(name) {
    var s = String(name || '');
    if (/5\s*路|五路/.test(s)) return 5;
    if (/3\s*路|三路/.test(s)) return 3;
    return null;
  }
  function parseDoors(name) {
    var s = String(name || '');
    var m = s.match(/(\d{2,3})\s*门/);
    if (m) return parseInt(m[1], 10);
    return null;
  }
  function parseWireSection(name, fallback) {
    var s = String(name || '');
    var m = s.match(/(\d+(?:\.\d+)?)\s*(?:mm2|mm²|平方|㎜²)/);
    if (m) return parseFloat(m[1]);
    m = s.match(/[×xX*]\s*(\d+(?:\.\d+)?)\s*$/);
    if (m) return parseFloat(m[1]);
    m = s.match(/(?:BV|BVR|BYJ|RVS|RVB|NH|ZR|WDZ)[A-Z-]*\s*[-]?\s*(\d+(?:\.\d+)?)/i);
    if (m) return parseFloat(m[1]);
    if (fallback !== undefined && fallback !== null) return fallback;
    return null;
  }
  function parseBridgeWH(name) {
    var s = String(name || '');
    var m = s.match(/(\d{3,4})\s*[×xX*]\s*(\d{2,4})/);
    if (m) return { w: parseInt(m[1], 10), h: parseInt(m[2], 10) };
    m = s.match(/(?:宽|W[=\s]?)\s*(\d{3,4})/i);
    if (m) return { w: parseInt(m[1], 10), h: null };
    return { w: null, h: null };
  }
  function conduitIsSteel(name) {
    return /镀锌钢管|焊接钢管|(?:^|[^A-Za-z])(?:SC|RC)\s*[-]?\s*\d|钢管/.test(name || '');
  }
  function parseConduitDN(name) {
    var s = String(name || '');
    var m = s.match(/(?:SC|RC|JDG|KBG|PC|FPC|MT|CP)\s*[-]?\s*(\d{2,3})/i);
    if (m) return parseInt(m[1], 10);
    return parseDN(s);
  }
  function tierPick(tiers, v) {
    if (!(v > 0)) return null;
    for (var i = 0; i < tiers.length; i++) if (v <= tiers[i].max) return { idx: i, tier: tiers[i], over: false };
    return { idx: tiers.length - 1, tier: tiers[tiers.length - 1], over: true };
  }

  // ---------- 消防 / 配管配线桥架：建条目 ----------
  function buildFireItem(name, cat) {
    var it = {};
    it.name = name;
    it.category = cat;
    it.isFire = true;
    it.listCode = F_LIST[cat].code;
    it.listName = F_LIST[cat].name;
    it.material = F_LABEL[cat];
    it.dn = parseDN(name) || parseVDn(name);   // 消火栓/接合器/水炮等「-150」写法兜底
    it.points = parsePoints(name);
    it.routes = parseRoutes(name);
    it.unit = '台';
    var s = String(name || '');

    if (cat === 'detPoint') {
      var kind = detKindOf('smoke');
      for (var i = 0; i < DET_KINDS.length; i++) { if (DET_KINDS[i].re.test(s)) { kind = DET_KINDS[i]; break; } }
      it.detKind = kind.key;
      it.detName = kind.name;
      it.wireMode = /多线制/.test(s) ? 'multi' : 'bus';
      it.unit = '只';
    } else if (cat === 'detLinear') {
      it.unit = 'm';
    } else if (cat === 'btn') {
      it.btnKind = /消火栓/.test(s) ? 'hydrantButton' : 'button';
      it.unit = '只';
    } else if (cat === 'soundLight') {
      it.alertKind = /警铃/.test(s) ? 'bell' : 'soundLight';
      it.unit = '只';
    } else if (cat === 'firePhone') {
      it.phoneKind = /插孔/.test(s) ? 'phoneJack' : (/分机/.test(s) ? 'phoneExt' : (/交换机|总机/.test(s) ? 'phoneSwitch' : 'phoneJack'));
      it.unit = '个';
    } else if (cat === 'fireBroadcast') {
      it.speakerKind = /壁挂|音箱/.test(s) ? 'wallSpeaker' : 'speaker';
      it.unit = '个';
    } else if (cat === 'fireModule') {
      it.moduleKind = /多输出|双输出|双输入/.test(s) ? 'moduleMulti' : (/报警模块|接口|监视|输入模块/.test(s) ? 'moduleAlarm' : 'moduleSingle');
      it.unit = '只';
    } else if (cat === 'moduleBox') {
      it.mount = /户外|室外/.test(s) ? 'out' : 'in';
      it.unit = '台';
    } else if (cat === 'zoneCtrl') {
      it.wireMode = /多线制/.test(s) ? 'multi' : 'bus';
      it.mount = /落地/.test(s) ? 'floor' : 'wall';
      it.unit = '台';
    } else if (cat === 'floorDisp') {
      it.wireMode = /多线制/.test(s) ? 'multi' : 'bus';
      it.unit = '台';
    } else if (cat === 'remoteCtrl') {
      it.routes = it.routes || 3;
      it.unit = '台';
    } else if (cat === 'fireHost') {
      it.genericHost = !/火灾报警.*(控制主机|主机)|报警控制主机|火灾报警主机/.test(s);
      it.unit = '台';
    } else if (cat === 'linkageHost') {
      it.wireMode = /多线制/.test(s) ? 'multi' : 'bus';
      it.mount = /落地/.test(s) ? 'floor' : 'wall';
      it.unit = '台';
    } else if (cat === 'broadcastHost') {
      it.bcastKind = 'amp125';
      for (var b = 0; b < BCAST_TYPES.length; b++) { if (BCAST_TYPES[b].re.test(s)) { it.bcastKind = BCAST_TYPES[b].key; break; } }
      if (/电话交换机|交换机/.test(s)) {
        var d = parseDoors(s);
        it.doors = d === 40 ? 40 : (d === 60 ? 60 : (d === 20 ? 20 : 20));
      }
      it.unit = (it.bcastKind === 'speaker' || it.bcastKind === 'wallSpeaker') ? '个' : '台';
    } else if (cat === 'microComputer') {
      it.unit = '台';
    } else if (cat === 'backupPower') {
      it.unit = '台';
    } else if (cat === 'integrated') {
      it.mount = /落地/.test(s) ? 'floor' : 'wall';
      it.unit = '台';
    } else if (cat === 'cabinet') {
      it.mount = /墙挂|壁挂|墙装/.test(s) ? 'wall' : 'floor';
      it.unit = '台';
    } else if (cat === 'sprinkler') {
      it.dn = it.dn || 15;
      it.ceiling = /无吊顶|不吊顶|明装/.test(s) ? 'open' : 'ceiling';
      it.sprinklerKind = /边墙/.test(s) ? 'sprinklerSide' : 'sprinkler';
      it.unit = '个';
    } else if (cat === 'flowIndicator') {
      it.conn = /法兰/.test(s) ? 'flange' : (/螺纹|丝扣/.test(s) ? 'thread' : (it.dn && it.dn > 100 ? 'flange' : 'thread'));
      it.unit = '个';
    } else if (cat === 'orifice') {
      it.unit = '个';
    } else if (cat === 'hydrantIn') {
      it.hydrantKind = /双栓/.test(s) ? 'dual' : 'single';
      it.dn = it.dn || 65;
      it.unit = '套';
    } else if (cat === 'hydrantOut') {
      it.outKind = /地上/.test(s) ? 'above1' : 'under1';
      it.unit = '套';
    } else if (cat === 'testDevice') {
      it.dn = it.dn || 25;
      it.unit = '组';
    } else if (cat === 'siamese') {
      it.siameseKind = /墙壁|墙式/.test(s) ? 'wall' : (/地上/.test(s) ? 'above' : 'under');
      it.dn = (it.dn && it.dn >= 150) ? 150 : 100;
      it.unit = '套';
    } else if (cat === 'monitor') {
      it.unit = '台';
    } else if (cat === 'fireDebug') {
      it.debugKind = /水炮/.test(s) ? 'monitor' : (/自动喷水|喷淋/.test(s) ? 'sprinkler' : 'hydrant');
      it.unit = '点';
      it.noPrice = true;
    }
    return it;
  }

  function buildElecItem(name, cat) {
    var it = {};
    it.name = name;
    it.category = cat;
    it.isFire = true;
    it.listCode = F_LIST[cat].code;
    it.listName = F_LIST[cat].name;
    it.material = F_LABEL[cat];
    it.unit = 'm';
    var s = String(name || '');
    if (cat === 'conduit') {
      it.dn = parseConduitDN(s);
      it.diameter = it.dn;
      it.conduitSteel = conduitIsSteel(s);
      it.layMode = /明配|明敷|明装/.test(s) ? 'surface' : 'concealed';
    } else if (cat === 'wiring') {
      it.section = parseWireSection(s);
      var wm = s.match(/(BVVB|BVR|BYJ|RVS|RVB|RYS|BV)/i);
      it.wireModel = wm ? wm[1].toUpperCase() : '';
      it.softWire = /RVS|RVB|RYS|RVVP|双绞|软线/i.test(s);
      if (it.softWire) {
        var cm = s.match(/(?:RVS|RVB|RYS|RVVP|RV)[A-Z-]*\s*-?\s*(\d{1,2})\s*[×xX*]/i) || s.match(/(\d{1,2})\s*[×xX*]\s*\d/);
        it.softCores = cm ? parseInt(cm[1], 10) : 2;
      }
      it.dn = it.section;
    } else if (cat === 'bridge') {
      var wh = parseBridgeWH(s);
      it.bridgeWidth = wh.w;
      it.bridgeHeight = wh.h;
      it.dn = wh.w;
    }
    return it;
  }

  // ---------- 建条目 ----------
  function buildItem(name) {
    if (!name) return null;
    // 保温绝热 / 管道支架优先（名称里也含"管"字）
    var acat = auxCatOf(name);
    if (acat) return buildAuxItem(name, acat);
    // 消防专业（消防电设备 / 消防水设备 / 配管配线桥架）
    var fcat = fireCatOf(name);
    if (fcat) {
      if (isElecCat(fcat)) return buildElecItem(name, fcat);
      return buildFireItem(name, fcat);
    }
    // 阀门及管道附件优先（与暖通站同口径）
    var vcat = valveCatOf(name);
    if (vcat) return buildValveItem(name, vcat);
    var it = {};
    it.name = name;
    it.material = materialOf(name);
    it.dn = parseDN(name);
    it.medium = parseMedium(name);
    it.loc = parseLoc(name);
    it.isRain = /雨水/.test(name);
    it.mediumAmbiguous = !/排水|污水|废水|雨水|给水|消防|消火栓|喷淋|中水|冷凝|燃气|煤气|天然气|液化气/.test(name);
    it.locAmbiguous = !/室内|室外|户外|外网|庭院|楼内|管井|地库/.test(name);

    if (it.material === '铸铁') {
      it.category = 'castIron';
      it.listCode = LIST.castIron.code;
      it.listName = LIST.castIron.name;
      var j = parseJoint(name);
      it.jointAuto = j || defaultJoint(it);
      it.joint = it.jointAuto;
      it.jointFromName = !!j;
      var allow = jointsOf(it);
      if (allow.indexOf(it.joint) < 0) {
        it.jointFallback = it.joint;
        it.joint = defaultJoint(it);
      }
    } else if (it.material === '镀锌钢') {
      it.category = 'galv';
      it.listCode = LIST.galv.code;
      it.listName = LIST.galv.name;
      var isGas = /燃气|煤气|天然气|液化气|气源|瓦斯/.test(name);
      it.medium = isGas ? 'gas' : 'water';
      it.jointAuto = isGas ? 'gas_thread' : 'thread';
      it.joint = it.jointAuto;
      it.jointFromName = isGas;
      it.jointFallback = null;
    } else if (PIPE_GROUPS[MAT_CAT[it.material]]) {
      it.category = MAT_CAT[it.material];
      it.listCode = LIST[it.category].code;
      it.listName = LIST[it.category].name;
      it.isRain = /雨水/.test(name);
      it.medium = /燃气|煤气|天然气|液化气|气源|瓦斯/.test(name) ? 'gas' : (it.isRain ? 'drain' : it.medium);
      var pj = parsePipeJoint(name);
      it.jointAuto = pj || defaultJoint(it);
      it.joint = it.jointAuto;
      it.jointFromName = !!pj;
      var allow2 = jointsOf(it);
      if (allow2.indexOf(it.joint) < 0) {
        it.jointFallback = it.joint;
        it.joint = defaultJoint(it);
      }
      // 塑料管材质细分（用于主材价）
      if (it.category === 'plastic') {
        if (it.medium === 'drain') it.plasticKind = 'pvcDrain';
        else if (/PPR|PP-R/.test(name)) it.plasticKind = 'ppr';
        else if (/PE|HDPE/.test(name)) it.plasticKind = 'pe';
        else if (/PVC|UPVC|U-PVC/.test(name)) it.plasticKind = 'pvc';
        else it.plasticKind = 'ppr';
      }
      if (it.category === 'composite') {
        it.compositeKind = /钢骨架|钢塑|衬塑|涂塑/.test(name) ? 'steelmesh' : 'alplastic';
      }
    } else {
      it.category = 'other';
      it.listCode = '';
      it.listName = '';
      it.joint = null;
    }
    // 消防水管道：DN50 及以上默认沟槽连接，DN50 以下默认螺纹连接
    if (isFireWaterName(name) && (it.category === 'galv' || PIPE_GROUPS[it.category])) {
      it.isFireWater = true;
      if (!it.jointFromName) {
        var wantGroove = (it.dn || 0) >= 50;
        var allowF = jointsOf(it);
        if (wantGroove && allowF.indexOf('groove') >= 0) {
          it.joint = 'groove'; it.jointAuto = 'groove'; it.jointFallback = null;
        } else if (!wantGroove && allowF.indexOf('thread') >= 0) {
          it.joint = 'thread'; it.jointAuto = 'thread'; it.jointFallback = null;
        } else if (wantGroove) {
          it.jointNote = 'DN' + it.dn + ' 无沟槽连接子目（第八册沟槽子目自 DN65 起），已按' +
            (JOINT_CN[it.joint] || JOINT_CN2[it.joint] || '螺纹连接') + '套用，请核对';
        }
      }
    }
    it.unit = 'm';
    return it;
  }

  // 档位定位：返回 { idx, dn }
  function tierOf(dns, dn) {
    if (dn === null || dn === undefined || isNaN(dn)) return null;
    for (var i = 0; i < dns.length; i++) if (dn <= dns[i]) return { idx: i, dn: dns[i], exact: dns[i] === dn };
    return { idx: dns.length - 1, dn: dns[dns.length - 1], exact: false, overflow: true };
  }

  // 其他管材：按部位+介质+连接方式定位定额组
  function groupOf(it) {
    var gs = PIPE_GROUPS[it.category];
    if (!gs) return null;
    var mk = mediumKeyOf(it);
    var hit = null;
    gs.forEach(function (g) { if (!hit && g.loc === it.loc && (g.medium || 'water') === mk && g.joint === it.joint) hit = g; });
    if (!hit) gs.forEach(function (g) { if (!hit && g.loc === it.loc && (g.medium || 'water') === mk) hit = g; });
    if (!hit) gs.forEach(function (g) { if (!hit && g.loc === it.loc) hit = g; });
    return hit;
  }

  // ---------- 定额匹配 ----------
  // 阀门定额：通用 8-579~584/8-620~629；特殊阀 8-682/8-686/8-612~616/8-645~649/8-1260；电磁阀 8-603~608/8-630~644
  function matchValveQuota(it) {
    var dn = it.dn, noDn = !(dn > 0);
    var c = it.category;
    if (c === 'waterValve') {
      if (noDn) return { code: '8-579', name: '螺纹阀门 公称直径15mm以内', inferred: false, noDn: true, unit: '个', factor: 1 };
      if (dn <= 50) {
        var wi = tierIdxV(V_WTHREAD, dn);
        return { code: V_WTHREAD[wi].code, name: '螺纹阀门 公称直径' + V_WTHREAD[wi].label, inferred: V_WTHREAD[wi].max !== dn, unit: '个', factor: 1 };
      }
      var wf = tierIdxV(V_WFLANGE, dn);
      return {
        code: V_WFLANGE[wf].code, name: '焊接法兰阀门 公称直径' + V_WFLANGE[wf].label,
        inferred: V_WFLANGE[wf].max !== dn, overRange: dn > 400, unit: '个', factor: 1
      };
    }
    if (c === 'autoAir') return { code: '8-682', name: '自动排气阀、手动放风阀 公称直径25mm以内', inferred: false, unit: '个', factor: 1 };
    if (c === 'tempValve') return { code: '8-686', name: '散热器温控阀 公称直径25mm以内', inferred: false, unit: '个', factor: 1 };
    if (c === 'flushValve') return { code: '8-1260', name: '口部冲洗阀制作、安装 壁龛式', inferred: false, unit: '套', factor: 1 };
    if (c === 'floatValve') {
      var fi = noDn ? 0 : tierIdxV(V_FLOAT, dn);
      return { code: V_FLOAT[fi].code, name: '法兰浮球阀 公称直径' + V_FLOAT[fi].label, inferred: !noDn && V_FLOAT[fi].max !== dn, noDn: noDn, overRange: !noDn && dn > 150, unit: '个', factor: 1 };
    }
    if (c === 'levelValve') {
      var li = noDn ? 0 : tierIdxV(V_LEVEL, dn);
      return { code: V_LEVEL[li].code, name: '法兰液压水位控制阀 公称直径' + V_LEVEL[li].label, inferred: !noDn && V_LEVEL[li].max !== dn, noDn: noDn, overRange: !noDn && dn > 200, unit: '个', factor: 1 };
    }
    if (c === 'solenoidValve') {
      if (noDn) return { code: '8-603', name: '螺纹电磁阀安装 公称直径15mm以内', inferred: false, noDn: true, unit: '个', factor: 1 };
      if (dn <= 50) {
        var si = tierIdxV(V_STHREAD, dn);
        return { code: V_STHREAD[si].code, name: '螺纹电磁阀安装 公称直径' + V_STHREAD[si].label, inferred: V_STHREAD[si].max !== dn, unit: '个', factor: 1 };
      }
      var sf = tierIdxV(V_SFLANGE, dn);
      return {
        code: V_SFLANGE[sf].code, name: '法兰电磁阀安装 公称直径' + V_SFLANGE[sf].label,
        inferred: V_SFLANGE[sf].max !== dn, overRange: dn > 500, unit: '个', factor: 1
      };
    }
    return { code: '', name: '', inferred: false };
  }

  // 阀门主材价：有信息价取信息价（不标品牌），无信息价取市场价并给参考品牌
  function valvePrice(it) {
    var vc = valveCfg(), dn = it.dn, c = it.category;
    if (c === 'waterValve') {
      var t = (vc.info || {})[it.valveKind || 'market'];
      if (t) {
        var i1 = nearIdxV(t.dns, dn);
        return {
          price: t.prices[i1], source: 'info',
          basis: '信息价：' + t.name + ' DN' + t.dns[i1] + ' ' + t.prices[i1] + '元/个' +
            (dn > 0 && t.dns[i1] !== dn ? '（DN' + dn + '按相邻档取定）' : '')
        };
      }
      var mk = vc.market || { dns: [15], prices: [40] };
      var i2 = nearIdxV(mk.dns, dn);
      return {
        price: mk.prices[i2], source: 'market', brand: vc.brand,
        basis: '市场价（' + vc.brand + '）：' + it.name + ' DN' + mk.dns[i2] + ' ' + mk.prices[i2] + '元/个（该阀种无信息价，按市场价计）'
      };
    }
    if (c === 'flushValve') {
      var fl = (vc.special || {}).flush || { prices: [480], brand: '' };
      return { price: fl.prices[0], source: 'market', brand: fl.brand, basis: '市场价（' + fl.brand + '）：口部冲洗阀 成套 ' + fl.prices[0] + '元/套（定额 8-1260 按套计）' };
    }
    if (c === 'solenoidValve') {
      var so = vc.solenoid || { dns: [15], prices: [180], brand: '' };
      var i4 = nearIdxV(so.dns, dn);
      return {
        price: so.prices[i4], source: 'market', brand: so.brand,
        basis: '市场价（' + so.brand + '）：电磁阀 DN' + so.dns[i4] + ' ' + so.prices[i4] + '元/个' +
          (dn > 0 && so.dns[i4] !== dn ? '（DN' + dn + '按相邻档取定）' : '')
      };
    }
    var key = { autoAir: 'autoAir', tempValve: 'temp', floatValve: 'float', levelValve: 'level' }[c];
    var sp = (vc.special || {})[key] || { dns: [25], prices: [0], source: 'market' };
    var i3 = nearIdxV(sp.dns, dn);
    if (sp.source === 'info') {
      return { price: sp.prices[i3], source: 'info', basis: '信息价：' + sp.name + ' DN' + sp.dns[i3] + ' ' + sp.prices[i3] + '元/个' };
    }
    return {
      price: sp.prices[i3], source: 'market', brand: sp.brand || vc.brand,
      basis: '市场价（' + (sp.brand || vc.brand) + '）：' + sp.name + ' DN' + sp.dns[i3] + ' ' + sp.prices[i3] + '元/个'
    };
  }

  // ---------- 消防定额匹配 ----------
  function matchFireQuota(it) {
    var c = it.category;
    var q = { code: '', name: '', inferred: false, unit: it.unit || '台', factor: 1 };

    if (c === 'detPoint') {
      var k = detKindOf(it.detKind);
      var multi = it.wireMode === 'multi';
      return { code: multi ? k.multi : k.bus, name: '点型探测器安装 ' + (multi ? '多线制' : '总线制') + ' ' + k.name, inferred: false, unit: '只', factor: 1 };
    }
    if (c === 'detLinear') return { code: '7-149', name: '线型探测器安装', inferred: false, unit: '10m', factor: 10 };
    if (c === 'btn') return { code: '7-150', name: '按钮安装', inferred: false, unit: '只', factor: 1 };
    if (c === 'soundLight') {
      if (it.alertKind === 'bell') return { code: '7-189', name: '警报装置安装 警铃', inferred: false, unit: '只', factor: 1 };
      return { code: '7-188', name: '警报装置安装 声光报警', inferred: false, unit: '只', factor: 1 };
    }
    if (c === 'firePhone') {
      if (it.phoneKind === 'phoneExt') return { code: '7-202', name: '消防通信、报警备用电源安装 通信 分机', inferred: false, unit: '个', factor: 1 };
      if (it.phoneKind === 'phoneSwitch') return { code: '7-199', name: '消防通信、报警备用电源安装 电话交换机 20门', inferred: false, unit: '台', factor: 1 };
      return { code: '7-203', name: '消防通信、报警备用电源安装 通信 插孔', inferred: false, unit: '个', factor: 1 };
    }
    if (c === 'fireBroadcast') {
      if (it.speakerKind === 'wallSpeaker') return { code: '7-197', name: '火灾事故广播安装 壁挂式音箱', inferred: false, unit: '个', factor: 1 };
      return { code: '7-196', name: '火灾事故广播安装 吸顶式扬声器', inferred: false, unit: '个', factor: 1 };
    }
    if (c === 'fireModule') {
      if (it.moduleKind === 'moduleMulti') return { code: '7-152', name: '控制模块（接口）安装 多输出', inferred: false, unit: '只', factor: 1 };
      if (it.moduleKind === 'moduleAlarm') return { code: '7-153', name: '报警模块（接口）安装', inferred: false, unit: '只', factor: 1 };
      return { code: '7-151', name: '控制模块（接口）安装 单输出', inferred: false, unit: '只', factor: 1 };
    }
    if (c === 'moduleBox') {
      if (it.mount === 'out') return { code: '2-368', name: '端子箱安装 户外', inferred: false, unit: '台', factor: 1, crossVol: '第二册' };
      return { code: '2-369', name: '端子箱安装 户内', inferred: false, unit: '台', factor: 1, crossVol: '第二册' };
    }
    if (c === 'zoneCtrl') {
      var zk = (it.wireMode === 'multi' ? 'multi' : 'bus') + '_' + (it.mount === 'floor' ? 'floor' : 'wall');
      var zt = ZONE_TIERS[zk];
      if (!(it.points > 0)) {
        return { code: '', name: '区域报警控制器安装（' + (it.wireMode === 'multi' ? '多线制' : '总线制') + '/' + (it.mount === 'floor' ? '落地式' : '壁挂式') + '）点数待选', inferred: false, unit: '台', factor: 1, needPoints: true };
      }
      var zp = tierPick(zt, it.points);
      return { code: zp.tier.code, name: '报警控制器安装 ' + (it.wireMode === 'multi' ? '多线制' : '总线制') + '(' + (it.mount === 'floor' ? '落地式' : '壁挂式') + ') ' + (zp.tier.max >= 99999 ? zp.tier.max + '点以外' : zp.tier.max + '点以内'), inferred: false, unit: '台', factor: 1, overRange: zp.over };
    }
    if (c === 'floorDisp') {
      if (it.wireMode === 'multi') return { code: '7-186', name: '重复显示器安装 多线制', inferred: false, unit: '台', factor: 1 };
      return { code: '7-187', name: '重复显示器安装 总线制', inferred: false, unit: '台', factor: 1 };
    }
    if (c === 'remoteCtrl') {
      if (it.routes >= 5) return { code: '7-191', name: '远程控制器安装 5路以内', inferred: false, unit: '台', factor: 1 };
      return { code: '7-190', name: '远程控制器安装 3路以内', inferred: false, unit: '台', factor: 1 };
    }
    if (c === 'fireHost') {
      return { code: '补充定额', name: '补充定额：火灾报警系统控制主机安装（需按项目实际补充基价）', inferred: false, unit: '台', factor: 1, manual: true };
    }
    if (c === 'linkageHost') {
      var lk = (it.wireMode === 'multi' ? 'multi' : 'bus') + '_' + (it.mount === 'floor' ? 'floor' : 'wall');
      var lt = LINK_TIERS[lk];
      if (!(it.points > 0)) {
        return { code: '', name: '联动控制器安装（' + (it.wireMode === 'multi' ? '多线制' : '总线制') + '/' + (it.mount === 'floor' ? '落地式' : '壁挂式') + '）点数待选', inferred: false, unit: '台', factor: 1, needPoints: true };
      }
      var lp = tierPick(lt, it.points);
      return { code: lp.tier.code, name: '联动控制器安装 ' + (it.wireMode === 'multi' ? '多线制' : '总线制') + '(' + (it.mount === 'floor' ? '落地式' : '壁挂式') + ') ' + (lp.tier.max >= 99999 ? lp.tier.max + '点以外' : lp.tier.max + '点以内'), inferred: false, unit: '台', factor: 1, overRange: lp.over };
    }
    if (c === 'broadcastHost') {
      var bk = it.bcastKind || 'amp125';
      for (var bi = 0; bi < BCAST_TYPES.length; bi++) {
        if (BCAST_TYPES[bi].key === bk) {
          if (bk === 'phoneSwitch') {
            var dd = it.doors || 20;
            var dcode = dd >= 60 ? '7-201' : (dd >= 40 ? '7-200' : '7-199');
            var dname = '消防通信、报警备用电源安装 电话交换机 ' + (dd >= 60 ? '60' : (dd >= 40 ? '40' : '20')) + '门';
            return { code: dcode, name: dname, inferred: false, unit: '台', factor: 1 };
          }
          return { code: BCAST_TYPES[bi].code, name: BCAST_TYPES[bi].name, inferred: false, unit: BCAST_TYPES[bi].unit, factor: 1 };
        }
      }
      return { code: '7-192', name: '火灾事故广播安装 125W功放', inferred: false, unit: '台', factor: 1 };
    }
    if (c === 'microComputer') return { code: '10-455', name: '计算机柜、台设备安装 通用计算机及台柜', inferred: false, unit: '台', factor: 1, crossVol: '第十册' };
    if (c === 'backupPower') return { code: '7-204', name: '消防通信、报警备用电源安装 消防报警备用电源', inferred: false, unit: '台', factor: 1 };
    if (c === 'integrated') {
      var ik = it.mount === 'floor' ? 'floor' : 'wall';
      var ig = INTEG_TIERS[ik];
      if (!(it.points > 0)) {
        return { code: '', name: '报警联动一体机安装（' + (it.mount === 'floor' ? '落地式' : '壁挂式') + '）点数待选', inferred: false, unit: '台', factor: 1, needPoints: true };
      }
      var ip = tierPick(ig, it.points);
      return { code: ip.tier.code, name: '报警联动一体机 ' + (it.mount === 'floor' ? '落地式' : '壁挂式') + ' ' + (ip.tier.max >= 99999 ? ip.tier.max + '点以外' : ip.tier.max + '点以内'), inferred: false, unit: '台', factor: 1, overRange: ip.over };
    }
    if (c === 'cabinet') {
      if (it.mount === 'wall') return { code: '12-9', name: '机柜、机架 墙挂式', inferred: false, unit: '台', factor: 1, crossVol: '第十二册' };
      return { code: '12-8', name: '机柜、机架 落地式', inferred: false, unit: '台', factor: 1, crossVol: '第十二册' };
    }
    if (c === 'sprinkler') {
      var sq = it.ceiling === 'open' ? SPRINKLER_Q.open : SPRINKLER_Q.ceiling;
      return { code: sq.code, name: sq.name, inferred: false, unit: '10个', factor: 10 };
    }
    if (c === 'flowIndicator') {
      var fd = it.dn || 50;
      if (it.conn === 'flange') {
        var fp = tierPick(FLOW_FLANGE, fd);
        return { code: fp.tier.code, name: '水流指示器安装 法兰连接 公称直径' + fp.tier.max + 'mm以内', inferred: fp.over, unit: '个', factor: 1, overRange: fp.over, dnTier: fp.tier.max };
      }
      var tp = tierPick(FLOW_THREAD, fd);
      return { code: tp.tier.code, name: '水流指示器安装 螺纹连接 公称直径' + tp.tier.max + 'mm以内', inferred: tp.over, unit: '个', factor: 1, overRange: tp.over, dnTier: tp.tier.max };
    }
    if (c === 'orifice') {
      var op = tierPick(ORIFICE_TIERS, it.dn || 50);
      return { code: op.tier.code, name: '减压孔板安装 公称直径' + op.tier.max + 'mm以内', inferred: op.over || !it.dn, unit: '个', factor: 1, overRange: op.over, dnTier: op.tier.max };
    }
    if (c === 'hydrantIn') {
      var hq = it.hydrantKind === 'dual' ? HYDRANT_IN_Q.dual : HYDRANT_IN_Q.single;
      return { code: hq.code, name: hq.name, inferred: false, unit: '套', factor: 1 };
    }
    if (c === 'hydrantOut') {
      var oq = HYDRANT_OUT_Q[it.outKind || 'under1'] || HYDRANT_OUT_Q.under1;
      return { code: oq.code, name: oq.name, inferred: false, unit: '套', factor: 1 };
    }
    if (c === 'testDevice') {
      var tq = tierPick(TEST_DEVICE_TIERS, it.dn || 25);
      return { code: tq.tier.code, name: tq.tier.name, inferred: tq.over, unit: '组', factor: 1, overRange: tq.over };
    }
    if (c === 'siamese') {
      var sk = it.siameseKind || 'under';
      var is150 = (it.dn || 100) >= 150;
      var codeMap = { under: is150 ? '7-56' : '7-55', above: is150 ? '7-58' : '7-57', wall: is150 ? '7-60' : '7-59' };
      var nmMap = { under: '地下式', above: '地上式', wall: '墙壁式' };
      return { code: codeMap[sk], name: '消防水泵接合器 ' + nmMap[sk] + ' ' + (is150 ? '150' : '100'), inferred: false, unit: '套', factor: 1 };
    }
    if (c === 'monitor') {
      var mp = tierPick(MONITOR_TIERS, it.dn || 50);
      return { code: mp.tier.code, name: mp.tier.name, inferred: mp.over, unit: '台', factor: 1, overRange: mp.over, dnTier: mp.tier.max };
    }
    if (c === 'fireDebug') {
      var dq = FIRE_DEBUG_Q[it.debugKind || 'hydrant'] || FIRE_DEBUG_Q.hydrant;
      return { code: dq.code, name: dq.name, inferred: false, unit: '点', factor: 1, noPrice: true };
    }
    return q;
  }

  // ---------- 配管 / 配线 / 桥架定额匹配（第二册，与电气站同口径）----------
  function matchElecQuota(it) {
    var c = it.category;
    if (c === 'conduit') {
      var steel = it.conduitSteel;
      var dnList = steel ? STEEL_DN : TUBE_DN;
      var code0 = steel ? STEEL_CODE[it.layMode] : TUBE_CODE[it.layMode];
      if (!(it.dn > 0)) return { code: '', name: (steel ? '镀锌钢管' : '电线管') + '敷设（管径待识别）', inferred: false, unit: '100m', factor: 100, needDn: true };
      var idx = 0;
      for (var i = 0; i < dnList.length; i++) { if (it.dn <= dnList[i]) { idx = i; break; } if (i === dnList.length - 1) idx = i; }
      var dn = dnList[idx];
      var over = it.dn > dnList[dnList.length - 1];
      return {
        code: '2-' + (code0 + idx),
        name: (steel ? '镀锌钢管敷设' : '电线管敷设') + ' 砖、混凝土结构' + (it.layMode === 'surface' ? '明配' : '暗配') + ' 公称直径' + dn + 'mm以内',
        inferred: over, unit: '100m', factor: 100, overRange: over, dnTier: dn
      };
    }
    if (c === 'wiring') {
      if (!(it.section > 0)) return { code: '', name: '管内穿线（截面待识别）', inferred: false, unit: '100m', factor: 100, needDn: true };
      if (it.softWire) {
        var ci2 = 0;
        for (var si2 = 0; si2 < SOFT_CORES.length; si2++) { if (it.softCores <= SOFT_CORES[si2]) { ci2 = si2; break; } if (si2 === SOFT_CORES.length - 1) ci2 = si2; }
        var csec = SOFT_SEC[SOFT_SEC.length - 1];
        for (var sj = 0; sj < SOFT_SEC.length; sj++) { if (it.section <= SOFT_SEC[sj]) { csec = SOFT_SEC[sj]; break; } }
        return {
          code: '2-' + (SOFT_CODE0 + ci2),
          name: '管内穿线 多芯软导线 ' + cnNum(SOFT_CORES[ci2]) + '芯 导线截面' + csec + 'mm²以内',
          inferred: true, unit: '100m', factor: 100, dnTier: csec
        };
      }
      if (it.section <= 4) {
        var li = 0;
        for (var j = 0; j < LIGHT_SEC.length; j++) { if (it.section <= LIGHT_SEC[j]) { li = j; break; } if (j === LIGHT_SEC.length - 1) li = j; }
        return {
          code: '2-' + (LIGHT_CODE0 + li),
          name: '管内穿线 照明线路 铜芯 导线截面' + LIGHT_SEC[li] + 'mm²以内',
          inferred: false, unit: '100m', factor: 100, dnTier: LIGHT_SEC[li]
        };
      }
      var pi2 = 0;
      for (var p = 0; p < POWER_WIRE_SEC.length; p++) { if (it.section <= POWER_WIRE_SEC[p]) { pi2 = p; break; } if (p === POWER_WIRE_SEC.length - 1) pi2 = p; }
      return {
        code: '2-' + (POWER_WIRE_CODE0 + pi2),
        name: '管内穿线 动力线路 铜芯 导线截面' + POWER_WIRE_SEC[pi2] + 'mm²以内',
        inferred: true, unit: '100m', factor: 100, dnTier: POWER_WIRE_SEC[pi2]
      };
    }
    if (c === 'bridge') {
      if (!(it.bridgeWidth > 0)) return { code: '', name: '钢制槽式桥架安装（宽度待识别）', inferred: false, unit: '10m', factor: 10, needDn: true };
      var bi2 = 0;
      for (var b = 0; b < BRIDGE_W.length; b++) { if (it.bridgeWidth <= BRIDGE_W[b]) { bi2 = b; break; } if (b === BRIDGE_W.length - 1) bi2 = b; }
      var overW = it.bridgeWidth > BRIDGE_W[BRIDGE_W.length - 1];
      return {
        code: '2-' + (BRIDGE_CODE0 + bi2),
        name: '钢制槽式桥架安装 宽度' + BRIDGE_W[bi2] + 'mm以内',
        inferred: true, unit: '10m', factor: 10, overRange: overW, dnTier: BRIDGE_W[bi2]
      };
    }
    return { code: '', name: '', inferred: false };
  }

  function matchQuota(it) {
    if (!it) return { code: '', name: '', inferred: false };
    if (isElecCat(it.category)) return matchElecQuota(it);
    if (isFireCat(it.category)) return matchFireQuota(it);
    if (isAuxCat(it.category)) return matchAuxQuota(it);
    if (isValveCat(it.category)) return matchValveQuota(it);
    if (PIPE_GROUPS[it.category]) {
      var g = groupOf(it);
      if (!g) return { code: '', name: '', inferred: false };
      if (it.dn === null || it.dn === undefined || isNaN(it.dn)) {
        return { code: '', name: g.name + '（管径待识别）', inferred: false, needDn: true };
      }
      var t = tierOf(g.dns, it.dn);
      var dnLabel = (it.category === 'copper' || it.category === 'plastic' || it.category === 'composite') ? '公称外径' : '公称直径';
      return {
        code: '8-' + (g.start + t.idx),
        name: g.name + ' ' + dnLabel + t.dn + 'mm以内',
        inferred: !t.exact,
        dnTier: t.dn,
        unit: '10m',
        factor: 10,
        group: g
      };
    }
    if (it.category !== 'castIron' && it.category !== 'galv') return { code: '', name: '', inferred: false };
    var tbl = ruleTable(it)[pipeKey(it)];
    if (!tbl) return { code: '', name: '', inferred: false };
    var def = tbl[it.joint] || tbl[defaultJoint(it)];
    if (!def) return { code: '', name: '', inferred: false };
    if (it.dn === null || it.dn === undefined || isNaN(it.dn)) {
      return { code: '', name: def.name + '（管径待识别）', inferred: false, needDn: true };
    }
    var idx = -1;
    for (var i = 0; i < def.dns.length; i++) { if (it.dn <= def.dns[i]) { idx = i; break; } }
    var inferred = false;
    if (idx < 0) { idx = def.dns.length - 1; inferred = true; }
    else if (def.dns[idx] !== it.dn) inferred = true;
    var dn = def.dns[idx];
    return {
      code: '8-' + (def.start + idx),
      name: def.name + ' 公称直径' + dn + 'mm以内',
      inferred: inferred,
      dnTier: dn,
      unit: '10m',
      factor: 10
    };
  }

  // ---------- 附加定额（沟槽管件 / 管道消毒冲洗）----------
  function buildExtraQuotas(it, quota) {
    var arr = [];
    if (!quota || !quota.code) return arr;
    if (isValveCat(it.category)) return arr;   // 阀门及附件不计管道消毒冲洗/沟槽管件
    if (isAuxCat(it.category)) return arr;     // 支架/保温不计管道消毒冲洗/沟槽管件
    if (it.isFire) return arr;                 // 消防设备/配管配线桥架不计管道消毒冲洗/沟槽管件
    var tierDn = quota.dnTier || it.dn;
    if (it.joint === 'groove') {
      var f = tierOf(GROOVE_FITTING.dns, tierDn);
      if (f) {
        var cnt = Math.max(1, Math.ceil(it.quantity / 6));
        arr.push({
          role: 'fitting', code: '8-' + (GROOVE_FITTING.start + f.idx),
          name: GROOVE_FITTING.name + ' 公称直径' + f.dn + 'mm以内',
          unit: GROOVE_FITTING.unit, factor: GROOVE_FITTING.factor,
          qty: cnt, note: '管件数量按6m定尺估算（每6m一个管件），请按图纸调整'
        });
      }
    }
    var fl = tierOf(PIPE_FLUSH.dns, tierDn);
    if (fl) {
      arr.push({
        role: 'flush', code: '8-' + (PIPE_FLUSH.start + fl.idx),
        name: PIPE_FLUSH.name + ' 公称直径' + fl.dn + 'mm以内',
        unit: PIPE_FLUSH.unit, factor: PIPE_FLUSH.factor,
        qty: it.quantity, note: ''
      });
    }
    return arr;
  }

  // ---------- 价格 ----------
  function getPeriods() {
    var arr = (typeof window !== 'undefined' && window.PIPE_PRICE_PERIODS) ? window.PIPE_PRICE_PERIODS
      : ((typeof window !== 'undefined' && window.CABLE_PRICE_PERIODS) || []);
    return arr || [];
  }
  function getPeriod(periodKey) {
    var arr = getPeriods();
    for (var i = 0; i < arr.length; i++) if (arr[i].period === periodKey) return arr[i];
    return arr[0] || null;
  }
  function interpPrice(table, key) {
    var keys = Object.keys(table).map(Number).sort(function (a, b) { return a - b; });
    if (!keys.length) return null;
    if (table[key] !== undefined) return { price: table[key], exact: true, tier: key };
    for (var i = 0; i < keys.length; i++) {
      if (key <= keys[i]) return { price: table[keys[i]], exact: false, tier: keys[i] };
    }
    var last = keys[keys.length - 1];
    return { price: table[last], exact: false, tier: last, overflow: true };
  }

  function lookupCastIronPrice(periodKey, it) {
    var p = getPeriod(periodKey);
    if (!p || !p.castIron) return null;
    if (it.dn === null || isNaN(it.dn)) return null;
    var grp = it.medium === 'drain' ? p.castIron.drain : p.castIron.water;
    if (!grp) return null;
    var r = interpPrice(grp.price, it.dn);
    if (!r) return null;
    var isInfo2 = !!(grp.infoDns && grp.infoDns.indexOf(r.tier) >= 0);
    if (isInfo2) {
      return { price: r.price, source: 'info',
        basis: '铸铁' + MEDIUM_CN[it.medium] + '管 DN' + it.dn + '：天津市工程造价信息（除税）' + r.price.toFixed(2) + '元/m' +
          (r.exact ? '' : '；信息价无DN' + it.dn + '档，按DN' + r.tier + '档取定') };
    }
    var basis = '铸铁' + MEDIUM_CN[it.medium] + '管 DN' + it.dn + '：' + grp.brand + '，' + r.price.toFixed(2) + '元/m（除税）' +
      (r.exact ? '' : '；信息价无DN' + it.dn + '档，按DN' + r.tier + '档就近取定') +
      (r.overflow ? '；已超常用最大档，请核对' : '');
    return { price: r.price, source: 'market', basis: basis };
  }

  function lookupGalvPrice(periodKey, it) {
    var p = getPeriod(periodKey);
    if (!p || !p.galv) return null;
    if (it.dn === null || isNaN(it.dn)) return null;
    var r = interpPrice(p.galv.price, it.dn);
    if (!r) return null;
    var basis = '镀锌钢管 DN' + it.dn + '（' + (it.joint === 'gas_thread' ? '燃气' : '给水') + '）：' + p.galv.brand +
      '，' + r.price.toFixed(2) + '元/m（除税）' +
      (r.exact ? '' : '；信息价无DN' + it.dn + '档，按DN' + r.tier + '档就近取定') +
      (r.overflow ? '；已超常用最大档，请核对' : '');
    return { price: r.price, source: 'market', basis: basis };
  }

  var PIPE_PRICE_META = {
    seamless: function (p) { return p.seamless; },
    welded: function (p) { return p.welded; },
    copper: function (p) { return p.copper; },
    stainless: function (p) { return p.stainless; },
    composite: function (p) { return (p.composite || {})['alplastic']; },
    plastic: function (p) { return (p.plastic || {})['ppr']; }
  };

  function lookupPipePrice(periodKey, it) {
    var p = getPeriod(periodKey);
    if (!p) return null;
    if (it.dn === null || isNaN(it.dn)) return null;
    var grp = null, label = '';
    if (it.category === 'seamless') { grp = p.seamless; label = '无缝钢管'; }
    else if (it.category === 'welded') { grp = p.welded; label = '焊接钢管'; }
    else if (it.category === 'copper') { grp = p.copper; label = '铜管'; }
    else if (it.category === 'stainless') { grp = p.stainless; label = '不锈钢管'; }
    else if (it.category === 'composite') {
      grp = (p.composite || {})[it.compositeKind || 'alplastic'];
      label = it.compositeKind === 'steelmesh' ? '钢骨架塑料复合管' : '铝塑复合管';
    } else if (it.category === 'plastic') {
      grp = (p.plastic || {})[it.plasticKind || 'ppr'];
      label = { ppr: 'PPR给水管', pe: 'PE给水管', pvc: 'PVC-U给水管', pvcDrain: 'PVC-U排水管' }[it.plasticKind || 'ppr'];
    }
    if (!grp || !grp.price) return null;
    var r = interpPrice(grp.price, it.dn);
    if (!r) return null;
    var dnLabel = (it.category === 'plastic' || it.category === 'composite') ? 'De' : 'DN';
    var isInfo = !!(grp.infoDns && grp.infoDns.indexOf(r.tier) >= 0);
    if (isInfo) {
      return { price: r.price, source: 'info',
        basis: label + ' ' + dnLabel + it.dn + '：天津市工程造价信息（除税）' + r.price.toFixed(2) + '元/m' +
          (r.exact ? '' : '；信息价无' + dnLabel + it.dn + '档，按' + dnLabel + r.tier + '档取定') };
    }
    var basis = label + ' ' + dnLabel + it.dn + '：' + grp.brand + '，' + r.price.toFixed(2) + '元/m（除税）' +
      (r.exact ? '' : '；价格库无' + dnLabel + it.dn + '档，按' + dnLabel + r.tier + '档就近取定') +
      (r.overflow ? '；已超常用最大档，请核对' : '');
    return { price: r.price, source: 'market', basis: basis };
  }

  function isPriced(it) { return it && (it.isFire || it.category === 'castIron' || it.category === 'galv' || !!PIPE_GROUPS[it.category] || isValveCat(it.category) || isAuxCat(it.category)); }

  // ---------- 消防设备 / 配管配线桥架 主材价 ----------
  function firePriceTable(periodKey) {
    var arr = (typeof window !== 'undefined' && window.FIRE_PRICE_PERIODS) ? window.FIRE_PRICE_PERIODS : [];
    for (var i = 0; i < arr.length; i++) if (arr[i].period === periodKey) return arr[i];
    if (arr.length) return arr[0];
    if (typeof window !== 'undefined' && (window.ELEC_PRICES || window.FIRE_DEVICE_PRICES)) {
      return { period: '2026-10', releaseLabel: '2026年第10期（10月）', elec: window.ELEC_PRICES || null, fire: window.FIRE_DEVICE_PRICES || null };
    }
    return null;
  }
  function bridgePrice(bt, w, h) {
    var keys = Object.keys(bt);
    if (!keys.length) return null;
    if (h > 0) {
      var exact = w + 'x' + h;
      if (bt[exact] !== undefined) return { key: exact, price: bt[exact], exact: true };
    }
    var parsed = keys.map(function (k) {
      var p = k.split('x');
      return { key: k, w: parseInt(p[0], 10), h: parseInt(p[1], 10), price: bt[k] };
    });
    var sameW = parsed.filter(function (x) { return x.w === w; }).sort(function (a, b) { return a.h - b.h; });
    if (sameW.length) {
      if (h > 0) {
        for (var i = 0; i < sameW.length; i++) if (sameW[i].h >= h) return { key: sameW[i].key, price: sameW[i].price, exact: false };
      }
      return { key: sameW[sameW.length - 1].key, price: sameW[sameW.length - 1].price, exact: false };
    }
    parsed.sort(function (a, b) { return a.w - b.w; });
    for (var j = 0; j < parsed.length; j++) if (parsed[j].w >= w) return { key: parsed[j].key, price: parsed[j].price, exact: false };
    var last = parsed[parsed.length - 1];
    return { key: last.key, price: last.price, exact: false };
  }

  function tierVal(def, v) {
    if (!def) return null;
    if (def.price !== undefined && def.price !== null) return def.price;
    var tiers = def.tiers;
    if (!tiers) return null;
    if (Array.isArray(tiers)) {
      if (!(v > 0)) return tiers[0].price;
      for (var i = 0; i < tiers.length; i++) if (v <= tiers[i].max) return tiers[i].price;
      return tiers[tiers.length - 1].price;
    }
    var keys = Object.keys(tiers).map(Number).sort(function (a, b) { return a - b; });
    if (!keys.length) return null;
    if (!(v > 0)) return tiers[keys[0]];
    for (var k = 0; k < keys.length; k++) if (v <= keys[k]) return tiers[keys[k]];
    return tiers[keys[keys.length - 1]];
  }
  function fireDeviceDef(it, periodKey) {
    var F = firePriceTable(periodKey);
    if (!F || !F.fire) return null;
    var c = it.category;
    if (c === 'fireDebug') return null;
    if (isFireElecCat(c)) {
      var E = F.fire.elec || {};
      if (c === 'detPoint') return { def: E[it.detKind || 'smoke'], v: null };
      if (c === 'detLinear') return { def: E.linear, v: null };
      if (c === 'btn') return { def: E[it.btnKind || 'button'], v: null };
      if (c === 'soundLight') return { def: E[it.alertKind || 'soundLight'], v: null };
      if (c === 'firePhone') return { def: E[it.phoneKind || 'phoneJack'], v: null };
      if (c === 'fireBroadcast') return { def: E[it.speakerKind || 'speaker'], v: null };
      if (c === 'fireModule') return { def: E[it.moduleKind || 'moduleSingle'], v: null };
      if (c === 'moduleBox') return { def: E.moduleBox, v: null };
      if (c === 'zoneCtrl') return { def: E.zoneCtrl, v: it.points };
      if (c === 'floorDisp') return { def: E.floorDisplay, v: null };
      if (c === 'remoteCtrl') return { def: E.remoteCtrl, v: it.routes };
      if (c === 'fireHost') return { def: E.hostMain, v: null };
      if (c === 'linkageHost') return { def: E.linkageHost, v: null };
      if (c === 'broadcastHost') return { def: E[it.bcastKind || 'amp125'], v: it.doors };
      if (c === 'microComputer') return { def: E.microComputer, v: null };
      if (c === 'backupPower') return { def: E.backupPower, v: null };
      if (c === 'integrated') return { def: E.integrated, v: it.points };
      if (c === 'cabinet') return { def: E.cabinet, v: it.dn };
      return null;
    }
    var W = F.fire.water || {};
    if (c === 'sprinkler') return { def: W[it.sprinklerKind || 'sprinkler'], v: null };
    if (c === 'flowIndicator') return { def: W.flowIndicator, v: it.dn };
    if (c === 'orifice') return { def: W.orifice, v: it.dn };
    if (c === 'hydrantIn') return { def: it.hydrantKind === 'dual' ? (W.hydrantInDual || W.hydrantIn) : W.hydrantIn, v: it.dn };
    if (c === 'hydrantOut') return { def: W.hydrantOut, v: null };
    if (c === 'testDevice') return { def: W.testDevice, v: it.dn };
    if (c === 'siamese') return { def: W.siamese, v: it.dn };
    if (c === 'monitor') return { def: W.monitor, v: it.dn };
    return null;
  }
  function firePrice(it, periodKey) {
    if (it.category === 'fireDebug') return { price: null, source: 'na', basis: '系统调试子目不计主材价', brand: '' };
    var dd = fireDeviceDef(it, periodKey);
    if (!dd || !dd.def) return { price: null, source: 'pending', basis: '价格库暂无该设备，请询价后填入', brand: '' };
    var def = dd.def;
    if (def.source === 'manual' || def.price === null) {
      return { price: null, source: 'manual', basis: '需人工输入主材单价（' + (def.label || F_LABEL[it.category]) + '，品牌规格差异大，不预设价格）', brand: def.brand || '' };
    }
    var p = tierVal(def, dd.v);
    if (p === null) return { price: null, source: 'pending', basis: '价格库缺少对应档位，请询价后填入', brand: def.brand || '' };
    var basis = (def.label || F_LABEL[it.category]) + '：' + (def.brand || '') + '，' + Number(p).toFixed(2) + '元/' + (def.unit || it.unit);
    var brandOut = def.brand || '';
    if (it.genericHost) {
      basis = '其他类型主机（按火灾报警系统控制主机市场价计）：' + (def.brand || '') + '，' + Number(p).toFixed(2) + '元/' + (def.unit || it.unit);
      brandOut = '按火灾报警控制主机市场价参考（成套设备，' + Number(p).toFixed(0) + '元/台）';
    }
    if (def.tiers && dd.v) basis += '（按' + dd.v + '就近取档）';
    return { price: Number(p), source: def.source === 'official' ? 'official' : 'market', basis: basis, brand: brandOut };
  }
  function elecPrice(it, periodKey) {
    var FP = firePriceTable(periodKey);
    var E = (FP && FP.elec) ? FP.elec : null;
    if (!E) return { price: null, source: 'pending', basis: '电气信息价库未加载', brand: '' };
    if (it.category === 'conduit') {
      var steel = it.conduitSteel;
      var tbl = steel ? E.steelConduit : E.jdgConduit;
      var nm = steel ? 'SC/RC 镀锌焊接钢管' : 'JDG/KBG 镀锌电线管';
      if (!tbl || !(it.dn > 0)) return { price: null, source: 'pending', basis: nm + ' 管径未识别，请注明如 SC25', brand: '' };
      var r = interpPrice(tbl, it.dn);
      if (!r) return { price: null, source: 'pending', basis: nm + ' 价格库无对应档位', brand: '' };
      return {
        price: r.price, source: 'official',
        basis: nm + ' DN' + it.dn + '：天津市' + (E.label || '当月') + '信息价 ' + r.price.toFixed(2) + '元/m（除税）' + (r.exact ? '' : '；无DN' + it.dn + '档，按DN' + r.tier + '档就近取定'),
        brand: '信息价（不标品牌）'
      };
    }
    if (it.category === 'wiring') {
      var wt = null, wnm = '';
      if (it.softWire) { wt = E.rvsWire; wnm = 'RVS 铜芯双绞软线'; }
      else if (/BVR/i.test(it.wireModel || '')) { wt = E.bvrWire; wnm = 'BVR 铜芯软电线'; }
      else { wt = E.bvWire; wnm = 'BV 铜芯绝缘电线'; }
      if (!wt || !(it.section > 0)) return { price: null, source: 'pending', basis: wnm + ' 导线截面未识别，请注明如 BV-2.5', brand: '' };
      var rw = interpPrice(wt, it.section);
      if (!rw) return { price: null, source: 'pending', basis: wnm + ' 价格库无对应截面', brand: '' };
      return {
        price: rw.price, source: 'official',
        basis: wnm + ' ' + it.section + 'mm²：天津市' + (E.label || '当月') + '信息价 ' + rw.price.toFixed(2) + '元/m（单芯除税）' + (rw.exact ? '' : '；无' + it.section + 'mm²档，按' + rw.tier + 'mm²档就近取定'),
        brand: '信息价（不标品牌）'
      };
    }
    if (it.category === 'bridge') {
      var bt = E.bridge;
      if (!bt || !(it.bridgeWidth > 0)) return { price: null, source: 'pending', basis: '桥架宽度未识别，请注明如 300×100', brand: '' };
      var rb = bridgePrice(bt, it.bridgeWidth, it.bridgeHeight);
      if (!rb) return { price: null, source: 'pending', basis: '桥架价格库无对应规格', brand: '' };
      return {
        price: rb.price, source: 'official',
        basis: '钢制槽式桥架 ' + rb.key + '：天津市' + (E.label || '当月') + '信息价 ' + rb.price.toFixed(2) + '元/m（除税）' + (rb.exact ? '' : '；价格库无该规格，按 ' + rb.key + ' 档就近取定'),
        brand: '信息价（不标品牌）'
      };
    }
    return { price: null, source: 'pending', basis: '未匹配价格来源', brand: '' };
  }

  function recomputePrice(it, periodKey) {
    if (it.isFire) {
      var fp = isElecCat(it.category) ? elecPrice(it, periodKey) : firePrice(it, periodKey);
      it.price = fp.price; it.priceSource = fp.source; it.priceBasis = fp.basis; it.priceBrand = fp.brand || '';
      return;
    }
    if (isAuxCat(it.category)) {
      var ap = auxPrice(it);
      it.price = ap.price; it.priceSource = ap.source; it.priceBasis = ap.basis; it.priceBrand = ap.brand || '';
      return;
    }
    if (isValveCat(it.category)) {
      var vp = valvePrice(it);
      it.price = vp.price; it.priceSource = vp.source; it.priceBasis = vp.basis; it.priceBrand = vp.brand || '';
      return;
    }
    var info = null;
    if (it.category === 'castIron') info = lookupCastIronPrice(periodKey, it);
    else if (it.category === 'galv') info = lookupGalvPrice(periodKey, it);
    else if (PIPE_GROUPS[it.category]) info = lookupPipePrice(periodKey, it);
    if (info) {
      it.price = info.price; it.priceSource = info.source; it.priceBasis = info.basis;
    } else {
      it.price = null;
      it.priceSource = isPriced(it) ? 'pending' : 'na';
      it.priceBasis = '';
    }
  }

  // ---------- 项目特征 ----------
  function featureText(it) {
    if (it.isFire) {
      var ff = [];
      ff.push('名称:' + it.name);
      ff.push('类型:' + (it.genericHost ? '其他类型主机（按火灾报警口径）' : (F_LABEL[it.category] || '消防')));
      var fsp = fireSpecText(it);
      if (fsp && fsp !== '—') ff.push('规格型号:' + fsp);
      if (it.priceBrand) ff.push('品牌参考:' + it.priceBrand);
      else if (it.priceSource === 'info') ff.push('品牌参考:信息价（不标品牌）');
      ff.push('其他:' + (it.genericHost ? '主机安装、接线、系统调试（按补充定额计列，请核对清单编码与基价）' : (F_WORK[it.category] || '')));
      return ff.join('；');
    }
    if (isAuxCat(it.category)) {
      var af = [];
      af.push('名称:' + it.name);
      af.push('类型:' + AUX_LABEL[it.category]);
      if (it.category === 'bracket') {
        af.push('计量:按型钢重量 kg 计');
        af.push('主材:型钢（信息价 4.20 元/kg）');
        af.push('其他:除锈、刷油、制作、安装、固定');
      } else {
        if (it.dn) af.push('规格型号:DN' + it.dn + ' 厚度' + it.insulThk + 'mm');
        else af.push('厚度:' + it.insulThk + 'mm');
        af.push('品牌参考:' + (it.priceBrand || ''));
        af.push('其他:' + (it.category === 'insulRubber' ? '保温壳安装、粘接、接缝处理' : '带铝箔玻璃棉铺贴、绑扎、接缝处理'));
      }
      return af.join('；');
    }
    if (isValveCat(it.category)) {
      var vf = [];
      vf.push('名称:' + it.name);
      vf.push('类型:' + V_LABEL[it.category]);
      if (it.dn) vf.push('规格型号:DN' + it.dn);
      vf.push('品牌参考:' + (it.brand || '信息价（不标品牌）'));
      vf.push('其他:' + (V_WORK[it.category] || ''));
      return vf.join('；');
    }
    var parts = [];
    parts.push('安装部位:' + (it.loc === 'out' ? '室外' : '室内'));
    parts.push('材质:' + (it.material || '铸铁'));
    if (it.dn) parts.push('型号规格:' + specCell(it));
    if (it.category === 'castIron') {
      parts.push('连接形式:承插');
      parts.push('接口材料:' + (JOINT_CN[it.joint] || '石棉水泥接口'));
      parts.push(it.medium === 'drain' ? '灌水试验、通球试验' : '水压试验、水冲洗');
    } else if (it.category === 'galv') {
      parts.push('连接形式:' + (JOINT_CN2[it.joint] || '螺纹连接'));
      if (it.joint === 'groove') parts.push('沟槽管件另计');
      else parts.push('接口材料:' + (it.joint === 'gas_thread' ? '聚四氟乙烯生料带（燃气管道）' : '铅油麻丝、聚四氟乙烯生料带'));
      parts.push(it.joint === 'gas_thread' ? '气压试验、空气吹扫' : '水压试验、水冲洗');
    } else if (PIPE_GROUPS[it.category]) {
      parts.push('连接形式:' + (JOINT_CN2[it.joint] || '焊接'));
      if (it.joint === 'groove') parts.push('沟槽管件另计');
      else if (it.joint === 'weld' || it.joint === 'arc' || it.joint === 'argon' || it.joint === 'oxy' || it.joint === 'braze') parts.push('接口材料:焊条/焊丝');
      if (it.medium === 'gas') parts.push('气压试验、空气吹扫');
      else if (it.medium === 'drain') parts.push('灌水试验、通球试验');
      else parts.push('水压试验、水冲洗、消毒冲洗');
    }
    return parts.join('；');
  }

  // ---------- 核对提示 ----------
  function buildFireWarn(it, quota) {
    var w = [];
    var c = it.category;
    if (c === 'fireDebug') {
      w.push('水灭火系统调试子目（030909001）不计主材价，工程量按关联清单数量自动生成，请核对');
      return w.join('；');
    }
    if (quota && quota.needPoints) w.push('名称未注点位数，请在「选项」列选择点数档位后重新计算');
    if (quota && quota.needDn) w.push('名称未识别规格（管径 / 截面 / 桥架宽度），请在名称中注明，如 SC25、BV-2.5、300×100');
    if (quota && quota.overRange) w.push('规格超出定额最大档，已取顶档 ' + quota.code + '，请核对');
    if (quota && quota.dnTier && it.dn && quota.dnTier !== it.dn && c !== 'wiring' && c !== 'bridge') {
      w.push('DN' + it.dn + '无对应档，按 DN' + quota.dnTier + '以内子目套用，请核对');
    }
    if (quota && quota.dnTier && c === 'wiring' && it.section && quota.dnTier !== it.section) {
      w.push(it.section + 'mm² 无对应档，按 ' + quota.dnTier + 'mm² 以内子目套用，请核对');
    }
    if (quota && quota.dnTier && c === 'bridge' && it.bridgeWidth && quota.dnTier !== it.bridgeWidth) {
      w.push('桥架宽 ' + it.bridgeWidth + ' 无对应档，按宽 ' + quota.dnTier + ' 以内子目套用，请核对');
    }
    if (quota && quota.crossVol) w.push('定额 ' + quota.code + ' 属' + quota.crossVol + '，跨册套用请核对册说明');
    if (quota && quota.manual) w.push('火灾报警系统控制主机无对应定额子目，已按补充定额计列，需人工补充基价并确认');
    if (it.genericHost) w.push('该主机类型未在标准清单子目中，已按 030904012 火灾报警系统控制主机口径 + 市场价计列，请核对清单编码与设备价');
    if (it.priceSource === 'manual') w.push('主材价需人工输入（设备品牌规格差异大，价格库不预设）');
    if (c === 'sprinkler') w.push('喷头按' + (it.ceiling === 'open' ? '无吊顶 7-10' : '有吊顶 7-11') + '计列，可在「选项」列切换有/无吊顶');
    if (c === 'hydrantIn') w.push('按' + (it.hydrantKind === 'dual' ? '双栓 7-54' : '单栓 7-53') + '计列，可在「选项」列切换单/双栓');
    if (c === 'siamese') w.push('按' + ({ under: '地下式', above: '地上式', wall: '墙壁式' }[it.siameseKind] || '地下式') + '计列，可在「选项」列切换安装型式');
    if (c === 'detPoint' && !/多线制|总线制/.test(it.name)) w.push('名称未注明多线制/总线制，已按总线制 7-144~7-148 计列，请在「选项」列确认');
    if (c === 'zoneCtrl' || c === 'linkageHost' || c === 'integrated') w.push('点数档位按名称中「XX点」匹配，可在「选项」列调整');
    if (c === 'conduit' && !it.conduitSteel) w.push('按电线管（JDG/KBG）敷设计列，若为 SC/RC 镀锌钢管请在名称中注明');
    if (c === 'wiring' && it.section > 4) w.push('导线截面大于 4mm²，已按动力线路子目计列，请核对');
    if (w.length) return w.join('；');
    return '';
  }

  function buildWarn(it, quota) {
    var w = [];
    if (it.isFire) return buildFireWarn(it, quota);
    if (it.category === 'bracket') {
      w.push('管道支架工程量按管道长度与管径分档含量估算，定额 7-138 计量单位 100kg，请按图纸支架实际重量调整');
      return w.join('；');
    }
    if (it.category === 'insulRubber' || it.category === 'insulGlass') {
      w.push((it.category === 'insulRubber' ? '橡塑保温' : '离心玻璃棉') + '按保温体积（m³）计，厚度按 ' + it.insulThk +
        'mm 取定；单位列填 m² 按面积×厚度折算，填 m 且含 DN 按 π×(DN+δ)×δ×L 折算');
      return w.join('；');
    }
    if (isValveCat(it.category)) {
      if (!it.dn && it.category !== 'flushValve') w.push('名称未注公称直径（如 DN100），已按本类最小档 ' + quota.code + ' 计列，请核对');
      if (quota.overRange) w.push('公称直径超本类最大档，已取顶档 ' + quota.code + '，请核对');
      if (it.category === 'flushValve') w.push('口部冲洗阀按 8-1260（壁龛式）计列，如为地坑式请改选 8-1261');
      if (it.category === 'waterValve' && !it.brand) w.push('该阀种取信息价，页面不标品牌');
      return w.join('；');
    }
    if (!isPriced(it)) {
      w.push('该材质（' + it.material + '）的清单/定额匹配逻辑待补充，暂只输出名称与长度，请手工套用');
      return w.join('；');
    }
    if (it.dn === null || it.dn === undefined || isNaN(it.dn)) {
      w.push('未识别公称直径，请在项目名称中注明（如 DN100 / DN150）');
    }
    if (it.jointFallback) {
      w.push('所选' + LOC_CN[it.loc] + MEDIUM_CN[it.medium] + '无' + (JOINT_CN[it.jointFallback] || JOINT_CN2[it.jointFallback] || it.jointFallback) + '子目，已按' + (JOINT_CN[it.joint] || JOINT_CN2[it.joint] || it.joint) + '套用，请核对');
    }
    if (it.jointNote) w.push(it.jointNote);
    if (it.category === 'galv' && it.joint === 'gas_thread') {
      var gasRange = it.loc === 'out' ? 'DN25~50' : 'DN15~100';
      if (it.dn !== null && (it.loc === 'out' ? (it.dn < 25 || it.dn > 50) : (it.dn < 15 || it.dn > 100))) {
        w.push('燃气镀锌钢管' + LOC_CN[it.loc] + '子目仅' + gasRange + '，DN' + it.dn + '超出范围，请核对');
      }
    }
    if (it.dn !== null && quota && quota.code && quota.dnTier && quota.dnTier !== it.dn) {
      w.push('DN' + it.dn + '无对应档，按 DN' + quota.dnTier + '以内子目套用，请核对');
    }
    if (PIPE_GROUPS[it.category]) {
      if (it.category === 'copper' && it.loc === 'out') w.push('第八册铜管无室外子目，已按室内铜管子目套用，请核对');
      if (it.loc === 'out' && it.joint === 'groove') w.push('室外管道无沟槽连接子目，已按室外钢管(焊接)套用，请核对');
      if (it.category === 'plastic' && it.isRain && it.joint === 'fusion') w.push('塑料雨水管无热熔子目，已按粘接或排水热熔子目套用，请核对');
      if (it.joint === 'groove') w.push('沟槽连接已附加管件定额' + ((it.extras || [])[0] ? ' ' + it.extras[0].code : '') + '，管件数量按6m定尺估算');
      if (it.medium === 'drain' || it.medium === 'gas') w.push('已附加管道消毒冲洗，排水/燃气管一般不计取，如无需请删除该定额行');
    }
    if (it.mediumAmbiguous) {
      if (it.category === 'galv') w.push('名称未注明给水/燃气，按给水（普通螺纹连接）套用，燃气管道请在选型列切换连接方式');
      else w.push('名称未注明给水/排水，按' + MEDIUM_CN[it.medium] + '套用，如不符请在名称中注明');
    }
    if (it.locAmbiguous) w.push('名称未注明室内/室外，按室内套用，可在选型列切换');
    if (it.qtyWarn) w.push('工程量缺失，暂按1m计，请核对');
    return w.join('；');
  }

  // ---------- 解析整表 ----------
  function parseRows(aoa, periodKey, format) {
    var results = [];
    var autoIdx = 0;
    for (var r = 0; r < aoa.length; r++) {
      var row = aoa[r] || [];
      var rawName = row[1];
      var name = (rawName === undefined || rawName === null) ? '' : String(rawName).trim();
      if (!name) continue;
      if (/序号/.test(String(row[0] || '')) && /名称/.test(name)) continue;
      if (/项目名称|管道名称|名称规格/.test(name) && !/\d/.test(name) && r < 5) continue;

      var it = buildItem(name);
      if (!it) continue;

      autoIdx++;
      var seqRaw = row[0];
      it.index = (seqRaw !== undefined && seqRaw !== null && String(seqRaw).trim() !== '') ? String(seqRaw).trim() : String(autoIdx);

      var qtyRaw = row[2];
      var qty = parseFloat(qtyRaw);
      it.qtyWarn = false;
      if (isNaN(qty) || qty <= 0) { qty = 1; it.qtyWarn = true; }
      // 保温绝热：D 列可填 m²（面积）或 m（管长），自动折算为 m³
      var unitRaw = row[3] === undefined || row[3] === null ? '' : String(row[3]).trim();
      if (it.category === 'insulRubber' || it.category === 'insulGlass') {
        var delta = (it.insulThk || 30) / 1000;
        if (/m²|㎡|平方米|平米/.test(unitRaw)) {
          qty = qty * delta;
          it.unitFrom = 'm²';
        } else if (/^(m|米|延米|延长米)$/.test(unitRaw) && it.dn) {
          qty = Math.PI * (it.dn / 1000 + delta) * delta * qty;
          it.unitFrom = 'm';
        }
        qty = Math.round(qty * 1000) / 1000;
      }
      it.quantity = qty;

      var quota = matchQuota(it);
      it.quotaCode = quota.code;
      it.quotaName = quota.name;
      it.quotaUnit = quota.unit || it.unit;
      it.quotaFactor = quota.factor || 1;
      it.codeInferred = !!quota.inferred;
      it.dnTier = quota.dnTier || null;
      it.extras = buildExtraQuotas(it, quota);
      it.warn = buildWarn(it, quota);

      recomputePrice(it, periodKey);
      it.features = featureText(it);
      results.push(it);
    }
    var out = withDebug(withBracket(results));
    out._periodKey = periodKey;
    out._format = format;
    return out;
  }

  function recomputeQuota(it) {
    var q = matchQuota(it);
    it.quotaCode = q.code;
    it.quotaName = q.name;
    it.quotaUnit = q.unit || it.unit;
    it.quotaFactor = q.factor || 1;
    it.codeInferred = !!q.inferred;
    it.dnTier = q.dnTier || null;
    it.extras = buildExtraQuotas(it, q);
    it.warn = buildWarn(it, q);
  }

  // ============================================================
  // 渲染
  // ============================================================
  function priceText(item) {
    if (item.category === 'fireDebug') return '<span class="tag tag-na">不计主材</span>';
    if (!isPriced(item)) return '<span class="tag tag-na">未计价</span>';
    if (item.price === null) {
      if (item.priceSource === 'manual') {
        var mtip = item.priceBasis ? ' title="' + String(item.priceBasis).replace(/"/g, '&quot;') + '"' : '';
        return '<span class="tag tag-pending"' + mtip + '>需人工填价</span>';
      }
      return '<span class="tag tag-pending">待询价</span>';
    }
    var tip = item.priceBasis ? ' title="' + String(item.priceBasis).replace(/"/g, '&quot;') + '"' : '';
    if (item.priceSource === 'estimated') return '<span class="tag tag-est"' + tip + '>估</span> <span' + tip + '>¥' + item.price.toFixed(2) + '</span>';
    if (item.priceSource === 'market') return '<span class="tag tag-market"' + tip + '>市场价</span> <span' + tip + '>¥' + item.price.toFixed(2) + '</span>';
    return '<span class="tag tag-info"' + tip + '>信息价</span> <span' + tip + '>¥' + item.price.toFixed(2) + '</span>';
  }
  function inferTag(it) {
    return it.codeInferred ? '<span class="tag tag-infer" title="定额编号按公称直径档位就近推算，请对照2020预算基价第八册子目表核对">推</span>' : '';
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function opt(val, cur, label) {
    return '<option value="' + val + '"' + (val === cur ? ' selected' : '') + '>' + label + '</option>';
  }
  function sel(act, idx, html) {
    return '<select class="cell-select" data-act="' + act + '" data-idx="' + idx + '">' + html + '</select>';
  }

  // ---------- 消防 / 配管配线桥架：选项列 ----------
  var FIRE_OPT_DEFS = {
    wireMode: [{ v: 'bus', t: '总线制' }, { v: 'multi', t: '多线制' }],
    mount: [{ v: 'wall', t: '壁挂式' }, { v: 'floor', t: '落地式' }],
    alertKind: [{ v: 'soundLight', t: '声光报警' }, { v: 'bell', t: '警铃' }],
    phoneKind: [{ v: 'phoneJack', t: '电话插孔' }, { v: 'phoneExt', t: '电话分机' }],
    speakerKind: [{ v: 'speaker', t: '吸顶式扬声器' }, { v: 'wallSpeaker', t: '壁挂式音箱' }],
    moduleKind: [{ v: 'moduleSingle', t: '单输出' }, { v: 'moduleMulti', t: '多输出' }, { v: 'moduleAlarm', t: '报警模块' }],
    boxMount: [{ v: 'in', t: '户内' }, { v: 'out', t: '户外' }],
    ceiling: [{ v: 'ceiling', t: '有吊顶' }, { v: 'open', t: '无吊顶' }],
    conn: [{ v: 'thread', t: '螺纹连接' }, { v: 'flange', t: '法兰连接' }],
    hydrantKind: [{ v: 'single', t: '单栓' }, { v: 'dual', t: '双栓' }],
    outKind: [
      { v: 'under1', t: '地下式 浅型' }, { v: 'under2', t: '地下式 深Ⅰ型' }, { v: 'under3', t: '地下式 深Ⅱ型' },
      { v: 'above1', t: '地上式 浅型' }, { v: 'above2', t: '地上式 深Ⅰ型' }, { v: 'above3', t: '地上式 深Ⅱ型' }
    ],
    siameseKind: [{ v: 'under', t: '地下式' }, { v: 'above', t: '地上式' }, { v: 'wall', t: '墙壁式' }],
    routes: [{ v: '3', t: '3路以内' }, { v: '5', t: '5路以内' }],
    layMode: [{ v: 'concealed', t: '暗配' }, { v: 'surface', t: '明配' }],
    bcastKind: [
      { v: 'amp125', t: '125W 功放' }, { v: 'amp250', t: '250W 功放' }, { v: 'recorder', t: '录音机' },
      { v: 'broadcastCab', t: '广播控制柜' }, { v: 'speaker', t: '吸顶式扬声器' }, { v: 'wallSpeaker', t: '壁挂式音箱' },
      { v: 'distributor', t: '广播分配器' }, { v: 'phoneSwitch', t: '电话交换机' }
    ],
    doors: [{ v: '20', t: '20门' }, { v: '40', t: '40门' }, { v: '60', t: '60门' }]
  };
  var POINT_TIERS_COMMON = [{ v: '32', t: '32点' }, { v: '64', t: '64点' }];
  var POINT_TIERS_BUS = [{ v: '200', t: '200点' }, { v: '500', t: '500点' }, { v: '1000', t: '1000点' }, { v: '1500', t: '1000点以外' }];
  var POINT_TIERS_LINK = [{ v: '100', t: '100点' }, { v: '200', t: '200点' }, { v: '500', t: '500点' }, { v: '800', t: '500点以外' }];
  var POINT_TIERS_INTEG = [{ v: '500', t: '500点' }, { v: '1000', t: '1000点' }, { v: '2000', t: '2000点' }, { v: '3000', t: '2000点以外' }];

  function selOf(defs, cur, act, idx, num) {
    var html = defs.map(function (d) { return opt(d.v, String(cur), d.t); }).join('');
    return '<select class="cell-select"' + (num ? ' data-num="1"' : '') + ' data-act="' + act + '" data-idx="' + idx + '">' + html + '</select>';
  }
  function fireOptCell(it) {
    var c = it.category, i = it._i, blocks = [];
    if (c === 'detPoint') blocks.push(selOf(FIRE_OPT_DEFS.wireMode, it.wireMode, 'wireMode', i));
    else if (c === 'soundLight') blocks.push(selOf(FIRE_OPT_DEFS.alertKind, it.alertKind, 'alertKind', i));
    else if (c === 'firePhone') blocks.push(selOf(FIRE_OPT_DEFS.phoneKind, it.phoneKind, 'phoneKind', i));
    else if (c === 'fireBroadcast') blocks.push(selOf(FIRE_OPT_DEFS.speakerKind, it.speakerKind, 'speakerKind', i));
    else if (c === 'fireModule') blocks.push(selOf(FIRE_OPT_DEFS.moduleKind, it.moduleKind, 'moduleKind', i));
    else if (c === 'moduleBox') blocks.push(selOf(FIRE_OPT_DEFS.boxMount, it.mount, 'mount', i));
    else if (c === 'zoneCtrl' || c === 'linkageHost' || c === 'integrated') {
      if (c !== 'integrated') blocks.push(selOf(FIRE_OPT_DEFS.wireMode, it.wireMode, 'wireMode', i));
      if (c !== 'zoneCtrl') blocks.push(selOf(FIRE_OPT_DEFS.mount, it.mount, 'mount', i));
      else blocks.push(selOf(FIRE_OPT_DEFS.mount, it.mount, 'mount', i));
      var pt = c === 'zoneCtrl'
        ? ((it.wireMode === 'multi') ? POINT_TIERS_COMMON : POINT_TIERS_BUS)
        : (c === 'linkageHost'
          ? ((it.wireMode === 'multi') ? [{ v: '100', t: '100点' }, { v: '200', t: '100点以外' }] : POINT_TIERS_LINK)
          : POINT_TIERS_INTEG);
      blocks.push(selOf(pt, String(it.points || pt[0].v), 'points', i, true));
    }
    else if (c === 'floorDisp') blocks.push(selOf(FIRE_OPT_DEFS.wireMode, it.wireMode, 'wireMode', i));
    else if (c === 'remoteCtrl') blocks.push(selOf(FIRE_OPT_DEFS.routes, it.routes, 'routes', i, true));
    else if (c === 'broadcastHost') {
      blocks.push(selOf(FIRE_OPT_DEFS.bcastKind, it.bcastKind, 'bcastKind', i));
      if (it.bcastKind === 'phoneSwitch') blocks.push(selOf(FIRE_OPT_DEFS.doors, it.doors, 'doors', i, true));
    }
    else if (c === 'cabinet') blocks.push(selOf(FIRE_OPT_DEFS.mount, it.mount, 'mount', i));
    else if (c === 'sprinkler') blocks.push(selOf(FIRE_OPT_DEFS.ceiling, it.ceiling, 'ceiling', i));
    else if (c === 'flowIndicator') blocks.push(selOf(FIRE_OPT_DEFS.conn, it.conn, 'conn', i));
    else if (c === 'hydrantIn') blocks.push(selOf(FIRE_OPT_DEFS.hydrantKind, it.hydrantKind, 'hydrantKind', i));
    else if (c === 'hydrantOut') blocks.push(selOf(FIRE_OPT_DEFS.outKind, it.outKind, 'outKind', i));
    else if (c === 'siamese') blocks.push(selOf(FIRE_OPT_DEFS.siameseKind, it.siameseKind, 'siameseKind', i));
    else if (c === 'conduit') blocks.push(selOf(FIRE_OPT_DEFS.layMode, it.layMode, 'layMode', i));
    if (!blocks.length) return '<span class="lay-static">—</span>';
    return '<div style="display:flex;flex-direction:column;gap:4px;">' + blocks.join('') + '</div>';
  }

  // ---------- 消防 / 配管配线桥架：规格列 ----------
  function fireSpecText(it) {
    var c = it.category;
    if (c === 'detPoint') return (it.detName || '感烟');
    if (c === 'detLinear') return '缆式线型';
    if (c === 'btn') return it.btnKind === 'hydrantButton' ? '消火栓按钮' : '手动报警按钮';
    if (c === 'soundLight') return it.alertKind === 'bell' ? '警铃' : '声光报警';
    if (c === 'firePhone') return it.phoneKind === 'phoneExt' ? '电话分机' : '电话插孔';
    if (c === 'fireBroadcast') return it.speakerKind === 'wallSpeaker' ? '壁挂式' : '吸顶式';
    if (c === 'fireModule') return ({ moduleSingle: '单输出', moduleMulti: '多输出', moduleAlarm: '报警模块' })[it.moduleKind] || '单输出';
    if (c === 'moduleBox') return it.mount === 'out' ? '户外' : '户内';
    if (c === 'zoneCtrl' || c === 'linkageHost' || c === 'integrated') {
      return (c === 'integrated' ? '' : (it.wireMode === 'multi' ? '多线制 ' : '总线制 ')) +
        (it.mount === 'floor' ? '落地式' : '壁挂式') + (it.points ? ' ' + it.points + '点' : '');
    }
    if (c === 'floorDisp') return it.wireMode === 'multi' ? '多线制' : '总线制';
    if (c === 'remoteCtrl') return (it.routes || 3) + '路以内';
    if (c === 'fireHost') return '成套';
    if (c === 'broadcastHost') {
      if (it.bcastKind === 'phoneSwitch') return '电话交换机 ' + (it.doors || 20) + '门';
      for (var b = 0; b < BCAST_TYPES.length; b++) if (BCAST_TYPES[b].key === it.bcastKind) return BCAST_TYPES[b].name.replace(/^.*安装\s*/, '');
      return '成套';
    }
    if (c === 'microComputer') return '成套';
    if (c === 'backupPower') return '成套';
    if (c === 'cabinet') return it.mount === 'wall' ? '墙挂式' : '落地式';
    if (c === 'sprinkler') return 'DN15 ' + (it.ceiling === 'open' ? '无吊顶' : '有吊顶');
    if (c === 'flowIndicator') return (it.dn ? 'DN' + it.dn + ' ' : '') + (it.conn === 'flange' ? '法兰' : '螺纹');
    if (c === 'orifice') return it.dn ? 'DN' + it.dn : '—';
    if (c === 'hydrantIn') return 'DN65 ' + (it.hydrantKind === 'dual' ? '双栓' : '单栓');
    if (c === 'hydrantOut') return (HYDRANT_OUT_Q[it.outKind || 'under1'] || {}).name ? (it.outKind || 'under1').indexOf('above') === 0 ? '地上式' : '地下式' : '地下式';
    if (c === 'testDevice') return 'DN' + (it.dn || 25);
    if (c === 'siamese') return ({ under: '地下式', above: '地上式', wall: '墙壁式' }[it.siameseKind] || '地下式') + ' DN' + (it.dn || 100);
    if (c === 'monitor') return '进口口径' + (it.dn || 50) + 'mm';
    if (c === 'fireDebug') return '—';
    if (c === 'conduit') return (it.conduitSteel ? 'SC' : 'JDG') + (it.dn || '') + ' ' + (it.layMode === 'surface' ? '明配' : '暗配');
    if (c === 'wiring') return (it.section ? it.section + 'mm²' : '—') + (it.softWire ? ' 软线' : '');
    if (c === 'bridge') return (it.bridgeWidth ? it.bridgeWidth + (it.bridgeHeight ? '×' + it.bridgeHeight : '') : '—');
    return '—';
  }
  function itTypeOf(it) {
    if (it.isFire) {
      if (it.genericHost) return '其他类型主机（按火灾报警口径）';
      return F_LABEL[it.category] || '消防';
    }
    if (isAuxCat(it.category)) return AUX_LABEL[it.category];
    if (isValveCat(it.category)) return V_LABEL[it.category];
    return '管道';
  }
  function itMaterialOf(it) {
    if (it.isFire) return '';                       // 消防设备（电/水）无材质概念，导出留空
    if (it.isFireWater) return (it.material || '') + '（消防水）';  // 消防水管道
    return it.material || '';
  }

  // 安装部位 / 接口形式 列
  function layCell(it) {
    if (it.isFire) return fireOptCell(it);
    if (isAuxCat(it.category)) return '<span class="lay-static">—</span>';
    if (isValveCat(it.category)) return '<span class="lay-static">—</span>';
    if (!isPriced(it)) {
      return '<span class="lay-static">待补充</span>';
    }
    var locHtml = opt('in', it.loc, '室内') + opt('out', it.loc, '室外');
    var js = jointsOf(it);
    var jointHtml = js.map(function (j) { return opt(j, it.joint, JOINT_CN2[j] || JOINT_CN[j] || j); }).join('');
    return '<div style="display:flex;flex-direction:column;gap:4px;">' +
      sel('loc', it._i, locHtml) + sel('joint', it._i, jointHtml) + '</div>';
  }

  function specCell(it) {
    if (it.isFire) return fireSpecText(it);
    if (isAuxCat(it.category)) {
      if (it.category === 'bracket') return '—';
      return (it.dn ? 'DN' + it.dn + ' ' : '') + 'δ' + it.insulThk;
    }
    if (isValveCat(it.category)) return it.dn ? 'DN' + it.dn : (it.category === 'flushValve' ? '成套' : '—');
    if (it.dn === null || it.dn === undefined || isNaN(it.dn)) return '—';
    var p = (it.category === 'plastic' || it.category === 'composite' || it.category === 'copper') ? 'De' : 'DN';
    return p + it.dn;
  }

  function renderTable(data) {
    var tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    data.forEach(function (item, i) {
      item._i = i;
      var tr = document.createElement('tr');
      if (item.warn) tr.className = 'row-warn';
      tr.innerHTML =
        '<td>' + escapeHtml(item.index) + '</td>' +
        '<td>' + (item.listCode || '—') + '</td>' +
        '<td class="cell-name" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</td>' +
        '<td>' + layCell(item) + '</td>' +
        '<td>' + specCell(item) + '</td>' +
        '<td class="cell-qcode">' + (item.quotaCode || '—') + ' ' + inferTag(item) + '</td>' +
        '<td class="cell-qname" title="' + escapeHtml(item.quotaName + ((item.extras && item.extras.length) ? ' ＋ ' + item.extras.map(function (x) { return x.code + ' ' + x.name; }).join(' ＋ ') : '')) + '">' +
          escapeHtml(item.quotaName || '—') +
          ((item.extras && item.extras.length) ? item.extras.map(function (x) {
            return '<br><span class="tag tag-info">＋' + x.code + '</span> <span style="font-size:12px;color:#5b6b73">' + escapeHtml(x.name.replace(/^.*?管道\s*/, '')) + '</span>';
          }).join('') : '') + '</td>' +
        '<td class="cell-price">' + priceText(item) + '</td>' +
        '<td>' + item.quantity + '</td>' +
        '<td class="cell-warn">' + (item.warn ? '<span title="' + escapeHtml(item.warn) + '">⚠️ ' + escapeHtml(item.warn) + '</span>' : '') + '</td>';
      tbody.appendChild(tr);
    });

    bindRowSelects(data);

    var elecN = data.filter(function (d) { return d.isFire && isFireElecCat(d.category); }).length;
    var waterN = data.filter(function (d) { return d.isFire && isFireWaterCat(d.category) && d.category !== 'fireDebug'; }).length;
    var other = data.length - elecN - waterN;
    var pending = data.filter(function (d) { return isPriced(d) && d.price === null && d.category !== 'fireDebug'; }).length;
    var total = data.reduce(function (s, d) { return s + (d.price === null ? 0 : d.price * d.quantity); }, 0);

    document.getElementById('totalCount').textContent = data.length;
    var elE = document.getElementById('catElec'); if (elE) elE.textContent = elecN;
    var elW = document.getElementById('catWater'); if (elW) elW.textContent = waterN;
    document.getElementById('catOther').textContent = other;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('totalPrice').textContent = '¥' + total.toFixed(2);
  }

  function bindRowSelects(data) {
    document.querySelectorAll('#tableBody select.cell-select').forEach(function (s) {
      s.addEventListener('change', function () {
        var idx = parseInt(s.getAttribute('data-idx'), 10);
        var act = s.getAttribute('data-act');
        var it = data[idx];
        if (!it) return;
        if (act === 'loc') {
          it.loc = s.value;
          it.locAmbiguous = false;
          var allow = jointsOf(it);
          if (allow.indexOf(it.joint) < 0) it.joint = defaultJoint(it);
          it.jointFallback = null;
        } else if (act === 'joint') {
          it.joint = s.value;
          it.jointFallback = null;
        } else {
          var raw = s.value;
          var isNum = s.getAttribute('data-num') === '1';
          if (act === 'mount' && (it.category === 'cabinet' || it.category === 'moduleBox')) {
            it.mount = raw;
          } else if (act === 'points') {
            it.points = isNum ? Number(raw) : raw;
          } else if (act === 'routes' || act === 'doors') {
            it[act] = Number(raw);
          } else {
            it[act] = isNum ? Number(raw) : raw;
          }
          if (act === 'wireMode' && (it.category === 'zoneCtrl' || it.category === 'linkageHost')) {
            it.points = null;
          }
        }
        recomputeQuota(it);
        recomputePrice(it, data._periodKey);
        it.features = featureText(it);
        renderTable(data);
      });
    });
  }

  // ============================================================
  // 导出
  // ============================================================
  function round4(v) { return Math.round(v * 10000) / 10000; }
  function num2(v) { return v === null || v === undefined ? '' : Number(Number(v).toFixed(2)); }

  function exportJianjing(data) {
    var wsData = [['序号', '清单编码', '项目名称', '定额编码', '定额名称', '主材价格', '数量', '项目特征']];
    data.forEach(function (it) {
      wsData.push([it.index, it.listCode, it.name, it.quotaCode, it.quotaName,
        it.price === null ? '' : num2(it.price), it.quantity, it.features]);
      (it.extras || []).forEach(function (x) {
        wsData.push(['', '', '', x.code, x.name + '（数量' + round4(x.qty / (x.factor || 1)) + ' ' + x.unit + '）', '', '', '']);
      });
    });
    var total = data.reduce(function (s, d) { return s + (d.price === null ? 0 : d.price * d.quantity); }, 0);
    wsData.push([]);
    wsData.push(['合计', '', '', '', '', num2(total), '', '']);

    var ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 8 }, { wch: 14 }, { wch: 42 }, { wch: 10 }, { wch: 40 }, { wch: 12 }, { wch: 8 }, { wch: 66 }];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '清单定额报价表');
    XLSX.writeFile(wb, '消防专业智能组价_建经_' + stamp() + '.xlsx');
  }

  function exportGLD(data) {
    var wsData = [['序号', '项目名称', '类型', '材质', '型号', '规格', '截面mm2', '工程量',
      '项目编码', '类型', '名称', '项目特征', '单位', '工程量', '主材单价']];

    var zIdx = 0;
    data.forEach(function (it) {
      var hasPrice = it.price !== null && isPriced(it);
      var specVal = specCell(it);

      if (!it.quotaCode) {
        wsData.push([
          it.index, it.name, itTypeOf(it), itMaterialOf(it), '', specVal, '', it.quantity,
          '', '待人工处理', it.name, it.features, it.unit, it.quantity,
          hasPrice ? num2(it.price) : ''
        ]);
        return;
      }
      wsData.push([
        it.index, it.name, itTypeOf(it), itMaterialOf(it), '', specVal, '', it.quantity,
        it.listCode, '清单行', it.name, it.features, it.unit, it.quantity,
        hasPrice ? num2(it.price) : ''
      ]);
      var qFactor = it.quotaFactor || 1;
      var sub = 0;
      wsData.push([
        it.index + '.' + (++sub), '', '', '', '', '', '', '',
        it.quotaCode, '定额行', it.quotaName, '', it.quotaUnit || it.unit,
        round4(it.quantity / qFactor), ''
      ]);
      (it.extras || []).forEach(function (x) {
        wsData.push([
          it.index + '.' + (++sub), '', '', '', '', '', '', '',
          x.code, '定额行', x.name, '', x.unit, round4(x.qty / (x.factor || 1)), ''
        ]);
      });
      if (hasPrice) {
        zIdx++;
        wsData.push([
          it.index + '.' + (++sub), '', '', '', '', '', '', '',
          'Z00741-' + String(zIdx).padStart(3, '0'), '子目下设备', it.name, '', it.unit, it.quantity, num2(it.price)
        ]);
      }
    });

    var total = data.reduce(function (s, d) { return s + (d.price === null ? 0 : d.price * d.quantity); }, 0);
    wsData.push([]);
    wsData.push(['合计', '', '', '', '', '', '', '', '', '', '', '', '', '', num2(total)]);

    var ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 8 }, { wch: 40 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 16 }, { wch: 9 }, { wch: 9 },
      { wch: 13 }, { wch: 10 }, { wch: 40 }, { wch: 56 }, { wch: 6 }, { wch: 9 }, { wch: 12 }
    ];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '清单定额报价表');
    XLSX.writeFile(wb, '消防专业智能组价_广联达_' + stamp() + '.xlsx');
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  }
  function stamp() {
    var d = new Date();
    return today() + '_' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
  }

  // ============================================================
  // 初始化 & 事件
  // ============================================================
  var exportData = [];

  function currentFormat() {
    return (document.querySelector('input[name="software"]:checked') || {}).value || 'guanglianda';
  }
  function currentPeriod() {
    var el = document.getElementById('periodSelect');
    return el ? el.value : (getPeriods()[0] || {}).period;
  }

  function refreshAll() {
    if (!window._rawAOA) return;
    exportData = parseRows(window._rawAOA, currentPeriod(), currentFormat());
    renderTable(exportData);
    var area = document.getElementById('resultArea');
    var btn = document.getElementById('btnGroup');
    var bar = document.getElementById('statusBar');
    if (exportData.length) {
      area.style.display = 'block';
      btn.style.display = 'flex';
      bar.style.display = 'block';
      bar.className = 'status-bar status-ok';
      var cnt = {};
      exportData.forEach(function (d) { cnt[d.category] = (cnt[d.category] || 0) + 1; });
      var nameMap = {
        detPoint: '点型探测器', detLinear: '线型探测器', btn: '按钮', soundLight: '警报装置',
        firePhone: '消防电话', fireBroadcast: '消防广播', fireModule: '消防模块', moduleBox: '模块箱',
        zoneCtrl: '区域报警控制器', floorDisp: '楼层显示器', remoteCtrl: '远程控制器', fireHost: '火灾报警主机',
        linkageHost: '联动控制主机', broadcastHost: '广播/对讲主机', microComputer: '控制微机', backupPower: '备用电源',
        integrated: '报警联动一体机', cabinet: '机柜',
        sprinkler: '喷头', flowIndicator: '水流指示器', orifice: '减压孔板', hydrantIn: '室内消火栓',
        hydrantOut: '室外消火栓', testDevice: '末端试水装置', siamese: '水泵接合器', monitor: '消防水炮',
        fireDebug: '水灭火系统调试', conduit: '配管', wiring: '配线', bridge: '桥架',
        castIron: '铸铁管', galv: '镀锌钢管', seamless: '无缝钢管', welded: '焊接钢管', copper: '铜管',
        stainless: '不锈钢管', composite: '复合管', plastic: '塑料管', waterValve: '阀门',
        bracket: '管道支架', insulRubber: '橡塑保温', insulGlass: '玻璃棉', other: '其他材质'
      };
      var parts = [];
      Object.keys(nameMap).forEach(function (k) { if (cnt[k]) parts.push(nameMap[k] + ' ' + cnt[k] + ' 条'); });
      bar.textContent = '成功解析 ' + exportData.length + ' 条：' + parts.join('、') +
        '；「选项 / 安装方式」列可切换走线制式、安装方式、点数档位、喷头吊顶、接合器型式等，定额与主材价实时重算；黄色行为需人工核对项';
    } else {
      area.style.display = 'none';
      btn.style.display = 'none';
      bar.style.display = 'block';
      bar.className = 'status-bar status-err';
      bar.textContent = '未在B列识别到消防清单项目名称，请检查表头是否为：A序号 / B项目名称 / C数量';
    }
  }

  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', function () {
    var selEl = document.getElementById('periodSelect');
    getPeriods().forEach(function (p) {
      var o = document.createElement('option');
      o.value = p.period;
      o.textContent = p.releaseLabel;
      selEl.appendChild(o);
    });
    selEl.addEventListener('change', refreshAll);

    var fileInput = document.getElementById('excelFile');
    var uploadArea = document.getElementById('uploadArea');

    fileInput.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (file) readFile(file);
    });

    uploadArea.addEventListener('click', function () { fileInput.click(); });
    uploadArea.addEventListener('dragover', function (e) { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', function () { uploadArea.classList.remove('dragover'); });
    uploadArea.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      var f = e.dataTransfer.files[0];
      if (f) readFile(f);
    });

    document.querySelectorAll('input[name="software"]').forEach(function (r) {
      r.addEventListener('change', refreshAll);
    });

    document.getElementById('resetBtn').addEventListener('click', function () {
      window._rawAOA = null;
      exportData = [];
      document.getElementById('resultArea').style.display = 'none';
      document.getElementById('btnGroup').style.display = 'none';
      document.getElementById('summaryArea').style.display = 'none';
      document.getElementById('statusBar').style.display = 'none';
      fileInput.value = '';
      document.getElementById('tableBody').innerHTML = '';
      document.getElementById('uploadArea').style.display = 'block';
    });

    document.getElementById('exportBtn').addEventListener('click', function () {
      if (!exportData.length) return;
      if (currentFormat() === 'jianjing') exportJianjing(exportData);
      else exportGLD(exportData);
    });
  });

  function readFile(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = new Uint8Array(e.target.result);
        var wb = XLSX.read(data, { type: 'array' });
        var ws = wb.Sheets[wb.SheetNames[0]];
        var aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        window._rawAOA = aoa;
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('summaryArea').style.display = 'grid';
        refreshAll();
      } catch (err) {
        var bar = document.getElementById('statusBar');
        bar.style.display = 'block';
        bar.className = 'status-bar status-err';
        bar.textContent = '文件解析失败：' + err.message;
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // 本地调试/自动化句柄（纯前端、本地计算）
  if (typeof window !== 'undefined') {
    window.__fire = window.__pipe = {
      parseRows: parseRows, matchQuota: matchQuota, buildItem: buildItem,
      recomputeQuota: recomputeQuota, getPeriods: getPeriods,
      exportGLD: exportGLD, exportJianjing: exportJianjing,
      getData: function () { return exportData; },
      setAOA: function (aoa) {
        window._rawAOA = aoa;
        exportData = parseRows(aoa, currentPeriod(), currentFormat());
        renderTable(exportData);
        return exportData;
      },
      setLoc: function (i, v) {
        var it = exportData[i]; it.loc = v; it.locAmbiguous = false;
        var allow = jointsOf(it);
        if (allow.indexOf(it.joint) < 0) it.joint = defaultJoint(it);
        it.jointFallback = null;
        recomputeQuota(it); recomputePrice(it, exportData._periodKey); it.features = featureText(it);
        renderTable(exportData);
      },
      setJoint: function (i, v) {
        var it = exportData[i]; it.joint = v; it.jointFallback = null;
        recomputeQuota(it); recomputePrice(it, exportData._periodKey); it.features = featureText(it);
        renderTable(exportData);
      }
    };
  }

  // 暴露给Node测试
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      LIST: LIST, CAST_IRON: CAST_IRON, GALV: GALV, JOINT_CN: JOINT_CN,
      buildItem: buildItem, matchQuota: matchQuota, parseRows: parseRows,
      fireCatOf: fireCatOf, elecCatOf: elecCatOf, F_LIST: F_LIST, F_LABEL: F_LABEL,
      matchFireQuota: matchFireQuota, matchElecQuota: matchElecQuota,
      firePrice: firePrice, elecPrice: elecPrice, withDebug: withDebug,
      isFireElecCat: isFireElecCat, isFireWaterCat: isFireWaterCat, isElecCat: isElecCat,
      parseDN: parseDN, parseMedium: parseMedium, parseLoc: parseLoc, parseJoint: parseJoint,
      materialOf: materialOf, jointsOf: jointsOf, defaultJoint: defaultJoint,
      lookupCastIronPrice: lookupCastIronPrice, lookupGalvPrice: lookupGalvPrice,
      lookupPipePrice: lookupPipePrice, getPeriods: getPeriods,
      pipeKey: pipeKey, isPriced: isPriced, PIPE_GROUPS: PIPE_GROUPS,
      parsePipeJoint: parsePipeJoint, JOINT_CN2: JOINT_CN2,
      featureText: featureText, buildWarn: buildWarn,
      exportGLD: exportGLD, exportJianjing: exportJianjing,
      V_LIST: V_LIST, V_LABEL: V_LABEL, isValveCat: isValveCat, valveCatOf: valveCatOf,
      buildValveItem: buildValveItem, matchValveQuota: matchValveQuota, valvePrice: valvePrice,
      V_WTHREAD: V_WTHREAD, V_WFLANGE: V_WFLANGE, V_FLOAT: V_FLOAT, V_LEVEL: V_LEVEL,
      V_STHREAD: V_STHREAD, V_SFLANGE: V_SFLANGE,
      AUX_LIST: AUX_LIST, AUX_LABEL: AUX_LABEL, isAuxCat: isAuxCat, auxCatOf: auxCatOf,
      buildAuxItem: buildAuxItem, matchAuxQuota: matchAuxQuota, auxPrice: auxPrice,
      bracketWeightPerM: bracketWeightPerM, withBracket: withBracket,
      fireCatOf: fireCatOf, elecCatOf: elecCatOf, F_LIST: F_LIST, F_LABEL: F_LABEL,
      matchFireQuota: matchFireQuota, matchElecQuota: matchElecQuota,
      firePrice: firePrice, elecPrice: elecPrice, withDebug: withDebug,
      isFireElecCat: isFireElecCat, isFireWaterCat: isFireWaterCat, isElecCat: isElecCat,
      fireSpecText: fireSpecText, itTypeOf: itTypeOf, itMaterialOf: itMaterialOf
    };
  }
})();
