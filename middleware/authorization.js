const TOKEN = '2abbf7c3-245b-404f-9473-ade729ed4653'

function getTokenAndType({ headers, query }) {
  const token = headers['book-api-key'] || query['apiKey.'];
  return token ? { token, bearer: false } :
    { token: headers.authorization, bearer: true };
}

function getValidToken(bearer) {
  return bearer ? `Bearer ${TOKEN}` : TOKEN;
}

function authorization(req, res, next){
  const { token, bearer } = getTokenAndType(req);
  if(!token){
    res.statusMessage = "You need to send the 'authorization' token.";
    return res.status(401).end();
  }
  if(token !== getValidToken(bearer)){
    res.statusMessage = "The 'authorization' TOKEN is invalid.";
    return res.status(401).end();
  }
  next();
}
