import {build} from 'esbuild';
await build({entryPoints:['App.jsx'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'build/App.js'});
await build({entryPoints:['client.jsx'],bundle:true,format:'esm',minify:true,outfile:'build/client.js',define:{'process.env.NODE_ENV':'"production"'},legalComments:'linked'});
