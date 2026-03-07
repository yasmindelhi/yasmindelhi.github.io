/* ============================================
   FUNGIRL SPA — v4 FINAL OPTIMIZED JS
   FIX: Forced reflow eliminated
   FIX: Zero DOM reads during scroll
   ============================================ */
(function(){
    "use strict";

    var navbar=document.getElementById("navbar"),
        backTop=document.getElementById("backToTop"),
        hamburger=document.getElementById("hamburger"),
        navMenu=document.getElementById("navMenu"),
        ticking=false;

    /* === FIX: Cache section positions to prevent forced reflow === */
    var sections=document.querySelectorAll("section[id]");
    var sectionCache=[];
    var linkCache={};

    function cacheSections(){
        sectionCache=[];
        for(var i=0;i<sections.length;i++){
            var s=sections[i];
            var id=s.id;
            sectionCache.push({
                id:id,
                top:s.offsetTop,
                bottom:s.offsetTop+s.offsetHeight
            });
            if(!linkCache[id]){
                var l=document.querySelector('.nav-link[href="#'+id+'"]');
                if(l)linkCache[id]=l;
            }
        }
    }

    /* Cache on load — only DOM read happens here, not during scroll */
    cacheSections();

    /* Debounced resize recalculation */
    var resizeTimer;
    window.addEventListener("resize",function(){
        clearTimeout(resizeTimer);
        resizeTimer=setTimeout(cacheSections,200);
    },{passive:true});

    /* === Single scroll handler — NO DOM reads inside === */
    function onScroll(){
        var y=window.pageYOffset;

        /* Navbar */
        if(navbar)navbar.classList.toggle("scrolled",y>60);

        /* Back to top */
        if(backTop)backTop.classList.toggle("visible",y>500);

        /* Active nav link — uses CACHED positions only (no reflow) */
        var scrollY=y+150;
        for(var i=0;i<sectionCache.length;i++){
            var s=sectionCache[i];
            if(linkCache[s.id]){
                linkCache[s.id].classList.toggle("active",scrollY>=s.top&&scrollY<s.bottom);
            }
        }

        ticking=false;
    }

    window.addEventListener("scroll",function(){
        if(!ticking){window.requestAnimationFrame(onScroll);ticking=true}
    },{passive:true});

    /* === Back to top === */
    if(backTop){
        backTop.addEventListener("click",function(){
            window.scrollTo({top:0,behavior:"smooth"});
        });
    }

    /* === Mobile menu (event delegation) === */
    if(hamburger&&navMenu){
        hamburger.addEventListener("click",function(){
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
            document.body.style.overflow=navMenu.classList.contains("active")?"hidden":"";
        });
        navMenu.addEventListener("click",function(e){
            if(e.target.classList.contains("nav-link")){
                hamburger.classList.remove("active");
                navMenu.classList.remove("active");
                document.body.style.overflow="";
            }
        });
    }

    /* === Scroll animations (IntersectionObserver — no scroll listener) === */
    if("IntersectionObserver" in window){
        var obs=new IntersectionObserver(function(entries){
            for(var i=0;i<entries.length;i++){
                if(entries[i].isIntersecting){
                    entries[i].target.classList.add("animated");
                    obs.unobserve(entries[i].target);
                }
            }
        },{threshold:.1,rootMargin:"0px 0px -40px 0px"});

        var anims=document.querySelectorAll("[data-animate]");
        for(var i=0;i<anims.length;i++)obs.observe(anims[i]);
    }

    /* === FAQ accordion (event delegation — single listener) === */
    var faqList=document.querySelector(".faq-list");
    if(faqList){
        faqList.addEventListener("click",function(e){
            var btn=e.target.closest(".faq-question");
            if(!btn)return;
            var item=btn.parentElement;
            var wasActive=item.classList.contains("active");
            var items=faqList.querySelectorAll(".faq-item");
            for(var i=0;i<items.length;i++){
                items[i].classList.remove("active");
                var q=items[i].querySelector(".faq-question");
                if(q)q.setAttribute("aria-expanded","false");
            }
            if(!wasActive){
                item.classList.add("active");
                btn.setAttribute("aria-expanded","true");
            }
        });
    }

    /* === Hero particles (desktop only, DocumentFragment) === */
    var pc=document.getElementById("particles");
    if(pc&&window.innerWidth>768){
        var frag=document.createDocumentFragment();
        for(var i=0;i<20;i++){
            var d=document.createElement("div");
            d.className="particle";
            var w=(Math.random()*4+2)+"px";
            d.style.cssText="left:"+Math.random()*100+"%;animation-duration:"+(Math.random()*8+6)+"s;animation-delay:"+(Math.random()*6)+"s;width:"+w+";height:"+w;
            frag.appendChild(d);
        }
        pc.appendChild(frag);
    }

    /* === Smooth scroll (single delegated listener) === */
    document.addEventListener("click",function(e){
        var a=e.target.closest('a[href^="#"]');
        if(!a)return;
        var href=a.getAttribute("href");
        if(href==="#")return;
        var target=document.querySelector(href);
        if(target){
            e.preventDefault();
            var offset=navbar?navbar.offsetHeight:0;
            window.scrollTo({
                top:target.getBoundingClientRect().top+window.pageYOffset-offset,
                behavior:"smooth"
            });
        }
    });

})();