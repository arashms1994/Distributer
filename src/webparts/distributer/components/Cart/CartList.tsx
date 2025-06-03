import * as React from "react";
import { CartListProps } from "../IDistributerProps";
import CartCard from "./CartCard";
import styles from "../Styles/Cart.module.scss";

export default class CartList extends React.Component<CartListProps, any> {
  render() {
    const { products, onDelete, onUpdateItem } = this.props;

    return (
      <div className={styles.productsDiv}>
        {products.map((product) => (
          <CartCard
            onUpdateItem={onUpdateItem}
            product={product}
            key={product.Id}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }
}
