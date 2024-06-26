import React, { useState } from "react";
import { Page, Layout, LegacyCard } from "@shopify/polaris";
import { TitleBar, Toast } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

export default function LoginPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const fetch = useAuthenticatedFetch();

  const handleLogin = () => {
    fetch("/api/merchant-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        console.log(response, "response");

        if (response.status === 200) {
          localStorage.setItem("merchantName", username);
          window.location.reload();
        } else if (response.status === 401) {
          alert("Invalid credentials");
        } else if (response.status === 404) {
          alert("Merchant doesn't exist");
        }
      })
      .catch((error) => {
        console.error(error, "error");
        alert("Invalid credentials");
      });
  };

  return (
    <Page narrowWidth>
      <Layout>
        <Layout.Section oneHalf>
          <LegacyCard title="Merchant Login" sectioned>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="loginInput"
              placeholder="Enter Ventor Name"
            />
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="loginInput"
              placeholder="Enter Password"
            />
            <button onClick={handleLogin} className="loginBtn">
              Login
            </button>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
