import { getDigest } from "./GetDigest";

export async function handleAddItem(
  title: string,
  setState: (state: any) => void,
  onReload: () => void
) {
  const listName = "shoping";
  const itemType = `SP.Data.${listName}ListItem`;
  const webUrl = "https://crm.zarsim.com";

  if (!title.trim()) {
    setState({ message: "لطفاً یک عنوان وارد کنید." });
    return;
  }

  try {
    const digest = await getDigest();

    await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
      method: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": digest,
      },
      body: JSON.stringify({
        __metadata: { type: itemType },
        Title: title,
      }),
    });

    setState({ message: `آیتم جدید (${title}) اضافه شد.`, title: "" });
    onReload();
  } catch (err) {
    setState({ message: `خطا: ${err.message}` });
  }
}

export async function addOrUpdateItemInVirtualInventory(data: {
  guid_form: string;
  Title?: string;
  ProductCode: string;
  status?: number;
  reserveInventory?: string;
}) {
  const listName = "virtualInventory";
  const itemType = `SP.Data.VirtualInventoryListItem`;
  const webUrl = "https://crm.zarsim.com";

  try {
    const digest = await getDigest();

    const guidForm = data.guid_form;
    const productCode = data.ProductCode;

    if (!guidForm) {
      throw new Error("guid_form is required");
    }

    let filterQuery = `guid_form eq '${guidForm}'`;

    if (
      productCode !== undefined &&
      productCode !== null &&
      productCode !== ""
    ) {
      filterQuery += ` and ProductCode eq '${productCode}'`;
    } else {
      console.warn(
        "Warning: ProductCode is undefined or empty, filtering only by guid_form"
      );
    }

    const filterUrl = `${webUrl}/_api/web/lists/getbytitle('${listName}')/items?$filter=${filterQuery}`;
    const searchResponse = await fetch(filterUrl, {
      headers: { Accept: "application/json;odata=verbose" },
    });

    if (searchResponse.ok) {
      console.log("ok!!!!!!!!");
    }
    
    if (!searchResponse.ok) {
      throw new Error(`Search failed: ${searchResponse.statusText}`);
    }

    const searchResult = await searchResponse.json();

    let itemId;

    if (searchResult.d.results.length > 0) {
      itemId = searchResult.d.results[0].Id;

      const updateData = { ...data };
      delete updateData.guid_form;

      const updateResponse = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})`,
        {
          method: "POST",
          headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": digest,
            "IF-MATCH": "*",
            "X-HTTP-Method": "MERGE",
          },
          body: JSON.stringify({
            __metadata: { type: itemType },
            ...updateData,
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`Update failed: ${updateResponse.statusText}`);
      }
    } else {
      const createResponse = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('${listName}')/items`,
        {
          method: "POST",
          headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": digest,
          },
          body: JSON.stringify({
            __metadata: { type: itemType },
            ...data,
          }),
        }
      );

      if (!createResponse.ok) {
        throw new Error(`Create failed: ${createResponse.statusText}`);
      }

      const createResult = await createResponse.json();
      itemId = createResult.d.Id;
    }

    const getResponse = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})?$select=reserveInventory`,
      {
        headers: { Accept: "application/json;odata=verbose" },
      }
    );

    if (!getResponse.ok) {
      throw new Error(`Failed to get item: ${getResponse.statusText}`);
    }

    const getResult = await getResponse.json();

    return getResult.d.reserveInventory;
  } catch (err) {
    console.error("❌ Error in addOrUpdateItemInVirtualInventory:", err);
    throw err;
  }
}

export async function addOrUpdateItemInOrderableInventory({
  Code,
  orderableInventory,
}: {
  Code: string;
  orderableInventory: string;
}): Promise<string | null> {
  const webUrl = "https://crm.zarsim.com";
  const listName = "orderableInventory";
  const itemType = `SP.Data.${
    listName.charAt(0).toUpperCase() + listName.slice(1)
  }ListItem`;

  const reduceAmount = parseInt(orderableInventory, 10);
  if (isNaN(reduceAmount)) {
    console.error(
      "❌ مقدار orderableInventory نامعتبر است:",
      orderableInventory
    );
    return null;
  }

  try {
    const digest = await getDigest();

    // بررسی اینکه آیتم در orderableInventory وجود دارد یا نه
    const res = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')/items?$filter=Code eq '${Code}'`,
      {
        headers: {
          Accept: "application/json;odata=verbose",
        },
      }
    );
    const data = await res.json();
    const existingItem = data.d.results[0];

    // اگر آیتم وجود دارد، از مقدار فعلی کم می‌کنیم
    if (existingItem) {
      const currentInventory =
        parseInt(existingItem.orderableInventory, 10) || 0;
      const newInventory = Math.max(currentInventory - reduceAmount, 0);

      await fetch(
        `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${existingItem.Id})`,
        {
          method: "POST",
          headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": digest,
            "X-HTTP-Method": "MERGE",
            "If-Match": "*",
          },
          body: JSON.stringify({
            __metadata: { type: itemType },
            orderableInventory: String(newInventory),
          }),
        }
      );

      return String(newInventory);
    }

    // اگر آیتم وجود ندارد، موجودی اولیه را از لیست Store بگیر
    const storeRes = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('Store')/items?$filter=Code eq '${Code}'`,
      {
        headers: { Accept: "application/json;odata=verbose" },
      }
    );
    const storeData = await storeRes.json();
    const storeItem = storeData.d.results[0];

    if (!storeItem) {
      console.error("❌ آیتمی با این Code در لیست Store پیدا نشد");
      return null;
    }

    const initialInventory = parseInt(storeItem.Inventory, 10) || 0;
    const newInventory = Math.max(initialInventory - reduceAmount, 0);

    // آیتم جدید را در orderableInventory بساز
    const createRes = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')/items`,
      {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": digest,
        },
        body: JSON.stringify({
          __metadata: { type: itemType },
          Code,
          orderableInventory: String(newInventory),
        }),
      }
    );

    const createdItem = await createRes.json();
    return createdItem.d.orderableInventory;
  } catch (err) {
    console.error("❌ خطا در پردازش موجودی:", err);
    return null;
  }
}
