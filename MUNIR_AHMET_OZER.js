(() => {
  // Only run on homepage
  const homepageOrigin = 'https://www.e-bebek.com';
  const { origin, pathname } = window.location;
  if (origin !== homepageOrigin || (pathname !== '/' && pathname !== '/index.html')) {
    console.log('wrong page');
    return;
  }

  const init = () => {
    buildHTML();
    buildCSS();
    setEvents();
  };

  const buildHTML = () => {
    const html = `
      <section class="product-carousel-wrapper">
        <div class="carousel-header">Beğenebileceğinizi düşündüklerimiz</div>
        <div class="product-carousel">
          <button class="carousel-nav prev">‹</button>
          <div class="carousel-track"></div>
          <button class="carousel-nav next">›</button>
        </div>
      </section>
    `;
    // Replace original eb-product-carousel in Section2A
    const originalCarousel = document.querySelector('cx-page-slot[position="Section2A"] eb-product-carousel');
    if (originalCarousel) {
      originalCarousel.outerHTML = html;
      return;
    }
    // Fallback: replace by header text match
    const originalHeader = document.querySelector('h2.title-primary');
    if (originalHeader && originalHeader.textContent.trim() === 'Sizin için Seçtiklerimiz') {
      const parentSection = originalHeader.closest('section') || originalHeader.parentElement;
      if (parentSection) {
        parentSection.outerHTML = html;
        return;
      }
    }
    // Fallback: append after home-stories
    const container = document.querySelector('.home-stories');
    if (container) {
      container.insertAdjacentHTML('afterend', html);
    } else {
      document.body.insertAdjacentHTML('beforeend', html);
    }
  };

  const buildCSS = () => {
    const css = `
      .product-carousel-wrapper { margin: 40px auto; max-width: 1200px; position: relative; }
      .carousel-header { background: #FFF6EB; color: #FF8C00; font-size: 26px; font-weight: bold; padding: 16px 24px; border-radius: 8px 8px 0 0; }
      .product-carousel { position: relative; overflow-x: visible; background: #fff; border: 1px solid #f0f0f0; border-radius: 0 0 8px 8px; padding: 0 40px; }
      .carousel-track { display: flex; gap: 16px; padding: 16px 0; overflow-x: auto; scroll-behavior: smooth; }
      .carousel-nav { position: absolute; top: calc(50% + 16px); transform: translateY(-50%); background: #FFF6EB; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #FF8C00; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.1); z-index: 2; }
      .carousel-nav.prev { left: 8px; }
      .carousel-nav.next { right: 8px; }
      .carousel-item { background: #ffffff; border: 1px solid #f0f0f0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); min-width: 220px; padding: 16px; position: relative; transition: border-color 0.3s ease; display: flex; flex-direction: column; }
      .carousel-item:hover { border-color: #FF8C00; }
      .carousel-item img { width: 100%; height: auto; border-radius: 4px; }
      .product-name { margin: 12px 0 8px; font-size: 14px; color: #333; text-decoration: none; flex-grow: 1; }
      .price-container { margin-bottom: 8px; }
      .price { font-size: 18px; font-weight: bold; color: #222; }
      .original-price { font-size: 14px; color: #999; text-decoration: line-through; margin-left: 8px; }
      .discount { font-size: 14px; color: #FF4D4F; margin-top: 4px; }
      .rating-stars { display: flex; justify-content: center; gap: 4px; margin-bottom: 12px; }
      .rating-stars svg { width: 16px; height: 16px; fill: #FFB400; }
      .add-to-cart { margin-top: auto; background: #FF8C00; color: #fff; border: none; border-radius: 20px; padding: 10px 0; font-size: 14px; cursor: pointer; width: 100%; }
      .add-to-cart:hover { background: #e67e00; }
      .heart { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; background: #fff; border: 1px solid #e0e0e0; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; color: #FF8C00; z-index: 1; transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease; }
      .heart.filled { background: #FF8C00; color: #fff; border-color: #FF8C00; }
      @media (max-width: 768px) {
        .product-carousel-wrapper { margin: 20px auto; }
        .carousel-header { font-size: 20px; padding: 12px 16px; }
        .carousel-item { min-width: 180px; padding: 12px; }
        .product-name { font-size: 12px; }
        .price { font-size: 16px; }
      }
    `;
    const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
  };

  const setEvents = () => {
    const API_URL = 'https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json';
    const STORAGE_KEY = 'productCarouselData';
    const FAVORITES_KEY = 'productCarouselFavorites';
    let products = [];
    try { products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { products = []; }
    let favorites = [];
    try { favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; } catch { favorites = []; }

    const starSVG = '<svg viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568L24 9.423l-6 5.845L19.335 24 12 19.771 4.665 24 6 15.268 0 9.423l8.332-1.268z"></path></svg>';

    const render = () => {
      const track = document.querySelector('.carousel-track'); if (!track) return;
      track.innerHTML = ''; products.forEach(product => {
        const item = document.createElement('div'); item.className = 'carousel-item'; item.dataset.id = product.id;
        let stars = ''; for (let i = 0; i < 5; i++) { stars += starSVG; }
        item.innerHTML = `
          <img src="${product.img}" alt="${product.name}" />
          <div class="heart">${favorites.includes(product.id) ? '♥' : '♡'}</div>
          <a href="${product.url}" target="_blank" class="product-name">${product.name}</a>
          <div class="price-container"><span class="price">${product.price.toFixed(2)} TL</span>${product.original_price !== product.price ? `<span class="original-price">${product.original_price.toFixed(2)} TL</span><div class="discount">%${Math.round(((product.original_price - product.price)/product.original_price)*100)} indirim</div>` : ''}</div>
          <div class="rating-stars">${stars}</div>
          <button class="add-to-cart">Sepete Ekle</button>
        `;
        track.appendChild(item);
      });
      document.querySelector('.carousel-nav.prev').onclick = () => document.querySelector('.carousel-track').scrollBy({ left: -260, behavior: 'smooth' });
      document.querySelector('.carousel-nav.next').onclick = () => document.querySelector('.carousel-track').scrollBy({ left: 260, behavior: 'smooth' });
      document.querySelectorAll('.carousel-item .heart').forEach(el => {el.onclick = () => {const id=parseInt(el.closest('.carousel-item').dataset.id);favorites=JSON.parse(localStorage.getItem(FAVORITES_KEY))||[];if(favorites.includes(id))favorites=favorites.filter(i=>i!==id);else favorites.push(id);localStorage.setItem(FAVORITES_KEY,JSON.stringify(favorites));render();};});
      document.querySelectorAll('.add-to-cart').forEach(btn => btn.onclick = () => alert('Ürün sepete eklendi!'));
    };

    if (products.length) render(); else fetch(API_URL).then(r=>r.json()).then(data=>{products=data;localStorage.setItem(STORAGE_KEY,JSON.stringify(data));render();}).catch(err=>console.error(err));
  };

  init();
  console.log('Carousel has been successfully replaced.');

})();
