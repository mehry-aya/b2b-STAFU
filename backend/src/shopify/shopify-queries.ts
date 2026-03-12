// shopify-queries.ts
export const GET_CATEGORIES_QUERY = `
  query {
    menu(handle: "b2b-menu") {
      items {
        title
        url
        items {
          title
          url
        }
      }
    }
  }
`;

export const GET_PRODUCTS_QUERY = `
  query getProducts($cursor: String) {
    products(first: 50, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          descriptionHtml
          handle
          vendor
          productType
          status
          options {
            name
            values
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          collections(first: 10) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                sku
                price
                compareAtPrice
                inventoryQuantity
                image {
                  url
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;