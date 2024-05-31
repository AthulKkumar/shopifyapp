import { Page, Layout, LegacyCard } from "@shopify/polaris";
import React from "react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

export function ProductsCard({ setMerchantName }) {
  const [products, setProducts] = React.useState([]);
  const [error, setError] = React.useState(null);
  const fetch = useAuthenticatedFetch();
  const merchantName = localStorage.getItem("merchantName");

  // Fetch products of the merchant
  React.useEffect(() => {
    setMerchantName(merchantName);

    fetch("/api/products/all", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ merchantName }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data.data);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [merchantName]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Page title={`${merchantName}'s Products`}>
        <Layout>
          {products.map((product) => (
            <Layout.Section key={product.id} oneThird>
              <LegacyCard title={product.title} sectioned>
                <p>{product.description}</p>
              </LegacyCard>
            </Layout.Section>
          ))}
        </Layout>
      </Page>
    </>
  );
}
