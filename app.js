document.addEventListener("DOMContentLoaded",function(){
  // External-page links use normal browser navigation.
  // Only true in-page anchors are handled as smooth scrolling.
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener("click",function(e){
      var id=a.getAttribute("href");
      var el=id && id.length>1 ? document.querySelector(id) : null;
      if(el){
        e.preventDefault();
        el.scrollIntoView({behavior:"smooth",block:"start"});
      }
    });
  });
});