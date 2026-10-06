document.addEventListener("DOMContentLoaded",function(){
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener("click",function(e){
      var id=a.getAttribute("href");
      if(id && id.length>1){
        var el=document.querySelector(id);
        if(el){e.preventDefault();el.scrollIntoView({behavior:"smooth"});}
      }
    });
  });
});