import * as React from "react";
import ProductCard from "./ProductCard";
import styles from "../Styles/Product.module.scss";
import { ProductsDivProps } from "../IDistributerProps";

export default class ProductsDiv extends React.Component<
  ProductsDivProps,
  any
> {
  render() {
    const { products, cart, image, userName, updateCartCount } = this.props;

    return (
      <div className={styles.productsDiv}>
        {products.map((p, i) => {
          const distributerPrice = p[userName];

          const matchedImage = image.find(
            (img) => img.name === `${p.IdCode}.jpg`
          );

          return (
            <ProductCard
              Price={p.Price}
              distributerPrice={distributerPrice}
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
              updateCartCount={updateCartCount}
            />
          );
        })}
      </div>
    );
  }
}
