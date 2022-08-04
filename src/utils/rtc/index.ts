import adapter  from "webrtc-adapter";
import Janus, { JanusJS }    from "../janus/janus";

const HOST = 'http://localhost:8088/janus'

type JDebugType = 'all' | boolean | JanusJS.DebugLevel[]

class RTC {
  static init = async (debug: JDebugType = 'all') => {
    return new Promise((resolve, reject) => {
      Janus.init({
        debug,
        dependencies: Janus.useDefaultDependencies({ adapter: adapter }),
        callback: () => {
          // 处理初始化之后
          let janus = new Janus({
            server: HOST,
            success: () => {
              return resolve(janus);
            },
            error: (e) => {
              return reject(e);
            },
            destroyed: () => {
              Janus.log('Janus destroy')
            }
          })
        },
      })
    })
  }
}

export default RTC;
