export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || !/^\d+$/.test(String(id))) {
    return res.status(400).send("Invalid product ID");
  }

  const frontendUrl =
    process.env.FRONTEND_URL || "https://jwelles.vercel.app";

  const backendUrl =
    process.env.BACKEND_API_URL || "https://jwelles.onrender.com/api/v1";

  const productUrl = `${frontendUrl}/products/${id}`;

  try {
    const response = await fetch(
      `${backendUrl}/products/${encodeURIComponent(id)}/`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return res.status(404).send("Product not found");
    }

    const product = await response.json();

    const title = product.name
      ? `${product.name} — JWELLES`
      : "JWELLES — Fine Jewellery";

    const description =
      product.description?.trim() ||
      `Shop ${product.name || "fine jewellery"} at JWELLES.`;

    const image =
      product.images?.[0]?.image ||
      product.image ||
      "";

    const absoluteImage = image
      ? image.startsWith("http")
        ? image
        : `${frontendUrl}${image.startsWith("/") ? "" : "/"}${image}`
      : "";

    const escapeHtml = (value = "") =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const safeTitle = escapeHtml(title);
    const safeDescription = escapeHtml(description.slice(0, 200));
    const safeImage = escapeHtml(absoluteImage);
    const safeUrl = escapeHtml(productUrl);
    const safeProductName = escapeHtml(product.name || "JWELLES");

    return res.status(200).setHeader("Content-Type", "text/html; charset=utf-8").send(`
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />

  <title>${safeTitle}</title>

  <meta
    name="description"
    content="${safeDescription}"
  />

  <meta
    property="og:type"
    content="product"
  />

  <meta
    property="og:title"
    content="${safeTitle}"
  />

  <meta
    property="og:description"
    content="${safeDescription}"
  />

  <meta
    property="og:image"
    content="${safeImage}"
  />

  <meta
    property="og:image:secure_url"
    content="${safeImage}"
  />

  <meta
    property="og:image:alt"
    content="${safeProductName}"
  />

  <meta
    property="og:url"
    content="${safeUrl}"
  />

  <meta
    property="og:site_name"
    content="JWELLES"
  />

  <meta
    name="twitter:card"
    content="summary_large_image"
  />

  <meta
    name="twitter:title"
    content="${safeTitle}"
  />

  <meta
    name="twitter:description"
    content="${safeDescription}"
  />

  <meta
    name="twitter:image"
    content="${safeImage}"
  />

  <link
    rel="canonical"
    href="${safeUrl}"
  />

  <meta
    http-equiv="refresh"
    content="0;url=${safeUrl}"
  />

  <script>
    window.location.replace(${JSON.stringify(productUrl)});
  </script>
</head>

<body>
  <p>
    Redirecting to
    <a href="${safeUrl}">${safeProductName}</a>...
  </p>
</body>
</html>
    `);
  } catch (error) {
    console.error("Product share metadata error:", error);

    return res.status(500).send("Unable to load product");
  }
}