(()=>{var e={152:()=>{}},t={};function n(a){var r=t[a];if(void 0!==r)return r.exports;var o=t[a]={exports:{}};return e[a](o,o.exports,n),o.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var a in t)n.o(t,a)&&!n.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";var e=n(152),t=n.n(e);(()=>{const e=document.querySelector("[data-projects]"),t=document.querySelector("[data-new-project-form"),n=document.querySelector("[data-new-project-input"),a=document.querySelector("[data-delete-list-button]"),r=document.querySelector("[data-list-display-container]"),o=document.querySelector("[data-list-title]"),l=document.querySelector("[data-list-count]"),i=document.querySelector("[data-tasks]"),s=document.getElementById("task-template"),d=document.querySelector("[data-new-task-form]"),c=document.querySelector("[data-new-task-input]"),u=document.querySelector("[data-clear-complete-button]"),m="task.lists",p="task.selectedListID";let f=JSON.parse(localStorage.getItem(m))||[],v=localStorage.getItem(p);function y(){k(),S()}function k(){localStorage.setItem(m,JSON.stringify(f)),localStorage.setItem(p,v)}function S(){h(e),f.forEach((t=>{const n=document.createElement("li");n.dataset.listId=t.id,n.classList.add("list-name"),n.innerText=t.name,t.id===v&&n.classList.add("active-list"),e.appendChild(n)}));const t=f.find((e=>e.id===v));null==v?r.style.display="none":(r.style.display="",o.innerText=t.name,g(t),h(i),function(e){e.tasks.forEach((e=>{const t=document.importNode(s.content,!0),n=t.querySelector("input");n.id=e.id,n.checked=e.complete;const a=t.querySelector("label");a.htmlFor=e.id,a.append(e.name),i.appendChild(t)}))}(t))}function g(e){const t=e.tasks.filter((e=>!e.complete)).length,n=1===t?"task":"tasks";l.innerText=`${t} ${n} remaining`}function h(e){for(;e.firstChild;)e.removeChild(e.firstChild)}e.addEventListener("click",(e=>{"li"===e.target.tagName.toLowerCase()&&(v=e.target.dataset.listId,y())})),i.addEventListener("click",(e=>{if("input"===e.target.tagName.toLowerCase()){const t=f.find((e=>e.id===v));t.tasks.find((t=>t.id===e.target.id)).complete=e.target.checked,k(),g(t)}})),u.addEventListener("click",(e=>{const t=f.find((e=>e.id===v));t.tasks=t.tasks.filter((e=>!e.complete)),y()})),a.addEventListener("click",(e=>{f=f.filter((e=>e.id!==v)),v=null,y()})),t.addEventListener("submit",(e=>{e.preventDefault();const t=n.value;if(null==t||""===t)return;const a=(r=t,{id:Date.now().toString(),name:r,tasks:[]});var r;n.value=null,f.push(a),y()})),d.addEventListener("submit",(e=>{e.preventDefault();const t=c.value;if(null==t||""===t)return;const n=(a=t,{id:Date.now().toString(),name:a,complete:!1});var a;c.value=null,f.find((e=>e.id===v)).tasks.push(n),y()})),S()})(),t()()})()})();