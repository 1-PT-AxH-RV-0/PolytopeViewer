/**
 *
 * @param msg
 */
export function triggerErrorDialog(msg) {
  this.errorMsg.innerHTML = msg;
  this.errorModalBs.show();
}
