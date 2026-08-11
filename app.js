const KEY='th_word_v1';
const DEFAULT_WORD='Tomorrow';
const phrases=[
 'makes it even better','calls for adaptation','keeps moving forward','starts with a question',
 'changes the way we look','is already happening','leaves room for possibility','takes another shape'
];

function getWord(){return localStorage.getItem(KEY)||DEFAULT_WORD}
function setWord(v){localStorage.setItem(KEY,v.trim()||DEFAULT_WORD)}

function initHome(){
 const word=getWord();
 document.getElementById('homeWord').textContent=word;
 const host=document.getElementById('marquee');
 const makeSet=()=>{const s=document.createElement('div');s.className='marquee-set';
   phrases.forEach((p,i)=>{const line=document.createElement('div');line.className='marquee-line';line.textContent=word+' '+p;s.appendChild(line);
     if(i===phrases.length-1){const reset=document.createElement('div');reset.className='marquee-line reset';reset.textContent=word+' Happens™';s.appendChild(reset)}
   });return s};
 host.appendChild(makeSet());host.appendChild(makeSet());
}
function initNotes(){
 document.getElementById('notesWord').textContent=getWord();
 const input=document.getElementById('noteInput');
 input.addEventListener('input',()=>{input.style.width=Math.max(120,Math.min(800,input.scrollWidth+8))+'px'});
 input.focus();
}
function initGallery(){
 const host=document.getElementById('gallery');
 const imgs=[
  'assets/images/01.jpg','assets/images/02.jpg','assets/images/03.jpg','assets/images/04.jpg',
  'assets/images/05.jpg','assets/images/06.jpg','assets/images/07.jpg','assets/images/08.jpg'
 ];
 imgs.forEach((src,i)=>{
  const im=document.createElement('img');im.className='photo';im.src=src;im.alt='Performance '+(i+1);
  im.style.left=(8+Math.random()*76)+'%';im.style.top=(4+Math.random()*68)+'%';
  im.style.transform=`translate(-50%,-50%) rotate(${(-8+Math.random()*16).toFixed(1)}deg)`;
  im.onerror=()=>im.remove();host.appendChild(im);
 });
}
function initAdmin(){
 const input=document.getElementById('word'),status=document.getElementById('status');
 input.value=getWord();
 document.getElementById('wordForm').addEventListener('submit',e=>{
  e.preventDefault();setWord(input.value);status.textContent='SAVED — THE WORD IS NOW ACTIVE.';setTimeout(()=>location.href='index.html',700);
 });
}
const page=document.body.dataset.page;
if(page==='home')initHome();
if(page==='notes')initNotes();
if(page==='gallery')initGallery();
if(page==='admin')initAdmin();
