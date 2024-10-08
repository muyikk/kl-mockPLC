const fs = require(`fs-extra`)
const {parse} = require(`json5`)
const MockOPCUA = require(`./opcua.js`)
// import json5 from "json5";
// import MockOPCUA from "./opcua.js"
// const MockOPCUA = require("./opcua")

// 获取config地址
const isPkg = typeof process.pkg !== "undefined";
let rootDir, configPath, logPath;
if (isPkg) {
	rootDir = path.dirname(process.execPath);
	configPath = rootDir + "\\mockPLC.json";
	logPath = rootDir + "\\log\\";
} else {
	configPath = __dirname.replace(/src$/, "mockPLC.json");
	logPath = __dirname.replace(/src$/, "log\\");
}
console.log("configPath:", configPath);
console.log("logPath:", logPath);
fs.existsSync(logPath) ? null : fs.mkdirSync(logPath);

// 读取config文件
const config = parse(fs.readFileSync(configPath, "utf-8"));
console.log(config);

const server = new MockOPCUA(config)
