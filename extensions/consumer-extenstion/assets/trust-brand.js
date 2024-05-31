// console.log("trustbrand.js loaded");

// document.addEventListener("DOMContentLoaded", function () {
//   console.log("trustbrand.js DOMContentLoaded");

//   let trustBrand = localStorage.getItem("trustedBrands");
//   console.log("Initial trusted brands:", trustBrand);

//   if (trustBrand) {
//     trustBrand = JSON.parse(trustBrand);
//     console.log("Parsed trusted brands:", trustBrand);
//   }

//   window.addEventListener("storage", function (e) {
//     console.log("storage event triggered", e);
//     if (e.key === "trustedBrands") {
//       console.log("Trusted Brands updated across tabs:", e.newValue);
//       if (e.newValue) {
//         const updatedBrands = JSON.parse(e.newValue);
//         console.log("Parsed updated brands:", updatedBrands);
//       }
//     }
//   });

//   window.addEventListener("trustedBrandsUpdated", function (e) {
//     console.log("Custom event - trustedBrandsUpdated:", e.detail);
//   });

//   function fetchImages() {
//     fetch(`${location.origin}/apps/proxy`)
//       .then((response) => response.json())
//       .then((data) => {
//         console.log(data);
//         const contentDiv = document.getElementById("trust-brand-content");
//         contentDiv.innerHTML = "";

//         data.images.forEach((image) => {
//           const itemDiv = document.createElement("div");
//           itemDiv.classList.add("trust-brand__content__item");

//           const imgElement = document.createElement("img");
//           imgElement.src = image.url;
//           imgElement.alt = image.alt;

//           itemDiv.appendChild(imgElement);
//           contentDiv.appendChild(itemDiv);
//         });
//       })
//       .catch((error) => console.error("Error fetching images:", error));
//   }
// });
