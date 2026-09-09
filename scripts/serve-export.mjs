import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, join, extname, sep } from "node:path";
const root=resolve("out");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".txt":"text/plain; charset=utf-8",".png":"image/png",".svg":"image/svg+xml",".jpg":"image/jpeg",".jpeg":"image/jpeg",".woff2":"font/woff2",".ico":"image/x-icon"};
const server=http.createServer(async(req,res)=>{
 try {
  const pathname=decodeURIComponent(new URL(req.url||"/","http://localhost").pathname);
  let file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  try { if((await stat(file)).isDirectory()) file=join(file,"index.html"); } catch { if(!extname(file))file=join(file,"index.html"); }
  let bytes;
  try {bytes=await readFile(file);} catch {file=join(root,"404.html");bytes=await readFile(file);res.statusCode=404;}
  res.setHeader("Content-Type",mime[extname(file)]||"application/octet-stream");
  if(req.method==="HEAD")res.end();else res.end(bytes);
 }catch{res.writeHead(500);res.end("Build the site with npm run build before starting it.");}
});
const port=Number(process.env.PORT||3000);
server.listen(port,()=>console.log("FresherDesk static preview at http://localhost:"+port));
