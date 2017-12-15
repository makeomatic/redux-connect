import axios from 'axios';

const isNode = new Function('try{return this===global}catch(e){return false}');

export const http = axios.create({
  timeout: 5000,
  baseURL: isNode() ? `http://localhost:${process.env.PORT || 3000}/` : undefined,
});
