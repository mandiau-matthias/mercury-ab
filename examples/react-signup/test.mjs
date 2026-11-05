import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {assign} from 'mercury-ab';
import {experiment} from './build/App.js';
test('server assignment survives a cookie round trip and equals the browser formula',async()=>{
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,MERCURY_EXAMPLE_PORT:'0'},stdio:['ignore','pipe','pipe']});
  try{
    const [chunk]=await once(child.stdout,'data');const url=String(chunk).match(/http:\/\/127\.0\.0\.1:\d+/)[0];
    const response=await fetch(url);const html=await response.text();const cookie=response.headers.get('set-cookie').split(';')[0];
    const props=JSON.parse(html.match(/id="bootstrap">([^<]+)<\/script>/)[1]);
    assert.deepEqual(props.serverAssignment,assign(experiment,props.visitor));
    const again=await fetch(url,{headers:{cookie}});const next=JSON.parse((await again.text()).match(/id="bootstrap">([^<]+)<\/script>/)[1]);
    assert.deepEqual(next,props);assert.equal((await fetch(url+'/client.js')).status,200);
  }finally{child.kill();await once(child,'exit');}
});
