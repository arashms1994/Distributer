import moment = require("moment-jalaali");
import { getDigest } from "./GetDigest";

export async function postToTaskCRM(
  testSmsOrderNumber: string,
  fullName: string
) {
  const webUrl = "https://crm.zarsim.com";
  const listName = "Task_CRM";
  const userGuid = localStorage.getItem("userGuid");

  try {
    const digest = await getDigest();

    const typeResponse = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')?$select=ListItemEntityTypeFullName`,
      {
        headers: {
          Accept: "application/json;odata=verbose",
        },
        credentials: "include",
      }
    );

    const typeData = await typeResponse.json();
    const itemType = typeData.d.ListItemEntityTypeFullName;

    const nowGregorian = new Date().toISOString();
    const nowJalali = moment().format("jYYYY/jMM/jDD");

    const response = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')/items`,
      {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": digest,
        },
        credentials: "include",
        body: JSON.stringify({
          __metadata: { type: itemType },
          Title: `سفارش فروشگاهی جناب ${fullName}`,
          Order_GUID: String(userGuid),
          Created_Name: "سیستم",
          CreatedAccant: "i:0#.w|zarsim\\rashaadmin",
          off_status: "NO",
          OrderType: "عادی",
          ReceiverAccant: "menayati",
          ReceiverName: "شادی عنایتی",
          Status0: "ارجاع شده",
          Order_Type: "1",
          Order_No: testSmsOrderNumber,
          DueDate: nowGregorian,
          DueDate_t: nowJalali,
          StartDate: nowGregorian,
          StartDate_t: nowJalali,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`خطا در ثبت تسک: ${errorData.error.message.value}`);
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error("خطا در ثبت تسک:", err);
    throw err;
  }
}
