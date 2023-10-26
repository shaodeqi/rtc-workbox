const logLevel = {
  Log: 0,
  Warning: 1,
  Error: 2,
};

const styles = ['color: green;', 'color: orange;', 'color: red;'];
const methods = ['info', 'warn', 'error'];

export default class Logger {
  constructor(namespace) {
    this.namespace = namespace;
  }

  log(level, args) {
    if (
      process.env.NODE_ENV === 'production' &&
      new URLSearchParams(location.search).get('debug') === null
    )
      return;
    console[methods[level]](`%c${this.namespace}`, styles[level], ...args);
  }

  setNamespace(namespace) {
    this.namespace = namespace;
    return this;
  }

  create(namespace) {
    return new Logger(namespace);
  }

  /**
   * 打印输出信息
   *
   * @param args 任意参数
   */
  info(...args) {
    this.log(logLevel.Log, args);
    return this;
  }

  /**
   * 打印输出警告信息
   *
   * @param args 任意参数
   */
  warn(...args) {
    this.log(logLevel.Warning, args);
    return this;
  }

  /**
   * 打印输出错误信息
   *
   * @param args 任意参数
   */
  error(...args) {
    this.log(logLevel.Error, args);
    return this;
  }
}
