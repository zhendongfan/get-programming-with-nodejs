exports.log_request_paths =  (req, res, next) => {
  console.log(`request made to: ${req.url}`);
  next();
}

exports.send_req_param = (req, res) => {
  let veg = req.params.vegetable;
  res.send(`This is the page for ${veg}`);
}

exports.respond_with_name = (req, res) => {
  let paramsName = req.params.myName;
  res.render('index', {name: paramsName});
}
