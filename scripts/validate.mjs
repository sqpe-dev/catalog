import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const rows=JSON.parse(await readFile('data/records.json'));
const inventory=JSON.parse(await readFile('data/reference-inventory.json'));
const ids=new Set(), urls=new Set();
for(const r of rows){
 assert.match(r.id,/^[a-z0-9-]+$/); assert.ok(!ids.has(r.id),r.id); ids.add(r.id);
 for(const k of ['title','sourceType','relevance','reviewStatus','evidence']) assert.ok(typeof r[k]==='string'&&r[k].trim(),`${r.id}: ${k}`);
 assert.ok(['Research paper','Product documentation','Software','Benchmark'].includes(r.sourceType));
 assert.ok(['Metadata pending verification','Publication record checked','Documentation checked','Full paper reviewed'].includes(r.reviewStatus));
 assert.ok(typeof r.profile==='boolean'); assert.ok(Array.isArray(r.aliases)&&Array.isArray(r.provenance));
 assert.ok(r.year===null||Number.isInteger(r.year));
 for(const url of [r.url,...r.aliases].filter(Boolean)){assert.equal(new URL(url).protocol,'https:');assert.ok(!urls.has(url)||rows.some(parent=>parent.id===r.parentRecord&&parent.url===url),`Duplicate source: ${url}`);urls.add(url)}
 if(r.reviewStatus==='Metadata pending verification')assert.equal(r.verifiedDate,null);else {assert.match(r.verifiedDate,/^\d{4}-\d{2}-\d{2}$/);assert.ok(r.url)}
 if(r.reviewStatus==='Full paper reviewed')assert.ok(r.reviewReport);
 if(r.profile){for(const k of ['summary','interface','caveat','name'])assert.ok(r[k]);assert.ok(Array.isArray(r.tags))}
}
for(const ref of inventory){assert.ok(ids.has(ref.recordId));assert.ok(rows.find(r=>r.id===ref.recordId).provenance.some(p=>p.line===ref.line&&p.citation===ref.citation))}
console.log(`Validated ${rows.length} records and ${inventory.length} imported bibliography citations.`);
