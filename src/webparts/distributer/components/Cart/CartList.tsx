// CartList.tsx
import * as React from "react";
import CartCard from "./CartCard";
import styles from "../Styles/Cart.module.scss";

export default class CartList extends React.Component<any, any> {
  render() {
    const { products, onDelete, onUpdateItem } = this.props;
    return (
      <div className={styles.productsDiv}>
        {products.map((product) => (
          <CartCard
            product={product}
            key={product.Id}
            onDelete={onDelete}
            onCountUpdate={this.props.onCountUpdate}
            onCountChange={this.props.onCountChange}
          />
        ))}
      </div>
    );
  }
}
