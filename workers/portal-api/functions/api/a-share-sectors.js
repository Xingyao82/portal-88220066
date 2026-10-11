const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  Accept: "application/json,text/plain,*/*",
  Referer: "https://quote.eastmoney.com/"
};

const CACHE_SECONDS = 300;
const PAGE_LIMIT = 50;
const MAX_PAGES_PER_TYPE = 10;

function toNumber(value) {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function fmtPct(value) {
  if (!Number.isFinite(value)) return null;
  return Number(value.toFixed(2));
}

function riskLabel(value) {
  if (!Number.isFinite(value)) return "unknown";
  if (value >= 5) return "strong";
  if (value >= 2) return "good";
  if (value <= -5) return "weak";
  if (value <= -2) return "soft";
  return "neutral";
}

function marketLabel(type) {
  if (type === "industry") return "行业";
  if (type === "concept") return "概念";
  return "板块";
}

const REPRESENTATIVE_ETF_RULES = [
  { keys: ["证券", "券商"], code: "512880", name: "证券ETF" },
  { keys: ["银行"], code: "512800", name: "银行ETF" },
  { keys: ["保险"], code: "512070", name: "证券保险ETF" },
  { keys: ["半导体"], code: "512480", name: "半导体ETF" },
  { keys: ["芯片", "集成电路"], code: "159995", name: "芯片ETF" },
  { keys: ["通信", "5G", "6G"], code: "515880", name: "通信ETF" },
  { keys: ["软件", "信创", "云计算", "人工智能", "AI", "算力", "数据要素"], code: "515230", name: "软件ETF" },
  { keys: ["计算机"], code: "512720", name: "计算机ETF" },
  { keys: ["游戏", "电竞"], code: "159869", name: "游戏ETF" },
  { keys: ["传媒", "短剧"], code: "512980", name: "传媒ETF" },
  { keys: ["新能源车", "汽车整车", "汽车零部件", "无人驾驶", "智能驾驶"], code: "515030", name: "新能源车ETF" },
  { keys: ["电池", "锂电", "固态电池"], code: "561910", name: "电池ETF" },
  { keys: ["新能源"], code: "516160", name: "新能源ETF" },
  { keys: ["光伏", "太阳能"], code: "515790", name: "光伏ETF" },
  { keys: ["风电"], code: "516180", name: "风电ETF" },
  { keys: ["储能"], code: "159566", name: "储能电池ETF" },
  { keys: ["机器人", "工业母机", "自动化"], code: "562500", name: "机器人ETF" },
  { keys: ["军工", "航天", "船舶"], code: "512660", name: "军工ETF" },
  { keys: ["有色", "铜", "铝", "稀土", "小金属"], code: "512400", name: "有色金属ETF" },
  { keys: ["钢铁"], code: "515210", name: "钢铁ETF" },
  { keys: ["煤炭"], code: "515220", name: "煤炭ETF" },
  { keys: ["石油", "油气"], code: "159697", name: "油气ETF" },
  { keys: ["化工", "氟化工", "磷化工"], code: "516020", name: "化工ETF" },
  { keys: ["黄金", "贵金属"], code: "518880", name: "黄金ETF" },
  { keys: ["白酒", "啤酒", "酿酒", "黄酒"], code: "512690", name: "酒ETF" },
  { keys: ["食品饮料", "饮料", "乳业"], code: "515170", name: "食品饮料ETF" },
  { keys: ["消费", "零售", "免税"], code: "159928", name: "消费ETF" },
  { keys: ["旅游", "酒店", "航空机场"], code: "159766", name: "旅游ETF" },
  { keys: ["医药", "医疗器械", "创新药", "生物制品", "中药"], code: "512010", name: "医药ETF" },
  { keys: ["医疗", "CRO"], code: "512170", name: "医疗ETF" },
  { keys: ["农业", "养殖", "猪肉", "鸡肉", "种业"], code: "159865", name: "养殖ETF" },
  { keys: ["房地产", "地产"], code: "512200", name: "房地产ETF" },
  { keys: ["基建", "建筑", "工程建设"], code: "516950", name: "基建ETF" },
  { keys: ["电力", "公用事业", "绿色电力"], code: "561560", name: "电力ETF" },
  { keys: ["环保", "碳中和"], code: "512580", name: "环保ETF" },
  { keys: ["物流", "快递"], code: "516910", name: "物流ETF" },
  { keys: ["央企", "国企"], code: "159259", name: "央企红利ETF" },
  { keys: ["红利", "高股息"], code: "510880", name: "红利ETF" },
  { keys: ["沪深300"], code: "510300", name: "沪深300ETF" },
  { keys: ["中证500"], code: "510500", name: "中证500ETF" },
  { keys: ["中证1000"], code: "512100", name: "中证1000ETF" },
  { keys: ["科创"], code: "588000", name: "科创50ETF" },
  { keys: ["创业板"], code: "159915", name: "创业板ETF" }
];

function representativeEtf(boardName = "") {
  const normalized = String(boardName).toUpperCase();
  const match = REPRESENTATIVE_ETF_RULES.find((rule) => rule.keys.some((key) => normalized.includes(String(key).toUpperCase())));
  return match ? { code: match.code, name: match.name } : null;
}

async function fetchBoardPage(type, page) {
  const fs = type === "industry" ? "m:90+t:2" : "m:90+t:3";
  const params = new URLSearchParams({
    pn: String(page),
    pz: String(PAGE_LIMIT),
    po: "1",
    fid: "f3",
    np: "1",
    fltt: "2",
    invt: "2",

    fs,
    fields: "f12,f14,f2,f3,f24,f25,f109,f110,f127,f128,f140,f141,f136,f152"
  });
  let lastError; const failures=[];
  for (const host of ["push2delay.eastmoney.com", "push2.eastmoney.com", "82.push2.eastmoney.com"]) {
    try {
      const response = await fetch(`https://${host}/api/qt/clist/get?${params}`, {
        headers: DEFAULT_HEADERS, signal: AbortSignal.timeout(4500),
        cf: { cacheTtl: CACHE_SECONDS, cacheTtlByStatus: {"200-299":CACHE_SECONDS,"400-599":0}, cacheEverything: true }
      });
      if (!response.ok) throw new Error(`${host}: HTTP ${response.status}`);
      const json = await response.json();
      const diff = json?.data?.diff;
      const rows = Array.isArray(diff) ? diff : Object.values(diff || {});
      if (!rows.length) throw new Error(`${host}: empty sector list (rc=${json?.rc})`);
      return { total: Number(json.data.total), rows: rows.map(row => ({...row, _boardType:type, _source:host})) };
    } catch (error) { lastError = error; failures.push(error.message); }
  }
  throw new Error(failures.join("; ") || lastError?.message);

}

async function fetchBoardsByType(type) {
  const first = await fetchBoardPage(type, 1);
  const pageCount = Math.min(Math.ceil(first.total / PAGE_LIMIT), MAX_PAGES_PER_TYPE);
  const rows = [...first.rows];
  for (let page = 2; page <= pageCount; page += 1) {
    try {
      rows.push(...(await fetchBoardPage(type, page)).rows);
    } catch {
      break;
    }
  }
  return rows;
}

async function fetchBoards() {
  const results = await Promise.allSettled([
    fetchBoardsByType("industry"),
    fetchBoardsByType("concept")
  ]);
  results.forEach((result,index) => { if (result.status === "rejected") console.warn(JSON.stringify({event:"sector-category-failed",category:index === 0 ? "industry" : "concept",error:result.reason?.message})); });
  const byKey = new Map();
  results.flatMap(result => result.status === "fulfilled" ? result.value : []).forEach((row) => {
    if (!row?.f12) return;
    const key = `${row._boardType}:${row.f12}`;
    byKey.set(key, row);
  });
  if (!byKey.size) throw new Error("All Eastmoney sector endpoints failed");
  return [...byKey.values()];
}

function normalizeRow(row) {
  const boardType = row?._boardType || "board";
  const oneDay = fmtPct(toNumber(row?.f3));
  const fiveDay = fmtPct(toNumber(row?.f109));
  const twentyDay = fmtPct(toNumber(row?.f127));
  const sixtyDay = fmtPct(toNumber(row?.f24));
  const ytd = fmtPct(toNumber(row?.f25));
  return {
    code: row?.f12 || "",
    name: row?.f14 || "",
    price: toNumber(row?.f2),
    change1d: oneDay,
    change5d: fiveDay,
    change20d: twentyDay,
    change60d: sixtyDay,
    changeYtd: ytd,
    leadName: row?.f128 || "",
    leadCode: row?.f140 || "",
    representativeEtf: representativeEtf(row?.f14 || ""),
    marketLabel: marketLabel(boardType),
    category: boardType,
    risk: riskLabel(Number.isFinite(ytd) ? ytd : oneDay),
    updatedSource: row._source || "eastmoney"
  };
}

async function fetchSinaIndustries() {
  const response = await fetch("https://money.finance.sina.com.cn/q/view/newFLJK.php?param=industry", {
    headers: {"User-Agent": DEFAULT_HEADERS["User-Agent"], Referer:"https://finance.sina.com.cn/"},
    signal: AbortSignal.timeout(7000)
  });
  if (!response.ok) throw new Error(`Sina HTTP ${response.status}`);
  const text = new TextDecoder("gb18030").decode(await response.arrayBuffer());
  const start = text.indexOf("{"); const end = text.lastIndexOf("}");
  const payload = JSON.parse(text.slice(start, end + 1));
  const items = Object.values(payload).map(value => {
    const fields = String(value).split(",");
    return {code:fields[0],name:fields[1],price:toNumber(fields[3]),change1d:fmtPct(toNumber(fields[5])),
      change5d:null,change20d:null,change60d:null,changeYtd:null,
      leadCode:fields[8],leadName:fields[12],representativeEtf:representativeEtf(fields[1]),
      marketLabel:"行业",category:"industry",risk:riskLabel(toNumber(fields[5])),updatedSource:"sina-industry-average"};
  }).filter(row => row.code && row.name && Number.isFinite(row.change1d));
  if (!items.length) throw new Error("Sina empty sector list");
  return items;
}

export async function onRequestGet() {
  try {
    let rows, partial = false, dataSource = "Eastmoney sector indices";
    try {
      rows = (await fetchBoards()).map(normalizeRow).filter(row => row.code && row.name);
      partial = !rows.some(row => row.category === "industry") || !rows.some(row => row.category === "concept");
    } catch (error) {
      console.warn(JSON.stringify({event:"sector-source-fallback", error:error.message}));
      rows = await fetchSinaIndustries(); partial = true; dataSource = "Sina industry constituent average (daily only)";
    }
    return Response.json({ok:true, updatedAt:new Date().toISOString(),cacheSeconds:CACHE_SECONDS,
      itemCount:rows.length,items:rows,partial,dataSource,
      ...(partial ? {notice:dataSource.startsWith("Sina") ? "新浪备用源仅含行业当日平均涨幅；概念及多日数据暂缺，源未提供交易时间。" : "东方财富部分板块暂不可用；已返回可用板块及多日涨幅。"} : {})
    }, {headers:{"Cache-Control":`public, max-age=60, s-maxage=${CACHE_SECONDS}`,"Access-Control-Allow-Origin":"*"}});
  } catch (error) {
    return Response.json({ok:false,error:error.message},{status:502,headers:{"Cache-Control":"no-store","Access-Control-Allow-Origin":"*"}});
  }
}
