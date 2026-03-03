---
title: "Modifying Websites with LLM-Generated Javascript Bookmarks"
description: "An exploration of malleable software"
date: 2025-04-16
slug: bookmark
tags: ["javascript", "how-to", "tools", "llm"]
---

## The Idea

There's this [awesome project](https://www.geoffreylitt.com/wildcard/) by Geoffrey Litt from 2020, where he made a Chrome extension which lets users easily modify the underlying code of the website they're looking at to get more out of it (add read times to articles, for instance). I found this last night, and that's how I started down the following path.

In Chrome, you can right click on a webpage, click Inspect, then go to Console, paste Javascript code, and run it. I started by messing with this, asking ChatGPT to write Javascript code that would do simple things, like put a timer on the page. Very cool stuff.

<figure>
  <img src="https://bucket.thomasdhughes.com/screenshot-25-20260225-170615.webp" alt="Screenshot - JS-generated timer in the upper right">
  <figcaption>Screenshot - JS-generated timer in the upper right</figcaption>
</figure>

And then while messing with this, I found something super cool: **bookmarks (the links you have in your Bookmarks Bar) can contain Javascript instead of a link, such that when clicked, they run that Javascript on whatever webpage you're on.**

## 3 Examples

I made a little webpage where you can find each of these if you want to [try them out for yourself](/js-bookmarks).

### 1) Hovering Table of Contents

This one generates a hovering, interactive table of contents for any webpage by looking for headers. When you click on the table, it takes you to the corresponding section.

<figure>
<video src="https://bucket.thomasdhughes.com/floating-table-of-contents-bookmarklet-recording-20260225-170618.mp4" autoplay loop muted playsinline width="100%"></video>
<figcaption>Video</figcaption>
</figure>

The bookmark:
```
javascript:(function(){const o=document.getElementById("floating-toc");o&&o.remove();const t=document.createElement("div");t.id="floating-toc",Object.assign(t.style,{position:"fixed",top:"100px",right:"20px",maxHeight:"70vh",overflowY:"auto",width:"250px",background:"white",border:"1px solid #ccc",borderRadius:"8px",padding:"10px",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",zIndex:9999,cursor:"move",fontFamily:"sans-serif"}),t.innerHTML="<strong>📑 Table of Contents</strong><br><br>";const e=[...document.querySelectorAll("h1,h2,h3,h4,h5,h6")];e.forEach((e,l)=>{e.id||(e.id="toc-header-"+l);const n=document.createElement("a");n.href=%60#${e.id}%60,n.textContent=e.textContent,Object.assign(n.style,{display:"block",marginLeft:%60${10*(parseInt(e.tagName[1])-1)}px%60,textDecoration:"none",color:"#0077cc",fontSize:"13px",cursor:"pointer"}),n.addEventListener("mouseenter",()=>n.style.textDecoration="underline"),n.addEventListener("mouseleave",()=>n.style.textDecoration="none"),n.addEventListener("click",o=>{o.preventDefault(),document.getElementById(e.id).scrollIntoView({behavior:"smooth"})}),t.appendChild(n)}),document.body.appendChild(t);let l,n,i=!1;t.addEventListener("mousedown",o=>{i=!0,l=o.clientX-t.offsetLeft,n=o.clientY-t.offsetTop,t.style.userSelect="none"}),document.addEventListener("mousemove",o=>{i&&(t.style.left=o.clientX-l+"px",t.style.top=o.clientY-n+"px")}),document.addEventListener("mouseup",()=>{i=!1,t.style.userSelect=""})})();
```

### 2) Link Previews

This one makes it so when you hover your cursor over a link, a preview of the linked page pops up, and you can scroll through it without leaving the current page.

<figure>
<video src="https://bucket.thomasdhughes.com/link-preview-bookmarklet-recording-20260225-170619.mp4" autoplay loop muted playsinline width="100%"></video>
<figcaption>Video</figcaption>
</figure>

The bookmark:
```
javascript:(function(){const e=document.createElement("iframe");Object.assign(e.style,{position:"fixed",width:"400px",height:"300px",border:"2px solid #333",borderRadius:"8px",zIndex:999999,display:"none",backgroundColor:"white",pointerEvents:"auto"}),document.body.appendChild(e);let t=null;document.addEventListener("mouseover",o=>{const r=o.target.closest("a");r&&r.href.startsWith("http")&&(t=r,e.src=r.href,e.style.top=%60${o.clientY+10}px%60,e.style.left=%60${o.clientX+10}px%60,e.style.display="block")}),document.addEventListener("mouseout",o=>{o.target===t&&!e.matches(":hover")&&setTimeout(()=>{!e.matches(":hover")&&document.activeElement!==e&&(e.style.display="none",e.src="")},200)}),e.addEventListener("mouseleave",()=>{e.style.display="none",e.src="",t=null})})();
```

### 3) Shareable Annotations

This last one is just a step fancier. Here's how it works:
1) Activate the bookmarklet.
2) Shift+Click anywhere on the webpage to add a comment.
3) Once you've added your comments, click "Copy Link with Comments" in the upper left.
4) Send the link to a friend (or just open it in another window).
5) When your friend opens that link, they'll see the regular webpage. But when they click to activate the bookmarklet, they'll see your comments!

(What's happening here is that the URL created contains the text and coordinates of the comments. I haven't tested what happens when you change the size of the screen. I'd imagine it breaks? I don't know.)

<figure>
<video src="https://bucket.thomasdhughes.com/shareable-annotations-bookmarklet-recording-20260225-170620.mp4" autoplay loop muted playsinline width="100%"></video>
<figcaption>Video</figcaption>
</figure>

The bookmark:
```
javascript:(function(){const comments=[];function renderComment(x,y,text){const b=document.createElement('div');b.textContent=text;Object.assign(b.style,{position:'absolute',top:`${y}px`,left:`${x}px`,background:'yellow',border:'1px solid #aaa',borderRadius:'4px',padding:'4px 8px',fontSize:'13px',zIndex:99999,maxWidth:'200px',whiteSpace:'pre-wrap'});document.body.appendChild(b)}document.addEventListener('click',e=>{if(!e.shiftKey)return;e.preventDefault();const t=prompt('Write your comment:');if(t){const c={x:e.pageX,y:e.pageY,text:t};comments.push(c);renderComment(c.x,c.y,c.text)}});const btn=document.createElement('button');btn.textContent='📋 Copy Link With Comments';Object.assign(btn.style,{position:'fixed',top:'10px',left:'10px',zIndex:1e5,padding:'6px 12px',fontSize:'14px',background:'#0077cc',color:'white',border:'none',borderRadius:'6px',cursor:'pointer'});document.body.appendChild(btn);function b64EncodeUnicode(str){return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,(match,p1)=>String.fromCharCode('0x'+p1)))}function b64DecodeUnicode(str){return decodeURIComponent(atob(str).split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''))}btn.onclick=()=>{const data=b64EncodeUnicode(JSON.stringify(comments));const url=new URL(location.href);url.hash='comments='+encodeURIComponent(data);navigator.clipboard.writeText(url.toString()).then(()=>{btn.textContent='✅ Copied!';setTimeout(()=>btn.textContent='📋 Copy Link With Comments',2000)})};if(location.hash.startsWith('#comments=')){try{const raw=location.hash.slice(10);console.log("Raw hash data:",raw);const decoded=/%[0-9A-Fa-f]{2}/.test(raw)?decodeURIComponent(raw):raw;const saved=JSON.parse(b64DecodeUnicode(decoded));saved.forEach(c=>{comments.push(c);renderComment(c.x,c.y,c.text)})}catch(e){console.warn('Bad comment data:',e)}}})();
```

## Why I Love This

Sometimes my mom is struggling with a website, and we're on the phone, and I'm trying to tell her how to navigate it, and it's not her fault at all, it's just not a great website.

I really like the idea that I can send her a bookmark, she clicks it, and it scans for the info she wants on that webpage and gives it to her. Like a 2-second Chrome extension.

## Doing It Yourself

There are just three things to know if you're going to prompt ChatGPT to write such a bookmark:
1. Before the Javascript, it must say `javascript:`
2. The Javascript has to be collapsed down to one line.
3. If you want to invoke an async function inside of a bookmarklet, you have to use an Immediately Invoked Async Function Expression (IIAFE), like this: `javascript:(async()=>{`
	- This is super cool, because it lets you have the bookmark navigate a site, pausing for a second or two between each operation to let things load.

Copy and paste those criteria into ChatGPT or Claude and you should be all the way right.

## Last Thing

It's pretty easy to accidentally run malicious code this way. Read the code before you run it and don't do anything evil with this :)
