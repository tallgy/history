import warning from './warning.js';

function createTransitionManager() {
  // 代表了 block
  let prompt = null;

  /**
   * setPrompt 只能设置一个
   * 如果使用了两次 setPrompt 应该会有问题产生
   * 测试了，如果使用两次，那么第一次会没有，这个从效果来说，也很正常
   * 因为 prompt 永远只会有一个，所以 只会有 一个 warning 提示，没有什么其他问题。
   */
  function setPrompt(nextPrompt) {
    // 历史记录一次只支持一个提示
    warning(prompt == null, 'A history supports only one prompt at a time');

    prompt = nextPrompt;

    return () => {
      if (prompt === nextPrompt) prompt = null;
    };
  }
  
  /**
   * 用来 使用 prompt
   * 因为 v5 已经不使用 prompt 了，所以少了这个代码
   * @param {*} location 
   * @param {*} action 
   * @param {*} getUserConfirmation 
   *    getConfirmation 跳转到了 DOMUtils 的 getConfirmation 方法 
   *    内部就是 直接调用了 window.confirm 
   * @param {*} callback 
   *    内部是一个比较简单的 判断是否需要被阻塞的行为
   *    如果 参数为 false 那么就会使用 revertPop 去重新跳转回去。代表了被阻塞了
   */
  function confirmTransitionTo(
    location,
    action,
    getUserConfirmation,
    callback
  ) {
    // TODO：如果在我们还在确认前一个转变的时候又开始了另一个转变，我们可能会以一种奇怪的状态结束。想出最好的办法来处理这件事。
    // TODO: If another transition starts while we're still confirming
    // the previous one, we may end up in a weird state. Figure out the
    // best way to handle this.
    if (prompt != null) {
      const result =
        typeof prompt === 'function' ? prompt(location, action) : prompt;

      if (typeof result === 'string') {
        if (typeof getUserConfirmation === 'function') {
          getUserConfirmation(result, callback);
        } else {
          warning(
            false,
            'A history needs a getUserConfirmation function in order to use a prompt message'
          );

          callback(true);
        }
      } else {
        // 从转换钩子返回false以取消转换。
        // Return false from a transition hook to cancel the transition.
        // 需要强制 false 的返回
        callback(result !== false);
      }
    } else {
      callback(true);
    }
  }

  // 代表了 listen
  let listeners = [];

  /**
   * 添加监听，这里，添加了一个 isActive 
   * 从简单来说，貌似可用可不用，不知道是为了什么考虑
   * 因为 在 return 里面都已经使用 filter 进行过滤，那么代表了下次 listen肯定已经没有了。
   * 等同于 push 方法
   * @param {*} fn 代表监听方法
   * @returns 
   */
  function appendListener(fn) {
    let isActive = true;

    function listener(...args) {
      if (isActive) fn(...args);
    }

    listeners.push(listener);

    return () => {
      isActive = false;
      listeners = listeners.filter(item => item !== listener);
    };
  }

  /**
   * 等同于 call 方法，通知轮询执行 listener 方法
   * @param  {...any} args 
   */
  function notifyListeners(...args) {
    listeners.forEach(listener => listener(...args));
  }

  return {
    /** block 设置 */
    setPrompt,
    /** block 执行 */
    confirmTransitionTo,
    /** listen 添加 */
    appendListener,
    /** listen 执行 */
    notifyListeners
  };
}

export default createTransitionManager;
