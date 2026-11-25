'use strict';
// All ordering and booking interactions are demonstrations only.
const dishes = [
  {id:1,name:'Seared Scallops',description:'Pea purée, crispy pancetta, micro herbs',price:18,category:'starters',image:'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=85'},
  {id:2,name:'Burrata & Heirloom Tomato',description:'Basil, aged balsamic, toasted sourdough',price:16,category:'starters',image:'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=85'},
  {id:3,name:'Wild Mushroom Pappardelle',description:'Truffle cream, parmesan, chive oil',price:24,category:'mains',image:'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=85'},
  {id:4,name:'Chef’s Seasonal Plate',description:'Market vegetables, herb oil, seasonal garnish',price:29,category:'mains',image:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=85'},
  {id:5,name:'Dark Chocolate Tart',description:'Hazelnut praline, chantilly cream',price:12,category:'desserts',image:'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=85'},
  {id:6,name:'Vanilla Berry Parfait',description:'Seasonal berries, whipped vanilla cream',price:11,category:'desserts',image:'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=85'},
  {id:7,name:'Citrus Spritz',description:'Sparkling citrus, rosemary, soda',price:9,category:'drinks',image:'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=85'},
  {id:8,name:'Espresso',description:'Freshly pulled espresso',price:5,category:'drinks',image:'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=800&q=85'}
];
const $ = (selector) => document.querySelector(selector);
const money = (amount) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(amount);
const cart = new Map();
let lastFocus = null;

function renderMenu(filter='all') {
  const selected = dishes.filter(dish => filter === 'all' || dish.category === filter);
  $('#menu-grid').innerHTML = selected.map(dish => `<article class="menu-card"><img src="${dish.image}" alt="${dish.name}" loading="lazy" /><div class="menu-card-content"><div class="menu-card-top"><h3>${dish.name}</h3><strong>${money(dish.price)}</strong></div><p>${dish.description}</p><button type="button" class="add-button" data-add="${dish.id}" aria-label="Add ${dish.name} to demo order">+ ADD TO ORDER</button></div></article>`).join('');
}
function renderCart(){
  const count = [...cart.values()].reduce((total,qty)=>total+qty,0);
  $('#cart-count').textContent = String(count);
  const entries=[...cart.entries()];
  $('#cart-items').innerHTML = entries.length ? entries.map(([id,qty])=>{const dish=dishes.find(item=>item.id===id);return `<div class="cart-item"><div><strong>${dish.name}</strong><p>${money(dish.price)} each</p></div><div class="qty"><button type="button" data-decrease="${id}" aria-label="Remove one ${dish.name}">−</button><span>${qty}</span><button type="button" data-increase="${id}" aria-label="Add one ${dish.name}">+</button></div></div>`;}).join('') : '<p>Your demo cart is empty. Explore the menu to add something delicious.</p>';
  const total=entries.reduce((sum,[id,qty])=>sum+dishes.find(item=>item.id===id).price*qty,0);
  $('#cart-total').textContent=money(total);
  $('#checkout').disabled=!entries.length;
}
function changeQty(id,delta){const next=(cart.get(id)||0)+delta;if(next<=0)cart.delete(id);else cart.set(id,next);renderCart();}
function openCart(){lastFocus=document.activeElement;$('#cart-backdrop').hidden=false;$('#cart-drawer').classList.add('open');$('#cart-drawer').setAttribute('aria-hidden','false');document.body.classList.add('lock-scroll');$('#cart-close').focus();}
function closeCart(){ $('#cart-backdrop').hidden=true;$('#cart-drawer').classList.remove('open');$('#cart-drawer').setAttribute('aria-hidden','true');document.body.classList.remove('lock-scroll');if(lastFocus?.focus)lastFocus.focus();}
function showModal(title,message){lastFocus=document.activeElement;$('#modal-title').textContent=title;$('#modal-message').textContent=message;$('#modal-backdrop').hidden=false;document.body.classList.add('lock-scroll');$('#modal-close').focus();}
function closeModal(){ $('#modal-backdrop').hidden=true;document.body.classList.remove('lock-scroll');if(lastFocus?.focus)lastFocus.focus();}
function todayLocal(){const date=new Date();return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}

renderMenu();renderCart();
$('#res-date').min=todayLocal();
$('#menu-filters').addEventListener('click',event=>{const button=event.target.closest('[data-filter]');if(!button)return;document.querySelectorAll('[data-filter]').forEach(item=>{item.classList.toggle('active',item===button);item.setAttribute('aria-pressed',String(item===button));});renderMenu(button.dataset.filter);});
$('#menu-grid').addEventListener('click',event=>{const button=event.target.closest('[data-add]');if(!button)return;changeQty(Number(button.dataset.add),1);openCart();});
$('#cart-items').addEventListener('click',event=>{const increase=event.target.closest('[data-increase]');const decrease=event.target.closest('[data-decrease]');if(increase)changeQty(Number(increase.dataset.increase),1);if(decrease)changeQty(Number(decrease.dataset.decrease),-1);});
$('#cart-open').addEventListener('click',openCart);$('#cart-close').addEventListener('click',closeCart);$('#cart-backdrop').addEventListener('click',closeCart);
$('#checkout').addEventListener('click',()=>{if(!cart.size)return;const count=[...cart.values()].reduce((sum,qty)=>sum+qty,0);const total=$('#cart-total').textContent;closeCart();showModal('Demo checkout',`Your demo order contains ${count} item${count===1?'':'s'} totaling ${total}. No payment was taken and no order was placed.`);cart.clear();renderCart();});
$('#reservation-form').addEventListener('submit',event=>{event.preventDefault();const date=$('#res-date').value,time=$('#res-time').value,guests=$('#res-guests').value;if(!date||!time||!guests)return;if(date<todayLocal()){showModal('Choose a future date','Please select today or a future date for your demo reservation.');return;}showModal('Reservation demo',`You selected ${date} at ${time} for ${guests} guest${guests==='1'?'':'s'}. This is a demonstration only: no table has been reserved.`);});
$('#events-form').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.currentTarget);const name=String(data.get('name')||'Guest').trim();showModal('Inquiry demo',`Thank you, ${name}. Your ${String(data.get('event')||'event').toLowerCase()} inquiry was validated locally. No email was sent.`);event.currentTarget.reset();});
$('#modal-close').addEventListener('click',closeModal);$('#modal-ok').addEventListener('click',closeModal);$('#modal-backdrop').addEventListener('click',event=>{if(event.target===$('#modal-backdrop'))closeModal();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!$('#modal-backdrop').hidden)closeModal();else if(!$('#cart-backdrop').hidden)closeCart();}});
$('#menu-toggle').addEventListener('click',()=>{const nav=$('#primary-nav');const open=nav.classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open));});
document.querySelectorAll('#primary-nav a').forEach(link=>link.addEventListener('click',()=>{$('#primary-nav').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');}));
