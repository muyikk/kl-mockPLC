const EventEmitter = require("events");
const {
	OPCUAServer,
	Variant,
	DataType,
	StatusCodes,
} = require(`node-opcua`);
class MockOPCUA {
	event;
	port; // 端口
	structure; // 结构体名称
	mockParams; // 模拟变量
	listenList; // 监听缓存值
	listens; // 监听设置
	heartBeats; // 心跳设置
	increaseList; // 递增设置
	decreaseList; // 递减设置
	constructor(config) {
		this.event = new EventEmitter();
		this.port = Number(config.port);
		this.structure = config.structure;
		this.mockParams = config.params;
		this.listenList = this.getListenList(config.listens);
		this.listens = config.listens;
		this.heartBeats = config.hearts;
		this.increaseList = config.increase;
		this.decreaseList = config.decrease;
		this.initServer();
	}
	/**
	 * 创建服务器
	 */
	async initServer() {
		// 初始化服务
		const server = new OPCUAServer({
			port: this.port,
			resourcePath: "/mockPLC",
			certificateFile: "./certificate.pem",
			privateKeyFile: "./privateKey.pem",
		});
		await server.initialize();

		// 开辟地址空间
		const addressSpace = server.engine.addressSpace;
		// 在地址空间中开辟namespace
		const namespace = addressSpace.getOwnNamespace();

		// 添加对象（用于储存变量，如：stCCD）,挂在地址空间里的Objects目录下
		const device = namespace.addObject({
			organizedBy: addressSpace.rootFolder.objects,
			browseName: this.structure,
		});

		// 初始化变量
		for (const key in this.mockParams) {
			this.initParams(namespace, device, key);
		}

		// 启动服务
		server.start(function () {
			console.log("Server is now listening ... (press CTRL+C to stop)");
			console.log("port ", server.endpoints[0].port);
		});
		console.log(`url: opc.tcp://127.0.0.1:${this.port}`);

		// 启动心跳
		this.heartBeat();
		this.increase()
		this.decrease()
	}

	/**
	 * 初始化变量
	 * @param {any} namespace 储存节点的namespace
	 * @param {any} device device对象
	 * @param {object} param 变量
	 */
	initParams(namespace, device, param) {
		namespace.addVariable({
			componentOf: device,
			browseName: param,
			dataType: this.mockParams[param].type,
			value: {
				get: () => {
          // 参数是否在监听列表里
					if (this.listens[param]) {
            // 参数是否发生改变
						if (this.listenList[param] != this.mockParams[param].value)
							this.listen();
					}
					return new Variant({
						dataType: DataType[this.mockParams[param].type],
						value: this.mockParams[param].value,
					});
				},
				set: (variant) => {
					this.mockParams[param].value = this.getType(
						this.mockParams[param].type,
						variant.value
					);
					return StatusCodes.Good;
				},
			},
		});
	}

	/**
	 * 转化变量类型
	 * @param {string} type 变量类型
	 * @param {any} data 更改变量参数
	 * @returns
	 */
	getType(type, data) {
		switch (type) {
			case "Int16":
				return parseInt(data);
			case "Int32":
				return parseInt(data);
			case "Int64":
				return parseInt(data);
			case "Double":
				return parseFloat(data);
			case "Float":
				return parseFloat(data);
		}
	}

  /**
   * 初始化监听缓存值
   * @param {Object} listens 监听规则对象
   * @returns 
   */
	getListenList(listens) {
		let listenList = {};
		for (let listen in listens) {
			listenList[listen] = this.mockParams[listen].value;
		}
		return listenList;
	}

	/**
	 * 初始化心跳变量
	 */
	heartBeat() {
		for (let heart in this.heartBeats) {
      if(!this.mockParams[heart]) {
        console.log(`心跳参数 ${heart} 未初始化`)
        continue
      }
			setInterval(() => {
				if (this.mockParams[heart].value == this.heartBeats[heart].data1)
					this.mockParams[heart].value = this.heartBeats[heart].data2;
				else this.mockParams[heart].value = this.heartBeats[heart].data1;
			}, this.heartBeats[heart].interval);
		}
	}

  /**
   * 监听值发生变化，触发更改其他值
   */
	listen() {
    // 寻找监听规则列表
		for (let listen in this.listens) {
			this.listens[listen].forEach((param) => {
        // 如果改变的值 == 规则列表中的值
				if (param.data == this.mockParams[listen].value) {
          if(!this.mockParams[param.change.param]) {
            console.log(`监听 ${listen} = ${this.mockParams[listen].value} 时，改变 ${param.change.param} 的变量未初始化`)
            return
          }
          // 触发更改其他值
					this.mockParams[param.change.param].value = param.change.value;
          // 更新监听缓存值
					this.listenList[listen] = this.mockParams[listen].value;
				}
			});
		}
	}

  /**
   * 递增变量初始化
   */
  increase() {
    for(let param in this.increaseList) {
      setInterval(() => {
        this.mockParams[param].value += this.increaseList[param].tolerance
      }, this.increaseList[param].interval);
    }
  }
  /**
   * 递减变量初始化
   */
  decrease() {
    for(let param in this.decreaseList) {
      setInterval(() => {
        this.mockParams[param].value -= this.decreaseList[param].tolerance
      }, this.decreaseList[param].interval);
    }
  }
}

module.exports = MockOPCUA;
