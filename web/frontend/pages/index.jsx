import { Page, Layout } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";

import { ProductsCard } from "../components";
import { TrustBrands } from "../components/TrustBrands";
import LoginPage from "./login";
import React from "react";

export default function HomePage() {
  const { t } = useTranslation();
  const [merchantName, setMerchantName] = React.useState("");

  return (
    <Page fullWidth>
      {localStorage.getItem("merchantName") ? (
        <>
          <TitleBar
            title="Add the Trust Brands to your products"
            primaryAction={null}
          />
          <Layout>
            <ProductsCard setMerchantName={setMerchantName} />
            <Layout.Section>
              <h1>Trust Brands :</h1>
              <TrustBrands merchantName={merchantName} />
            </Layout.Section>
          </Layout>
        </>
      ) : (
        <LoginPage />
      )}
    </Page>
  );
}
