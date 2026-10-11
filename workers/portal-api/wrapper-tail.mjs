export default {
 async fetch(request,env,ctx) {
  const url=new URL(request.url);
  if (url.pathname==='/api/health') return Response.json({ok:true,release:'20261011-resilience-2',snapshots:!!env.NEWS_DB});
  // Preserve the Pages recorder's existing secret and authorization check.
  if (['/api/ai-recommendations','/api/a-share-ai-recommendations'].includes(url.pathname)&&url.searchParams.get('record')==='cron') {
   url.hostname='a529e35b.portal-88220066.pages.dev';return fetch(new Request(url,request));
  }
  if (url.pathname==='/a-share-sectors/' || url.pathname==='/a-share-sectors' || url.pathname==='/a-share-sectors/index.html') {
   url.hostname='portal-88220066.pages.dev';
   const upstream=await fetch(new Request(url,request));
   if (!upstream.ok || !upstream.headers.get('Content-Type')?.includes('text/html')) return upstream;
   let html=await upstream.text();
   html=html.replace('<div class="status-row">','<div class="status-row"><span id="data-source-status" class="pill" role="status">正在检查数据源…</span>');
   html=html.replace('rows = Array.isArray(payload.items) ? payload.items : [];', `rows = Array.isArray(payload.items) ? payload.items : [];
    const dataStatus = document.getElementById('data-source-status');
    if (dataStatus) dataStatus.textContent = payload.stale
     ? '缓存数据：' + (payload.snapshotAt || payload.updatedAt || '')
     : payload.partial ? (payload.notice || '部分板块暂不可用')
     : '东方财富板块数据';`);
   const headers=new Headers(upstream.headers);headers.delete('Content-Length');headers.set('Cache-Control','no-cache');
   return new Response(html,{status:upstream.status,headers});
  }
  const fallback={fetch:async()=>Response.json({ok:false,error:'API endpoint not found'},{status:404})};
  return pages.fetch(request,{...env,ASSETS:fallback},ctx);
 }
};
