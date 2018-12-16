const url_list = {
  get_parking_fee: '/car_owner/get_parking_fee',
  get_by_wechat_js_code: '/car_owner/get_by_wechat_js_code',
  get_by_wechat_id: '/car_owner/get_by_wechat_id',
  get_parking_fee: '/car_owner/get_parking_fee',
  get_order_pay_parameters: '/car_owner/get_order_pay_parameters',
  get_monthly_rent_details_by_order_id: '/car_owner/get_monthly_rent_details_by_order_id'
}

function get_request_url(key){
  return url_list[key]
}

module.exports = {
  getRequestURL: get_request_url
}