/**
 * 触发错误对话框。
 * 显示错误消息弹窗。
 * @this {PolytopeRendererApp}
 * @param {string} msg - 错误消息内容（支持 HTML）。
 */
export function triggerErrorDialog(msg) {
  this.errorMsg.innerHTML = msg;
  this.errorModalBs.show();
}
