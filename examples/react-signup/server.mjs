import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {assign} from 'mercury-ab';
import {App,experiment} from './build/App.js';
const port=Number(process.env.MERCURY_EXAMPLE_PORT??4175);
const server=createServer(async(req,res)=>{
  if(req.url==='/client.js'||req.url==='/client.js.LEGAL.txt'){try{res.writeHead(200,{'Content-Type':req.url.endsWith('.js')?'text/javascript':'text/plain'});res.end(await readFile(new URL('./build'+req.url,import.meta.url)));}catch{res.end();}return;}
  if(req.url!=='/'){res.writeHead(404).end();return;}
  const existing=/(?:^|;\s*)mercury_visitor=([0-9a-f-]{36})(?:;|$)/i.exec(req.headers.cookie??'')?.[1];
  const visitor=existing??randomUUID();
  const props={visitor,serverAssignment:assign(experiment,visitor)};
  const bootstrap=JSON.stringify(props).replace(/</g,'\\u003c');
  const headers={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'};
  if(!existing)headers['Set-Cookie']=`mercury_visitor=${visitor}; Path=/; HttpOnly; SameSite=Lax`;
  res.writeHead(200,headers);
  res.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mercury A/B · React example</title><style>body{font:17px/1.6 system-ui;background:#f6f3ee;color:#29222e;margin:0}main{max-width:850px;margin:auto;padding:40px 24px}h1{font-size:clamp(2.5rem,6vw,4rem);line-height:1.1;letter-spacing:-.05em}section{background:white;padding:28px;border:1px solid #ddd2e7;border-radius:18px}button{background:#664187;color:white;border:0;border-radius:9px;padding:14px;font:inherit;cursor:pointer}label{display:block;margin:20px 0}pre{font-size:.8rem;white-space:pre-wrap;overflow-wrap:anywhere}code{overflow-wrap:anywhere}a{color:#664187}.eyebrow{color:#664187;letter-spacing:.1em;font-size:.75rem}button:focus-visible,input:focus-visible{outline:3px solid #ae84d1;outline-offset:3px}</style><body><div id="root">${renderToString(React.createElement(App,props))}</div><script type="application/json" id="bootstrap">${bootstrap}</script><script type="module" src="/client.js"></script></body></html>`);
});
server.listen(port,'127.0.0.1',()=>console.log(`Open http://127.0.0.1:${server.address().port}`));
