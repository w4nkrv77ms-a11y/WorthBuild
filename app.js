document.addEventListener("DOMContentLoaded",function(){
  document.documentElement.classList.add("iw-ready");

  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener("click",function(e){
      var id=a.getAttribute("href");
      if(id && id.length>1){
        var el=document.querySelector(id);
        if(el){e.preventDefault();el.scrollIntoView({behavior:"smooth",block:"start"});}
      }
    });
  });

  var current=location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("header nav a").forEach(function(a){
    var href=(a.getAttribute("href")||"").split("#")[0];
    if(href && href===current) a.classList.add("active");
  });

  if("IntersectionObserver" in window){
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}
      });
    },{threshold:.12});
    document.querySelectorAll(".feature-card,.start-card,.steps article,.analysis-card,.ready-card").forEach(function(el){
      el.classList.add("iw-reveal");
      observer.observe(el);
    });
  }
});