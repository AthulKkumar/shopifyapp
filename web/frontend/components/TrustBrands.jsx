import { Page, Layout, LegacyCard } from "@shopify/polaris";
import React, { useState } from "react";
import amazonpay from "../assets/amazonpay.svg";
import americanexpress from "../assets/americanexpress.svg";
import gpay from "../assets/gpay.svg";
import mastercard from "../assets/mastercard.svg";
import paypal from "../assets/paypal.svg";
import visa from "../assets/visa.svg";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

export function TrustBrands({ merchantName }) {
  const brands = [
    { name: "Amazon Pay", image: amazonpay },
    { name: "American Express", image: americanexpress },
    { name: "Google Pay", image: gpay },
    { name: "Mastercard", image: mastercard },
    { name: "PayPal", image: paypal },
    { name: "Visa", image: visa },
  ];

  const [selectedBrands, setSelectedBrands] = useState([]);
  const [error, setError] = useState(null);
  const fetch = useAuthenticatedFetch();

  function addBrandstoDB(e) {
    e.preventDefault();

    const payload = { merchantName, selectedBrands };

    fetch("/api/merchant/trustedbrand", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("trustedBrands", JSON.stringify(selectedBrands));
        console.log("Success:", data);
        setError(null);

        window.dispatchEvent(
          new CustomEvent("trustedBrandsUpdated", {
            detail: selectedBrands,
          })
        );
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(error.message);
      });
  }

  const handleCheckboxChange = (brand) => {
    setSelectedBrands((prevSelectedBrands) => {
      if (prevSelectedBrands.some((b) => b.name === brand.name)) {
        return prevSelectedBrands.filter((b) => b.name !== brand.name);
      } else {
        return [...prevSelectedBrands, brand];
      }
    });
  };

  return (
    <Page>
      <Layout>
        <Layout.Section oneThird>
          {brands.map((brand) => (
            <LegacyCard title={brand.name} sectioned key={brand.name}>
              <input
                type="checkbox"
                checked={selectedBrands.some((b) => b.name === brand.name)}
                onChange={() => handleCheckboxChange(brand)}
              />
              <img
                src={brand.image}
                alt={brand.name}
                className="trustBrandIcon"
              />
            </LegacyCard>
          ))}
          {error && <div style={{ color: "red" }}>Error: {error}</div>}
          <button onClick={addBrandstoDB} className="trustBrandBtn">
            Save
          </button>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
