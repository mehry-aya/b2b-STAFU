import { ShopifyProductSyncPayload, ShopifyVariantSyncPayload } from "../products/shopify.service";

export class ShopifyMapper {
  static mapNodeToProductPayload(node: any): ShopifyProductSyncPayload {
    const variants = node.variants?.edges?.map((ve: any) => {
      const v = ve.node;
      const options = v.selectedOptions || [];
      return {
        shopifyVariantId: v.id,
        title: v.title,
        sku: v.sku,
        price: v.price || null,
        compareAtPrice: v.compareAtPrice || null,
        inventoryQuantity: v.inventoryQuantity ?? 0,
        option1: options[0]?.value || null,
        option2: options[1]?.value || null,
        option3: options[2]?.value || null,
        imageUrl: v.image?.url || null,
      } as ShopifyVariantSyncPayload;
    });

    const images = node.images?.edges?.map((ie: any) => ({
      src: ie.node.url,
      alt: ie.node.altText || '',
    })) || [];

    return {
      shopifyId: node.id,
      title: node.title,
      description: node.descriptionHtml,
      handle: node.handle,
      vendor: node.vendor,
      productType: node.productType,
      status: node.status?.toLowerCase() || 'unknown',
      images,
      options: node.options || [],
      variants: variants || [],
      collections: node.collections?.edges?.map((ce: any) => ({
        shopifyId: ce.node.id,
        title: ce.node.title,
        handle: ce.node.handle,
      })) || [],
    };
  }
}
