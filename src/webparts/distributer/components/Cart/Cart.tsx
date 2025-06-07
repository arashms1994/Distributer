import * as React from "react";
import { Component } from "react";
import CartList from "./CartList";
import styles from "../Styles/Cart.module.scss";
import { getDigest } from "../Crud/GetDigest";
import moment = require("moment-jalaali");
import { getCurrentUser, getCustomerInfoByUserName } from "../Crud/GetData";
import { postToTaskCRM } from "../Crud/PostToTaskCRM";
import sendSmsToZarsimCEO from "../utils/sendSms";
import { hashHistory } from "react-router";
import { formatNumberWithComma } from "../utils/formatNumberWithComma";

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
      userInfo: [],
      totalPrice: 0,
    };

    this.handleDeleteItem = this.handleDeleteItem.bind(this);
    this.handleOrder = this.handleOrder.bind(this);
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

  handleCountUpdate = (id, newCount) => {
    this.setState(
      (prevState) => {
        const updatedCartItems = prevState.cartItems.map((item) => {
          if (item.Id === id) {
            return { ...item, count: newCount };
          }
          return item;
        });
        return { cartItems: updatedCartItems };
      },
      () => {
        this.calculateTotalPrice(this.state.cartItems);
      }
    );
  };

  async componentDidMount() {
    try {
      const cartItems = await this.props.fetchCartItems();
      this.setState({ cartItems }, () => {
        this.calculateTotalPrice(this.state.cartItems);
      });

      const currentUser = await getCurrentUser();
      const nameId = currentUser.UserId.NameId;
      const customerInfo = await getCustomerInfoByUserName(nameId);

      const fullName = customerInfo.Title || "";
      const phoneNumber = customerInfo.Mobile || "";
      const expertName = customerInfo.SalesExpert || "";
      const expertMobile = customerInfo.SalesExpertMobile || "";
      const expertAcc_text = customerInfo.SalesExpertAcunt_text || "";
      const expertAcc = expertAcc_text.split("\\")[1];

      this.setState({
        nameId,
        fullName,
        phoneNumber,
        expertAcc,
        expertName,
        expertMobile,
      });
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
      .then((cartItems) =>
        this.setState({ cartItems }, () => {
          this.calculateTotalPrice(cartItems);
        })
      )
      .catch((err) => this.setState({ message: `خطا در حذف: ${err.message}` }));
  }

  calculateTotalPrice(cartItems) {
    let total = 0;
    cartItems.forEach((item) => {
      const count = Number(item.count) || 0;
      const price = Number(item.price) || 0;
      total += count * price;
    });

    this.setState({ totalPrice: total });
  }

  async handleOrder() {
    try {
      const userGuid = localStorage.getItem("userGuid");
      if (!userGuid) {
        this.setState({ errMassage: "شناسه کاربری پیدا نشد." });
        return;
      }

      if (!this.state.phoneNumber) {
        this.setState({ errMassage: "شماره تلفن کاربر ثبت نشده است." });
        return;
      }

      const { cartItems } = this.state;
      if (cartItems.length === 0) {
        this.setState({ errMassage: "سبد خرید خالی است." });
        return;
      }

      const webUrl = "https://crm.zarsim.com";
      const listName = "Orders";
      const digest = await getDigest();

      const orderNumber = this.generateOrderId(0);
      const updatedOrderNumber = this.incrementOrderId(orderNumber);

      const orderRes = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('${listName}')/items`,
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

      if (orderData.d) {
        const itemId = orderData.d.Id;
        const testSmsOrderNumber = itemId + 10000;

        await fetch(
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

        this.setState({
          // message: "سفارش با موفقیت ثبت شد",
          showSuccessPopup: true,
          testSmsOrderNumber,
          fullName: this.state.fullName,
        });

        setTimeout(() => {
          localStorage.removeItem("userGuid");
        }, 2000);
      } else {
        this.setState({ errMassage: "خطا در ثبت سفارش" });
      }
    } catch (err) {
      console.error("خطا در ثبت سفارش:", err);
      this.setState({ errMassage: "خطا در ثبت سفارش" });
    }
  }
  handleCountChange = () => {
    this.calculateTotalPrice(this.state.cartItems);
  };

  render() {
    return (
      <div className={styles.formContainer}>
        {this.state.errMassage && (
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
              onClick={() => this.setState({ errMassage: "" })}
            >
              ✕
            </button>
          </div>
        )}

        <CartList
          products={this.state.cartItems}
          onDelete={this.handleDeleteItem}
          onCountChange={this.handleCountChange} // 👈 اضافه کن
          onCountUpdate={this.handleCountUpdate}
        />

        {this.state.cartItems.length > 0 ? (
          <div className={styles.cartButtonDiv}>
            <button
              className={styles.cartButton}
              onClick={this.handleOrder}
              type="button"
            >
              ثبت سفارش
            </button>
          </div>
        ) : (
          <div className={styles.emptyCartMessage}>سبد خرید شما خالی است.</div>
        )}
        {this.state.showSuccessPopup && (
          <div className={styles.orderPopupOverlay}>
            <div className={styles.orderPopupBox}>
              <h3 className={styles.orderPopupHeading}>ثبت سفارش موفق</h3>

              <p className={styles.orderPopupParaph}>
                مشتری عزیز، جناب {this.state.fullName}
              </p>

              <p className={styles.orderPopupParaph}>
                سفارش شما با شماره{" "}
                <span className={styles.popupHeading}>
                  {this.state.testSmsOrderNumber}
                </span>{" "}
                ثبت شد.
              </p>

              <p className={styles.orderPopupParaph}>
                همکاران ما پس از بررسی در اسرع وقت
              </p>

              <p className={styles.orderPopupParaph}>
                با شما تماس خواهند گرفت.
              </p>

              <button
                className={styles.closeOrderPopupBtn}
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

        <div className={styles.totalPrice}>
          مجموع کل: {formatNumberWithComma(Number(this.state.totalPrice))} ریال
        </div>
      </div>
    );
  }
}
