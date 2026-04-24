/**
 * 统一响应格式工具
 *
 * 约定：
 * - code: 0 表示成功，其他为错误码（401/403/400/404/500）
 * - data: 响应数据，成功时为实际数据，失败时为 null
 * - message: 响应消息，成功时为 'success'，失败时为错误描述
 */

/**
 * 成功响应
 * @param {object} res - Express 响应对象
 * @param {*} data - 响应数据
 * @param {string} message - 响应消息
 * @param {number} httpStatus - HTTP 状态码，默认 200
 */
function success(res, data = {}, message = 'success', httpStatus = 200) {
  return res.status(httpStatus).json({
    code: 0,
    data,
    message
  });
}

/**
 * 失败响应
 * @param {object} res - Express 响应对象
 * @param {number} code - 错误码（401/403/400/404/500）
 * @param {string} message - 错误消息
 * @param {number} httpStatus - HTTP 状态码，默认与 code 相同
 */
function fail(res, code = 400, message = '请求错误', httpStatus = null) {
  const status = httpStatus !== null ? httpStatus : code;
  return res.status(status).json({
    code,
    data: null,
    message
  });
}

module.exports = { success, fail };
