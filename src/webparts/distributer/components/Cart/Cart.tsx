// Cart.tsx
import * as React from "react";
import { Component } from "react";
import CartList from "./CartList";
import styles from "../Styles/Cart.module.scss";
import { getDigest } from "../Crud/GetDigest";
import * as moment from "moment-jalaali";
import { getCurrentUser, getCustomerInfoByUserName } from "../Crud/GetData";
import { postToTaskCRM } from "../Crud/PostToTaskCRM";
import sendSmsToZarsimCEO from "../utils/sendSms";
import { hashHistory } from "react-router";

export default class Cart extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      cartItems: [],
      message: "",
      errMassage: "",
      showSuccessPopup: false,
      testSmsOrderNumber: "",
      fullName: "",
      nameId: "",
      orderCountToday: 1,
      phoneNumber: "",
      expertAcc: "",
      expertName: "",
      expertMobile: "",
      expertAcc: "",
      expertName: "",
      expertMobile: "",
      userInfo: [],
      totalAmount: 0,
    };
  }

  formatCount(value: string): string {
    while (value.length < 3) value = "0" + value;
    return value;
  }

  gregorianToJalali(gYear: number, gMonth: number, gDay: number): string {
    return moment(`${gYear}-${gMonth}-${gDay}`, "YYYY-MM-DD").format(
      "jYY/jMM/jDD"
    );
  }

  generateOrderId(category: number): string {
    const currentDate = new Date();
    const orderDate = this.gregorianToJalali(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate()
    );
    const count = this.formatCount(this.state.orderCountToday.toString());
    const code = this.getCategoryCode(category);

    this.setState((prev) => ({ orderCountToday: prev.orderCountToday + 1 }));
    return `${orderDate.replace(/\//g, "")}${code}${count}`;
  }

  getCategoryCode(category: number): string {
    return category >= 0 && category <= 4 ? String(category) : "X";
  }

  incrementOrderId(orderId: number | string): string {
    return (parseInt(String(orderId), 10) + 1000).toString();
  }

  calcaluateTheToatalPrice = () => {
    const totalAmount = this.state.cartItems.reduce((sum, item) => {
      const price = Number(item.price);
      const count = Number(item.count);
      return sum + price * count;
    }, 0);
    this.setState({ totalAmount });
  };

  async componentDidMount() {
    try {
      const cartItems = await this.props.fetchCartItems();
      const currentUser = await getCurrentUser();
      const customerInfo = await getCustomerInfoByUserName(
        currentUser.UserId.NameId
      );
      const expertAcc = (customerInfo.SalesExpertAcunt_text || "").split(
        "\\"
      )[1];

      this.setState(
        {
          cartItems,
          nameId: currentUser.UserId.NameId,
          fullName: customerInfo.Title || "",
          phoneNumber: customerInfo.Mobile || "",
          expertAcc: expertAcc,
          expertName: customerInfo.SalesExpert || "",
          expertMobile: customerInfo.SalesExpertMobile || "",
        },
        this.calcaluateTheToatalPrice // 💡 محاسبه اولیه
      );
    } catch (err) {
      this.setState({ message: `خطا در بارگذاری سبد خرید: ${err.message}` });
    }
  }

  handleDeleteItem = async (id: number) => {
    try {
      const digest = await getDigest();
      const webUrl = "https://crm.zarsim.com";
      const listName = "shoping";

      await fetch(
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
      );

      const cartItems = await this.props.fetchCartItems();
      this.setState({ cartItems }, this.calcaluateTheToatalPrice);
    } catch (err) {
      this.setState({ message: `خطا در حذف: ${err.message}` });
    }
  };

  handleOrder = async () => {
    try {
      const userGuid = localStorage.getItem("userGuid");
      if (
        !userGuid ||
        !this.state.phoneNumber ||
        this.state.cartItems.length === 0
      ) {
        this.setState({ errMassage: "اطلاعات ناقص برای ثبت سفارش" });
        return;
      }

      const digest = await getDigest();
      const orderNumber = this.generateOrderId(0);
      const updatedOrderNumber = this.incrementOrderId(orderNumber);
      const webUrl = "https://crm.zarsim.com";

      const orderRes = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('Orders')/items`,
        {
          method: "POST",
          headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": digest,
          },
          body: JSON.stringify({
            __metadata: { type: "SP.Data.OrdersListItem" },
            guid_form: userGuid,
            phoneNumber: this.state.phoneNumber,
            Date: new Date().toISOString(),
            CustomerName: this.state.fullName,
            OrderNumber: "",
          }),
        }
      );

      const orderData = await orderRes.json();
      if (orderData.d.Id) {
        const itemId = orderData.d.Id;
        const testSmsOrderNumber = itemId + 10000;

        await fetch(
          `${webUrl}/_api/web/lists/getbytitle('Orders')/items(${itemId})`,
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
              __metadata: { type: "SP.Data.OrdersListItem" },
              OrderNumber: testSmsOrderNumber.toString(),
            }),
          }
        );

        postToTaskCRM(
          String(testSmsOrderNumber),
          this.state.fullName,
          String(this.state.expertAcc),
          String(this.state.expertName)
        );

        const smsMessage = `جناب ${this.state.fullName} سفارش شما با شماره ${testSmsOrderNumber} ثبت شد`;
        const CSEsmsMessage = `سفارش جناب ${this.state.fullName} با شماره ${testSmsOrderNumber} ثبت شد `;

        // sendSmsToZarsimCEO(CSEsmsMessage, "09123146451");
        sendSmsToZarsimCEO(CSEsmsMessage, this.state.SalesExpertMobile);
        sendSmsToZarsimCEO(smsMessage, this.state.phoneNumber);

        this.setState({ showSuccessPopup: true, testSmsOrderNumber });
      }
    } catch (err) {
      this.setState({ errMassage: "خطا در ثبت سفارش" });
    }
  };

  render() {
    return (
      <div className={styles.formContainer}>
        {this.state.errMassage && (
          <div className={styles.errorMessage}>
            <span>{this.state.errMassage}</span>
            <button onClick={() => this.setState({ errMassage: "" })}>×</button>
          </div>
        )}

        <CartList
          products={this.state.cartItems}
          onDelete={this.handleDeleteItem}
          onUpdateItem={this.calcaluateTheToatalPrice}
        />

        {this.state.cartItems.length > 0 && (
          <div className={styles.totalAmountDiv}>
            <p className={styles.totalAmountP}>
              جمع کل: {this.state.totalAmount.toLocaleString()} ریال
            </p>
            <button className={styles.cartButton} onClick={this.handleOrder}>
              ثبت سفارش
            </button>
          </div>
        )}

        {this.state.cartItems.length === 0 && (
          <div className={styles.emptyCartMessage}>سبد خرید شما خالی است.</div>
        )}

        {this.state.showSuccessPopup && (
          <div className={styles.orderPopupOverlay}>
            <div className={styles.orderPopupBox}>
              <h3>ثبت سفارش موفق</h3>
              <p>مشتری عزیز، جناب {this.state.fullName}</p>
              <p>سفارش شما با شماره {this.state.testSmsOrderNumber} ثبت شد.</p>
              <button
                onClick={() => {
                  localStorage.removeItem("userGuid");
                  hashHistory.push("/");
                  window.location.reload();
                }}
              >
                تایید
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
