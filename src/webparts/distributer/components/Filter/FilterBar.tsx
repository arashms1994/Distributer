import * as React from "react";
import { Component } from "react";
import styles from "../Styles/Filter.module.scss";
import { FilterBarProps, FilterBarState, Product } from "../IDistributerProps";

const SUB_CATEGORIES = ["AV", "T1", "T2", "T3"];

class FilterBar extends Component<FilterBarProps, FilterBarState> {
  constructor(props: FilterBarProps) {
    super(props);
    this.state = {
      size: "",
      color: "",
      productgroup: "",
      subcategory: "",
    };
  }

  handleChange = (e: any) => {
    const { name, value } = e.target;

    this.setState(
      (prevState) => ({
        ...prevState,
        [name]: value,
      }),
      () => {
        this.props.onFilterChange(this.state);
      }
    );
  };

  getAvailableSubCategories = (): string[] => {
    const { products } = this.props;
    if (!products || products.length === 0) return [];

    const foundCategories: string[] = [];

    for (const sub of SUB_CATEGORIES) {
      if (
        products.some(
          (product) =>
            typeof product.Title === "string" &&
            product.Title.toUpperCase().indexOf(sub) !== -1
        )
      ) {
        foundCategories.push(sub);
      }
    }

    return foundCategories;
  };

  getUniqueOptions = (key: keyof Product): string[] => {
    if (!this.props.products || this.props.products.length === 0) {
      if (key === "color")
        return [
          "آبی",
          "قرمز",
          "سبز",
          "مشکی",
          "سفید",
          "قهوه‌ای",
          "نارنجی",
          "طوسی",
          "زرد",
          "صورتی",
          "بنفش",
          "بژ",
          "طوسی.مشکی",
          "سبز.زرد",
          "مشکی.سفید",
          "سفید.مشکی",
          "سفید.قرمز",
          "زرد.قرمز",
          "زرد.سبز",
          "آبی.سفید",
        ];
      if (key === "productgroup")
        return [
          "خودرویی",
          "هادی بافته شده",
          "سیلیکونی",
          "غیر خودرویی",
          "ابزار دقیق",
        ];
      if (key === "size")
        return [
          "1X0.5(mm2)",
          "1X4(mm2)",
          "1X3(mm2)",
          "1X0.3(mm2)",
          "1X2.5(mm2)",
          "1X2(mm2)",
          "1X1.5(mm2)",
          "1X1(mm2)",
        ];
      return [];
    }

    const options = this.props.products
      .map((product) => product[key])
      .filter((value) => value !== undefined && value !== null)
      .map(String);

    const seen: { [key: string]: boolean } = {};
    const unique: string[] = [];

    for (const option of options) {
      if (!seen[option]) {
        seen[option] = true;
        unique.push(option);
      }
    }

    return unique;
  };

  render() {
    const availableColors = this.getUniqueOptions("color");
    const availableSizes = this.getUniqueOptions("size");
    const availableProductGroup = this.getUniqueOptions("productgroup");
    const availableSubCategories = this.getAvailableSubCategories();

    return (
      <div className={styles.filterDiv}>
        <h3 className={styles.filterHeading}>فیلترها</h3>

        <select
          className={styles.filterSelect}
          id="colorFilter"
          name="color"
          value={this.state.color}
          onChange={this.handleChange}
        >
          <option className={styles.filterOption} value="">
            رنگ‌ها
          </option>
          {availableColors.map((color) => (
            <option className={styles.filterOption} key={color} value={color}>
              {color}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          id="sizeFilter"
          name="size"
          value={this.state.size}
          onChange={this.handleChange}
        >
          <option className={styles.filterOption} value="">
            سایزها
          </option>
          {availableSizes.map((size) => (
            <option className={styles.filterOption} key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          id="subCategoryFilter"
          name="subcategory"
          value={this.state.subcategory}
          onChange={this.handleChange}
        >
          <option className={styles.filterOption} value="">
            زیر شاخه ها
          </option>
          {availableSubCategories.map((sub) => (
            <option className={styles.filterOption} key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          id="productGroupFilter"
          name="productGroup"
          value={this.state.productgroup}
          onChange={this.handleChange}
        >
          <option className={styles.filterOption} value="">
            دسته بندی ها
          </option>
          {availableProductGroup.map((productGroup) => (
            <option
              className={styles.filterOption}
              key={productGroup}
              value={productGroup}
            >
              {productGroup}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

export default FilterBar;
