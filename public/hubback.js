/* Barra "Regresar al Hub" — solo aparece si se llegó desde el PROVAC HUB (?hub=1 o #sso=). */
(function(){
  try{
    var q=/[?&]hub=1(&|$)/.test(location.search);
    if(q||/^#sso=/.test(location.hash))sessionStorage.setItem('pv_hub','1');
    if(sessionStorage.getItem('pv_hub')!=='1')return;
    if(q){var s=location.search.replace(/([?&])hub=1&?/,'$1').replace(/[?&]$/,'');history.replaceState(null,'',location.pathname+s+location.hash);}
  }catch(e){return}
  var st=document.createElement('style');
  st.textContent='.pv-hubbar{display:flex;align-items:center;gap:10px;box-sizing:border-box;width:100%;min-height:40px;padding:0 14px;background:#014EA0;color:#fff;font:600 13px/1 Montserrat,system-ui,sans-serif;text-decoration:none;letter-spacing:.02em;border-bottom:3px solid #3CAA36;position:relative;z-index:5}.pv-hubbar:hover{background:#00244A}.pv-hubbar span{font-size:16px;line-height:1}@media print{.pv-hubbar{display:none}}';
  document.head.appendChild(st);
  var a=document.createElement('a');a.className='pv-hubbar';a.href='https://provac-hub.vercel.app/';
  a.innerHTML='<span>←</span>REGRESAR AL HUB';
  function put(){if(!document.body||document.querySelector('.pv-hubbar'))return;document.body.insertBefore(a,document.body.firstChild)}
  if(document.body)put();else document.addEventListener('DOMContentLoaded',put);
})();
