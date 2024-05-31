// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import mongoose, { trusted } from "mongoose";
import bcrypt from "bcrypt";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import { Verify, verify } from "crypto";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());
app.use("/userData/*", shopify.validateAuthenticatedSession()); // Proxy to the backend

app.use(express.json());

// Mongo Db connection

mongoose
  .connect("mongodb://127.0.0.1:27017/econsumer")
  .then(() => {
    console.log("--- Connected to Mongoose Successfully ---");
  })
  .catch((error) => {
    console.log("--- Mongoose Can't Connect ---");
  });

let merchantSchmea = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  trustedBrands: {
    type: Array,
    required: false,
  },
});

let Merchant = mongoose.model("merchantdata", merchantSchmea);

/**
 * @api Demo test for proxy
 * */
app.get("/userData/userinfo", async (req, res) => {
  res.json("User Info recived successfully");
});

/**
 * @api to create merchant account
 */

app.post("/api/merchant-signin", async (req, res) => {
  try {
    let merchant = req.body || {
      username: "Company 123",
      password: "123456",
    };
    let merchantData = await Merchant.findOne({ username: merchant.username });
    if (!merchantData) {
      let hash = await bcrypt.hash(merchant.password, 10);
      merchant.password = hash;
      let merchantData = new Merchant(merchant);
      let data = await merchantData.save();

      res.status(200).send({
        message: "Merchant account created successfully",
        data,
        merchantName: merchant.username,
      });
    } else {
      res.status(400).send({ error: "Merchant already exists" });
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * @api to login merchant account
 */

app.post("/api/merchant-login", async (req, res) => {
  try {
    console.log(req.body);
    let merchant = req.body;
    let merchantData = await Merchant.findOne({ username: merchant.username });
    if (merchantData) {
      let match = await bcrypt.compare(
        merchant.password,
        merchantData.password
      );
      if (match) {
        res.status(200).send({
          message: "Merchant logged in successfully",
          merchantName: merchant.username,
        });
      } else {
        res.status(400).send({ error: "Invalid credentials" });
      }
    } else {
      res.status(400).send({ error: "Merchant doesn't exist" });
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * @api to get products of an specific merchant
 */

app.post("/api/products/all", async (req, res) => {
  const { merchantName } = req.body;
  try {
    const data = await shopify.api.rest.Product.all({
      session: res.locals.shopify.session,
      vendor: merchantName,
    });
    res.status(200).send(data);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({ error: error.message });
  }
});

/**
 * @api to add trusted brand into DB
 */

app.put("/api/merchant/trustedbrand", async (req, res) => {
  const { merchantName, selectedBrands } = req.body;
  try {
    let merchantData = await Merchant.findOne({ username: merchantName });
    if (!merchantData) {
      return res.status(400).json({ error: "Merchant not found" });
    }
    merchantData.trustedBrands = selectedBrands;
    await merchantData.save();

    res.status(200).json({ message: "Brands successfully saved" });
  } catch (error) {
    console.error("Error saving trusted brands:", error);
    res.status(500).json({ error: "Failed to save trusted brands" });
  }
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
