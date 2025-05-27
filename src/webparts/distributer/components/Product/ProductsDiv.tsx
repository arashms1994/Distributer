import * as React from "react";
import ProductCard from "./ProductCard";
import styles from "../Styles/Product.module.scss";
import { ProductsDivProps } from "../IDistributerProps";

export default class ProductsDiv extends React.Component<
  ProductsDivProps,
  any
> {
  render() {
    const { products, cart, image } = this.props;

    return (
      <div className={styles.productsDiv}>
        {products.map((p, i) => {
          const matchedImage = image.find(
            (img) => img.name === `${p.IdCode}.jpg`
          );

          return (
            <ProductCard
              Inventory={p.Inventory}
              codegoods={p.codegoods}
              size={p.size}
              color={p.color}
              productgroup={p.productgroup}
              IdCode={p.IdCode}
              key={i}
              Id={p.Id}
              djne={p.djne}
              Title={p.Title}
              Code={p.Code}
              cart={cart}
              image={
                matchedImage
                  ? `https://crm.zarsim.com${matchedImage.url}`
                  : undefined
              }
              updateCartCount={this.props.updateCartCount}
            />
          );
        })}
      </div>
    );
  }
}
