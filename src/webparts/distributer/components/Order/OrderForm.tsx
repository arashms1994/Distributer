import * as React from "react";
import { Component } from "react";
import styles from "../Styles/Order.module.scss";
import * as moment from "moment-jalaali";
import { loadCard } from "../Crud/GetData";
import { postToTaskCRM } from "../Crud/PostToTaskCRM";
import sendSmsToZarsimCEO from "../utils/sendSms";

export default class OrderForm extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      cartItems: [],
      message: "",
      phoneNumber: "",
      description: "",
      fullName: "",
      showMessage: false,
      orderCountToday: 0,
      currentOrderNumber: "",
      showSuccessPopup: false,
      testSmsOrderNumber: 0,
    };
  }

  getDigest(): Promise<string> {
    const webUrl = "https://crm.zarsim.com";
    return fetch(`${webUrl}/_api/contextinfo`, {
      method: "POST",
      headers: { Accept: "application/json;odata=verbose" },
    })
      .then((res) => res.json())
      .then((data) => data.d.GetContextWebInformation.FormDigestValue);
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

  formatCount(value: string): string {
    while (value.length < 3) {
      value = "0" + value;
    }
    return value;
  }

  getCategoryCode(category: number): string {
    return category >= 0 && category <= 4 ? String(category) : "X";
  }

  incrementOrderId(orderId: number | string): string {
    const currentOrderNumber = parseInt(String(orderId), 10);
    return (currentOrderNumber + 1000).toString();
  }

  async loadCartData(userGuid: string) {
    try {
      const cartItems = await loadCard(userGuid);
      this.setState({ cartItems });
    } catch (error) {
      console.error("خطا در بارگذاری داده‌های سبد خرید:", error);
    }
  }

  componentDidMount() {
    const userGuid = localStorage.getItem("userGuid");
    if (userGuid) {
      this.loadCartData(userGuid);
    }
  }

  handleInputChange = (event: any) => {
    const { name, value } = event.target;
    this.setState({ [name]: value } as any);
  };

  handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { fullName, phoneNumber, description } = this.state;

    if (!fullName || !phoneNumber) {
      this.setState({
        message: "لطفا همه فیلدها را پر کنید.",
        showMessage: true,
      });
      return;
    }

    const digest = await this.getDigest();
    const webUrl = "https://crm.zarsim.com";
    const listName = "Orders";
    const itemType = "SP.Data.OrdersListItem";
    const userGuid = localStorage.getItem("userGuid");

    if (!userGuid) {
      this.setState({ message: "شناسه کاربری پیدا نشد", showMessage: true });
      return;
    }

    const orderNumber = this.generateOrderId(0);
    const updatedOrderNumber = this.incrementOrderId(orderNumber);

    try {
      const res = await fetch(
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
            guid_form: userGuid,
            phoneNumber,
            Date: new Date().toISOString(),
            Description: description,
            CustomerName: fullName,
            OrderNumber: updatedOrderNumber,
          }),
        }
      );

      const data = await res.json();

      if (data.d) {
        const testSmsOrderNumber = Number(data.d.Id) + 10000;
        this.setState({
          currentOrderNumber: updatedOrderNumber,
          showSuccessPopup: true,
          testSmsOrderNumber,
          showMessage: false,
        });

        const smsMessage = `جناب آقای ${fullName}  سفارش شما با شماره ${testSmsOrderNumber} ثبت شد`;

        await fetch(
          `${webUrl}/_api/web/lists/getbytitle('SMSToCustomer')/items`,
          {
            method: "POST",
            headers: {
              Accept: "application/json;odata=verbose",
              "Content-Type": "application/json;odata=verbose",
              "X-RequestDigest": digest,
            },
            body: JSON.stringify({
              __metadata: { type: "SP.Data.SMSToCustomerListItem" },
              Title: String(fullName),
              Description: smsMessage,
              Mobile: String(phoneNumber),
              send_p: true,
              send_e: false,
            }),
          }
        );
        // --------------------------------------------------SMS TO ZARSIM CEO-----------------------------------------------------//
        const CSEsmsMessage = `سفارش با شماره ${testSmsOrderNumber} ثبت شد `;
        sendSmsToZarsimCEO(CSEsmsMessage, "09123146451");
        sendSmsToZarsimCEO(CSEsmsMessage, "09129643050");

        setTimeout(() => {
          localStorage.removeItem("userGuid");
        }, 10000);
      } else {
        this.setState({
          message: "خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.",
          showMessage: true,
        });
      }
    } catch (error) {
      console.error("خطا در ارسال سفارش:", error);
      this.setState({
        message: "خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.",
        showMessage: true,
      });
    }
  };

  render() {
    return (
      <div className={styles.orderConatiner}>
        <div className={styles.formDiv}>
          {this.state.showMessage && (
            <div className={styles.errorMessage}>
              <span>{this.state.message}</span>
              <button
                className={styles.closeBtn}
                onClick={() => this.setState({ showMessage: false })}
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={this.handleSubmit} className={styles.formContainer}>
            <input
              placeholder="نام و نام خانوادگی"
              type="text"
              name="fullName"
              value={this.state.fullName}
              onChange={this.handleInputChange}
              required
              className={styles.orderFormInput}
            />
            <input
              type="text"
              name="phoneNumber"
              placeholder="شماره همراه"
              value={this.state.phoneNumber}
              onChange={this.handleInputChange}
              required
              className={styles.orderFormInput}
            />
            <textarea
              name="description"
              placeholder="توضیحات (اختیاری)"
              value={this.state.description}
              onChange={this.handleInputChange}
              className={styles.orderFormTextArea}
            />

            <button type="submit" className={styles.submitBtn}>
              ثبت سفارش
            </button>
          </form>

          
        </div>
      </div>
    );
  }
}
