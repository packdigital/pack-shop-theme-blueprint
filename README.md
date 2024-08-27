<p align="center"><a href="https://www.packdigital.com"><img src="https://cdn.shopify.com/s/files/1/0830/5750/8663/files/pack-blueprint-hydrogen-logo.png?v=1713300323" width="40px" alt="Pack Digital - gives growing brands every tool they need to build and manage their Shopify Hydrogen storefront" /></a></p>

<p align="center"><b><a href="https://pack-shop.packdigital.com/pages/example-shop-page" target="_blank">Check out the demo store</a></b></p>

### Requirements

- Node.js version 16.14.0 or higher

Once you have your project cloned start off by installing your node packages

```
npm install
```

### Environment Variables

To run your application locally, you can use Shopify's mock.shop API to simulate a Shopify storefront. You can set the `PUBLIC_STORE_DOMAIN` environment variable to `mock.shop` to use the mock.shop API.

```dotenv
SESSION_SECRET="foobar"
PUBLIC_STORE_DOMAIN="mock.shop"
PUBLIC_STOREFRONT_API_TOKEN="foobar"
```

You can automate pull in your Shopify environment variables directly from your Shopify Hydrogen storefront using the Hydrogen CLI. Run the command below and follow its prompts.

```
npx shopify hydrogen env pull
```

Alternatively, you can create a `.env` file and manually copy these values from your Shopify Hydrogen storefront. You can find the variables by going to the Hydrogen storefront > Storefront Settings > Environments & Variables. These are the required variables needed:

```dotenv
SESSION_SECRET="XXX"
PUBLIC_STOREFRONT_API_TOKEN="XXX"
PUBLIC_STORE_DOMAIN="XXX"
PACK_PUBLIC_TOKEN="XXX"
PACK_SECRET_TOKEN="XXX"
PACK_STOREFRONT_ID="XXX"
```

### Building for production

This command will simulate the same deployment job that Shopify Oxygen will use when deploying your live site.

```bash
npm run build
```

### Building for local development

This command will start a server locally on your machine at http://localhost:3000.

```bash
npm run dev
```

## Documentation and Support

View [Pack's developer documentation](https://docs.packdigital.com) for info on how to set up and use the platform.
Join our Discord community if you get stuck, want to chat, or are thinking of a new feature.
Or email us at contact@packdigital.com if Discord isn't your thing.
We're here to help - and to make Pack even better!

## Contributors

We ❤ all contributions, big and small!
Read our [quickstart](https://docs.packdigital.com/quickstart) guide for how to set up your local development environment.
The TLDR:

- If there’s a bug, raise an issue
- If you have a fix, fork it and do a PR
- If you have a feature request → Raise it as an issue / discussion, put in a PR if you build it
  If you want to, you can reach out via [Discord](#) or email and we'll set up a pair programming session to get you started.
