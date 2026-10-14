/* Separa el almacenamiento local de cada app cuando viven bajo la misma dirección del Hub
   (/bandas/, /admin/, ...). En su dirección propia no hace nada (no toca datos existentes). */
(function(){
  var m=location.pathname.match(/^\/(bandas|admin)\//);
  if(!m)return;
  var p='pv:'+m[1]+':',real=window.localStorage;
  function mine(){var o=[];for(var i=0;i<real.length;i++){var k=real.key(i);if(k.indexOf(p)===0)o.push(k)}return o}
  var ns={
    getItem:function(k){return real.getItem(p+k)},
    setItem:function(k,v){real.setItem(p+k,v)},
    removeItem:function(k){real.removeItem(p+k)},
    key:function(i){var a=mine();return i<a.length?a[i].slice(p.length):null},
    clear:function(){mine().forEach(function(k){real.removeItem(k)})},
    get length(){return mine().length}
  };
  try{Object.defineProperty(window,'localStorage',{value:ns,configurable:true})}catch(e){}
})();
