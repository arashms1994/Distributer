import * as React from "react";
import { Component } from "react";
import { IDistributerProps, Product } from "../components/IDistributerProps";
import {
  getCurrentUser,
  getCustomerInfoByUserName,
  loadImages,
  loadItems,
} from "./Crud/GetData";
import styles from "./Styles/Distributer.module.scss";
import ProductsDiv from "./Product/ProductsDiv";
import FilterBar from "./Filter/FilterBar";
import uuidv4 from "./utils/createGuid";
import { getDigest } from "./Crud/GetDigest";
require("./Styles/font.css");

function containsText(source: string, query: string): boolean {
  return source.toLowerCase().indexOf(query.toLowerCase()) !== -1;
}

export default class Distributer extends Component<IDistributerProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      title: "",
      message: "",
      userGuid: "",
      refresh: 0,
      imageUrl: "",
      showMessage: false,
      searchQuery: "",
      nameId: "",
      filters: {
        color: "",
        size: "",
        productgroup: "",
        subcategory: "",
      },
    };

    this.handleAddToCart = this.handleAddToCart.bind(this);
    this.goToCart = this.goToCart.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  async componentDidMount() {
    const items = await loadItems();
    const imageUrl = await loadImages();
    const currentUser = await getCurrentUser();
    const nameId = currentUser.UserId.NameId;
    const user = await getCustomerInfoByUserName(nameId);
    const userName = user.UserName;

    let userGuid = localStorage.getItem("userGuid");
    if (!userGuid) {
      userGuid = uuidv4();
      localStorage.setItem("userGuid", userGuid);
    }

    this.setState({ userGuid, items, imageUrl, userName });
  }

  handleSearch(event) {
    const searchQuery = event.target.value.toLowerCase();
    this.setState({ searchQuery });
  }

  goToCart() {
    window.location.hash = "#/cart";
  }

  handleFilterChange = (filters: Partial<any>) => {
    this.setState({ filters: { ...this.state.filters, ...filters } });
  };

  async handleAddToCart(itemId: number, title: string) {
    const listName = "shoping";
    const itemType = "SP.Data.ShopingListItem";
    const webUrl = "https://crm.zarsim.com";

    try {
      const digest = await getDigest();

      const response = await fetch(
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
            Title: title,
            codegoods: String(itemId),
            guid_form: this.state.userGuid,
            count: "1",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      await response.json();

      this.setState(
        (prev) => ({
          message: "کالای مورد نظر با موفقیت به سبد خرید اضافه شد",
          refresh: prev.refresh + 1,
          showMessage: true,
        }),
        () => {
          setTimeout(() => this.setState({ showMessage: false }), 3000);

          if (this.props.updateCartCount) {
            this.props.updateCartCount();
          }
        }
      );
    } catch (error) {
      this.setState({
        message: `خطا در افزودن به سبد خرید: ${error.message}`,
        showMessage: true,
      });
    }
  }

  render() {
    const { filters } = this.state;
    const searchQuery = this.props.searchQuery || "";

    let filteredItems = this.state.items;

    if (searchQuery.trim() !== "") {
      filteredItems = filteredItems.filter(
        (item: Product) =>
          (item.Title && containsText(item.Title, searchQuery)) ||
          (item.Code && containsText(item.Code, searchQuery))
      );
    }

    if (filters.color) {
      filteredItems = filteredItems.filter(
        (item: Product) => item.color === filters.color
      );
    }

    if (filters.size) {
      filteredItems = filteredItems.filter(
        (item: Product) => item.size === filters.size
      );
    }

    if (filters.productgroup) {
      filteredItems = filteredItems.filter(
        (item: Product) => item.productgroup === filters.productgroup
      );
    }

    if (filters.subcategory) {
      filteredItems = filteredItems.filter(
        (item: Product) =>
          item.Title &&
          item.Title.toUpperCase().indexOf(
            filters.subcategory.toUpperCase()
          ) !== -1
      );
    }

    return (
      <div className={styles.formContainer}>
        {this.state.showMessage && (
          <div className={styles.successMessage}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="green"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17L4 12" />
            </svg>
            <span>{this.state.message}</span>
            <button
              className={styles.closeBtn}
              onClick={() => this.setState({ showMessage: false })}
            >
              ✕
            </button>
          </div>
        )}

        <div className={styles.mainContainer}>
          <FilterBar
            products={this.state.items}
            onFilterChange={this.handleFilterChange}
          />

          <ProductsDiv
            image={this.state.imageUrl}
            products={filteredItems}
            cart={this.handleAddToCart}
            updateCartCount={this.props.updateCartCount}
            userName={this.state.userName}
          />
        </div>
      </div>
    );
  }
}
