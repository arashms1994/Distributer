// CartList.tsx
import * as React from "react";
import { CartListProps } from "../IDistributerProps";
import CartCard from "./CartCard";
import styles from "../Styles/Cart.module.scss";

export default class CartList extends React.Component<any,any> {
  render() {
    const { products, onDelete, onUpdateItem } = this.props;
    return (
      <div className={styles.productsDiv}>
        {products.map((product) => (
          <CartCard
            key={product.Id}
            product={product}
            onDelete={onDelete}
            onUpdateItem={onUpdateItem}
          />
        ))}
      </div>
    );
  }
}
