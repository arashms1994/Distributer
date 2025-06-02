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
  ProductCode?: string;
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

    // جستجو در لیست با فیلتر
    const filterUrl = `${webUrl}/_api/web/lists/getbytitle('${listName}')/items?$filter=${filterQuery}`;
    const searchResponse = await fetch(filterUrl, {
      headers: { Accept: "application/json;odata=verbose" },
    });

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
