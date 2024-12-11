// ==UserScript==
// @name         Ckw test
// @namespace    https://github.com/melodySung/ckw-test.git
// @version      2024-12-11+1
// @author       Melody
// @description  ckw cart test.
// @homepage     https://github.com/melodySung/ckw-test
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chiikawamarket.jp
// @match        https://chiikawamarket.jp/products/*
// @match        https://chiikawamarket.jp/collections/*
// @match        https://chiikawamarket.jp/collections/*/products/*
// @match        https://nagano-market.jp/products/*
// @match        https://nagano-market.jp/*/products/*
// @match        https://nagano-market.jp/collections/*
// @match        https://nagano-market.jp/collections/*/products/*
// @match        https://nagano-market.jp/*/collections/*/products/*
// @match        https://chiikawamogumogu.shop/products/*
// @match        https://chiikawamogumogu.shop/collections/*/products/*
// @grant        none
// ==/UserScript==

(async function () {
  "use strict";

  const getCart = async () => {
    const res = await fetch("/cart.js", {
      headers: {
        accept: "*/*",
      },
    });
    const data = await res.json();
    return data?.items;
  };

  const addItem = async (id, productId, quantity) => {
    const res = await fetch("/cart/add.js", {
      headers: {
        accept: "application/javascript",
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundary788zedotmtSec399",
        "x-requested-with": "XMLHttpRequest",
      },
      method: "POST",
      body: `------WebKitFormBoundary788zedotmtSec399\r\nContent-Disposition: form-data; name="form_type"\r\n\r\nproduct\r\n------WebKitFormBoundary788zedotmtSec399\r\nContent-Disposition: form-data; name="utf8"\r\n\r\n✓\r\n------WebKitFormBoundary788zedotmtSec399\r\nContent-Disposition: form-data; name="id"\r\n\r\n${id}\r\n------WebKitFormBoundary788zedotmtSec399\r\nContent-Disposition: form-data; name="quantity"\r\n\r\n${quantity}\r\n------WebKitFormBoundary788zedotmtSec399\r\nContent-Disposition: form-data; name="product-id"\r\n\r\n${productId}\r\n------WebKitFormBoundary788zedotmtSec399\r\nContent-Disposition: form-data; name="section-id"\r\n\r\ntemplate--18391309091057__main\r\n------WebKitFormBoundary788zedotmtSec399--\r\n`,
    });
    return res.status;
  };

  const removeItem = async (id) => {
    const items = await getCart();
    const index = items?.findIndex((e) => e?.id == id);
    if (index >= 0) {
      await fetch("/cart/change.js", {
        headers: {
          accept: "*/*",
          "content-type": "application/json",
        },
        method: "POST",
        body: `{"line":${index + 1},"quantity":0}`,
      });
      return items[index]?.quantity ?? 0;
    }
    return 0;
  };

  const addToCart = async () => {
       // Make sure the label is valid.
    let label = document.getElementsByClassName("product-page--title")?.[0];
    if (!label) {
      label = document.getElementsByClassName("product__title")?.[0].children?.[0];
    }
    if (!label) {
      return;
    }

    const text = label.textContent;

    label.textContent = `${text} (🔄)`;

    // Get product ID and ID for storage checking.
    const productId = document.querySelector('input[name="product-id"]')?.getAttribute("value");
    let id = document.getElementsByClassName("product-form--variant-select")?.[0]?.children?.[0]?.getAttribute("value");
    if (!id) {
      // Chiikawa Mogumogu Honpo Online Store.
      id = document.getElementsByClassName("product__pickup-availabilities")?.[0]?.getAttribute("data-variant-id");
    }
    if (!productId || !id) {
      return;
    }

    try {
        // Attempt to add items with the given quantity to cart.
        let res = await addItem(id, productId, 1);
        console.log("addItem res")
        console.log(res)

        label.textContent = `${text} ${res}`;
        if(res == 200 ) {
            label.textContent = `${text} (✅)`;
        } else {
            label.textContent = `${text} (❌)`;
        }
    } catch (error) {
        label.textContent = `${text} ${error.message}`;
        console.log("add Cart Error: ${error.message}")
    }

  }

  const links = [];
  const createLink = () => {
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = "加购物车";
    // TODO: this color does not apply to Chiikawa Mogumogu Honpo Online Store.
    link.style.color = "var(--bg-color--button)";
    link.style.marginLeft = "8px";
    link.style.textDecoration = "underline";
    link.addEventListener("click", (e) => {
      e.preventDefault();
      for (const link of links) {
        link.remove();
      }
    });
    links.push(link);
    return link;
  };

    //collections
    const productLinks = document.querySelectorAll('.product--root a');

    console.log("find links:")
    console.log(productLinks);

    productLinks.forEach(link => {
        link.setAttribute('target', '_blank');
    });


    // Product.
    let title = document.getElementsByClassName("product-page--title")?.[0];
    if (!title) {
      title = document.getElementsByClassName("product__title")?.[0]?.children?.[0];
    }
    if (!title) {
      return;
    }
    const link = createLink();
    link.addEventListener("click", () => {
      addToCart();
    });
    title.appendChild(link);
  
})();

