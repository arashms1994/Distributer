import * as React from "react";
import { Component } from "react";
import { hashHistory } from "react-router";
import CartList from "./CartList";
import styles from "../Styles/Cart.module.scss";

export default class Cart extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      cartItems: [],
      message: "",
    };

    this.handleDeleteItem = this.handleDeleteItem.bind(this);
    this.goOrder = this.goOrder.bind(this);
  }

  async componentDidMount() {
    const cartItems = await this.props.fetchCartItems();
    this.setState({ cartItems });
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

  handleDeleteItem(id: number) {
    const listName = "shoping";
    const webUrl = "https://crm.zarsim.com";

    this.getDigest()
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

  goOrder() {
    hashHistory.push("/order");
  }

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
            <button onClick={this.goOrder} className={styles.cartButton}>
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
