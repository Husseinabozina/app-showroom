import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import path from 'node:path';
const catalog=JSON.parse(readFileSync('content/projects.json','utf8'));
const visible=catalog.filter(p=>p.visible),slugs=new Set();
for(const p of catalog){
 assert.match(p.slug,/^[a-z][a-z0-9-]*$/);assert(!slugs.has(p.slug),`Duplicate slug: ${p.slug}`);slugs.add(p.slug);
 if(!p.visible){assert(!existsSync(`dist/projects/${p.slug}`),`Hidden route leaked: ${p.slug}`);continue;}
 for(const key of ['name','summary','role','roleDetail','status','source','boundary','verifiedAt'])assert(p[key],`${p.slug}: missing ${key}`);
 assert(p.evidence.length,`${p.slug}: no evidence`);assert(p.contributions.length,`${p.slug}: no contribution`);
 for(const l of p.links){assert.match(l.url,/^https:\/\//);if(p.source==='Private source')assert.notEqual(l.kind,'source',`${p.slug}: private source mislabeled`);}
 for(const s of p.screens)assert(existsSync('dist/'+s.src),`Missing screen ${s.src}`);
 if(p.featured)assert(p.screens.length>=2,`${p.slug}: featured needs two images`);
}
function walk(dir){return readdirSync(dir).flatMap(n=>statSync(path.join(dir,n)).isDirectory()?walk(path.join(dir,n)):[path.join(dir,n)]);}
for(const file of walk('dist').filter(f=>f.endsWith('.html'))){
 const html=readFileSync(file,'utf8');assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${file}: heading count`);assert(html.includes('name="description"'));
 for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  const ref=match[1].split('#')[0].split('?')[0];if(/^(https?:|mailto:|data:)/.test(ref))continue;
  let target=path.resolve(path.dirname(file),ref);if(ref.endsWith('/'))target=path.join(target,'index.html');assert(existsSync(target),`${file}: broken local reference ${ref}`);
 }
}
const homepage=readFileSync('dist/index.html','utf8');assert.equal((homepage.match(/data-project /g)||[]).length,visible.length);
console.log(`PASS: ${visible.length} visible projects, ${catalog.length-visible.length} hidden drafts; metadata, evidence, source labels, generated routes and local links.`);
