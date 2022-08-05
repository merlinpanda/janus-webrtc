import mitt from 'mitt';

class RTC {
  /**
   * 单例
   */
  private static instance: RTC;

  /**
   * 事件处理器
   */
  public emitter = mitt();

  // 禁止实例化以实现单例模式
  private constructor () {}

  // 单例
  static getInstance = (): RTC => {
    if (! RTC.instance) {
      RTC.instance = new RTC();
    }

    return RTC.instance;
  }

  public videoDevices = async () => {
   return new Promise((resolve, reject) => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      let videos = devices.filter(device => {
        return device.kind === 'videoinput'
      })

      return resolve(videos);
    }).catch(e => {
      return reject(e)
    })
   })
  }
}

export default RTC;
