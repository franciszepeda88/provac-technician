/* Acceso único PROVAC HUB: recibe "#sso=<token Hub>&rt=…", lo canjea en el backend y entra sin pedir contraseña.
   Sin fragmento, la app funciona exactamente igual que antes (login propio). */
(function(){
  var APP='bandas',API='https://provac-backend.onrender.com/api';
  var m=location.hash.match(/^#sso=([^&]+)&rt=/);
  if(!m)return;
  var at=decodeURIComponent(m[1]);
  history.replaceState(null,'',location.pathname+location.search);
  var ov=document.createElement('div');
  ov.setAttribute('style','position:fixed;inset:0;z-index:2147483600;background:#fff;color:#014EA0;display:flex;align-items:center;justify-content:center;font:600 16px Montserrat,system-ui,sans-serif');
  ov.textContent='Entrando desde PROVAC HUB…';
  (document.body||document.documentElement).appendChild(ov);
  var ctl=new AbortController(),t=setTimeout(function(){ctl.abort()},60000); /* el servidor gratuito puede tardar en despertar */
  fetch(API+'/auth/hub',{method:'POST',signal:ctl.signal,headers:{'Content-Type':'application/json',Authorization:'Bearer '+at},body:JSON.stringify({app:APP})})
   .then(function(r){return r.json().then(function(d){return{ok:r.ok,d:d}})})
   .then(function(x){
     clearTimeout(t);
     if(x.ok&&x.d.token){localStorage.setItem('token',x.d.token);localStorage.setItem('usuario',JSON.stringify(x.d.usuario));location.replace(location.pathname+location.search);return}
     ov.textContent=(x.d&&x.d.error)||'No se pudo entrar desde el Hub';
     ov.style.color='#9B1C1C';setTimeout(function(){ov.remove()},3500);
   })
   .catch(function(){ov.textContent='No se pudo conectar. Inicia sesión normalmente.';setTimeout(function(){ov.remove()},3500)});
})();
