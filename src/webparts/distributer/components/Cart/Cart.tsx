import * as React from "react";
import { Component } from "react";
import CartList from "./CartList";
import styles from "../Styles/Cart.module.scss";
import { getDigest } from "../Crud/GetDigest";
import moment = require("moment-jalaali");

export default class Cart extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      cartItems: [],
      message: "",
      showSuccessPopup: false,
      testSmsOrderNumber: null,
      fullName: "",
      orderCountToday: 1,
      userInfo: [],
    };

    this.handleDeleteItem = this.handleDeleteItem.bind(this);
    // this.handleOrder = this.handleOrder.bind(this);
  }

  formatCount(value: string): string {
    while (value.length < 3) {
      value = "0" + value;
    }
    return value;
  }

  gregorianToJalali(gYear: number, gMonth: number, gDay: number): string {
    const date = moment(`${gYear}-${gMonth}-${gDay}`, "YYYY-MM-DD");
    return date.format("jYY/jMM/jDD");
  }

  generateOrderId(category: number): string {
    const currentDate = new Date();
    const orderDate = this.gregorianToJalali(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate()
    );
    const yearMonthDay = orderDate.split("/").join("");
    const categoryCode = this.getCategoryCode(category);
    const count = this.formatCount(this.state.orderCountToday.toString());

    this.setState((prevState) => ({
      orderCountToday: prevState.orderCountToday + 1,
    }));

    return `${yearMonthDay}${categoryCode}${count}`;
  }

  getCategoryCode(category: number): string {
    return category >= 0 && category <= 4 ? String(category) : "X";
  }

  incrementOrderId(orderId: number | string): string {
    const currentOrderNumber = parseInt(String(orderId), 10);
    return (currentOrderNumber + 1000).toString();
  }

  async componentDidMount() {
    try {
      const cartItems = await this.props.fetchCartItems();
      this.setState({ cartItems });
    } catch (err) {
      this.setState({ message: `خطا در بارگذاری سبد خرید: ${err.message}` });
    }
  }

  handleDeleteItem(id: number) {
    const listName = "shoping";
    const webUrl = "https://crm.zarsim.com";

    getDigest()
      .then((digest) =>
        fetch(
          `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${id})`,
          {
            method: "POST",
            headers: {
              Accept: "application/json;odata=verbose",
              "X-RequestDigest": digest,
              "IF-MATCH": "*",
              "X-HTTP-Method": "DELETE",
            },
          }
        )
      )
      .then(() => {
        this.setState({ message: "کالای مورد نظر با موفقیت حذف شد" });
        this.props.updateCartCount();
        return this.props.fetchCartItems();
      })
      .then((cartItems) => this.setState({ cartItems }))
      .catch((err) => this.setState({ message: `خطا در حذف: ${err.message}` }));
  }

//  async handleOrder() {
//   try {
//     const userGuid = localStorage.getItem("userGuid");
//     if (!userGuid) {
//       this.setState({ message: "شناسه کاربری پیدا نشد." });
//       return;
//     }

//     const userInfoFromList = await getCustomerInfo();

//     const fullName = userInfoFromList.Title || "";
//     const phoneNumber = userInfoFromList.Mobile || "";

//     if (!phoneNumber) {
//       this.setState({ message: "شماره تلفن کاربر ثبت نشده است." });
//       return;
//     }

//     const { cartItems } = this.state;
//     if (cartItems.length === 0) {
//       this.setState({ message: "سبد خرید خالی است." });
//       return;
//     }

//     const webUrl = "https://crm.zarsim.com";
//     const listName = "Orders";
//     const digest = await getDigest();

//     const orderNumber = this.generateOrderId(0);
//     const updatedOrderNumber = this.incrementOrderId(orderNumber);

//     const orderRes = await fetch(
//       `${webUrl}/_api/web/lists/getbytitle('${listName}')/items`,
//       {
//         method: "POST",
//         headers: {
//           Accept: "application/json;odata=verbose",
//           "Content-Type": "application/json;odata=verbose",
//           "X-RequestDigest": digest,
//         },
//         body: JSON.stringify({
//           __metadata: { type: "SP.Data.OrdersListItem" },
//           guid_form: userGuid,
//           phoneNumber,
//           Date: new Date().toISOString(),
//           CustomerName: fullName,
//           OrderNumber: updatedOrderNumber,
//           Address: userInfoFromList.Address || "", 
//           Email: userInfoFromList.Email || "",
//         }),
//       }
//     );

//     const orderData = await orderRes.json();

//     if (orderData.d) {
//       const testSmsOrderNumber = Number(orderData.d.Id) + 10000;

//       postToTaskCRM(String(testSmsOrderNumber), fullName);

//       const smsMessage = `جناب ${fullName} سفارش شما با شماره ${testSmsOrderNumber} ثبت شد`;

//       await fetch(
//         `${webUrl}/_api/web/lists/getbytitle('SMSToCustomer')/items`,
//         {
//           method: "POST",
//           headers: {
//             Accept: "application/json;odata=verbose",
//             "Content-Type": "application/json;odata=verbose",
//             "X-RequestDigest": digest,
//           },
//           body: JSON.stringify({
//             __metadata: { type: "SP.Data.SMSToCustomerListItem" },
//             Title: String(fullName),
//             Description: smsMessage,
//             Mobile: String(phoneNumber),
//             send_p: true,
//             send_e: false,
//           }),
//         }
//       );

//       const CSEsmsMessage = `سفارش جناب ${fullName} با شماره ${testSmsOrderNumber} ثبت شد `;
//       sendSmsToZarsimCEO(CSEsmsMessage, "09129643050");

//       this.setState({
//         message: "سفارش با موفقیت ثبت شد",
//         showSuccessPopup: true,
//         testSmsOrderNumber,
//         fullName,
//       });

//       setTimeout(() => {
//         localStorage.removeItem("userGuid");
//       }, 2000);
//     } else {
//       this.setState({ message: "خطا در ثبت سفارش" });
//     }
//   } catch (err) {
//     console.error("خطا در ثبت سفارش:", err);
//     this.setState({ message: "خطا در ثبت سفارش" });
//   }
// }

  render() {
    return (
      <div className={styles.formContainer}>
        {this.state.message && (
          <div className={styles.errorMessage}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17L4 12" />
            </svg>
            <span>{this.state.message}</span>
            <button
              className={styles.closeBtn}
              onClick={() => this.setState({ message: "" })}
            >
              ✕
            </button>
          </div>
        )}

        <CartList
          products={this.state.cartItems}
          onDelete={this.handleDeleteItem}
        />

        {this.state.cartItems.length > 0 ? (
          <div className={styles.cartButtonDiv}>
            <button className={styles.cartButton}>
              ثبت سفارش
            </button>
          </div>
        ) : (
          <div className={styles.emptyCartMessage}>سبد خرید شما خالی است.</div>
        )}
      </div>
    );
  }
}

// sendSmsToZarsimCEO(CSEsmsMessage, "09123146451");
