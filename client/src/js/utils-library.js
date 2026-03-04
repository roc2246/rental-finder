export function appendParams(args){
  const params = new URLSearchParams();
  for(const key in args){
    if(typeof args[key] === 'object'){
      params.append(key, JSON.stringify(args[key]));
    } else {
      params.append(key, args[key]);
    }
  }
  return params
}