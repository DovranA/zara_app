import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { Product } from "./database";

export interface PDFProduct extends Product {
  userName?: string;
}

const generateProductHTML = (products: PDFProduct[]): string => {
  const productRows = products
    .map(
      (product) => `
        <div class="product-card">
            <div class="product-header">
                <h2 class="product-name">${product.name}</h2>
                <span class="product-price">$${product.price.toFixed(2)}</span>
            </div>
            ${
              product.note
                ? `<p class="product-note"><strong>Note:</strong> ${product.note}</p>`
                : ""
            }
            ${
              product.delivery_date
                ? `
                <p class="product-date">
                    <strong>Delivery Date:</strong> ${new Date(
                      product.delivery_date
                    ).toLocaleDateString()}
                </p>
            `
                : ""
            }
            ${
              product.userName
                ? `
                <p class="product-user">
                    <strong>Assigned to:</strong> ${product.userName}
                </p>
            `
                : ""
            }
            ${
              product.userName
                ? `
                <p class="product-user">
                    <strong>Assigned to:</strong> ${product.userName}
                </p>
            `
                : ""
            }
        </div>
    `
    )
    .join("");

  return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    padding: 40px;
                    background: #ffffff;
                    color: #333;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    border-bottom: 3px solid #667eea;
                    padding-bottom: 20px;
                }
                
                .header h1 {
                    font-size: 32px;
                    color: #667eea;
                    margin-bottom: 10px;
                }
                
                .header p {
                    font-size: 14px;
                    color: #666;
                }
                
                .summary {
                    background: #f5f7fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                }
                
                .summary h3 {
                    color: #667eea;
                    margin-bottom: 10px;
                }
                
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                }
                
                .summary-item {
                    text-align: center;
                }
                
                .summary-item .label {
                    font-size: 12px;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .summary-item .value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #667eea;
                    margin-top: 5px;
                }
                
                .products-section {
                    margin-top: 30px;
                }
                
                .section-title {
                    font-size: 20px;
                    color: #333;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #e0e0e0;
                }
                
                .product-card {
                    background: #ffffff;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 15px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                
                .product-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .product-name {
                    font-size: 18px;
                    color: #333;
                    font-weight: 600;
                }
                
                .product-price {
                    font-size: 20px;
                    color: #667eea;
                    font-weight: bold;
                }
                
                .product-note,
                .product-date,
                .product-user {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 8px;
                    line-height: 1.5;
                }
                
                .product-note strong,
                .product-date strong,
                .product-user strong {
                    color: #333;
                }
                
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #e0e0e0;
                    text-align: center;
                    font-size: 12px;
                    color: #999;
                }
                
                @media print {
                    body {
                        padding: 20px;
                    }
                    
                    .product-card {
                        page-break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Product List</h1>
                <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
            
            <div class="summary">
                <h3>Summary</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="label">Total Products</div>
                        <div class="value">${products.length}</div>
                    </div>
                    <div class="summary-item">
                        <div class="label">Total Value</div>
                        <div class="value">$${products
                          .reduce((sum, p) => sum + p.price, 0)
                          .toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="label">With Delivery Date</div>
                        <div class="value">${
                          products.filter((p) => p.delivery_date).length
                        }</div>
                    </div>
                </div>
            </div>
            
            <div class="products-section">
                <h2 class="section-title">Products</h2>
                ${productRows}
            </div>
            
            <div class="footer">
                <p>This document was automatically generated by Zara App</p>
            </div>
        </body>
        </html>
    `;
};

export const generateProductsPDF = async (
  products: PDFProduct[]
): Promise<void> => {
  try {
    if (products.length === 0) {
      throw new Error("No products selected");
    }

    const html = generateProductHTML(products);

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Share Product List",
      UTI: "com.adobe.pdf",
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

export const printProductsPDF = async (
  products: PDFProduct[]
): Promise<void> => {
  try {
    if (products.length === 0) {
      throw new Error("No products selected");
    }

    const html = generateProductHTML(products);

    await Print.printAsync({
      html,
    });
  } catch (error) {
    console.error("Error printing PDF:", error);
    throw error;
  }
};
